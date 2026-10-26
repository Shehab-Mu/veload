<script setup lang="ts">
import { ref } from "vue";
import {
  VAutoSkeleton,
  VPatternSkeleton,
  VSkeleton,
  VSkeletonGroup,
  VSkeletonSwitch,
} from "veload";
import { skeletonPatterns, skeletonPresets, skeletonPatternPath } from "~/data/catalog";
import {
  skeletonPatternTabs,
  skeletonPrimitiveTabs,
  skeletonSwitchTabs,
} from "~/data/examples";
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";
import CodeTabs from "~/components/CodeTabs.vue";
import PageIntro from "~/components/PageIntro.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";

usePageSeo({
  title: "Skeleton placeholders and patterns",
  description:
    "Complete Veloader skeleton documentation: the primitive, eleven layout patterns, the switching and auto skeleton helpers, and ten named presets for Vue 3.",
  path: "/skeletons",
});

const isLoading = ref(true);
</script>

<template>
  <div class="container skeletons">
    <AppBreadcrumbs
      :items="[{ label: 'Home', to: '/' }, { label: 'Skeletons' }]"
    />

    <PageIntro
      eyebrow="Placeholders"
      title="Skeletons for every layout"
      lead="Veloader ships one primitive, eleven layout patterns, two switching helpers and ten named presets. Everything is decorative until you give it a label."
    />

    <section class="section" aria-labelledby="primitive-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Primitive</p>
          <h2 id="primitive-title" class="section__title">VSkeleton</h2>
        </div>
        <p class="section__lead">
          The building block. Pick a shape, give it a size, and add a label when
          assistive technology should announce it.
        </p>
      </div>

      <div class="demo-grid">
        <div class="demo card">
          <p class="demo__label">Text</p>
          <div class="demo__body"><VSkeleton /></div>
        </div>
        <div class="demo card">
          <p class="demo__label">Rectangle</p>
          <div class="demo__body">
            <VSkeleton variant="rect" width="100%" height="4rem" />
          </div>
        </div>
        <div class="demo card">
          <p class="demo__label">Circle</p>
          <div class="demo__body">
            <VSkeleton variant="circle" :width="56" label="Loading avatar" />
          </div>
        </div>
        <div class="demo card">
          <p class="demo__label">Group</p>
          <div class="demo__body">
            <VSkeletonGroup>
              <VSkeleton variant="circle" :width="44" />
              <VSkeleton width="70%" />
              <VSkeleton width="48%" />
            </VSkeletonGroup>
          </div>
        </div>
      </div>

      <div class="section__code">
        <CodeTabs :tabs="skeletonPrimitiveTabs" label="VSkeleton examples" />
      </div>
    </section>

    <section class="section" aria-labelledby="pattern-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Patterns</p>
          <h2 id="pattern-title" class="section__title">VPatternSkeleton</h2>
        </div>
        <p class="section__lead">
          One component renders eleven layouts. Switch between them with the
          <code>pattern</code> prop.
        </p>
      </div>

      <ul class="pattern-grid">
        <li v-for="entry in skeletonPatterns" :key="entry.pattern">
          <NuxtLink
            class="pattern"
            :to="skeletonPatternPath(entry.pattern)"
            :aria-label="`Explore ${entry.title} skeleton`"
          >
            <div class="pattern__preview" aria-hidden="true">
              <VPatternSkeleton :pattern="entry.pattern" :rows="3" />
            </div>
            <span class="pattern__meta">
              <span class="pattern__name">{{ entry.pattern }}</span>
              <span class="pattern__description">{{ entry.description }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>

      <div class="section__code">
        <CodeTabs :tabs="skeletonPatternTabs" label="VPatternSkeleton examples" />
      </div>
    </section>

    <section class="section" aria-labelledby="switch-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Switching</p>
          <h2 id="switch-title" class="section__title">
            VSkeletonSwitch and VAutoSkeleton
          </h2>
        </div>
        <p class="section__lead">
          Render a skeleton while data loads and the real content afterwards.
          <code>VAutoSkeleton</code> is the same behaviour under its catalogue
          name.
        </p>
      </div>

      <div class="switch card">
        <div class="switch__control">
          <input
            id="skeleton-loading"
            v-model="isLoading"
            type="checkbox"
            class="switch__checkbox"
          />
          <label for="skeleton-loading">Loading</label>
        </div>

        <div class="switch__preview">
          <VSkeletonSwitch
            :loading="isLoading"
            pattern="profile"
            label="Loading profile"
          >
            <p class="switch__content">Profile content is ready.</p>
          </VSkeletonSwitch>
        </div>

        <div class="switch__preview">
          <VAutoSkeleton
            :loading="isLoading"
            pattern="list"
            label="Loading list"
          >
            <p class="switch__content">List content is ready.</p>
          </VAutoSkeleton>
        </div>
      </div>

      <div class="section__code">
        <CodeTabs :tabs="skeletonSwitchTabs" label="Switching examples" />
      </div>
    </section>

    <section class="section" aria-labelledby="preset-title">
      <div class="section__head">
        <div>
          <p class="eyebrow">Named presets</p>
          <h2 id="preset-title" class="section__title">Ready made layouts</h2>
        </div>
        <p class="section__lead">
          Each preset fixes the pattern and exposes only the props that make
          sense for that layout.
        </p>
      </div>

      <ul class="preset-grid">
        <li v-for="preset in skeletonPresets" :key="preset.slug">
          <SkeletonCard :entry="preset" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.skeletons {
  display: grid;
  gap: 1rem;
  padding-bottom: 3rem;
}

.section {
  padding-block: clamp(1.5rem, 4vw, 3rem);
}

.section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.section__title {
  margin-top: 0.6rem;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 760;
  letter-spacing: -0.03em;
}

.section__lead {
  max-width: 32rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.65;
}

.section__lead code {
  padding: 0.1em 0.32em;
  border-radius: 0.3rem;
  background: var(--surface-sunken);
  font-family: var(--font-mono);
  font-size: 0.86em;
}

.section__code {
  margin-top: 1.5rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
}

.demo {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.demo__label {
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.demo__body {
  display: grid;
  align-content: center;
  gap: 0.6rem;
  min-height: 6rem;
  padding: 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
}

.pattern {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
  height: 100%;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.pattern:hover,
.pattern:focus-visible {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  color: inherit;
  transform: translateY(-2px);
}

.pattern:active {
  transform: translateY(0);
}

.pattern__meta {
  display: grid;
}

.pattern__preview {
  display: grid;
  align-content: start;
  min-height: 8.5rem;
  padding: 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text);
}

.pattern__preview :deep(.v-pattern-skeleton) {
  max-width: none;
}

.pattern__name {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.pattern__description {
  margin-top: 0.2rem;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.switch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  padding: 1.25rem;
}

.switch__control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.switch__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent);
}

.switch__preview {
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text);
}

.switch__preview :deep(.v-pattern-skeleton) {
  max-width: none;
}

.switch__content {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 1rem;
}

@media (max-width: 60rem) {
  .section__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .switch {
    grid-template-columns: 1fr;
  }
}
</style>
