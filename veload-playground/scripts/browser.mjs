/** Dependency-free, bounded Chrome/CDP sessions shared by browser checks. */
import { spawn } from "node:child_process";
import { accessSync, constants, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

export function findChrome() {
  const candidates = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ];
  for (const candidate of candidates) {
    try {
      if (!statSync(candidate).isFile()) continue;
      accessSync(candidate, process.platform === "win32" ? constants.F_OK : constants.X_OK);
      return candidate;
    } catch { /* Try the next installed browser, unless CHROME_PATH selected one. */ }
  }
  throw new Error("Chrome executable not found. Set CHROME_PATH to an installed Chrome/Chromium executable.");
}

export async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

/** Kill the whole owned process tree, including Chrome descendants on Windows. */
export async function stopProcess(child, { group = false, graceMs = 1500 } = {}) {
  if (!child?.pid) return;
  const exited = child.exitCode !== null || child.signalCode !== null;
  const signal = (name) => {
    try {
      if (group && process.platform !== "win32") process.kill(-child.pid, name);
      else if (!exited) child.kill(name);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  if (process.platform === "win32") {
    // A crashed check may have left Chrome alive even when its Node parent exited.
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore", windowsHide: true,
    });
    await new Promise((resolve) => {
      const timer = setTimeout(() => { killer.kill(); resolve(); }, 3000);
      const done = () => { clearTimeout(timer); resolve(); };
      killer.once("exit", done);
      killer.once("error", done);
    });
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    return;
  }
  signal("SIGTERM");
  if (!exited) {
    await new Promise((resolve) => {
      const timer = setTimeout(done, graceMs);
      function done() { clearTimeout(timer); child.removeListener("exit", done); resolve(); }
      child.once("exit", done);
    });
  }
  // Also reap descendants when the group leader has already exited.
  signal("SIGKILL");
}

/**
 * Returns evaluate(...evaluateArgs), preserving the existing withPage contract.
 * actions receives send/evaluate/waitFor plus navigation, viewport/media, real
 * mouse/keyboard helpers and diagnostics. onDiagnostics also runs on failure.
 */
