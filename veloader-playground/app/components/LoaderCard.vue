<script setup lang="ts">
import { computed } from "vue";
import type { LoaderMeta } from "~/data/catalog";
import { getLoaderComponent } from "~/data/catalog";

const props = withDefaults(
  defineProps<{
    entry: LoaderMeta;
    color?: string;
    size?: number;
  }>(),
  {
    color: "#6d3ff2",
    size: 40,
  },
);

const component = computed(() => getLoaderComponent(props.entry.name));
</script>

<template>
  <NuxtLink class="loader-card" :to="`/loaders/${entry.slug}`">
    <span class="loader-card__preview" :style="{ color }">
      <component :is="component" :size="size" :duration="1400" decorative />
    </span>

    <span class="loader-card__body">
      <span class="loader-card__head">
        <span class="loader-card__title">{{ entry.title }}</span>
        <span class="badge">{{ entry.category }}</span>
      </span>
      <span class="loader-card__name">{{ entry.name }}</span>
      <span class="loader-card__description">{{ entry.description }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.loader-card {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.loader-card:hover,
.loader-card:focus-visible {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  color: inherit;
  transform: translateY(-2px);
}

.loader-card:active {
  transform: translateY(0);
}

.loader-card__preview {
  display: grid;
  place-items: center;
  min-height: 7.5rem;
  border-radius: var(--radius-sm);
  background:
    radial-gradient(
      120% 120% at 50% 0%,
      color-mix(in srgb, currentColor 12%, transparent),
      transparent 70%
    ),
    var(--surface-muted);
}

.loader-card__body {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.loader-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.loader-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.loader-card__name {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.loader-card__description {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}
</style>
