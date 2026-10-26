<script setup lang="ts">
import { computed, reactive } from "vue";
import {
  VLoading,
  VLoadingButton,
  VLoader,
  VProgress,
  VSkeletonLoader,
  VSpinDotsLoader,
  VSpinner,
} from "veload";
import { featuredLoaders, featuredSkeletonPresets, loaders } from "~/data/catalog";
import { installSnippet } from "~/utils/code";
import CodeBlock from "~/components/CodeBlock.vue";
import LoaderCard from "~/components/LoaderCard.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";

usePageSeo({
  title: "Accessible Vue 3 loaders, skeletons and progress components",
  description:
    `Veload is a dependency-free Vue 3 loading toolkit available on npm as veload@0.1.0: ${loaders.length} loaders, skeleton presets, progress bars and loading buttons with accessible defaults.`,
  path: "/",
});

const controls = reactive({
  size: 44,
  duration: 1400,
  color: "#6d3ff2",
  label: "Loading content",
});

const features = [
  {
    title: `${loaders.length} loader treatments`,
    body: "Original CSS animations covering motion, circular, geometric and utility styles, each with its own detail page and copyable example.",
  },
  {
    title: "Skeleton presets",
    body: "Article, card, dashboard, feed, form, list, media card, product, profile and table layouts built from one accessible primitive.",
  },
  {
    title: "Accessible by default",
    body: "Status roles, live labels and decorative modes are handled for you. Decorative previews never interrupt a screen reader.",
  },
  {
    title: "Reduced motion aware",
    body: "Every animation collapses under prefers-reduced-motion, so the interface stays calm for people who ask for it.",
  },
  {
    title: "Framework agnostic",
    body: "Plain Vue 3 components and composables. No Nuxt module, no plugin, no global manager, no runtime dependencies.",
  },
  {
    title: "Typed end to end",
    body: "Props, slots and composable return values are exported as TypeScript types, so the editor always knows what a component accepts.",
  },
];

const stats = [
  { value: String(loaders.length), label: "loader treatments" },
  { value: "11", label: "skeleton patterns" },
  { value: "0", label: "runtime dependencies" },
  { value: "100%", label: "server renderable" },
];

const code = computed(() => installSnippet());

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "Veload",
        alternateName: "veload",
        description:
          "A publicly available Vue 3 loading toolkit distributed on npm as veload@0.1.0, with loaders, skeletons and progress components.",
        url: "https://www.npmjs.com/package/veload",
        softwareVersion: "0.1.0",
        programmingLanguage: "Vue",
        runtimePlatform: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    },
  ],
});
</script>

