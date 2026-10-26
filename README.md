# Veload

**Veload** is a Vue 3 loading toolkit for developers building responsive, accessible loading experiences. It provides loaders, skeleton placeholders, progress indicators, loading-state components, and composables for tracking asynchronous work.

The product is named **Veload**; its published npm package is **`veload`** (`veload@0.1.0`).

## Features

- `VSpinner`, `VLoader`, and 36 individually importable animated loaders.
- Skeleton primitives, reusable patterns, and named layout presets.
- Determinate and indeterminate progress bars.
- Loading overlays and a loading-aware native button.
- Composables for concurrent, delayed, and grouped loading states.
- TypeScript declarations included with the package.
- Accessible status and progress semantics, with decorative options where appropriate.
- Animations honor `prefers-reduced-motion`.
- Vue components can render with Nuxt SSR; the ESM entry supports tree-shaking. The shared stylesheet includes styles for all components.

## Installation

```bash
npm install veload
```

Import the stylesheet once in your application entry point or root component. The package does not inject styles automatically:

```ts
import "veload/style.css";
```

The `veload` entry provides ESM (`dist/index.js`), CommonJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`). The shared stylesheet is available through `veload/style.css` (`dist/style.css`).

## Quick start

This Vue 3 + TypeScript single-file component demonstrates an async operation with a loading overlay:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VLoading, useLoading } from "veload";
import "veload/style.css";

const { isLoading, execute } = useLoading();
const message = ref<string | null>(null);

async function load() {
  try {
    const response = await execute(() => fetch("/api/message"));
    if (!response.ok) throw new Error("Request failed");
    message.value = (await response.json()) as string;
  } catch (error) {
    message.value = error instanceof Error ? error.message : "Unknown error";
  }
}
</script>

<template>
  <VLoading :loading="isLoading" label="Loading message">
    <button type="button" @click="load">Reload</button>
    <p v-if="message">{{ message }}</p>
  </VLoading>
</template>
```

The `/api/message` endpoint belongs to your application. In `<script setup>`, imported components are available in the template without global registration.

## Usage examples

### Spinner

```vue
<VSpinner :size="40" color="#2563eb" label="Loading products" />
```

### Skeleton

```vue
<VSkeleton variant="rect" width="100%" height="8rem" />
<VCardSkeleton />
```

### Progress

```vue
<VProgress :value="42" label="Uploading files" value-text="42%" />
<VProgress label="Preparing download" />
```

Omit `value` for indeterminate progress.

### Loading button

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

