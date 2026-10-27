
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expectedExports = [
  "VArticleSkeleton",
  "VAutoSkeleton",
  "VBarsLoader",
  "VBlobLoader",
  "VBounceLoader",
  "VBreathingLoader",
  "VCardFlipLoader",
  "VCardSkeleton",
  "VDashboardSkeleton",
  "VDotSweepLoader",
  "VDotsLoader",
  "VDualArcLoader",
  "VElementLoader",
  "VEqualizerLoader",
  "VFallbackLoader",
  "VFeedSkeleton",
  "VFlowLoader",
  "VFormSkeleton",
  "VGradientRingLoader",
  "VGridLoader",
  "VHashtagLoader",
  "VHeatmapLoader",
  "VLiquidLoader",
  "VListSkeleton",
  "VLoader",
  "VLoading",
  "VLoadingButton",
  "VLogoSpinLoader",
  "VMediaCardSkeleton",
  "VMorphLoader",
  "VOrbitDotsLoader",
  "VOrbitLoader",
  "VPatternSkeleton",
  "VPlaneLoader",
  "VProductCardSkeleton",
  "VProfileSkeleton",
  "VProgress",
  "VProgressRingLoader",
  "VPulseLoader",
  "VRingLoader",
  "VRippleLoader",
  "VRotateLoader",
  "VSignalLoader",
  "VSkeleton",
  "VSkeletonGroup",
  "VSkeletonLoader",
  "VSkeletonSwitch",
  "VSlidingBarsLoader",
  "VSnakeLoader",
  "VSpinDotsLoader",
  "VSpinLoader",
  "VSpinner",
  "VSquaresLoader",
  "VStairLoader",
  "VTableSkeleton",
  "VTypingLoader",
  "VWaveLoader",
  "useDelayedLoading",
  "useLoading",
  "useLoadingGroup",
];

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = mkdtempSync(join(tmpdir(), "veload-consumer-"));
const modules = join(workspace, "node_modules");

function run(command, args, cwd, shell = false) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    shell,
  });
}

function link(from, to) {
  if (!existsSync(from)) {
    return false;
  }

  cpSync(from, to, { recursive: true });
  return true;
}

function findTarball(directory) {
  const tarball = readdirSync(directory).find((entry) => entry.endsWith(".tgz"));

  if (!tarball) {
    throw new Error("No tarball was produced");
  }

  return join(directory, tarball);
}

