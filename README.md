# Veload

[![npm version](https://img.shields.io/npm/v/veload.svg)](https://www.npmjs.com/package/veload)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Shehab-Mu/veload/blob/main/pcakage/LICENSE)
[![Playground](https://img.shields.io/badge/Playground-veload--playground.vercel.app-6d3ff2)](https://veload-playground.vercel.app)

Accessible loading UI for Vue 3: animated loaders, skeleton placeholders, progress indicators, and loading-state components with TypeScript support.

Explore interactive demos and documentation in the [Veload playground](https://veload-playground.vercel.app).

## Key features

- `VSpinner`, `VLoader`, and 36 individually importable loader components.
- Skeleton primitives, patterns, and named layout presets.
- Determinate and indeterminate progress indicators.
- Loading overlays and a loading-aware button.
- Composables for tracking, delaying, and grouping async loading states.
- TypeScript declarations and a shared stylesheet.
- Accessible status and progress semantics, plus reduced-motion support.
- Vue components that can be rendered with Nuxt SSR.

## Installation

Veload requires Vue `^3.5.2` as a peer dependency.

```bash
npm install veload
```

Import the stylesheet once in your application entry point:

```ts
// Vite / Webpack (main.ts)
import "veload/style.css";
```

For Nuxt, register the stylesheet in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["veload/style.css"],
});
```

## Quick Start

Use Veload in a Vue 3 + TypeScript single-file component. This example simulates an async operation; replace it with your application’s work.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VLoading, useLoading } from "veload";

const { isLoading, execute } = useLoading();
const message = ref("Not loaded yet");

async function load() {
  await execute(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    message.value = "Ready";
  });
}
</script>

<template>
  <VLoading :loading="isLoading" label="Loading message">
    <button type="button" @click="load">Load message</button>
    <p>{{ message }}</p>
  </VLoading>
</template>
```

## Components and composables

All components and composables are named exports from `veload`; there is no plugin to register with `app.use()`.

**Loading and progress:** `VSpinner`, `VProgress`, `VLoading`, `VLoadingButton`.

**Loader collection:** `VLoader` selects a treatment with its `variant` prop. Individual loader components are also exported:

- **Motion:** `VBarsLoader`, `VBounceLoader`, `VDotsLoader`, `VDotSweepLoader`, `VEqualizerLoader`, `VSlidingBarsLoader`, `VSpinLoader`, `VSpinDotsLoader`, `VTypingLoader`, `VWaveLoader`.
- **Circular:** `VBreathingLoader`, `VDualArcLoader`, `VGradientRingLoader`, `VOrbitDotsLoader`, `VOrbitLoader`, `VProgressRingLoader`, `VPulseLoader`, `VRingLoader`, `VRippleLoader`, `VRotateLoader`, `VSignalLoader`, `VSnakeLoader`.
- **Geometric:** `VBlobLoader`, `VCardFlipLoader`, `VElementLoader`, `VFlowLoader`, `VGridLoader`, `VHashtagLoader`, `VHeatmapLoader`, `VLiquidLoader`, `VLogoSpinLoader`, `VMorphLoader`, `VPlaneLoader`, `VSquaresLoader`, `VStairLoader`.
- **Utility:** `VFallbackLoader`.

**Skeletons:** `VSkeleton` (`VSkeletonLoader` alias), `VPatternSkeleton`, `VSkeletonGroup`, `VSkeletonSwitch`, `VAutoSkeleton`, and the presets `VArticleSkeleton`, `VCardSkeleton`, `VDashboardSkeleton`, `VFeedSkeleton`, `VFormSkeleton`, `VListSkeleton`, `VMediaCardSkeleton`, `VProductCardSkeleton`, `VProfileSkeleton`, and `VTableSkeleton`.

**Composables:** `useLoading()`, `useDelayedLoading(options?)`, and `useLoadingGroup(sources)`.

## Usage examples

### Loader and skeleton

```vue
<VSpinner :size="32" label="Loading products" />
<VLoader variant="wave" label="Loading results" />
<VSkeleton variant="rect" width="100%" height="8rem" />
<VCardSkeleton />
```

### Progress

```vue
<VProgress :value="42" label="Uploading files" value-text="42%" />
<VProgress label="Preparing download" />
```

Omit `value` for an indeterminate progress bar.

### Loading-aware button

```vue
<VLoadingButton :loading="isSaving" type="submit">
  Save changes
</VLoadingButton>
```

### Delayed and grouped loading states

```ts
import { useDelayedLoading, useLoading, useLoadingGroup } from "veload";

const search = useDelayedLoading({ delay: 200, minVisibleDuration: 300 });
const products = useLoading();
const categories = useLoading();
const catalogLoading = useLoadingGroup([
  products.isLoading,
  categories.isLoading,
]);

await search.execute(() => fetchResults());
```

`useLoading()` tracks overlapping promises and exposes `isLoading`, `pendingCount`, and `execute`. `useDelayedLoading()` provides the same API with optional display delay and minimum visible duration. `useLoadingGroup()` derives a combined state from reactive loading sources.

## Accessibility and reduced motion

`VSpinner`, `VLoader`, and `VLoading` expose labeled status semantics. `VLoading` and `VLoadingButton` expose busy state, and determinate `VProgress` exposes its range and value. Skeletons are decorative and hidden from assistive technology by default, or can expose a status label. Loaders provide a `decorative` option when an ancestor already announces loading. Animations respect the user’s `prefers-reduced-motion` setting.

## SSR compatibility

Veload components can render with Vue SSR and Nuxt; they do not require a client-only wrapper. Create composables inside component setup rather than at module scope so mutable state is not shared between server requests. Use your framework’s server-aware data-fetching APIs for initial data; loading composables track async work but do not replace data fetching or hydration.

## Playground and documentation

Explore the components and examples in the [Veload playground](https://veload-playground.vercel.app). Browse the [installation guide](https://veload-playground.vercel.app/docs/installation), [API guide](https://veload-playground.vercel.app/docs/api), and [accessibility guide](https://veload-playground.vercel.app/docs/accessibility).

The source repository is [Shehab-Mu/veload](https://github.com/Shehab-Mu/veload).

## License

[MIT](https://github.com/Shehab-Mu/veload/blob/main/pcakage/LICENSE)