`useLoading()` tracks overlapping async operations; `useDelayedLoading()` delays indicator visibility to reduce flicker; `useLoadingGroup()` derives a combined state from existing sources. See the [public exports](#components-and-loaders) and the [playground API guide](https://veload-playground.vercel.app/docs/api) for more examples and prop details.

## Components and loaders

All entries below are named exports from `veload`. Import components directly; the package does not provide a default plugin.

**Loading and progress:** `VSpinner`, `VProgress`, `VLoading`, `VLoadingButton`.

**Loader collection:** `VLoader` (select a treatment with its `variant` prop), plus these individually exported loaders:

- **Motion:** `VBarsLoader`, `VBounceLoader`, `VDotsLoader`, `VDotSweepLoader`, `VEqualizerLoader`, `VSlidingBarsLoader`, `VSpinLoader`, `VSpinDotsLoader`, `VTypingLoader`, `VWaveLoader`.
- **Circular:** `VBreathingLoader`, `VDualArcLoader`, `VGradientRingLoader`, `VOrbitDotsLoader`, `VOrbitLoader`, `VProgressRingLoader`, `VPulseLoader`, `VRingLoader`, `VRippleLoader`, `VRotateLoader`, `VSignalLoader`, `VSnakeLoader`.
- **Geometric:** `VBlobLoader`, `VCardFlipLoader`, `VElementLoader`, `VFlowLoader`, `VGridLoader`, `VHashtagLoader`, `VHeatmapLoader`, `VLiquidLoader`, `VLogoSpinLoader`, `VMorphLoader`, `VPlaneLoader`, `VSquaresLoader`, `VStairLoader`.
- **Utility:** `VFallbackLoader`.

**Skeletons:** `VSkeleton` and its alias `VSkeletonLoader`; `VPatternSkeleton`; layout helpers `VSkeletonGroup`, `VSkeletonSwitch`, and `VAutoSkeleton`; presets `VArticleSkeleton`, `VCardSkeleton`, `VDashboardSkeleton`, `VFeedSkeleton`, `VFormSkeleton`, `VListSkeleton`, `VMediaCardSkeleton`, `VProductCardSkeleton`, `VProfileSkeleton`, and `VTableSkeleton`.

**Composables:** `useLoading()`, `useDelayedLoading(options?)`, and `useLoadingGroup(sources)`.

## Accessibility and SSR

Loading components expose status semantics and labels, progress bars expose progress values when determinate, and loading wrappers set `aria-busy`. Skeletons are hidden from assistive technology by default unless given a label; loaders support decorative use to avoid duplicate announcements. `VLoadingButton` uses a native disabled button while loading. Animations respect `prefers-reduced-motion`.

The components can render in Nuxt SSR and do not require a client-only wrapper. For SSR applications, create composables inside component setup rather than at module scope, so mutable state is not shared across requests. Use the framework's server-aware data-fetching APIs for initial data; the loading composables track operations and do not replace data fetching or hydration.

These behaviors are covered by tests, but the project does not claim formal WCAG conformance.

## Playground

[`veload-playground/`](./veload-playground/) is the Nuxt application used to explore and demonstrate the library. Its current production URL is [https://veload-playground.vercel.app](https://veload-playground.vercel.app).

Run the playground commands from `veload-playground/`:

```bash
npm run dev
npm run build
npm run generate
npm run preview
npm run typecheck
npm test
npm run check:a11y
npm run check:interactions
npm run check:og-image
```

The `dev` and `build` scripts rebuild the sibling library first. The playground requires Node.js `^22.22.3` as declared in its `package.json`.

### Public site origin

The playground uses `NUXT_PUBLIC_SITE_URL` for canonical and social metadata, `robots.txt`, and the sitemap. Set it to the real public HTTP(S) origin when deploying. Reverse proxies should use the external public origin rather than an internal host or forwarded request host.

For static generation, provide the value at **generation time**; generated page metadata does not automatically load a later runtime value. The built Node server does not automatically load a local development `.env` file either, so provide the variable in the server's runtime environment. No environment-template copy is needed for local development.

## Development and validation

The repository has no root package manifest; run library and playground commands from their respective directories. The following are the library scripts declared in `pcakage/package.json`:

```bash
cd pcakage
npm run build       # Build ESM/CJS output and TypeScript declarations
npm run build:types # Generate TypeScript declarations only
npm test            # Run library tests with Vitest
npm run typecheck   # Check library TypeScript and Vue components
```

To generate declarations separately, run `npm run build:types`. `npm run build` already runs that script after the Vite build. The playground's `npm run typecheck` and `npm test` are listed above.

## Project structure

```text
.
├── pcakage/             # Vue library source, build configuration, and package metadata
│   ├── src/
│   ├── scripts/
│   └── package.json
├── veload-playground/   # Nuxt playground, documentation pages, and app tests
│   ├── app/
│   ├── server/
│   ├── shared/
│   └── package.json
└── README.md
```

`pcakage/` is the library directory's existing spelling and is intentionally preserved. The playground is a separate application and consumes the sibling library during repository development.

## Compatibility

Veload requires Vue **`^3.5.2`** as a peer dependency (Vue 3.5.2 or a compatible later Vue 3 release). The library bundles its JavaScript and TypeScript declarations; consumers import the shared stylesheet separately. The playground currently declares Node.js `^22.22.3`.

## License

Veload is distributed under the [MIT License](./pcakage/LICENSE). The npm package metadata also declares `MIT`.

## Links

- [Veload on npm](https://www.npmjs.com/package/veload)
- [Playground](https://veload-playground.vercel.app)