export async function withPage(url, evaluate, options = {}) {
  const chrome = findChrome();
  const allowedOrigin = new URL(url).origin;
  const viewport = options.viewport ?? { width: options.width ?? 1280, height: options.height ?? 900 };
  if (![viewport.width, viewport.height].every((value) => Number.isInteger(value) && value > 0)) throw new Error("Viewport dimensions must be positive integers");
  const profile = mkdtempSync(join(tmpdir(), "veload-browser-"));
  // Managed checks inherit their runner-owned group so its timeout kills Chrome too.
  const browserGroup = process.platform !== "win32" && process.env.VELOAD_MANAGED_CHECK !== "1";
  const browser = spawn(chrome, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-component-update", "--disable-sync",
    "--disable-default-apps", "--metrics-recording-only", "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    `--window-size=${viewport.width},${viewport.height}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"], windowsHide: true, detached: browserGroup });
  let browserLog = "";
  browser.stderr.on("data", (chunk) => { browserLog = (browserLog + chunk).slice(-2000); });
  let socket;
  let closed = false;
  let currentUrl = url;
  let id = 0;
  const pending = new Map();
  const diagnostics = [];
  const media = { colorScheme: options.colorScheme, reducedMotion: options.reducedMotion };
  const localOnly = options.localOnly ?? process.env.VELOAD_LOCAL_ONLY === "1";
  const abort = new AbortController();
  const timeoutMs = options.timeoutMs ?? 45000;
  let timeout;
  const failure = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      const error = new Error(`Browser session exceeded ${timeoutMs}ms (${currentUrl})`);
      abort.abort(error);
      reject(error);
    }, timeoutMs);
    browser.once("error", (error) => reject(new Error(`Chrome could not start: ${error.message}`)));
    browser.once("exit", (code, signal) => {
      if (!closed) reject(new Error(`Chrome exited (${signal ?? code}): ${browserLog.trim().slice(-600)}`));
    });
  });
  const addDiagnostic = (kind, level, message, source = currentUrl) => {
    if (diagnostics.length < 200) diagnostics.push({ kind, level, message: String(message).slice(0, 800), url: source });
  };
  const rejectPending = (error) => {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); }
    pending.clear();
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    if (closed || socket?.readyState !== WebSocket.OPEN) return reject(new Error(`CDP is closed (${method})`));
    const requestId = ++id;
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error(`CDP command timed out: ${method}`));
    }, options.commandTimeoutMs ?? 10000);
    pending.set(requestId, { resolve, reject, timer });
    try { socket.send(JSON.stringify({ id: requestId, method, params })); }
    catch (error) { clearTimeout(timer); pending.delete(requestId); reject(error); }
  });
  const evaluateExpression = async (expression) => {
    const response = await send("Runtime.evaluate", {
      expression, returnByValue: true, awaitPromise: true, userGesture: true,
    });
    if (response.exceptionDetails) {
      const detail = response.exceptionDetails;
      throw new Error(`Page evaluation: ${detail.exception?.description ?? detail.text}`.slice(0, 1000));
    }
    return response.result?.value;
  };
  const waitFor = async (expression, waitMs = 10000) => {
    const deadline = Date.now() + waitMs;
    while (Date.now() < deadline) {
      abort.signal.throwIfAborted();
      try { if (await evaluateExpression(expression)) return; }
      catch (error) {
        if (!/context was destroyed|Cannot find context|Inspected target navigated/i.test(error.message)) throw error;
      }
      await sleep(40, undefined, { signal: abort.signal });
    }
    throw new Error(`Browser wait timed out at ${currentUrl}: ${expression.slice(0, 180)}`);
  };
  const settle = () => evaluateExpression(`(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  })()`);
  const setViewport = async ({ width, height = 1000 }) => {
    if (![width, height].every((value) => Number.isInteger(value) && value > 0)) throw new Error("Viewport dimensions must be positive integers");
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await settle();
  };
  const setMedia = async (next) => {
    Object.assign(media, next);
    const features = [];
    if (media.colorScheme) features.push({ name: "prefers-color-scheme", value: media.colorScheme });
    if (media.reducedMotion) features.push({ name: "prefers-reduced-motion", value: media.reducedMotion });
    await send("Emulation.setEmulatedMedia", { features });
    await settle();
  };
  const navigate = async (destination) => {
    const target = new URL(destination, url);
    if (localOnly && target.origin !== allowedOrigin) throw new Error(`Refusing non-local navigation: ${target.origin}`);
    currentUrl = target.href;
    const response = await send("Page.navigate", { url: target.href });
    if (response.errorText) throw new Error(`Navigation failed: ${response.errorText} (${currentUrl})`);
    await waitFor(`location.href === ${JSON.stringify(target.href)} && document.readyState === "complete"`);
    await waitFor(`!document.getElementById("__nuxt") || Boolean(document.getElementById("__nuxt").__vue_app__)`);
    await settle();
    if (options.delay ?? 1500) await sleep(options.delay ?? 1500, undefined, { signal: abort.signal });
  };
  const click = async (selector) => {
    const point = await evaluateExpression(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element || element.disabled) throw new Error("Missing or disabled click target: " + ${JSON.stringify(selector)});
      element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
      const box = element.getBoundingClientRect();
      const x = box.left + box.width / 2, y = box.top + box.height / 2;
      const hit = document.elementFromPoint(x, y);
      if (!box.width || !box.height || !hit || !(hit === element || element.contains(hit))) {
        throw new Error("Click target is obscured or outside the viewport: " + ${JSON.stringify(selector)});
      }
      return { x, y };
    })()`);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await send("Input.dispatchMouseEvent", { type, ...point, ...(type === "mouseMoved" ? {} : { button: "left", clickCount: 1 }) });
    }
    await settle();
  };
  const press = async (key, modifiers = 0) => {
    const codes = { Enter: 13, Tab: 9, Home: 36, End: 35, ArrowLeft: 37, ArrowRight: 39, Backspace: 8, " ": 32 };
    if (!codes[key]) throw new Error(`Unsupported verification key: ${key}`);
    for (const type of ["keyDown", "keyUp"]) {
      await send("Input.dispatchKeyEvent", { type, key, code: key === " " ? "Space" : key, modifiers, windowsVirtualKeyCode: codes[key] });
    }
    await settle();
  };

  try {
    const result = await Promise.race([failure, (async () => {
      let port;
      const deadline = Date.now() + 15000;
      while (!port && Date.now() < deadline) {
        abort.signal.throwIfAborted();
        try { port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]); }
        catch { /* Chrome writes its selected free debugging port after startup. */ }
        if (!port) await sleep(100, undefined, { signal: abort.signal });
      }
      if (!port) throw new Error(`Chrome did not expose a debugging port: ${browserLog.slice(-600)}`);
      let target;
      while (!target && Date.now() < deadline) {
        abort.signal.throwIfAborted();
        try {
          const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
            method: "PUT", signal: AbortSignal.any([abort.signal, AbortSignal.timeout(1000)]), redirect: "error",
          });
          if (response.ok) target = await response.json();
          else await response.body?.cancel();
        } catch { /* The debugging HTTP endpoint can lag behind DevToolsActivePort. */ }
        if (!target) await sleep(100, undefined, { signal: abort.signal });
      }
      if (!target?.webSocketDebuggerUrl) throw new Error(`Chrome target creation timed out: ${browserLog.slice(-600)}`);
      socket = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Chrome WebSocket connection timed out")), 5000);
        const done = (callback, value) => { clearTimeout(timer); callback(value); };
        socket.addEventListener("open", () => done(resolve), { once: true });
        socket.addEventListener("error", () => done(reject, new Error("Chrome WebSocket failed")), { once: true });
      });
      socket.addEventListener("close", () => rejectPending(new Error("Chrome DevTools connection closed")));
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        if (message.id) {
          const request = pending.get(message.id);
          if (!request) return;
          pending.delete(message.id);
          clearTimeout(request.timer);
          if (message.error) request.reject(new Error(message.error.message));
          else request.resolve(message.result);
          return;
        }
        const data = message.params;
        if (message.method === "Runtime.consoleAPICalled" && ["warning", "warn", "error", "assert"].includes(data.type)) {
          addDiagnostic("console", data.type, data.args.map((arg) => arg.value ?? arg.description ?? arg.type).join(" "));
        } else if (message.method === "Runtime.exceptionThrown") {
          const detail = data.exceptionDetails;
          addDiagnostic("exception", "error", detail.exception?.description ?? detail.text);
        } else if (message.method === "Log.entryAdded" && ["warning", "error"].includes(data.entry.level)) {
          addDiagnostic("log", data.entry.level, data.entry.text, data.entry.url || currentUrl);
        } else if (message.method === "Network.responseReceived" && data.type === "Document" && data.response.status >= 400) {
          addDiagnostic("http", "error", `HTTP ${data.response.status}`, data.response.url);
        } else if (message.method === "Fetch.requestPaused") {
          const requestUrl = new URL(data.request.url);
          const allowed = requestUrl.origin === allowedOrigin || ["data:", "blob:", "about:"].includes(requestUrl.protocol);
          if (!allowed) addDiagnostic("network", "error", `Blocked external request: ${requestUrl.origin}`);
          send(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", {
            requestId: data.requestId, ...(!allowed ? { errorReason: "BlockedByClient" } : {}),
          }).catch((error) => { if (!closed) addDiagnostic("cdp", "error", error.message); });
        }
      });
      await send("Page.enable");
      await send("Runtime.enable");
      await send("Log.enable");
      await send("Network.enable");
      if (localOnly) await send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
      await setViewport(viewport);
      await setMedia({});
      await navigate(url);
      const page = { send, evaluate: evaluateExpression, waitFor, navigate, setViewport, setMedia, click, press, settle, diagnostics };
      if (options.actions) await options.actions(page);
      const value = await evaluateExpression(`(${evaluate.toString()})(...${JSON.stringify(options.evaluateArgs ?? [])})`);
      if (options.failOnDiagnostics !== false && diagnostics.length) {
        throw new Error(`Browser warnings/errors: ${JSON.stringify(diagnostics.slice(0, 5))}`);
      }
      return value;
    })()]);
    return result;
  } finally {
    closed = true;
    clearTimeout(timeout);
    abort.abort(new Error("Browser session ended"));
    rejectPending(new Error("Browser session ended"));
    try { socket?.close(); } catch { /* A failed handshake may already have closed it. */ }
    try { await stopProcess(browser, { group: browserGroup }); }
    finally {
      try { rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); }
      catch { console.warn(`Chrome profile could not be removed: ${profile}`); }
      options.onDiagnostics?.(diagnostics.slice());
    }
  }
}
