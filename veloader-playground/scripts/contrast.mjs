/**
 * Computes WCAG contrast ratios for the design tokens.
 *
 * The surfaces listed in `inScope` are the ones `--text-subtle` is actually
 * rendered on (see the usages in `app/`). The remaining surfaces are reported
 * for reference only.
 *
 * Usage: node scripts/contrast.mjs [lightCandidate] [darkCandidate]
 */

const hex = (value) => {
  const raw = value.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const luminance = (rgb) => {
  const channels = rgb.map((value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
};

const contrast = (foreground, background) => {
  const a = luminance(hex(foreground));
  const b = luminance(hex(background));
  const [high, low] = a > b ? [a, b] : [b, a];
  return (high + 0.05) / (low + 0.05);
};

const light = {
  "page-bg": "#f6f5fa",
  surface: "#ffffff",
  "surface-muted": "#faf9fd",
  "surface-sunken": "#f2f0f8",
  "accent-soft": "#f1ebff",
};

const dark = {
  "page-bg": "#0d0a17",
  surface: "#151022",
  "surface-muted": "#191428",
  "surface-sunken": "#100d1c",
  "accent-soft": "#211a3a",
};

/** Surfaces `--text-subtle` is actually rendered on. */
const inScope = new Set(["page-bg", "surface", "surface-muted"]);

const report = (title, foreground, surfaces) => {
  console.log(`\n${title} (${foreground})`);
  for (const [name, background] of Object.entries(surfaces)) {
    const ratio = contrast(foreground, background);
    const used = inScope.has(name);
    const verdict = !used ? "n/a " : ratio >= 4.5 ? "PASS" : "FAIL";
    console.log(
      `  ${verdict}  on ${name.padEnd(15)} ${background}  ${ratio.toFixed(2)}:1  ${used ? "(in scope)" : "(not used with this token)"}`,
    );
  }
};

const candidate = process.argv[2] ?? "#857c9b";
const darkCandidate = process.argv[3] ?? "#8a82a6";

console.log(
  `light candidate ${candidate} (L ${luminance(hex(candidate)).toFixed(4)}) | dark candidate ${darkCandidate} (L ${luminance(hex(darkCandidate)).toFixed(4)})`,
);

report("current --text-subtle (light)", "#857c9b", light);
report("candidate --text-subtle (light)", candidate, light);
report("current --text-subtle (dark)", "#8a82a6", dark);
report("candidate --text-subtle (dark)", darkCandidate, dark);

console.log("\nreference tokens");
report("--text (light)", "#191233", light);
report("--text-muted (light)", "#655d7d", light);
report("--text-muted (dark)", "#a79fc2", dark);