<template>
  <div class="container home">
    <section class="hero">
      <div class="hero__copy">
        <p class="eyebrow">Vue 3 loading states</p>
        <h1 class="hero__title">
          Make waiting <em>feel intentional.</em>
        </h1>
        <p class="hero__lead">
          Veload is an accessible, dependency free collection of polished Vue 3
          loaders, skeleton presets and progress components. Every example on
          this site is the real package, rendered on the server.
        </p>

        <div class="cluster hero__actions">
          <NuxtLink class="button button--primary" to="/docs/installation">
            Install Veload
          </NuxtLink>
          <NuxtLink class="button button--ghost" to="/loaders">
            Browse the loaders
          </NuxtLink>
        </div>

        <dl class="hero__stats">
          <div v-for="stat in stats" :key="stat.label" class="hero__stat">
            <dt class="hero__stat-value">{{ stat.value }}</dt>
            <dd class="hero__stat-label">{{ stat.label }}</dd>
          </div>
        </dl>
      </div>

      <div class="hero__panel">
        <div class="hero__panel-head">
          <span class="badge">Live component</span>
          <span class="hero__panel-note">Rendered on the server</span>
        </div>
        <div class="hero__panel-body">
          <VSpinDotsLoader
            :size="72"
            :duration="controls.duration"
            :color="controls.color"
            :label="controls.label"
          />
        </div>
        <p class="hero__panel-caption">
          <code>&lt;VSpinDotsLoader :size="72" /&gt;</code>
        </p>
      </div>
    </section>

    <section class="section" aria-labelledby="features-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">What you get</p>
          <h2 id="features-title" class="section__title">
            Built for real interfaces
          </h2>
        </div>
        <p class="section__lead">
          Small primitives that compose into the loading states your product
          actually needs.
        </p>
      </div>

      <ul class="feature-grid">
        <li v-for="feature in features" :key="feature.title" class="feature">
          <h3 class="feature__title">{{ feature.title }}</h3>
          <p class="feature__body">{{ feature.body }}</p>
        </li>
      </ul>
    </section>

    <section class="section" aria-labelledby="controls-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Interactive</p>
          <h2 id="controls-title" class="section__title">
            Tune a treatment in seconds
          </h2>
        </div>
        <p class="section__lead">
          These controls drive the previews below. Every loader accepts the same
          size, colour, duration and label props. The cards stay decorative so
          they do not interrupt a screen reader; the live component in the hero
          uses the label.
        </p>
      </div>

      <div class="controls card">
        <div class="control">
          <label for="home-size">
            Size <span>{{ controls.size }}px</span>
          </label>
          <input
            id="home-size"
            v-model.number="controls.size"
            type="range"
            min="20"
            max="96"
            step="1"
          />
        </div>

        <div class="control">
          <label for="home-duration">
            Duration <span>{{ controls.duration }}ms</span>
          </label>
          <input
            id="home-duration"
            v-model.number="controls.duration"
            type="range"
            min="400"
            max="2800"
            step="100"
          />
        </div>

        <div class="control">
          <label for="home-color">Accent</label>
          <div class="control__row">
            <input
              id="home-color"
              v-model="controls.color"
              type="color"
              class="control__color"
            />
            <span class="control__value">{{ controls.color }}</span>
          </div>
        </div>

        <div class="control">
          <label for="home-label">Screen reader label</label>
          <input
            id="home-label"
            v-model="controls.label"
            type="text"
            class="control__text"
            autocomplete="off"
          />
        </div>
      </div>

      <ul class="loader-grid">
        <li v-for="loader in featuredLoaders" :key="loader.slug">
          <LoaderCard
            :entry="loader"
            :color="controls.color"
            :size="controls.size"
          />
        </li>
      </ul>

      <p class="section__footer">
        <NuxtLink class="button button--ghost" to="/loaders">
          View all {{ loaders.length }} loaders
        </NuxtLink>
      </p>
    </section>

    <section class="section" aria-labelledby="skeletons-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Placeholders</p>
          <h2 id="skeletons-title" class="section__title">
            Skeletons that match the final layout
          </h2>
        </div>
        <p class="section__lead">
          Named presets for the screens you build most often, plus the
          primitive and pattern APIs behind them.
        </p>
      </div>

      <ul class="skeleton-grid">
        <li v-for="preset in featuredSkeletonPresets" :key="preset.slug">
          <SkeletonCard :entry="preset" />
        </li>
      </ul>

      <p class="section__footer">
        <NuxtLink class="button button--ghost" to="/skeletons">
          View all skeleton patterns
        </NuxtLink>
      </p>
    </section>

    <section class="section" aria-labelledby="primitives-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Core components</p>
          <h2 id="primitives-title" class="section__title">
            The rest of the toolkit
          </h2>
        </div>
        <p class="section__lead">
          Spinners, progress bars, loading buttons and content overlays for the
          states that are not a single animation.
        </p>
      </div>

      <ul class="primitive-grid">
        <li class="primitive">
          <h3 class="primitive__title">VSpinner</h3>
          <p class="primitive__body">
            A compact status spinner for inline work such as saving a field.
          </p>
          <div class="primitive__demo">
            <VSpinner :size="32" color="#14b8a6" decorative />
          </div>
        </li>

        <li class="primitive">
          <h3 class="primitive__title">VProgress</h3>
          <p class="primitive__body">
            Determinate and indeterminate progress with an accessible value.
          </p>
          <div class="primitive__demo">
            <VProgress
              :value="68"
              color="#6d3ff2"
              label="Uploading"
              value-text="68% complete"
            />
          </div>
        </li>

        <li class="primitive">
          <h3 class="primitive__title">VLoadingButton</h3>
          <p class="primitive__body">
            A native button that disables itself and shows an indicator while
            it works.
          </p>
          <div class="primitive__demo">
            <VLoadingButton :loading="true">Save changes</VLoadingButton>
          </div>
        </li>

        <li class="primitive">
          <h3 class="primitive__title">VLoading</h3>
          <p class="primitive__body">
            An overlay that makes the content beneath it inert while loading.
          </p>
          <div class="primitive__demo primitive__demo--block">
            <VLoading :loading="true" label="Refreshing">
              <div class="loading-demo">Project overview</div>
            </VLoading>
          </div>
        </li>

        <li class="primitive">
          <h3 class="primitive__title">VLoader</h3>
          <p class="primitive__body">
            The generic loader that switches between all 32 treatments.
          </p>
          <div class="primitive__demo">
            <VLoader variant="morph" :size="32" color="#f97316" decorative />
          </div>
        </li>

        <li class="primitive">
          <h3 class="primitive__title">VSkeletonLoader</h3>
          <p class="primitive__body">
            The skeleton primitive, exported under its catalogue name.
          </p>
          <div class="primitive__demo">
            <VSkeletonLoader variant="rect" height="2.5rem" decorative />
          </div>
        </li>
      </ul>
    </section>

    <section class="section" aria-labelledby="install-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Get started</p>
          <h2 id="install-title" class="section__title">
            Install the package
          </h2>
        </div>
        <p class="section__lead">
          Install the MIT-licensed Vue 3 toolkit from npm as
          <code>veload@0.1.0</code>.
        </p>
      </div>

      <CodeBlock :code="code" language="bash" label="Terminal" />
      <p class="section__footer">
        <a
          class="button button--ghost"
          href="https://www.npmjs.com/package/veload"
          target="_blank"
          rel="noreferrer"
        >
          View veload on npm
        </a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.home > * {
  min-width: 0;
}

