# Veloader

A small, accessible loading toolkit for Vue 3, written in TypeScript.

Veloader provides:

- `VSpinner` — an animated status spinner
- `VSkeleton` — text, rectangular, and circular placeholders
- `VProgress` — determinate and indeterminate progress bars
- `VLoading` — a content wrapper with a loading overlay
- `VLoadingButton` — a native button with a loading state
- `useLoading()` — concurrent async operation tracking
- `useDelayedLoading()` — delayed and minimum-duration indicator visibility
- `useLoadingGroup()` — aggregation of independent loading states

> **Release status:** Veloader is licensed under MIT and is being prepared
> for its first public npm release. It is not yet published, so the install
> command below becomes usable only after the release is verified on npm.

## Installation

The workflow below is intended only after a public release is verified on
npm; consumers can then install the published package with:

```bash
npm install veload
```

Veloader's actual Vue peer range is **`^3.5.2`**: Vue 3.5.2 or a later
compatible Vue 3 release, below Vue 4. Vue 3.0–3.4 are not supported by this
range. The generated declarations rely on Vue 3.5 type definitions. Use a
Vue application toolchain such as Vite with its Vue plugin or Nuxt; the
library itself ships compiled JavaScript, not SFCs consumers need to build.

No local library build, repository checkout, linking, or tarball is part of
the future public consumer workflow. Authorized repository development is
covered separately under [Local maintainer workflow](#local-maintainer-workflow).

The public entry points are:

| Import | Exported files |
| --- | --- |
| `veload` | Named ESM exports (`dist/index.js`), CommonJS (`dist/index.cjs`), and declarations (`dist/index.d.ts`). |
| `veload/style.css` | The extracted component stylesheet (`dist/style.css`). |

Import from these public paths, not internal source or `dist` subpaths.

### Stylesheet

Component styles are extracted into `dist/style.css`. Import it once in your
application entry point or root component:

```ts
import "veload/style.css";
```

The JavaScript entry does not inject styles automatically. Without this import
the components render without their intended appearance and animations.

The stylesheet contains the styles of **every** component and is not split
per component. The ESM JavaScript entry point is tree-shakeable, so a
production bundler can remove unused components, but that does not trim the
shared CSS. Maintainers can run `npm run check:bundle` and
`npm run check:consumer` for measurements against the current packed build;
payload sizes change as the collection grows.

## Quick start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VLoading, useLoading } from "veload";
import "veload/style.css";

const { isLoading, execute } = useLoading();
const message = ref<string | null>(null);

async function load() {
  try {
    message.value = await execute(async () => {
      const response = await fetch("/api/message");
      if (!response.ok) throw new Error("Request failed");
      return (await response.json()) as string;
    });
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

Supply your own `/api/message` endpoint returning a JSON string; it is not
provided by Veloader. The request runs only on a user click, and the
application handles its errors. In `<script setup>`, imported components are
available in the template without registration.

### Optional component registration

All components are named exports. There is no default plugin export, global
plugin installation step, or global loading manager. For Options API
components, import the components and add them to `components`. To opt into
Vue's global registration instead, register individual exports in `main.ts`:

```ts
import { createApp } from "vue";
import { VSpinner } from "veload";
import "veload/style.css";
import App from "./App.vue";

const app = createApp(App);
app.component("VSpinner", VSpinner);
app.mount("#app");
```

Do not call `app.use(Veloader)`; there is no Veloader plugin. Runtime global
registration does not automatically declare components for Vue's template
type checker. Prefer local imports, or add a Vue `GlobalComponents` type
augmentation in the consuming app if global template typing is needed.

### Nuxt and SSR

Register the stylesheet once through Nuxt's global CSS option:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["veload/style.css"],
});
```

Import components directly in page or component SFCs. No Nuxt module,
client-only plugin, or `<ClientOnly>` wrapper is required to render them.
Use Nuxt's `useFetch` or `useAsyncData` for initial server data so Nuxt reuses
the server payload during hydration:

```vue
<script setup lang="ts">
import { VLoading } from "veload";

const { data: message, status, error, refresh } =
  await useFetch<string>("/api/message");
</script>

<template>
  <VLoading :loading="status === 'pending'" label="Loading message">
    <button type="button" @click="refresh()">Reload</button>
    <p v-if="error">Could not load the message.</p>
    <p v-else-if="message">{{ message }}</p>
  </VLoading>
</template>
```

The endpoint is application-owned. Create loading composables inside setup,
not at module scope where their mutable state could leak across SSR
requests. `useLoading` and `useDelayedLoading` track user-triggered work;
they do not replace Nuxt's data fetching or payload handling. Keep
browser-only code in event handlers or `onMounted` and use matching initial
state on the server and client to avoid hydration mismatches.

## Components

### `VSpinner`

An accessible CSS spinner with a customizable size and accent color.

```vue
<VSpinner />
<VSpinner :size="40" color="#22C55E" label="Loading products" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `24` | Diameter in pixels. Negative and non-finite values are normalized. |
| `color` | `string` | `"currentColor"` | Accent color of the active edge. |
| `label` | `string` | `"Loading"` | Accessible name for `role="status"`. A blank label makes the spinner decorative. |
| `decorative` | `boolean` | `false` | Hides the spinner from assistive technology. Use when an ancestor already announces loading. |

The visual ring is always `aria-hidden`; only the root status element is
announced. The spinner itself does not animate under
`prefers-reduced-motion: reduce`.

### `VSkeleton`

A placeholder primitive for text, rectangles, and circles.

```vue
<!-- A single line of text -->
<VSkeleton />

<!-- A card-sized rectangle -->
<VSkeleton variant="rect" width="100%" height="12rem" />

<!-- An avatar -->
<VSkeleton variant="circle" :width="48" label="Loading avatar" />

<!-- Static, no shimmer -->
<VSkeleton variant="rect" :animated="false" height="2rem" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"text" \| "rect" \| "circle"` | `"text"` | Placeholder shape. Unknown runtime values fall back to `"text"`. |
| `width` | `number \| string` | `100%` (`40px` for circles) | Pixel number or CSS length. |
| `height` | `number \| string` | `1em` for text, `6rem` for rectangles, square for circles | Pixel number or CSS length. |
| `borderRadius` | `number \| string` | Shape-dependent | Overrides the default radius. |
| `animated` | `boolean` | `true` | Enables the shimmer. Reduced-motion preferences always disable it. |
| `label` | `string` | — | When provided, the skeleton becomes a `role="status"` placeholder. Without a label it is `aria-hidden`. |

For simple layouts, compose the primitive with application spacing. For common
application layouts, see the named skeleton presets in the [Skeleton collection](#skeleton-collection).

### `VProgress`

A progress bar for known and unknown totals.

```vue
<!-- Determinate -->
<VProgress :value="42" label="Uploading files" value-text="42%" />

<!-- Indeterminate -->
<VProgress label="Preparing download" />

<!-- Custom range and appearance -->
<VProgress
  :value="3"
  :max="10"
  label="Steps completed"
  value-text="3 of 10 steps"
  height="1rem"
  color="#16A34A"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| null` | `null` | Current value. Omit or pass `null`/`NaN` for indeterminate progress. |
| `min` | `number` | `0` | Range lower bound. |
| `max` | `number` | `100` | Range upper bound. |
| `label` | `string` | `"Progress"` | Accessible name. A blank label omits `aria-label`. |
| `valueText` | `string` | — | Human-readable value exposed through `aria-valuetext`. Only used while determinate. |
| `height` | `number \| string` | `8` | Bar thickness in pixels or any CSS length. |
| `color` | `string` | `#2563eb` | Filled bar color. Overrides `--v-progress-color`. |
| `trackColor` | `string` | `#e2e8f0` | Track color. Overrides `--v-progress-track-color`. |

Values are clamped to `[min, max]`. A non-finite value or an invalid range
(`max <= min`) produces indeterminate progress with no `aria-valuenow`.
Indeterminate progress does not claim a completion percentage.

### `VLoading`

A positioned overlay around content.

```vue
<VLoading :loading="isLoading" label="Loading products">
  <ProductList />
</VLoading>

<!-- Keep content interactive while the overlay is visible -->
<VLoading :loading="isLoading" :inert-content="false" label="Refreshing">
  <ProductList />
</VLoading>

<!-- Custom indicator -->
<VLoading :loading="isLoading" label="Loading products">
  <ProductList />

  <template #indicator>
    <span class="my-loader">Please wait…</span>
  </template>
</VLoading>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `loading` | `boolean` | `false` | Shows the overlay and sets `aria-busy`. |
| `label` | `string` | `"Loading"` | Loading message. Visually hidden, announced by `role="status"`. A blank label removes the status role and hides the overlay from assistive technology. |
| `inertContent` | `boolean` | `true` | Makes wrapped content inert while loading. |
| `indicatorSize` | `number` | `28` | Size of the built-in spinner. |

Slots:

- `default` — the content being loaded.
- `indicator` — replaces the built-in spinner.

The overlay is absolutely positioned, so showing and hiding it does not change
the content's layout. The wrapper establishes a stacking context
(`isolation: isolate`) and the overlay defaults to `z-index: 10`. Give the
wrapper a height (or content) when it is not otherwise sized. When
`inertContent` is `true` (the default), the content is inert and the overlay
intercepts pointer events; when `false`, the overlay does not intercept pointer
events and content remains interactive. `inert` is supported by modern
browsers; older browsers may still allow interaction with content beneath the
overlay.

### `VLoadingButton`

A native `<button>` with a loading state.

```vue
<script setup lang="ts">
import { VLoadingButton, useLoading } from "veload";

const { isLoading, execute } = useLoading();

function save() {
  return execute(async () => {
    await fetch("/api/save", { method: "POST" });
  });
}
</script>

<template>
  <VLoadingButton :loading="isLoading" type="submit" @click="save">
    Save changes
  </VLoadingButton>
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `loading` | `boolean` | `false` | Disables the button, sets `aria-busy="true"`, and shows an indicator. |
| `disabled` | `boolean` | `false` | Native disabled state. The button is also disabled while loading. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Native button type. The safe default avoids accidental form submission. |
| `indicatorSize` | `number` | `16` | Size of the built-in spinner. |

Slots:

- `default` — button label/content. It remains in the accessibility tree and
  keeps its space while loading.
- `indicator` — replaces the built-in spinner.

Native attributes and event listeners are forwarded to the `<button>` element.
While loading, the native `disabled` attribute prevents repeated activation.
The component deliberately has no action callback prop: pass your async
handler through native listeners so errors propagate to your own code.

## Composables

### `useLoading()`

Tracks concurrent asynchronous operations for one loading state.

```ts
import { useLoading } from "veload";

const { isLoading, pendingCount, execute } = useLoading();

const result = await execute(() => fetchData());
```

| Member | Type | Description |
|---|---|---|
| `isLoading` | `Readonly<Ref<boolean>>` | `true` while at least one operation is pending. |
| `pendingCount` | `Readonly<Ref<number>>` | Number of pending operations for this instance. |
| `execute` | `<T>(operation: () => Promise<T>) => Promise<T>` | Runs and tracks the operation. Results and errors pass through unchanged. |

Each instance owns independent state. Overlapping calls are counted, and
`isLoading` stays `true` until the last operation settles. Synchronous throws
from the callback are also cleaned up and propagated.

`execute` continues to settle correctly when called outside an active Vue
effect scope. State is not automatically reset when a scope is disposed;
pending operations still decrement their own count when they finish.

### `useDelayedLoading(options?)`

Prevents loading-indicator flicker for fast operations.

```ts
import { useDelayedLoading } from "veload";

const { isLoading, pendingCount, execute } = useDelayedLoading({
  delay: 200,
  minVisibleDuration: 300,
});
```

`options` may also be a number, which is shorthand for `{ delay: number }`.

| Option | Type | Default | Description |
|---|---|---|---|
| `delay` | `number` | `200` | Milliseconds to wait before `isLoading` becomes `true`. Negative values become `0`; non-finite values use the default. |
| `minVisibleDuration` | `number` | `0` | Minimum milliseconds the indicator remains visible once shown. Negative values become `0`; non-finite values become `0`. |

Behavior:

- The operation starts immediately; only indicator visibility is delayed.
- If all operations finish before `delay`, the indicator never appears.
- Once visible, the indicator stays visible while any operation is pending.
- `minVisibleDuration` is measured from the moment the indicator appears, not
  from when each operation starts. It is a minimum for continuous visibility:
  if the indicator has already been visible that long, it hides as soon as all
  operations finish.
- A new operation starting while a hide is pending cancels that hide and keeps
  the indicator visible.
- Timers are cleared when operations finish or the owning component/effect
  scope is disposed. Disposing a scope hides a visible indicator immediately.
- Results and errors are preserved exactly as with `useLoading()`.

### `useLoadingGroup(sources)`

Aggregates independent loading sources without owning them.

```ts
import { useLoading, useLoadingGroup } from "veload";

const products = useLoading();
const categories = useLoading();

const { isLoading, activeCount } = useLoadingGroup([
  products.isLoading,
  categories.isLoading,
]);
```

`sources` is either an array of `Readonly<Ref<boolean>>` / `() => boolean`
values, or a getter returning such an array when the set changes dynamically.

| Member | Type | Description |
|---|---|---|
| `isLoading` | `ComputedRef<boolean>` | `true` when at least one source is active. |
| `activeCount` | `ComputedRef<number>` | Number of active sources. |

The group is read-only: it does not mutate, start, or stop the source states.

## Accessibility

- `VSpinner` uses `role="status"` with an accessible label. Set `decorative`
  or use a blank label when a parent already announces loading.
- `VSkeleton` is decorative by default. Provide `label` to expose it as a
  `role="status"` placeholder with `aria-busy="true"`.
- `VProgress` uses `role="progressbar"` and exposes
  `aria-valuemin`/`aria-valuemax`/`aria-valuenow` only when determinate.
  `aria-valuetext` is available for human-readable values.
- `VLoading` sets `aria-busy` on its wrapper and announces its label through
  `role="status"`. Its built-in spinner is decorative to avoid duplicate
  announcements. With a blank label the overlay is `aria-hidden`.
- `VLoadingButton` exposes `aria-busy` while loading and relies on the native
  `disabled` attribute to prevent repeated activation. Its label remains
  available to assistive technology.
- All animations are disabled or reduced under
  `prefers-reduced-motion: reduce`. Consumers can still add their own motion
  preferences.

These behaviors are covered by unit tests, but no formal WCAG conformance
audit has been performed.

## Customization

Components use scoped styles and documented CSS custom properties. Set them on
a component or an ancestor:

```vue
<VProgress
  :value="60"
  style="--v-progress-color: #7c3aed; --v-progress-track-color: #ede9fe"
/>
```

| Component | Custom property | Default |
|---|---|---|
| `VSpinner` | `--v-spinner-border-width` | `3px` |
| | `--v-spinner-track-color` | `currentColor` |
| `VSkeleton` | `--v-skeleton-base-color` | `rgba(148, 163, 184, 0.28)` |
| | `--v-skeleton-highlight-color` | `rgba(255, 255, 255, 0.55)` |
| | `--v-skeleton-radius` | `0.25em` (text), `0.5rem` (rect) |
| | `--v-skeleton-duration` | `1.4s` |
| `VProgress` | `--v-progress-color` | `#2563eb` |
| | `--v-progress-track-color` | `#e2e8f0` |
| | `--v-progress-radius` | `999px` |
| | `--v-progress-duration` | `1.4s` |
| `VLoading` | `--v-loading-overlay-background` | `rgba(255, 255, 255, 0.72)` |
| | `--v-loading-color` | `#334155` |
| | `--v-loading-z-index` | `10` |
| | `--v-loading-radius` | `inherit` |
| | `--v-loading-backdrop-filter` | `none` |
| `VLoadingButton` | `--v-loading-button-gap` | `0.5rem` |

The `color`, `trackColor`, and `height` props on `VProgress`, and the
`borderRadius` prop on `VSkeleton`, take precedence over the corresponding
custom properties. Animation keyframes are scoped by the build and do not use
a shared global name.

`VLoading` uses a light translucent overlay by default, which assumes a light
surface. On a dark surface, override the overlay and the label colour:

```vue
<VLoading
  :loading="isLoading"
  label="Loading"
  style="--v-loading-overlay-background: rgba(15, 10, 30, 0.72); --v-loading-color: #f1eefb"
>
  <ProductList />
</VLoading>
```

The loaders are styled entirely through their props and expose no custom
properties. They inherit `currentColor`, so a colour on an ancestor is enough
to theme them.

## TypeScript

Declarations are included via the root `types` export; no separate types
package or ambient module shim is needed. Public prop and return types are
exported from the package root:

```ts
import type {
  LoaderVariant,
  LoadingSource,
  NamedLoaderProps,
  UseDelayedLoadingOptions,
  UseDelayedLoadingReturn,
  UseLoadingGroupReturn,
  UseLoadingReturn,
  VLoaderProps,
  VLoadingButtonProps,
  VLoadingProps,
  VProgressProps,
  VSkeletonProps,
  VSpinnerProps,
} from "veload";
```

Use `vue-tsc` (or `nuxt typecheck` in a Nuxt app) to check SFC templates in
addition to regular TypeScript. Keep Vue within the supported `^3.5.2` peer
range so the component declarations resolve against compatible Vue types.

`execute` preserves the operation's return type:

```ts
interface Product {
  id: number;
  title: string;
}

const products: Product[] = await execute(async () => {
  const response = await fetch("/api/products");
  return (await response.json()) as Product[];
});
```

## Loader collection

Veloader includes **36 named loader treatments**, selectable through
`VLoader` or individual named exports, plus its skeleton surface. The
collection expands the original 32 with four additional treatments:

| Component | `VLoader` variant | Marks | Suggested use |
| --- | --- | --- | --- |
| `VBreathingLoader` | `breathing` | 2 fixed; ignores `count` | Calm background activity or a waiting state. |
| `VDualArcLoader` | `dual-arc` | 2 fixed; ignores `count` | Compact circular feedback for refresh or synchronization. |
| `VDotSweepLoader` | `dot-sweep` | 4 by default; `count` supports 1–12 | Sequential activity beside text or in a list. |
| `VSlidingBarsLoader` | `sliding-bars` | 4 by default; `count` supports 1–12 | Horizontal feedback for a panel or processing task. |

The original 32 treatments and named skeleton surface were implemented in
Vue with React Loadly as a visual reference. The reference package declares
MIT metadata but has no tracked license text, so no reference source,
styles, or assets were reused.

All named loaders share `NamedLoaderProps`: `color` (`"currentColor"`), `size`
(`40`), `duration` (`1000` milliseconds), `count` (`4` where applicable),
`label` (`"Loading"`), and `decorative` (`false`). `VProgressRingLoader` also
accepts `value` from `0` to `100`. Import a named loader and use it directly:

```vue
<script setup lang="ts">
import { VOrbitDotsLoader } from "veload";
import "veload/style.css";
</script>

<template>
  <VOrbitDotsLoader :size="48" color="#7c3aed" label="Syncing workspace" />
</template>
```

`count` controls supported repeated-mark treatments, such as `bars`,
`dots`, `grid` and `orbit-dots`, and is clamped to `1`–`12`. It is not a way
to change fixed-geometry treatments. Grid, heatmap and squares default to
four, nine and nine marks respectively; other repeating treatments default
to four. Row-based repeating treatments grow with the count so their marks
are not clipped.

| Category | Components |
| --- | --- |
| Motion | `VBarsLoader`, `VBounceLoader`, `VDotsLoader`, `VDotSweepLoader`, `VEqualizerLoader`, `VSlidingBarsLoader`, `VSpinLoader`, `VSpinDotsLoader`, `VTypingLoader`, `VWaveLoader` |
| Circular | `VBreathingLoader`, `VDualArcLoader`, `VGradientRingLoader`, `VOrbitDotsLoader`, `VOrbitLoader`, `VProgressRingLoader`, `VPulseLoader`, `VRingLoader`, `VRippleLoader`, `VRotateLoader`, `VSignalLoader`, `VSnakeLoader` |
| Geometric | `VBlobLoader`, `VCardFlipLoader`, `VElementLoader`, `VFlowLoader`, `VGridLoader`, `VHashtagLoader`, `VHeatmapLoader`, `VLiquidLoader`, `VLogoSpinLoader`, `VMorphLoader`, `VPlaneLoader`, `VSquaresLoader`, `VStairLoader` |
| Utility | `VFallbackLoader`, `VLoader` (`variant` selects any treatment) |

### Skeleton collection

`VSkeleton` remains the primitive (`variant`, `width`, `height`, `borderRadius`,
`animated`, and `label`). It is also exported as `VSkeletonLoader` for catalog
parity. `VPatternSkeleton` accepts `pattern` (`lines`, `article`, `card`,
`profile`, `list`, `table`, `media`, `form`, `dashboard`, `feed`, or `product`),
`rows` (default `3`), `color`, `highlightColor`, `animated` (default `true`),
and `label`.

For `VDashboardSkeleton`, `rows` counts **data rows only**, not the table
header, statistic tiles, or chart. A fixed header is always rendered, so
`:rows="1"` means one header plus exactly one data row. `VTableSkeleton`
uses the same data-row definition but allows its header to be toggled with
`showHeader`. Row counts are rounded and clamped to `1`–`12`; columns to
`1`–`6`. This preserves the existing layout and public meaning of `rows`.

- Layout helpers: `VSkeletonGroup`, `VSkeletonSwitch`, `VAutoSkeleton`.
  `VAutoSkeleton` is a safe Vue content switcher: it renders a named skeleton
  pattern or `#skeleton` slot while loading and the default slot afterwards. It
  deliberately does not inspect or execute slot components to infer their DOM.
- Named presets: `VArticleSkeleton`, `VCardSkeleton`, `VDashboardSkeleton`,
  `VFeedSkeleton`, `VFormSkeleton`, `VListSkeleton`, `VMediaCardSkeleton`,
  `VProductCardSkeleton`, `VProfileSkeleton`, and `VTableSkeleton`.

Every animation honors `prefers-reduced-motion`; status elements are hidden from
assistive technology when `decorative` is used or no label is provided.

## Limitations

- No global loading manager, request deduplication, or automatic HTTP
  integration is provided.
- `VLoading` positions its overlay absolutely. The wrapper needs content or an
  explicit height to be visible.
- `VLoading`'s content isolation uses the HTML `inert` attribute. Very old
  browsers may not support it.
- Progress values only reflect data supplied by the consumer; the library does
  not estimate backend progress.
- The package has not yet been published. Public installation and release
  availability begin only after npm confirms the first release.


## Development

### Local maintainer workflow

These steps are for authorized repository development before a public
release, not for consumer installation. Run in `Veloader/pcakage` (the
directory is actually spelled `pcakage`):

```bash
npm install
npm run typecheck
npm test
npm run build        # Vite ESM/CJS build, then declarations
npm run build:types  # declarations only
npm run check:consumer # pack the library and use it like an application
npm run check:bundle  # measure the tree shaken payload of a consumer
npm pack --dry-run   # inspect package contents
```

The test suite uses Vitest, Vue Test Utils, and jsdom. Timing tests use fake
timers. `vitest.config.ts` contains the test options and reuses the Vue plugin
from `vite.config.ts`; the production Vite config imports from `vite`, not
`vitest/config`. Declaration generation uses `tsconfig.build.json`, which
excludes the local test suites.

Build tooling is declared in this library's own `devDependencies`. Install
it here (for example, `npm ci --include=dev`) before running the build; an
installation in the sibling playground is not a replacement. See the
playground README for its Vercel install order and supported Node version.

The build externalizes Vue and emits:

- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (types)
- `dist/style.css` (extracted styles)

`npm run check:consumer` packs the library, extracts the tarball into a
temporary folder and renders every component on the server with the packed
package, so the packed artifact is checked rather than only the source.
This does not publish anything or establish a distribution license.

For an authorized external test app, run `npm pack` after building and
install the resulting `.tgz` using its actual filesystem path from that
app. A directory link also needs a built `dist` directory and access to a
compatible Vue peer; it is not a substitute for checking the packed
artifact. The sibling playground already declares `file:../pcakage`; its
README documents the repository setup. None of these local steps belong
in the post-release npm consumer workflow.

## Documentation

The interactive documentation and playground for Veloader lives in the
`veloader-playground` workspace. It is a Nuxt 4 application that renders on the
server and consumes this package through its public entry point:

- `/` — landing page with a curated selection
- `/loaders` and `/loaders/[name]` — all 36 loader treatments
- `/skeletons` and `/skeletons/[name]` — primitives, patterns and presets
- `/docs/installation`, `/docs/accessibility`, `/docs/api` — the guides

