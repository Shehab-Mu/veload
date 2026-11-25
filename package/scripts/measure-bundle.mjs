

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = join(projectRoot, ".bundle-measurement");

function gzipSize(path) {
  return gzipSync(readFileSync(path)).length;
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function build(entry, outDir) {
  const config = `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: fileURLToPath(new URL("./${outDir}", import.meta.url)),
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./entry.js", import.meta.url)),
      formats: ["es"],
      fileName: () => "bundle.js",
    },
    rollupOptions: { external: ["vue"] },
    minify: true,
  },
});
`;

  writeFileSync(join(workspace, "vite.config.mjs"), config, "utf8");
  writeFileSync(join(workspace, "entry.js"), entry, "utf8");

  execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", [
    "vite",
    "build",
    "--config",
    join(workspace, "vite.config.mjs"),
  ], { cwd: projectRoot, stdio: "pipe", shell: process.platform === "win32" });

  const bundle = join(workspace, outDir, "bundle.js");
  const stylesheet = readdirSync(join(workspace, outDir)).find((entry) =>
    entry.endsWith(".css"),
  );

  return {
    js: readFileSync(bundle).length,
    jsGzip: gzipSize(bundle),
    css: stylesheet ? readFileSync(join(workspace, outDir, stylesheet)).length : 0,
    cssGzip: stylesheet
      ? gzipSize(join(workspace, outDir, stylesheet))
      : 0,
  };
}

try {
  rmSync(workspace, { recursive: true, force: true });
  mkdirSync(workspace, { recursive: true });

  console.log("Building a consumer that imports VSpinner only...");
  const single = build(
    'import { VSpinner } from "../src/index";\nexport { VSpinner };\n',
    "out-single",
  );

  console.log("Building a consumer that imports the four additional loaders...");
  const additions = build(
    'import { VBreathingLoader, VDualArcLoader, VDotSweepLoader, VSlidingBarsLoader } from "../src/index";\nexport { VBreathingLoader, VDualArcLoader, VDotSweepLoader, VSlidingBarsLoader };\n',
    "out-loaders",
  );

  console.log("Building a consumer that imports the whole package...");
  const all = build(
    'import * as Veload from "../src/index";\nexport { Veload };\n',
    "out-all",
  );

  console.log("");
  console.log("Bundle                JavaScript            CSS");
  console.log(
    `VSpinner only         ${format(single.js)} (${format(single.jsGzip)} gz)  ${format(single.css)} (${format(single.cssGzip)} gz)`,
  );
  console.log(
    `Four new loaders      ${format(additions.js)} (${format(additions.jsGzip)} gz)  ${format(additions.css)} (${format(additions.cssGzip)} gz)`,
  );
  console.log(
    `Whole package         ${format(all.js)} (${format(all.jsGzip)} gz)  ${format(all.css)} (${format(all.cssGzip)} gz)`,
  );
  console.log("");
  console.log(
    `Tree shaken away: ${format(all.js - single.js)} of JavaScript (${(((all.js - single.js) / all.js) * 100).toFixed(1)}%)`,
  );
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