.hero {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  padding-block: clamp(3rem, 7vw, 5.5rem) 2rem;
}

.hero__title {
  margin-top: 1rem;
  font-size: clamp(2.6rem, 6vw, 4.4rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.hero__title em {
  color: var(--accent);
  font-style: normal;
}

.hero__lead {
  max-width: 34rem;
  margin-top: 1.25rem;
  color: var(--text-muted);
  font-size: 1.08rem;
  line-height: 1.7;
}

.hero__actions {
  margin-top: 1.75rem;
}

.hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
  gap: 1rem;
  margin: 2.5rem 0 0;
  padding-top: 1.75rem;
  border-top: 1px solid var(--border);
}

.hero__stat-value {
  color: var(--text);
  font-size: 1.45rem;
  font-weight: 760;
  letter-spacing: -0.03em;
}

.hero__stat-label {
  margin: 0;
  color: var(--text-subtle);
  font-size: 0.78rem;
}

.hero__panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.hero__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--border);
}

.hero__panel-note {
  color: var(--text-subtle);
  font-size: 0.76rem;
}

.hero__panel-body {
  display: grid;
  place-items: center;
  min-height: 15rem;
  padding: 2rem;
  background:
    radial-gradient(
      100% 100% at 50% 0%,
      rgba(109, 63, 242, 0.14),
      transparent 65%
    ),
    var(--surface-muted);
}

.hero__panel-caption {
  padding: 0.85rem 1.1rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  overflow-x: auto;
  white-space: nowrap;
}

.section {
  padding-block: clamp(2.5rem, 6vw, 4.5rem);
}

.section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.75rem;
}

.section__title {
  margin-top: 0.6rem;
  font-size: clamp(1.7rem, 3.2vw, 2.4rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

.section__lead {
  max-width: 30rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.65;
}

.section__footer {
  margin-top: 1.75rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.feature__title {
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.feature__body {
  margin-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.87rem;
  line-height: 1.6;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.4rem;
}

.control {
  display: grid;
  gap: 0.45rem;
}

.control label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
}

.control label span {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
}

.control input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

.control__row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.control__color {
  width: 3rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: transparent;
}

.control__value {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.74rem;
}

.control__text {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface-muted);
  font-size: 0.85rem;
}

.loader-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 1rem;
}

.primitive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.primitive {
  display: grid;
  align-content: start;
  gap: 0.6rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.primitive__title {
  font-size: 0.95rem;
  font-weight: 700;
}

.primitive__body {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.primitive__demo {
  display: grid;
  place-items: center;
  min-height: 6rem;
  margin-top: 0.35rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
}

.primitive__demo--block {
  display: block;
  padding: 0;
  background: transparent;
}

.loading-demo {
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--surface-sunken);
  color: var(--text-muted);
}

:deep(.v-loading-button) {
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  color: var(--accent-contrast);
  background: var(--accent);
}

@media (max-width: 60rem) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 40rem) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
