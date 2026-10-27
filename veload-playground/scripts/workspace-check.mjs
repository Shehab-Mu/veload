/** Real DOM/CDP workspace checks; no axe or screen-reader conformance claim. */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withPage } from "./browser.mjs";

const baseUrl = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
if (!["127.0.0.1", "localhost", "[::1]"].includes(baseUrl.hostname)) {
  throw new Error("workspace-check only accepts a localhost server");
}
const loaderSlugs = ["breathing", "dual-arc", "dot-sweep", "sliding-bars"];
const routes = ["/", "/loaders", "/skeletons", "/skeletons/dashboard-skeleton", "/skeletons/lines", "/docs/installation",
  ...loaderSlugs.map((slug) => `/loaders/${slug}`)];
const patternSlugs = {
  lines: "lines", article: "article-skeleton", card: "card-skeleton", profile: "profile-skeleton",
  list: "list-skeleton", table: "table-skeleton", media: "media-card-skeleton", form: "form-skeleton",
  dashboard: "dashboard-skeleton", feed: "feed-skeleton", product: "product-card-skeleton",
};
const screenshots = mkdtempSync(join(tmpdir(), "veload-workspace-"));
let screenshotCount = 0;
let assertions = 0;
let failures = 0;
let context = "workspace";
const inPage = (page, fn, ...args) => page.evaluate(`(${fn.toString()})(...${JSON.stringify(args)})`);
function check(name, condition, detail = "") {
  assertions += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${context}: ${name}${detail ? ` — ${String(detail).slice(0, 1600)}` : ""}`);
}
async function screenshot(page, name) {
  if (screenshotCount >= 6) return;
  const { data } = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(screenshots, `${name}.png`), Buffer.from(data, "base64"));
  screenshotCount += 1;
}
function inspectLayout() {
  const width = document.documentElement.clientWidth;
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const offenders = scrollWidth > width + 1 ? Array.from(document.querySelectorAll("body *"))
    .map((element) => ({ element, box: element.getBoundingClientRect() }))
    .filter(({ element, box }) => box.width > 0 && (box.right > width + 1 || box.left < -1) && getComputedStyle(element).visibility !== "hidden")
    .slice(0, 8).map(({ element, box }) => ({
      tag: element.tagName.toLowerCase(), id: element.id, class: String(element.className).slice(0, 100),
      left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width),
    })) : [];
  return { width, innerWidth, scrollWidth, overflow: scrollWidth - width, offenders };
}
async function layout(page, name = "no page-level horizontal overflow") {
  const result = await inPage(page, inspectLayout);
  check(name, result.overflow <= 1, JSON.stringify(result));
}
async function range(page, id, value) {
  const info = await inPage(page, (id) => {
    const input = document.getElementById(id);
    if (!input || input.disabled || input.type !== "range") throw new Error(`Range is missing/not ready: ${id}`);
    input.scrollIntoView({ block: "center", behavior: "instant" });
    input.focus();
    return { min: Number(input.min), max: Number(input.max), step: Number(input.step || 1) };
  }, id);
  if (value === "max" || value === info.max) await page.press("End");
  else {
    const steps = (value - info.min) / info.step;
    if (!Number.isInteger(steps) || steps < 0 || steps > 20) throw new Error(`Unsupported keyboard slider target: ${id}=${value}`);
    await page.press("Home");
    for (let index = 0; index < steps; index += 1) await page.press("ArrowRight");
  }
  const actual = await inPage(page, (id) => Number(document.getElementById(id).value), id);
  check(`${id} receives real keyboard input`, actual === (value === "max" ? info.max : value), `got ${actual}`);
  return actual;
}
async function text(page, id, value) {
  await inPage(page, (id) => {
    const input = document.getElementById(id);
    if (!input || input.disabled) throw new Error(`Text control is missing/not ready: ${id}`);
    input.focus(); input.select();
  }, id);
  if (value) await page.send("Input.insertText", { text: value });
  else await page.press("Backspace");
  await page.settle();
}
function readTabs() {
  return Array.from(document.querySelectorAll('.playground__code [role="tab"]'), (tab) => {
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    return { id: tab.id, label: tab.textContent.trim(), selected: tab.getAttribute("aria-selected") === "true",
      tabindex: tab.tabIndex, panel: panel?.id, visible: Boolean(panel?.getClientRects().length),
      code: panel?.querySelector("pre code")?.textContent ?? "", focused: document.activeElement === tab };
  });
}
async function snippets(page, bindings) {
  const tabs = await inPage(page, readTabs);
  const code = Object.fromEntries(tabs.map((tab) => [tab.label, tab.code]));
  for (const [name, value] of Object.entries(bindings)) {
    const template = typeof value === "boolean" ? (value ? name : `:${name}="false"`)
      : typeof value === "number" ? `:${name}="${value}"` : `${name}=${JSON.stringify(value)}`;
    check(`Vue snippet follows ${name}`, Boolean(code.Vue?.includes(template)), template);
    check(`Composition snippet follows ${name}`, Boolean(code["Composition API"]?.includes(`const ${name} = ref(${JSON.stringify(value)});`) && code["Composition API"].includes(`:${name}="${name}"`)), String(value));
    check(`TypeScript snippet follows ${name}`, Boolean(code.TypeScript?.includes(`${name}: ${JSON.stringify(value)},`)), String(value));
  }
}
function visibleFocus(selector) {
  const element = document.querySelector(selector);
  if (!element) return { visible: false, reason: "missing target" };
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 && !["transparent", "rgba(0, 0, 0, 0)"].includes(style.outlineColor);
  return { visible: document.activeElement === element && element.matches(":focus-visible") && outline && box.width > 0 && box.top >= 0 && box.bottom <= innerHeight,
    outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, top: box.top, bottom: box.bottom };
}
async function keyboardTabs(page) {
  let tabs = await inPage(page, readTabs);
  check("all five implementation tabs exist", tabs.length === 5, tabs.map((tab) => tab.label).join(", "));
  if (tabs.length !== 5) return;
  const selector = `[role="tab"][id=${JSON.stringify(tabs[0].id)}]`;
  await inPage(page, (selector) => {
    const tab = document.querySelector(selector);
    tab.scrollIntoView({ block: "center", behavior: "instant" }); tab.focus();
  }, selector);
  for (const [key, index] of [["Home", 0], ["ArrowRight", 1], ["End", 4], ["ArrowLeft", 3], ["Home", 0], ["ArrowLeft", 4], ["ArrowRight", 0]]) {
    await page.press(key);
    tabs = await inPage(page, readTabs);
    check(`tabs ${key} selects/focuses index ${index}`, tabs[index].selected && tabs[index].focused && tabs[index].visible && tabs[index].tabindex === 0
      && tabs.filter((tab) => tab.selected).length === 1 && tabs.filter((tab) => tab.visible).length === 1
      && tabs.filter((tab) => tab.tabindex === 0).length === 1);
  }
  const focus = await inPage(page, visibleFocus, selector);
  check("keyboard tab focus is visibly outlined", focus.visible, JSON.stringify(focus));
}
async function clipboard(page) {
  for (const label of ["Vue", "Composition API", "TypeScript"]) {
    const tab = (await inPage(page, readTabs)).find((entry) => entry.label === label);
    if (!tab?.panel || !tab.code) throw new Error(`Missing ${label} code panel`);
    await page.click(`[role="tab"][id=${JSON.stringify(tab.id)}]`);
    const active = (await inPage(page, readTabs)).find((entry) => entry.selected);
    check(`${label} code is the active visible panel`, active?.id === tab.id && active.visible);
    await page.evaluate(`navigator.clipboard.writeText(${JSON.stringify(`veload-copy-sentinel-${Date.now()}`)})`);
    await page.click(`[role="tabpanel"][id=${JSON.stringify(tab.panel)}] .copy-button`);
    // Windows clipboard text uses CRLF even when writeText receives LF.
    // Normalize only that platform conversion; all code content must still match.
    await page.waitFor(`navigator.clipboard.readText().then(value => value.replaceAll(String.fromCharCode(13, 10), String.fromCharCode(10)) === ${JSON.stringify(tab.code)})`, 3000);
    const copied = await page.evaluate("navigator.clipboard.readText()");
    check(`${label} real clipboard equals current code after edits`, copied.replaceAll("\r\n", "\n") === tab.code, `expected ${tab.code.length} LF characters; got ${copied?.length} clipboard characters`);
    const status = await inPage(page, (id) => {
      const node = document.getElementById(id)?.querySelector(".code-block__status");
      return { text: node?.textContent.trim(), role: node?.getAttribute("role") };
    }, tab.panel);
    check(`${label} copy is announced`, status.text === "Copied to the clipboard" && status.role === "status", JSON.stringify(status));
  }
}
function animations() {
  const elements = Array.from(document.querySelectorAll(".playground__preview, .playground__preview *"));
  const active = [];
  for (const element of elements) for (const pseudo of [null, "::before", "::after"]) {
    const style = getComputedStyle(element, pseudo);
    if (style.animationName.split(",").some((name) => name.trim() !== "none")) {
      active.push({ class: String(element.className), pseudo, name: style.animationName });
    }
  }
  return { elements: elements.length, active, reduced: matchMedia("(prefers-reduced-motion: reduce)").matches };
}
async function reducedMotion(page) {
  const before = await inPage(page, animations);
  check("preview has an animation before reduced motion", before.active.length > 0);
  await page.setMedia({ reducedMotion: "reduce" });
  const after = await inPage(page, animations);
  check("reduced motion computes no preview/pseudo animations", after.elements > 1 && after.reduced && after.active.length === 0, JSON.stringify(after.active.slice(0, 6)));
  await page.setMedia({ reducedMotion: "no-preference" });
}
async function dashboard(page) {
  const help = await inPage(page, () => {
    const slider = document.getElementById("skeleton-rows");
    return { label: document.querySelector('label[for="skeleton-rows"]')?.textContent.replace(/\s+/g, " ").trim(),
      hint: (slider?.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim() ?? "").join(" ") };
  });
  check("rows slider is labelled Data rows", /^Data rows\b/.test(help.label ?? ""), JSON.stringify(help));
  check("describedby explains the fixed header separately", /one fixed table header/i.test(help.hint) && /separate/i.test(help.hint), JSON.stringify(help));
  for (const columns of [1, 6]) {
    await range(page, "skeleton-columns", columns);
    for (const rows of [1, 2, 12]) {
      await range(page, "skeleton-rows", rows);
      const counts = await inPage(page, () => {
        const root = document.querySelector(".playground__preview .v-pattern-skeleton");
        const headers = root.querySelectorAll(".v-pattern-skeleton__table-header");
        const data = Array.from(root.querySelectorAll(".v-pattern-skeleton__data-row"));
        return { rows: data.length, headers: headers.length, cells: data.map((row) => row.children.length),
          tracks: data.map((row) => getComputedStyle(row).gridTemplateColumns.split(/\s+/).length),
          headerTracks: headers[0] ? getComputedStyle(headers[0]).gridTemplateColumns.split(/\s+/).length : 0,
          headerCells: headers[0]?.children.length, stats: root.querySelector(".v-pattern-skeleton__stats")?.children.length };
      });
      check(`${rows} data rows + one fixed header, ${columns} columns`, counts.rows === rows && counts.headers === 1 && counts.headerCells === columns
        && counts.cells.every((count) => count === columns) && counts.tracks.every((count) => count === columns)
        && counts.headerTracks === columns && counts.stats === columns, JSON.stringify(counts));
      await snippets(page, { rows, columns });
      await layout(page, `no overflow at rows=${rows}, columns=${columns}`);
    }
  }
  await keyboardTabs(page);
  await clipboard(page);
  await reducedMotion(page);
}
async function lines(page) {
  for (const rows of [1, 2, 12]) {
    await range(page, "skeleton-rows", rows);
    const count = await inPage(page, () => document.querySelectorAll(".playground__preview .v-pattern-skeleton--lines > .v-skeleton").length);
    check(`lines renders exactly ${rows} text rows`, count === rows, `got ${count}`);
    await snippets(page, { rows });
    await layout(page, `no overflow at ${rows} lines`);
  }
  await keyboardTabs(page);
  await clipboard(page);
  await reducedMotion(page);
}
async function loader(page, slug) {
  const repeating = ["dot-sweep", "sliding-bars"].includes(slug);
  const hasCount = await page.evaluate('Boolean(document.getElementById("loader-count"))');
  check("only repeated-mark loaders expose count", hasCount === repeating);
  await range(page, "loader-size", "max");
  await range(page, "loader-duration", "max");
  const label = `Verifying ${slug} activity in a long workspace label`;
  await text(page, "loader-label", label);
  for (const count of repeating ? [1, 2, 12] : [2]) {
    if (repeating) await range(page, "loader-count", count);
    const preview = await inPage(page, () => {
      const node = document.querySelector(".playground__preview .v-loader");
      const style = getComputedStyle(node);
      return { marks: node.querySelectorAll(".v-loader__mark").length, role: node.getAttribute("role"), label: node.getAttribute("aria-label"),
        size: style.getPropertyValue("--vl-size").trim(), duration: style.getPropertyValue("--vl-duration").trim() };
    });
    check(`preview follows size, duration, label and ${count} marks`, preview.marks === count && preview.role === "status" && preview.label === label
      && preview.size === "120px" && preview.duration === "3000ms", JSON.stringify(preview));
    await snippets(page, { size: 120, duration: 3000, label, ...(repeating ? { count } : {}) });
    await layout(page, `no overflow at maximum size/duration and count=${count}`);
    const stage = await inPage(page, () => {
      const preview = document.querySelector(".playground__preview");
      const parent = preview.parentElement.getBoundingClientRect();
      const box = preview.getBoundingClientRect();
      return { left: box.left, right: box.right, parentLeft: parent.left, parentRight: parent.right,
        overflow: getComputedStyle(preview).overflowX, scrollWidth: preview.scrollWidth, clientWidth: preview.clientWidth,
        focusable: preview.tabIndex === 0 && preview.getAttribute("aria-label") === "Loader preview" };
    });
    check("large previews remain contained and keyboard-scrollable rather than clipped", stage.left >= stage.parentLeft && stage.right <= stage.parentRight
      && ["auto", "scroll"].includes(stage.overflow) && stage.focusable, JSON.stringify(stage));
  }
  await page.click("#loader-decorative");
  const hidden = () => {
    const node = document.querySelector(".playground__preview .v-loader");
    return node.getAttribute("aria-hidden") === "true" && !node.hasAttribute("role") && !node.hasAttribute("aria-label");
  };
  check("decorative hides the preview status", await inPage(page, hidden));
  await snippets(page, { decorative: true });
  await page.click("#loader-decorative");
  const restored = await inPage(page, () => {
    const node = document.querySelector(".playground__preview .v-loader");
    return { role: node.getAttribute("role"), label: node.getAttribute("aria-label"), hidden: node.hasAttribute("aria-hidden") };
  });
  check("turning decorative off restores the named status", restored.role === "status" && restored.label === label && !restored.hidden, JSON.stringify(restored));
  await text(page, "loader-label", "");
  check("empty label also makes the preview decorative", await inPage(page, hidden));
  await snippets(page, { label: "" });
  await text(page, "loader-label", label);
  await keyboardTabs(page);
  await clipboard(page);
  await reducedMotion(page);
}
async function checkLinks(page, source, selector, expected, pattern = false) {
  await page.navigate(new URL(source, baseUrl).href);
  const links = await inPage(page, (selector) => Array.from(document.querySelectorAll(selector), (link) => ({
    href: link.getAttribute("href"), tag: link.tagName, tabindex: link.tabIndex,
    name: link.querySelector(".pattern__name")?.textContent.trim(),
  })), selector);
  check(`${selector}: all ${expected} real links exist`, links.length === expected && links.every((link) => link.tag === "A" && link.tabindex >= 0), JSON.stringify(links));
  check(`${selector}: unique destinations`, new Set(links.map((link) => link.href)).size === expected);
  if (pattern) for (const link of links) check(`pattern ${link.name} maps to its detail page`, link.href === `/skeletons/${patternSlugs[link.name]}`, link.href);
  if (selector === ".skeleton-card") {
    const expectedPaths = Object.values(patternSlugs).filter((slug) => slug !== "lines").map((slug) => `/skeletons/${slug}`);
    check("ten named presets retain their real destinations", expectedPaths.every((path) => links.some((link) => link.href === path)));
  }
  for (const link of links) {
    const target = new URL(link.href, baseUrl);
    if (target.origin !== baseUrl.origin || !/^\/(loaders|skeletons)\/[^/]+$/.test(target.pathname)) {
      check("link has a local detail destination", false, String(link.href)); continue;
    }
    for (const method of ["click", "Enter"]) {
      try {
        await page.navigate(new URL(source, baseUrl).href);
        const targetSelector = `${selector}[href=${JSON.stringify(link.href)}]`;
        if (method === "click") await page.click(targetSelector);
        else {
          await inPage(page, (selector) => {
            const node = document.querySelector(selector);
            node.scrollIntoView({ block: "center", behavior: "instant" }); node.focus();
          }, targetSelector);
          // Traverse away and back with actual Tab events to exercise keyboard modality.
          await page.press("Tab");
          await page.press("Tab", 8);
          const focus = await inPage(page, visibleFocus, targetSelector);
          check(`${link.href}: keyboard link focus is visible`, focus.visible, JSON.stringify(focus));
          await page.press("Enter");
        }
        const slug = target.pathname.split("/").pop();
        const previewSelector = source === "/loaders" ? `.v-loader--${slug}`
          : `.v-pattern-skeleton--${Object.keys(patternSlugs).find((pattern) => patternSlugs[pattern] === slug)}`;
        await page.waitFor(`location.pathname === ${JSON.stringify(target.pathname)}
          && Boolean(document.querySelector('.playground__controls input:not(:disabled)'))
          && Boolean(document.querySelector(${JSON.stringify(`.playground__preview ${previewSelector}`)}))
          && new URL(document.querySelector('link[rel="canonical"]').href).pathname === ${JSON.stringify(target.pathname)}`);
        await page.settle();
        const destination = await inPage(page, () => ({ path: location.pathname, heading: document.querySelector("h1")?.textContent.trim(),
          canonical: new URL(document.querySelector('link[rel="canonical"]').href).pathname,
          preview: Boolean(document.querySelector(".playground__preview .v-loader, .playground__preview .v-pattern-skeleton")) }));
        check(`${link.href}: ${method} navigates to a real hydrated detail`, destination.path === target.pathname && destination.canonical === target.pathname && destination.heading && destination.preview, JSON.stringify(destination));
      } catch (error) {
        check(`${link.href}: ${method} navigation completed`, false, error.message);
      }
    }
  }
  console.log(`Checked ${links.length} ${selector} links with both mouse click and keyboard Enter.`);
}

console.log(`Workspace screenshots: ${screenshots}`);
let diagnostics = [];
try {
  await withPage(baseUrl.href, () => null, {
    delay: 0, timeoutMs: 170000, viewport: { width: 1440, height: 1000 }, localOnly: true, failOnDiagnostics: false, preserveClipboard: true,
    onDiagnostics: (entries) => { diagnostics = entries; },
    actions: async (page) => {

      const lightBackgrounds = new Map();
      for (const scheme of ["light", "dark"]) for (const width of [1440, 1024, 768, 390]) {
        await page.setMedia({ colorScheme: scheme, reducedMotion: "no-preference" });
        await page.setViewport({ width, height: 1000 });
        for (const route of routes) {
          context = `${scheme} ${width}px ${route}`;
          const startFailures = failures;
          try {
            await page.navigate(new URL(route, baseUrl).href);
            const viewport = await inPage(page, () => ({ width: innerWidth, dark: matchMedia("(prefers-color-scheme: dark)").matches,
              background: getComputedStyle(document.body).backgroundColor }));
            check("viewport/theme emulation is active", viewport.width === width && viewport.dark === (scheme === "dark"), JSON.stringify(viewport));
            if (scheme === "light") lightBackgrounds.set(`${width}:${route}`, viewport.background);
            else check("dark theme changes the rendered background", Boolean(lightBackgrounds.get(`${width}:${route}`))
              && viewport.background !== lightBackgrounds.get(`${width}:${route}`), JSON.stringify(viewport));
            await layout(page);
            if (route.startsWith("/loaders/")) {
              await page.waitFor('Boolean(document.getElementById("loader-size") && !document.getElementById("loader-size").disabled)');
              await loader(page, route.split("/").pop());
            } else if (route.includes("dashboard-skeleton") || route === "/skeletons/lines") {
              await page.waitFor('Boolean(document.getElementById("skeleton-rows") && !document.getElementById("skeleton-rows").disabled)');
              if (route.includes("dashboard")) await dashboard(page); else await lines(page);
            }
            const sample = (scheme === "light" && width === 1440 && route === "/loaders")
              || (scheme === "dark" && width === 1440 && route.includes("dashboard-skeleton"))
              || (scheme === "dark" && width === 390 && route === "/skeletons")
              || (scheme === "light" && width === 390 && route === "/docs/installation");
            if (sample) {
              await page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })");
              await page.settle();
              await screenshot(page, `${scheme}-${width}-${route.split("/").pop()}`);
            }
          } catch (error) {
            check("workspace scenario completed", false, error.message);
            if (screenshotCount < 6) await screenshot(page, `failure-${scheme}-${width}-${route.split("/").pop()}`).catch(() => {});
          }
          console.log(`${failures === startFailures ? "PASS" : "FAIL"}  ${context}`);
        }
      }
      await page.setMedia({ colorScheme: "light", reducedMotion: "no-preference" });
      await page.setViewport({ width: 1440, height: 1000 });
      for (const [source, selector, count, pattern] of [["/loaders", ".loader-card", 36, false], ["/skeletons", ".pattern", 11, true], ["/skeletons", ".skeleton-card", 10, false]]) {
        context = `navigation ${selector}`;
        try { await checkLinks(page, source, selector, count, pattern); }
        catch (error) { check("real link navigation completed", false, error.message); }
      }
    },
  });
} catch (error) {
  check("browser workspace session completed", false, error.message);
} finally {
  context = "browser diagnostics";
  for (const entry of diagnostics) check(`${entry.kind}/${entry.level}`, false, JSON.stringify(entry));
  console.log(`Workspace: ${assertions} assertions; ${failures} failures; ${screenshotCount} screenshots in ${screenshots}`);
  if (failures) process.exitCode = 1;
  else {
    try {
      rmSync(screenshots, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
      console.log("Workspace screenshots removed after successful checks.");
    } catch {
      console.warn(`Warning: workspace screenshot directory could not be removed: ${screenshots}`);
    }
  }
}