function checkSource() {
  return `import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import * as Veloader from "veload";

const expectedExports = ${JSON.stringify(expectedExports)};
const actualExports = Object.keys(Veloader).sort();
const missing = expectedExports.filter((name) => !actualExports.includes(name));
const unexpected = actualExports.filter((name) => !expectedExports.includes(name));

const failures = [];
const checks = [];
function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(name);
}

check("every documented export is present", missing.length === 0, missing.join(", "));
check("no unexpected exports", unexpected.length === 0, unexpected.join(", "));

const commonJS = createRequire(import.meta.url)("veload");
check("CommonJS exposes the same public exports", Object.keys(commonJS).sort().join(",") === actualExports.join(","));

const loaderAdditions = [
  { name: "VBreathingLoader", variant: "breathing", marks: 2 },
  { name: "VDualArcLoader", variant: "dual-arc", marks: 2 },
  { name: "VDotSweepLoader", variant: "dot-sweep", marks: 12 },
  { name: "VSlidingBarsLoader", variant: "sliding-bars", marks: 12 },
];

const app = createSSRApp({
  render: () =>
    h("div", [
      h(Veloader.VLoader, { variant: "spin", label: "Loading" }),
      h(Veloader.VSpinDotsLoader, { size: 32 }),
      h(Veloader.VSkeleton, { variant: "rect", width: 120, height: 40 }),
      h(Veloader.VPatternSkeleton, { pattern: "table", label: "Loading table" }),
      h(Veloader.VCardSkeleton, { rows: 2 }),
      h(Veloader.VSkeletonSwitch, { loading: true, pattern: "list" }),
      h(Veloader.VAutoSkeleton, { loading: true, pattern: "product" }),
      h(Veloader.VProgress, { value: 40, label: "Upload" }),
      h(Veloader.VLoading, { loading: true, label: "Loading" }, () => h("p", "Content")),
      h(Veloader.VLoadingButton, { loading: true, type: "submit" }, () => "Save"),
    ]),
});

const html = await renderToString(app);

check("the package renders on the server", html.includes("v-loader--spin"));
check("named loaders render", html.includes("v-loader--spin-dots"));
check("skeletons render", html.includes("v-skeleton--rect"));
check("patterns render", html.includes("v-pattern-skeleton--table"));
check("progress exposes its value", html.includes('aria-valuenow="40"'));
check("the loading overlay renders", html.includes("v-loading__overlay"));
check("the loading button marks itself busy", html.includes('aria-busy="true"'));
check("the status role is present", html.includes('role="status"'));

const stylesheet = readFileSync(new URL("./node_modules/veload/dist/style.css", import.meta.url), "utf8");
check("the stylesheet is shipped", stylesheet.length > 0);
check("the stylesheet contains the loader rules", stylesheet.includes(".v-loader"));
check("the stylesheet contains the reduced motion rules", stylesheet.includes("prefers-reduced-motion"));

for (const { name, variant, marks } of loaderAdditions) {
  for (const [format, exports] of [["ESM", Veloader], ["CommonJS", commonJS]]) {
    const markup = await renderToString(createSSRApp({
      render: () => h(exports[name], {
        size: 32, color: "#7c3aed", duration: 750, count: 99,
        label: "Preparing workspace", "data-consumer": variant,
      }),
    }));
    check(name + " renders from " + format, markup.includes("v-loader--" + variant));
    check(name + " keeps its mark limits in " + format, (markup.match(/class="v-loader__mark"/g) ?? []).length === marks);
    check(name + " forwards props and attrs in " + format,
      markup.includes('aria-label="Preparing workspace"') && markup.includes('data-consumer="' + variant + '"') &&
      markup.includes("--vl-size:32px") && markup.includes("--vl-duration:750ms") && markup.includes("--vl-color:#7c3aed"));
  }
  check(name + " has shipped styles", stylesheet.includes(".v-loader--" + variant));
}

const composable = Veloader.useLoading();
check("the composables are callable", composable.isLoading.value === false);

for (const entry of checks) {
  console.log(\`\${entry.ok ? "PASS" : "FAIL"}  \${entry.name}\${entry.detail ? \` - \${entry.detail}\` : ""}\`);
}
console.log(\`\\n\${checks.length - failures.length}/\${checks.length} consumer checks passed\`);
if (failures.length > 0) process.exitCode = 1;
`;
}

try {
  mkdirSync(modules, { recursive: true });

  console.log("Packing the library...");

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npm, ["pack", "--pack-destination", workspace], projectRoot, true);

  const tarball = findTarball(workspace);
  console.log(`Extracting ${tarball}...`);
  // GNU tar treats a Windows drive colon as a remote host; extract relative
    // to the existing temporary cwd so both GNU tar and Windows tar work.
    run("tar", ["-xzf", basename(tarball)], workspace);

  const extracted = join(workspace, "package");
  cpSync(extracted, join(modules, "veload"), { recursive: true });
  rmSync(extracted, { recursive: true, force: true });

  link(join(projectRoot, "node_modules", "vue"), join(modules, "vue"));
  mkdirSync(join(modules, "@vue"), { recursive: true });

  for (const pkg of [
    "runtime-core",
    "runtime-dom",
    "reactivity",
    "shared",
    "server-renderer",
  ]) {
    link(
      join(projectRoot, "node_modules", "@vue", pkg),
      join(modules, "@vue", pkg),
    );
  }

  const script = join(workspace, "check.mjs");
  writeFileSync(script, checkSource(), "utf8");

  console.log("Running the consumer checks...\n");
  const output = run(process.execPath, [script], workspace);
  process.stdout.write(output);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
