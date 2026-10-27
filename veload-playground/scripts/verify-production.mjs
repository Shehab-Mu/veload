/**
 * Finite verification of an already-built Nitro server; never builds the app.
 * Usage (from veload-playground): node scripts/verify-production.mjs
 */
import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { findChrome, freePort, stopProcess } from "./browser.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const serverEntry = join(root, ".output", "server", "index.mjs");
const checkTimeoutMs = 180000;
const wholeTimeoutMs = 600000;
const abort = new AbortController();
const wholeTimer = setTimeout(() => abort.abort(new Error("Production verification exceeded its 600-second whole-run limit")), wholeTimeoutMs);
const interrupt = (signal) => {
  process.exitCode = signal === "SIGINT" ? 130 : 143;
  abort.abort(new Error(`Verification interrupted by ${signal}`));
};
const onInterrupt = () => interrupt("SIGINT");
const onTerminate = () => interrupt("SIGTERM");
process.once("SIGINT", onInterrupt);
process.once("SIGTERM", onTerminate);
let server;
let checkChild;
let stopping = false;
let serverLog = "";
let failures = 0;
let checks = 0;

async function ready(baseUrl) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    abort.signal.throwIfAborted();
    try {
      const response = await fetch(new URL("/docs/installation", baseUrl), {
        redirect: "error", signal: AbortSignal.any([abort.signal, AbortSignal.timeout(1000)]),
      });
      await response.body?.cancel();
      if (response.ok) return;
    } catch { /* Wait for this owned server to bind and finish startup. */ }
    await sleep(100, undefined, { signal: abort.signal });
  }
  throw new Error(`Built server was not ready within 20 seconds. ${serverLog.slice(-1500)}`);
}

async function runCheck(script, baseUrl, env) {
  abort.signal.throwIfAborted();
  checks += 1;
  console.log(`\nRUN   node scripts/${script} ${baseUrl} (limit ${checkTimeoutMs / 1000}s)`);
  const child = spawn(process.execPath, [join(root, "scripts", script), baseUrl], {
    cwd: root, env, stdio: "inherit", windowsHide: true, detached: process.platform !== "win32",
  });
  checkChild = child;
  let timer;
  let onAbort;
  try {
    const code = await Promise.race([
      new Promise((resolve, reject) => {
        child.once("error", (error) => reject(new Error(`${script} could not start: ${error.message}`)));
        child.once("exit", (code, signal) => signal ? reject(new Error(`${script} exited on ${signal}`)) : resolve(code));
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${script} exceeded ${checkTimeoutMs / 1000} seconds`)), checkTimeoutMs);
        onAbort = () => reject(abort.signal.reason);
        abort.signal.addEventListener("abort", onAbort, { once: true });
        if (abort.signal.aborted) onAbort();
      }),
    ]);
    if (code !== 0) throw new Error(`${script} exited with status ${code}`);
    console.log(`PASS  ${script}`);
  } finally {
    clearTimeout(timer);
    abort.signal.removeEventListener("abort", onAbort);
    await stopProcess(child, { group: true });
    checkChild = undefined;
  }
}

try {
  try {
    if (!statSync(serverEntry).isFile()) throw new Error("not a file");
  } catch {
    throw new Error("Missing .output/server/index.mjs. Build the playground first; this runner deliberately does not build it.");
  }
  findChrome();
  console.log("Production browser verification: sequential checks, 180s/check, 600s whole run, plus bounded process cleanup.");
  const scenarios = [
    {
      name: "Nuxt default configured origin",
      origin: undefined,
      expectedOrigin: "https://veload-playground.vercel.app",
      scripts: ["audit.mjs", "interaction-check.mjs", "workspace-check.mjs"],
    },
    {
      name: "explicit configured test origin",
      origin: "https://public.localhost:8443",
      expectedOrigin: "https://public.localhost:8443",
      scripts: ["audit.mjs"],
    },
    {
      name: "invalid configured origin / request-origin fallback",
      origin: "not-an-origin",
      expectedOrigin: undefined,
      scripts: ["audit.mjs"],
    },
  ];
  for (const scenario of scenarios) {
    abort.signal.throwIfAborted();
    const port = await freePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const env = { ...process.env, NODE_ENV: "production", HOST: "127.0.0.1", NITRO_HOST: "127.0.0.1",
      PORT: String(port), NITRO_PORT: String(port), VELOAD_LOCAL_ONLY: "1", VELOAD_MANAGED_CHECK: "1" };
    delete env.NUXT_PUBLIC_SITE_URL;
    if (scenario.origin) env.NUXT_PUBLIC_SITE_URL = scenario.origin;
    const expectedOrigin = scenario.expectedOrigin ?? baseUrl;
    // The server's actual configuration and the audit's expectation are independent.
    const checkEnv = { ...env, NUXT_PUBLIC_SITE_URL: expectedOrigin };
    console.log(`\nSERVER ${scenario.name}: ${baseUrl}; NUXT_PUBLIC_SITE_URL ${scenario.origin === undefined ? "unset" : JSON.stringify(scenario.origin)}; expected metadata origin ${expectedOrigin}`);
    stopping = false;
    serverLog = "";
    server = spawn(process.execPath, [serverEntry], {
      cwd: root, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true, detached: process.platform !== "win32",
    });
    const startedServer = server;
    const append = (chunk) => { serverLog = (serverLog + chunk).slice(-4000); };
    server.stdout.on("data", append);
    server.stderr.on("data", append);
    server.once("error", (error) => abort.abort(new Error(`Built server could not start: ${error.message}`)));
    server.once("exit", (code, signal) => {
      if (server === startedServer && !stopping) abort.abort(new Error(`Built server exited unexpectedly (${signal ?? code}). ${serverLog.slice(-1200)}`));
    });
    try {
      await ready(baseUrl);
      for (const script of scenario.scripts) {
        try { await runCheck(script, baseUrl, checkEnv); }
        catch (error) {
          failures += 1;
          console.error(`FAIL  ${scenario.name}: ${error.message}`);
          abort.signal.throwIfAborted();
        }
      }
    } finally {
      stopping = true;
      await stopProcess(server, { group: true });
      server = undefined;
    }
  }
  console.log(`\nProduction verification: ${checks} checks; ${failures} failures. All scenario servers have been stopped.`);
  if (failures) process.exitCode = 1;
} catch (error) {
  const cause = abort.signal.aborted ? abort.signal.reason : error;
  console.error(`FAIL  production verification: ${String(cause.message).slice(0, 2000)}`);
  process.exitCode ||= 1;
} finally {
  clearTimeout(wholeTimer);
  stopping = true;
  abort.abort(new Error("Verification finished"));
  try { await stopProcess(checkChild, { group: true }); }
  finally { await stopProcess(server, { group: true }); }
  process.removeListener("SIGINT", onInterrupt);
  process.removeListener("SIGTERM", onTerminate);
}
