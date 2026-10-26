import type { LoaderMeta, SkeletonPresetMeta } from "../data/catalog";
import { skeletonPresetPropNames } from "../data/component-props";

/**
 * Controls exposed by the loader playground.
 */
export interface LoaderControlState {
  size: number;
  color: string;
  duration: number;
  label: string;
  count: number;
  value: number | null;
  decorative: boolean;
}

/**
 * Controls exposed by the skeleton playground.
 */
export interface SkeletonControlState {
  rows: number;
  columns: number;
  animated: boolean;
  color: string;
  highlightColor: string;
  label: string;
  avatarSize: number;
  mediaHeight: string;
  showMedia: boolean;
  showAvatar: boolean;
  showHeader: boolean;
  showChart: boolean;
  showStats: boolean;
  showSubmit: boolean;
  showRating: boolean;
  showPrice: boolean;
  showCta: boolean;
}

export function escapeAttributeValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isDifferent(value: unknown, fallback: unknown): boolean {
  if (typeof value === "number" && typeof fallback === "number") {
    return value !== fallback;
  }

  return value !== fallback;
}

interface Binding {
  name: string;
  value: unknown;
}

interface BindingInput {
  name: string;
  value: unknown;
  fallback: unknown;
}

function collectBindings(inputs: BindingInput[]): Binding[] {
  const bindings: Binding[] = [];

  for (const input of inputs) {
    if (typeof input.value === "boolean") {
      // A boolean is only mentioned when it differs from the default, so the
      // snippet stays short but never disagrees with the preview.
      if (input.value !== input.fallback) {
        bindings.push(input);
      }
      continue;
    }

    if (input.value === null || input.value === undefined) {
      continue;
    }

    // An empty loader label is meaningful: VLoader treats it as decorative.
    // Keep it in generated examples instead of silently restoring "Loading".
    if (input.value === "") {
      if (
        input.name === "label" &&
        typeof input.fallback === "string" &&
        input.fallback.length > 0
      ) {
        bindings.push(input);
      }
      continue;
    }

    if (!isDifferent(input.value, input.fallback)) {
      continue;
    }

    bindings.push(input);
  }

  return bindings;
}

function renderBinding(binding: Binding): string {
  const { name, value } = binding;

  if (typeof value === "boolean") {
    return value ? name : `:${name}="false"`;
  }

  if (typeof value === "number") {
    return `:${name}="${value}"`;
  }

  return `${name}="${escapeAttributeValue(String(value))}"`;
}

function renderBoundName(binding: Binding): string {
  return `:${binding.name}="${binding.name}"`;
}

function loaderBindings(
  entry: LoaderMeta,
  state: LoaderControlState,
  defaults: Record<string, unknown>,
): Binding[] {
  const inputs: BindingInput[] = [
    { name: "size", value: state.size, fallback: defaults.size },
    { name: "color", value: state.color, fallback: defaults.color },
    { name: "duration", value: state.duration, fallback: defaults.duration },
    ...(entry.repeatCount ? [{ name: "count", value: state.count, fallback: defaults.count }] : []),
    { name: "label", value: state.label, fallback: defaults.label },
    { name: "decorative", value: state.decorative, fallback: defaults.decorative },
  ];

  // Only the progress ring renders a value.
  if (entry.supportsValue) {
    inputs.push({ name: "value", value: state.value, fallback: defaults.value });
  }

  return collectBindings(inputs);
}

function skeletonBindings(
  preset: SkeletonPresetMeta,
  state: SkeletonControlState,
  defaults: Record<string, unknown>,
): Binding[] {
  const inputs: BindingInput[] = [
    { name: "rows", value: state.rows, fallback: defaults.rows },
    { name: "columns", value: state.columns, fallback: defaults.columns },
    { name: "avatarSize", value: state.avatarSize, fallback: defaults.avatarSize },
    {
      name: "mediaHeight",
      value: state.mediaHeight,
      fallback: defaults.mediaHeight,
    },
    { name: "color", value: state.color, fallback: defaults.color },
    {
      name: "highlightColor",
      value: state.highlightColor,
      fallback: defaults.highlightColor,
    },
    { name: "animated", value: state.animated, fallback: defaults.animated },
    { name: "label", value: state.label, fallback: defaults.label },
    { name: "showMedia", value: state.showMedia, fallback: defaults.showMedia },
    { name: "showAvatar", value: state.showAvatar, fallback: defaults.showAvatar },
    { name: "showHeader", value: state.showHeader, fallback: defaults.showHeader },
    { name: "showChart", value: state.showChart, fallback: defaults.showChart },
    { name: "showStats", value: state.showStats, fallback: defaults.showStats },
    { name: "showSubmit", value: state.showSubmit, fallback: defaults.showSubmit },
    { name: "showRating", value: state.showRating, fallback: defaults.showRating },
    { name: "showPrice", value: state.showPrice, fallback: defaults.showPrice },
    { name: "showCta", value: state.showCta, fallback: defaults.showCta },
  ];
  const supported = skeletonPresetPropNames[preset.name] ?? [];
  return collectBindings(inputs.filter((input) => supported.includes(input.name)));
}

/**
 * Builds the template usage of a named loader.
 */
export function loaderTemplate(
  entry: LoaderMeta,
  state: LoaderControlState,
  defaults: Record<string, unknown>,
): string {
  const attributes = loaderBindings(entry, state, defaults).map(renderBinding);

  return attributes.length > 0
    ? `<${entry.name} ${attributes.join(" ")} />`
    : `<${entry.name} />`;
}

/**
 * Builds a complete single file component for a named loader.
 */
