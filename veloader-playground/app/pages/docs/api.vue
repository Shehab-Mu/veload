<script setup lang="ts">
import { computed } from "vue";
import {
  VAutoSkeleton,
  VLoader,
  VLoading,
  VLoadingButton,
  VPatternSkeleton,
  VProgress,
  VSkeleton,
  VSkeletonGroup,
  VSkeletonSwitch,
  VSpinner,
} from "veload";
import {
  buildGenericLoaderPropDocs,
  buildLoadingButtonPropDocs,
  buildLoadingPropDocs,
  buildPatternPropDocs,
  buildProgressPropDocs,
  buildSkeletonGroupPropDocs,
  buildSkeletonPropDocs,
  buildSkeletonSwitchPropDocs,
  buildSpinnerPropDocs,
  loadingButtonSlots,
  loadingSlots,
  skeletonSwitchSlots,
} from "~/data/prop-docs";
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";
import CodeBlock from "~/components/CodeBlock.vue";
import PageIntro from "~/components/PageIntro.vue";
import PropTable from "~/components/PropTable.vue";
import { loaders } from "~/data/catalog";
import { loaderTypes } from "~/data/examples";

usePageSeo({
  title: "API reference",
  description:
    "Complete prop, slot and type reference for every Veloader component, including the shared loader and skeleton props, the composables and the CSS custom properties.",
  path: "/docs/api",
});

const componentSections = computed(() => [
  {
    id: "vloader",
    name: "VLoader",
    summary:
      "The generic loader. The variant prop selects one of the 32 treatments and every named loader is a thin wrapper around it.",
    props: buildGenericLoaderPropDocs(),
    slots: [],
    component: VLoader,
  },
  {
    id: "vskeleton",
    name: "VSkeleton",
    summary:
      "The skeleton primitive. It is also exported as VSkeletonLoader for catalogue parity.",
    props: buildSkeletonPropDocs(),
    slots: [],
    component: VSkeleton,
  },
  {
    id: "vpatternskeleton",
    name: "VPatternSkeleton",
    summary:
      "Renders one of the eleven layout patterns from a single component.",
    props: buildPatternPropDocs(),
    slots: [],
    component: VPatternSkeleton,
  },
  {
    id: "vskeletongroup",
    name: "VSkeletonGroup",
    summary:
      "Groups placeholders with a shared gap and exposes the group as one status region.",
    props: buildSkeletonGroupPropDocs(),
    slots: [],
    component: VSkeletonGroup,
  },
  {
    id: "vskeletonswitch",
    name: "VSkeletonSwitch",
    summary:
      "Shows a skeleton while loading and the default slot afterwards.",
    props: buildSkeletonSwitchPropDocs(),
    slots: skeletonSwitchSlots,
    component: VSkeletonSwitch,
  },
  {
    id: "vautoskeleton",
    name: "VAutoSkeleton",
    summary:
      "A safe content switcher. It never inspects slot content to infer a layout, it renders the pattern you choose.",
    props: buildSkeletonSwitchPropDocs(),
    slots: skeletonSwitchSlots,
    component: VAutoSkeleton,
  },
  {
    id: "vspinner",
    name: "VSpinner",
    summary: "A compact status spinner for inline work.",
    props: buildSpinnerPropDocs(),
    slots: [],
    component: VSpinner,
  },
  {
    id: "vprogress",
    name: "VProgress",
    summary: "A determinate or indeterminate progress bar.",
    props: buildProgressPropDocs(),
    slots: [],
    component: VProgress,
  },
  {
    id: "vloading",
    name: "VLoading",
    summary:
      "Wraps content in an overlay and makes that content inert while it loads.",
    props: buildLoadingPropDocs(),
    slots: loadingSlots,
    component: VLoading,
  },
  {
    id: "vloadingbutton",
    name: "VLoadingButton",
    summary: "A native button with a loading state.",
    props: buildLoadingButtonPropDocs(),
    slots: loadingButtonSlots,
    component: VLoadingButton,
  },
]);

const namedLoaders = computed(() =>
  loaders.map((entry) => ({
    name: entry.name,
    slug: entry.slug,
    description: entry.description,
  })),
);

