<script setup lang="ts">
import { computed } from "vue";
import { findLoader, loaders } from "~/data/catalog";
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";
import LoaderPlayground from "~/components/LoaderPlayground.vue";

const route = useRoute();
const slug = computed(() => String(route.params.name ?? ""));
const entry = computed(() => findLoader(slug.value));

if (!entry.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Unknown loader: ${slug.value}`,
    fatal: true,
  });
}

const loader = entry.value;

usePageSeo({
  title: `${loader.title} loader (${loader.name})`,
  description: `${loader.description}. ${loader.name} is an original Vue 3 loader treatment from Veloader with adjustable size, colour, duration and accessible label.`,
  path: `/loaders/${loader.slug}`,
  type: "article",
});

const related = computed(() =>
  loaders
    .filter(
      (candidate) =>
        candidate.category === loader.category && candidate.slug !== loader.slug,
    )
    .slice(0, 4),
);

const breadcrumbItems = [
  { label: "Home", to: "/" },
  { label: "Loaders", to: "/loaders" },
  { label: loader.title },
];
</script>

<template>
  <div class="container detail">
    <AppBreadcrumbs :items="breadcrumbItems" />

    <header class="detail__header">
      <p class="eyebrow">{{ loader.category }} loader</p>
      <h1 class="detail__title">{{ loader.title }}</h1>
      <p class="detail__lead">{{ loader.description }}</p>
      <p class="detail__name">
        <code>{{ loader.name }}</code>
        <span class="badge">{{ loader.variant }}</span>
      </p>
    </header>

    <LoaderPlayground :entry="loader" />

    <section class="detail__notes" aria-labelledby="notes-title">
      <h2 id="notes-title" class="detail__section-title">
        About this treatment
      </h2>
      <ul class="detail__notes-list">
        <li v-for="note in loader.highlights" :key="note">{{ note }}</li>
      </ul>
    </section>

    <section v-if="related.length > 0" class="detail__related" aria-labelledby="related-title">
      <h2 id="related-title" class="detail__section-title">
        More {{ loader.category.toLowerCase() }} loaders
      </h2>
      <ul class="detail__related-list">
        <li v-for="item in related" :key="item.slug">
          <NuxtLink class="detail__related-link" :to="`/loaders/${item.slug}`">
            <span class="detail__related-name">{{ item.name }}</span>
            <span class="detail__related-description">{{ item.description }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p class="detail__related-footer">
        <NuxtLink class="button button--ghost" to="/loaders">
          View all loaders
        </NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: 1.25rem;
  min-width: 0;
  padding-bottom: 3rem;
}

.detail > * {
  min-width: 0;
}

.detail__header {
  max-width: 46rem;
  padding-block: 1.5rem 1rem;
}

.detail__title {
  margin-top: 0.75rem;
  font-size: clamp(2rem, 4.2vw, 3rem);
  font-weight: 780;
  letter-spacing: -0.035em;
  line-height: 1.08;
}

.detail__lead {
  margin-top: 0.75rem;
  color: var(--text-muted);
  font-size: 1.02rem;
}

.detail__name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.detail__name code {
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
  background: var(--surface-sunken);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.detail__section-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.detail__notes,
.detail__related {
  margin-top: 2.5rem;
}

.detail__notes-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.detail__notes-list li {
  position: relative;
  padding-left: 1.35rem;
  color: var(--text-muted);
  font-size: 0.93rem;
  line-height: 1.6;
}

.detail__notes-list li::before {
  position: absolute;
  top: 0.65em;
  left: 0.25rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: var(--accent);
  content: "";
}

.detail__related-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.detail__related-link {
  display: grid;
  gap: 0.25rem;
  height: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.detail__related-link:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  color: inherit;
}

.detail__related-name {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.detail__related-description {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.detail__related-footer {
  margin-top: 1.25rem;
}
</style>
