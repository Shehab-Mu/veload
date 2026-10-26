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
.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.breadcrumbs__link {
  color: var(--text-muted);
  text-decoration: none;
}

.breadcrumbs__link:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}

.breadcrumbs__current {
  color: var(--text);
  font-weight: 600;
}

.breadcrumbs__separator {
  color: var(--text-subtle);
}
</style>