const composables = computed(() => [
  {
    name: "useLoading()",
    summary:
      "Tracks concurrent asynchronous operations for a single loading state.",
    members: [
      { name: "isLoading", type: "Readonly<Ref<boolean>>", description: "True while at least one operation is pending." },
      { name: "pendingCount", type: "Readonly<Ref<number>>", description: "Number of pending operations for this instance." },
      {
        name: "execute",
        type: "<T>(operation: () => Promise<T>) => Promise<T>",
        description:
          "Runs and tracks the operation. Results and errors pass through unchanged.",
      },
    ],
  },
  {
    name: "useDelayedLoading(options?)",
    summary:
      "Delays the indicator until the work has been pending for a while, so fast operations never flash a spinner.",
    members: [
      {
        name: "delay",
        type: "number",
        description:
          "Milliseconds to wait before isLoading becomes true. Defaults to 200.",
      },
      {
        name: "minVisibleDuration",
        type: "number",
        description:
          "Minimum milliseconds the indicator stays visible once it appears. Defaults to 0.",
      },
    ],
  },
  {
    name: "useLoadingGroup(sources)",
    summary:
      "Aggregates independent loading sources into one state without owning them.",
    members: [
      {
        name: "isLoading",
        type: "ComputedRef<boolean>",
        description: "True when at least one source is active.",
      },
      {
        name: "activeCount",
        type: "ComputedRef<number>",
        description: "Number of sources that are currently active.",
      },
    ],
  },
]);

const customProperties = [
  {
    component: "VSpinner",
    name: "--v-spinner-border-width",
    default: "3px",
  },
  { component: "VSpinner", name: "--v-spinner-track-color", default: "currentColor" },
  {
    component: "VSkeleton",
    name: "--v-skeleton-base-color",
    default: "rgba(148, 163, 184, 0.28)",
  },
  {
    component: "VSkeleton",
    name: "--v-skeleton-highlight-color",
    default: "rgba(255, 255, 255, 0.55)",
  },
  {
    component: "VSkeleton",
    name: "--v-skeleton-radius",
    default: "0.25em (text), 0.5rem (rect)",
  },
  { component: "VSkeleton", name: "--v-skeleton-duration", default: "1.4s" },
  { component: "VProgress", name: "--v-progress-color", default: "#2563eb" },
  { component: "VProgress", name: "--v-progress-track-color", default: "#e2e8f0" },
  { component: "VProgress", name: "--v-progress-radius", default: "999px" },
  { component: "VProgress", name: "--v-progress-duration", default: "1.4s" },
  {
    component: "VLoading",
    name: "--v-loading-overlay-background",
    default: "rgba(255, 255, 255, 0.72)",
  },
  { component: "VLoading", name: "--v-loading-color", default: "#334155" },
  { component: "VLoading", name: "--v-loading-z-index", default: "10" },
  { component: "VLoading", name: "--v-loading-radius", default: "inherit" },
  { component: "VLoading", name: "--v-loading-backdrop-filter", default: "none" },
  {
    component: "VLoadingButton",
    name: "--v-loading-button-gap",
    default: "0.5rem",
  },
];
</script>

