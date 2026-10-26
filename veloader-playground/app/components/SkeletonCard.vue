<script setup lang="ts">
import { computed } from "vue";
import type { SkeletonPresetMeta } from "~/data/catalog";
import { getSkeletonPresetComponent } from "~/data/catalog";

const props = defineProps<{
  entry: SkeletonPresetMeta;
}>();

const component = computed(() => getSkeletonPresetComponent(props.entry.name));
</script>

<template>
  <NuxtLink class="skeleton-card" :to="`/skeletons/${entry.slug}`" :aria-label="`Explore ${entry.title} skeleton (${entry.name})`">
    <div class="skeleton-card__preview" aria-hidden="true">
      <component :is="component" :rows="3" />
    </div>

    <span class="skeleton-card__body">
      <span class="skeleton-card__title">{{ entry.title }}</span>
      <span class="skeleton-card__name">{{ entry.name }}</span>
      <span class="skeleton-card__description">{{ entry.description }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.skeleton-card {
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

.skeleton-card:hover,
.skeleton-card:focus-visible {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  color: inherit;
  transform: translateY(-2px);
}

.skeleton-card:active {
  transform: translateY(0);
}

.skeleton-card__preview {
  display: grid;
  align-content: start;
  min-height: 9rem;
  padding: 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text);
}

.skeleton-card__preview :deep(.v-pattern-skeleton) {
  max-width: none;
}

.skeleton-card__body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.skeleton-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.skeleton-card__name {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.skeleton-card__description {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}
</style>
