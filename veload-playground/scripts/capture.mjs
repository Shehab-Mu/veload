/**
 * Captures a screenshot of a running page with the DevTools protocol.
 *
 * Usage:
 *   node scripts/capture.mjs <url> <output.png> [colorScheme] [width] [height]
 *
 * The color scheme can be "light" or "dark". It emulates the
 * `prefers-color-scheme` media query, so the screenshot shows the theme a
 * visitor with that system preference would see.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, output, scheme = "light", width = "1440", height = "1400"] =
  process.argv.slice(2);

if (!url || !output) {
  console.error("Usage: node scripts/capture.mjs <url> <output.png> [scheme]");
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const profile = mkdtempSync(join(tmpdir(), "veload-capture-"));
const port = 9333;

const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function waitForTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
        { method: "PUT" },
      );

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // The browser is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Could not reach the browser");
}

function send(socket, id, method, params) {
  return new Promise((resolve, reject) => {
    const listener = (event) => {
      const message = JSON.parse(event.data);

      if (message.id !== id) {
        return;
      }

      socket.removeEventListener("message", listener);

      if (message.error) {
        reject(new Error(message.error.message));
        return;
      }

      resolve(message.result);
    };

    socket.addEventListener("message", listener);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

try {
  const target = await waitForTarget();
  const socket = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  await send(socket, 1, "Page.enable", {});
  await send(socket, 2, "Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: scheme }],
  });
  await send(socket, 3, "Emulation.setDeviceMetricsOverride", {
    width: Number(width),
    height: Number(height),
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send(socket, 4, "Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const { data } = await send(socket, 5, "Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });

  writeFileSync(output, Buffer.from(data, "base64"));
  console.log(`Wrote ${output}`);

  socket.close();
} finally {
  browser.kill();

  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // The browser may still hold a lock on its profile folder.
  }
}
