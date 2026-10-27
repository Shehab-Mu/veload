/**
 * Interaction check of the playground.
 *
 * It drives the real production build in a headless browser: it moves a
 * slider, switches a tab and presses the copy button, then reports what the
 * page shows. It proves that the controls, the tabs and the copy feedback work
 * in a browser and not only in the unit tests.
 */

import { withPage } from "./browser.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const url = new URL("/loaders/spin", baseUrl).href;

/**
 * Clicks the copy button with a real mouse event so the browser treats it as
 * a user gesture. The clipboard API requires that activation.
 */
async function clickCopyButton({ send, waitFor }) {
  // SSR renders the control before Vue attaches its click handler. Do not
  // dispatch a mouse event until Nuxt has completed client hydration.
  await waitFor("Boolean(document.getElementById('__nuxt')?.__vue_app__)");

  const activePanelHasCopyButton = `(() => {
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    const panelId = tab?.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const button = panel?.querySelector(".code-block__toolbar .copy-button");

    return Boolean(
      button &&
      !button.disabled &&
      button.offsetParent !== null &&
      button.getBoundingClientRect().width > 0,
    );
  })()`;

  await waitFor(activePanelHasCopyButton);

  const { result } = await send("Runtime.evaluate", {
    expression: `(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]');
      const panelId = tab?.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const button = panel?.querySelector(
        ".code-block__toolbar .copy-button",
      );

      if (!button) return null;

      // The page scrolls smoothly, so the jump has to be instant before the
      // button can be measured and clicked.
      document.documentElement.style.scrollBehavior = "auto";
      button.scrollIntoView({ block: "center", behavior: "instant" });

      const box = button.getBoundingClientRect();

      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    })()`,
    returnByValue: true,
  });

  if (!result.value) {
    throw new Error("The copy button was not found");
  }

  const { x, y } = result.value;

  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x,
    y,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });

  await waitFor(`(() => {
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    const panelId = tab?.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const status = panel?.querySelector(".code-block__status");

    return Boolean(status?.textContent.trim());
  })()`);
}

const results = await withPage(
  url,
  async () => {
    const output = {};

    const setRange = (id, value) => {
      const input = document.getElementById(id);
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;

      setter.call(input, String(value));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    // 1. The size slider changes the preview and the generated code.
    const previewBefore = document
      .querySelector(".v-loader")
      .getAttribute("style");
    setRange("loader-size", 96);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const previewAfter = document
      .querySelector(".v-loader")
      .getAttribute("style");
    const template = document.querySelector(".playground__template code")
      .textContent;

    output.size = {
      before: /--vl-size:\s*48px/.test(previewBefore ?? ""),
      after: /--vl-size:\s*96px/.test(previewAfter ?? ""),
      template: template.includes(':size="96"'),
    };

    // 2. The copy button reports a result. The status is read before the tab
    // is switched, because the click happened on the visible panel.
    const selectedTab = document.querySelector(
      '[role="tab"][aria-selected="true"]',
    );
    const selectedPanelId = selectedTab?.getAttribute("aria-controls");
    const panel = selectedPanelId
      ? document.getElementById(selectedPanelId)
      : null;
    const status = panel?.querySelector(".code-block__status");

    output.copy = {
      status: status?.textContent.trim() ?? "",
      announced: status?.getAttribute("role") === "status",
    };

    // 3. Switching the tab shows the other implementation.
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const typescriptTab = tabs.find(
      (tab) => tab.textContent.trim() === "TypeScript",
    );

    typescriptTab.click();
    await new Promise((resolve) => setTimeout(resolve, 200));

      const typescriptPanelId = typescriptTab.getAttribute("aria-controls");
      const visiblePanel = typescriptPanelId
        ? document.getElementById(typescriptPanelId)
        : null;

    output.tabs = {
      selected: typescriptTab.getAttribute("aria-selected"),
      panelText: visiblePanel?.textContent.includes("NamedLoaderProps") ?? false,
    };

    return output;
  },
  {
    delay: 0,
    preserveClipboard: true,
    actions: async ({ send, waitFor }) => {
      await clickCopyButton({ send, waitFor });
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
);

let failures = 0;

function assert(name, condition, detail = "") {
  if (condition) {
    console.log(`PASS  ${name}`);
    return;
  }

  failures += 1;
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

assert(
  "the size slider updates the preview",
  results.size.before && results.size.after,
  JSON.stringify(results.size),
);
assert(
  "the size slider updates the generated code",
  results.size.template,
  JSON.stringify(results.size),
);
assert(
  "the tabs switch and show the other implementation",
  results.tabs.selected === "true" && results.tabs.panelText,
  JSON.stringify(results.tabs),
);
assert(
  "the visible copy button reports copy success in a live region",
  results.copy.status === "Copied to the clipboard" && results.copy.announced,
  JSON.stringify(results.copy),
);

console.log(`      copy status: "${results.copy.status}"`);

console.log("");
console.log(
  failures === 0
    ? "All interaction checks passed."
    : `${failures} interaction checks failed.`,
);

if (failures > 0) {
  process.exitCode = 1;
}
