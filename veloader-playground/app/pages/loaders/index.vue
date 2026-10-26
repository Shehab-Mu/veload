<script setup lang="ts">
import { computed, ref } from "vue";
import {
  loaderCategories,
  loaders,
  type LoaderCategory,
} from "~/data/catalog";
import LoaderCard from "~/components/LoaderCard.vue";
import PageIntro from "~/components/PageIntro.vue";

usePageSeo({
  title: "All loader treatments",
  description:
    "Browse every Veloader loader treatment for Vue 3. Filter by category, search by name and open a loader to tune its props and copy the code.",
  path: "/loaders",
});

const query = ref("");
const activeCategory = ref<LoaderCategory | "All">("All");

const normalizedQuery = computed(() => query.value.trim().toLowerCase());

const filteredLoaders = computed(() =>
  loaders.filter((entry) => {
    const matchesCategory =
      activeCategory.value === "All" || entry.category === activeCategory.value;

    if (!matchesCategory) {
      return false;
    }

    if (normalizedQuery.value.length === 0) {
      return true;
    }

    return (
      entry.name.toLowerCase().includes(normalizedQuery.value) ||
      entry.title.toLowerCase().includes(normalizedQuery.value) ||
      entry.description.toLowerCase().includes(normalizedQuery.value) ||
      entry.variant.toLowerCase().includes(normalizedQuery.value)
    );
  }),
);

const resultSummary = computed(() => {
  const total = filteredLoaders.value.length;

  if (total === 0) {
    return "No loader matches the current filters.";
  }

  if (total === 1) {
    return "1 loader matches the current filters.";
  }

  return `${total} loaders match the current filters.`;
});

function resetFilters(): void {
  query.value = "";
  activeCategory.value = "All";
}
</script>

<template>
  <div class="container collection">
    <PageIntro
      :eyebrow="`${loaders.length} treatments`"
      title="Every loader, one page"
      lead="Each treatment is an original CSS animation with its own props, accessibility notes and copyable implementation. Filter the collection, then open a loader to tune it live."
    />

    <div class="toolbar card">
      <div class="toolbar__search">
        <label class="visually-hidden" for="loader-search">
          Search loaders by name
        </label>
        <input
          id="loader-search"
          v-model="query"
          type="search"
          class="toolbar__input"
          placeholder="Search loaders, for example orbit"
          autocomplete="off"
        />
      </div>

      <div class="toolbar__filters" role="group" aria-label="Filter by category">
        <button
          type="button"
          class="chip"
          :class="{ 'chip--active': activeCategory === 'All' }"
          :aria-pressed="activeCategory === 'All'"
          @click="activeCategory = 'All'"
        >
          All
        </button>
        <button
          v-for="category in loaderCategories"
          :key="category"
          type="button"
          class="chip"
          :class="{ 'chip--active': activeCategory === category }"
          :aria-pressed="activeCategory === category"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <p class="toolbar__count" role="status" aria-live="polite">
        {{ resultSummary }}
      </p>
    </div>

    <ul v-if="filteredLoaders.length > 0" class="collection__grid">
      <li v-for="loader in filteredLoaders" :key="loader.slug">
        <LoaderCard :entry="loader" />
      </li>
    </ul>

    <div v-else class="empty card">
      <h2 class="empty__title">Nothing matches those filters</h2>
      <p class="empty__body">
        Try a different search term, or reset the filters to see all
        {{ loaders.length }} treatments again.
      </p>
      <button type="button" class="button button--ghost" @click="resetFilters">
        Reset filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.collection {
  display: grid;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

.toolbar {
  display: grid;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
}

.toolbar__search {
  display: grid;
}

.toolbar__input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--surface-muted);
  font-size: 0.92rem;
}

.toolbar__input:focus-visible {
  border-color: var(--accent);
  outline-offset: 1px;
}

.toolbar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.chip:hover {
  border-color: var(--accent-border);
  color: var(--accent-strong);
}

.chip--active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.toolbar__count {
  color: var(--text-subtle);
  font-size: 0.8rem;
}

.collection__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.empty {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  padding: 2.5rem;
}

.empty__title {
  font-size: 1.15rem;
  font-weight: 700;
}

.empty__body {
  max-width: 32rem;
  color: var(--text-muted);
  font-size: 0.92rem;
}
</style>
