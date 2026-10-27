<script setup lang="ts">
export interface BreadcrumbItem {
  label: string;
  to?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li v-for="(item, index) in items" :key="item.label" class="breadcrumbs__item">
        <NuxtLink v-if="item.to" class="breadcrumbs__link" :to="item.to">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  min-inline-size: 0;
  margin: 30px 0;
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.625rem;
  font-size: 0.82rem;
  line-height: 1.5;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-inline-size: 0;
  max-inline-size: 100%;
}

.breadcrumbs__link,
.breadcrumbs__current {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.breadcrumbs__link {
  color: var(--text-muted);
  text-decoration: none;
}

.breadcrumbs__link:hover,
.breadcrumbs__link:focus-visible {
  color: var(--accent-strong);
  text-decoration: underline;
}

.breadcrumbs__current {
  color: var(--text);
  font-weight: 600;
}

.breadcrumbs__separator {
  flex-shrink: 0;
  color: var(--text-subtle);
  font-size: 0.75rem;
}
</style>