export function loaderSfc(
  entry: LoaderMeta,
  state: LoaderControlState,
  defaults: Record<string, unknown>,
): string {
  return `<script setup lang="ts">
import { ${entry.name} } from "veloader";
import "veloader/style.css";
</script>

<template>
  ${loaderTemplate(entry, state, defaults)}
</template>`;
}

/**
 * Builds a state driven example for a named loader.
 */
export function loaderComposition(
  entry: LoaderMeta,
  state: LoaderControlState,
  defaults: Record<string, unknown>,
): string {
  const bindings = loaderBindings(entry, state, defaults);

  if (bindings.length === 0) {
    return loaderSfc(entry, state, defaults);
  }

  const refs = bindings
    .map((binding) => {
      const literal =
        typeof binding.value === "number"
          ? String(binding.value)
          : JSON.stringify(binding.value);
      return `const ${binding.name} = ref(${literal});`;
    })
    .join("\n");

  const attributes = bindings.map(renderBoundName).join(" ");

  return `<script setup lang="ts">
import { ref } from "vue";
import { ${entry.name} } from "veloader";
import "veloader/style.css";

${refs}
</script>

<template>
  <${entry.name} ${attributes} />
</template>`;
}

/**
 * Builds the TypeScript API snippet of a named loader.
 */
export function loaderTypes(
  entry: LoaderMeta,
  state: LoaderControlState,
): string {
  const propsType = entry.supportsValue
    ? "VProgressRingLoaderProps"
    : "NamedLoaderProps";

  const lines: string[] = [
    `import { ${entry.name}, type ${propsType} } from "veloader";`,
    "",
    `// ${entry.name} accepts the shared ${propsType} type.`,
    `const props: ${propsType} = {`,
  ];

  if (state.size !== 40) {
    lines.push(`  size: ${state.size},`);
  }

  if (state.color !== "currentColor") {
    lines.push(`  color: ${JSON.stringify(state.color)},`);
  }

  if (state.duration !== 1000) {
    lines.push(`  duration: ${state.duration},`);
  }

  if (entry.repeatCount && state.count !== entry.defaultMarks) {
    lines.push(`  count: ${state.count},`);
  }

  if (state.label !== "Loading") {
    lines.push(`  label: ${JSON.stringify(state.label)},`);
  }

  if (state.decorative) {
    lines.push("  decorative: true,");
  }

  if (entry.supportsValue && state.value !== null) {
    lines.push(`  value: ${state.value},`);
  }

  lines.push("};", "", `// Render it: <${entry.name} v-bind="props" />`);

  return lines.join("\n");
}

/**
 * Builds the template usage of a named skeleton preset.
 */
export function skeletonTemplate(
  preset: SkeletonPresetMeta,
  state: SkeletonControlState,
  defaults: Record<string, unknown>,
): string {
  const attributes = skeletonBindings(preset, state, defaults).map(renderBinding);

  return attributes.length > 0
    ? `<${preset.name} ${attributes.join(" ")} />`
    : `<${preset.name} />`;
}

/**
 * Builds a complete single file component for a named skeleton preset.
 */
export function skeletonSfc(
  preset: SkeletonPresetMeta,
  state: SkeletonControlState,
  defaults: Record<string, unknown>,
): string {
  return `<script setup lang="ts">
import { ${preset.name} } from "veloader";
import "veloader/style.css";
</script>

<template>
  ${skeletonTemplate(preset, state, defaults)}
</template>`;
}

/**
 * Builds a state driven example for a named skeleton preset.
 */
export function skeletonComposition(
  preset: SkeletonPresetMeta,
  state: SkeletonControlState,
  defaults: Record<string, unknown>,
): string {
  const bindings = skeletonBindings(preset, state, defaults);

  if (bindings.length === 0) {
    return skeletonSfc(preset, state, defaults);
  }

  const refs = bindings
    .map((binding) => {
      const literal =
        typeof binding.value === "number"
          ? String(binding.value)
          : JSON.stringify(binding.value);
      return `const ${binding.name} = ref(${literal});`;
    })
    .join("\n");

  const attributes = bindings.map(renderBoundName).join(" ");

  return `<script setup lang="ts">
import { ref } from "vue";
import { ${preset.name} } from "veloader";
import "veloader/style.css";

${refs}
</script>

<template>
  <${preset.name} ${attributes} />
</template>`;
}

/** Builds a typed preset example from the same supported bindings as its preview. */
export function skeletonTypes(
  preset: SkeletonPresetMeta,
  state: SkeletonControlState,
  defaults: Record<string, unknown>,
): string {
  const propsType = `${preset.name}Props`;
  const bindings = skeletonBindings(preset, state, defaults);
  const properties = bindings.map((binding) =>
    `  ${binding.name}: ${JSON.stringify(binding.value)},`,
  );
  return [
    `import { ${preset.name}, type ${propsType} } from "veloader";`,
    "",
    `const props: ${propsType} = {`,
    ...properties,
    "};",
    "",
    `// Render it: <${preset.name} v-bind="props" />`,
  ].join("\n");
}

/**
 * Installation instructions shared by the documentation pages.
 */
export function installSnippet(): string {
  return `# Only after a public release under the confirmed package name.
# Veloader is currently private and unpublished.
npm install veloader`;
}

/**
 * Stylesheet registration for the different frameworks.
 */
export function stylesheetSnippet(): string {
  return `// Nuxt — nuxt.config.ts
export default defineNuxtConfig({
  css: ["veloader/style.css"],
});

// Vite — main.ts
import "veloader/style.css";

// Vue CLI / plain webpack — main.ts
import "veloader/style.css";`;
}