<template>
  <div class="container docs">
    <AppBreadcrumbs
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Docs', to: '/docs/installation' },
        { label: 'API' },
      ]"
    />

    <PageIntro
      eyebrow="Reference"
      title="API reference"
      lead="Every prop below is read from the published package at build time, so the tables always describe the code you actually install."
    />

    <article class="docs__body">
      <section class="api-section" aria-labelledby="components-title">
        <h2 id="components-title" class="api-section__title">Components</h2>

        <section
          v-for="section in componentSections"
          :key="section.id"
          class="api-block"
          :aria-labelledby="`${section.id}-title`"
        >
          <h3 :id="`${section.id}-title`" class="api-block__title">
            {{ section.name }}
          </h3>
          <p class="api-block__summary">{{ section.summary }}</p>

          <PropTable :props="section.props" :caption="`${section.name} props`" />

          <table v-if="section.slots.length > 0" class="api-table">
            <caption class="visually-hidden">{{ section.name }} slots</caption>
            <thead>
              <tr>
                <th scope="col">Slot</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in section.slots" :key="slot.name">
                <th scope="row"><code>{{ slot.name }}</code></th>
                <td>{{ slot.description }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>

      <section class="api-section" aria-labelledby="loaders-title">
        <h2 id="loaders-title" class="api-section__title">Named loaders</h2>
        <p class="api-block__summary">
          Every named loader accepts the shared loader props:
          <code>color</code>, <code>size</code>, <code>duration</code>,
          <code>count</code>, <code>label</code> and <code>decorative</code>.
          <code>VProgressRingLoader</code> additionally accepts
          <code>value</code>.
        </p>

        <ul class="api-loaders">
          <li v-for="loader in namedLoaders" :key="loader.name">
            <NuxtLink class="api-loaders__link" :to="`/loaders/${loader.slug}`">
              <code>{{ loader.name }}</code>
              <span>{{ loader.description }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="api-section" aria-labelledby="composables-title">
        <h2 id="composables-title" class="api-section__title">Composables</h2>

        <section
          v-for="composable in composables"
          :key="composable.name"
          class="api-block"
        >
          <h3 class="api-block__title">{{ composable.name }}</h3>
          <p class="api-block__summary">{{ composable.summary }}</p>

          <table class="api-table">
            <caption class="visually-hidden">{{ composable.name }} members</caption>
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Type</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in composable.members" :key="member.name">
                <th scope="row"><code>{{ member.name }}</code></th>
                <td><code>{{ member.type }}</code></td>
                <td>{{ member.description }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>

      <section class="api-section" aria-labelledby="types-title">
        <h2 id="types-title" class="api-section__title">Exported types</h2>
        <p class="api-block__summary">
          All prop and return types are exported from the package root.
        </p>

        <CodeBlock :code="loaderTypes" language="ts" label="Types" />
      </section>

      <section class="api-section" aria-labelledby="css-title">
        <h2 id="css-title" class="api-section__title">CSS custom properties</h2>
        <p class="api-block__summary">
          Components use scoped styles and these custom properties. Set them on
          a component or on any ancestor.
        </p>

        <div class="api-table__wrapper">
          <table class="api-table">
            <caption class="visually-hidden">CSS custom properties</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Custom property</th>
                <th scope="col">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="property in customProperties" :key="property.name">
                <th scope="row">{{ property.component }}</th>
                <td><code>{{ property.name }}</code></td>
                <td><code>{{ property.default }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="api-block__summary">
          The loaders are styled entirely through their props, so they expose
          no custom properties.
        </p>

        <p class="api-block__summary">
          <code>VLoading</code> uses a light translucent overlay by default,
          which assumes a light surface. On a dark surface, override
          <code>--v-loading-overlay-background</code> and
          <code>--v-loading-color</code>.
        </p>
      </section>
    </article>
  </div>
</template>

<style scoped>
.docs {
  padding-bottom: 3rem;
}

.docs__body {
  display: grid;
  gap: 1rem;
}

.api-section {
  padding-block: 1rem;
}

.api-section__title {
  margin-bottom: 1rem;
  font-size: clamp(1.5rem, 2.8vw, 2rem);
  font-weight: 760;
  letter-spacing: -0.03em;
}

.api-block {
  padding-block: 1.25rem;
}

.api-block__title {
  font-size: 1.15rem;
  font-weight: 720;
  letter-spacing: -0.01em;
}

.api-block__summary {
  max-width: 48rem;
  margin-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.65;
}

.api-block__summary code {
  padding: 0.1em 0.32em;
  border-radius: 0.3rem;
  background: var(--surface-sunken);
  font-family: var(--font-mono);
  font-size: 0.86em;
}

.api-table__wrapper {
  margin-top: 1rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  text-align: left;
}

.api-table th,
.api-table td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.api-table thead th {
  background: var(--surface-muted);
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.api-table tbody tr:last-child th,
.api-table tbody tr:last-child td {
  border-bottom: 0;
}

.api-table tbody th {
  font-weight: 600;
  white-space: nowrap;
}

.api-table code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.api-loaders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.6rem;
  margin-top: 1rem;
}

.api-loaders__link {
  display: grid;
  gap: 0.2rem;
  height: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: inherit;
  text-decoration: none;
}

.api-loaders__link:hover {
  border-color: var(--accent-border);
  color: inherit;
}

.api-loaders__link code {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.api-loaders__link span {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>
