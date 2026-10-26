<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const links = [
  { label: "Loaders", to: "/loaders" },
  { label: "Skeletons", to: "/skeletons" },
  { label: "API", to: "/docs/api" },
  { label: "Accessibility", to: "/docs/accessibility" },
];

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}

const activePath = computed(() => route.path);
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <NuxtLink class="site-header__brand" to="/">
        <span class="site-header__mark" aria-hidden="true">
          <span class="site-header__dot" />
        </span>
        <span class="site-header__wordmark">Veloader</span>
        <span class="site-header__tag">Vue 3</span>
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Main">
        <ul class="site-header__list">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              class="site-header__link"
              :class="{ 'site-header__link--active': isActive(link.to) }"
              :to="link.to"
              :aria-current="activePath === link.to ? 'page' : undefined"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--page-bg) 82%, transparent);
  backdrop-filter: blur(12px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 4rem;
}

.site-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text);
  font-weight: 750;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-header__brand:hover {
  color: var(--text);
}

.site-header__mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.55rem;
  background: linear-gradient(140deg, var(--accent), #38bdf8);
}

.site-header__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--accent-contrast);
  animation: header-pulse 1.8s ease-in-out infinite;
}

.site-header__wordmark {
  font-size: 1.02rem;
}

.site-header__tag {
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 500;
}

.site-header__list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.site-header__link {
  display: inline-block;
  padding: 0.45rem 0.7rem;
  border-radius: 0.5rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.site-header__link:hover {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.site-header__link--active {
  color: var(--accent-strong);
}

@keyframes header-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header__dot {
    animation: none;
  }
}

@media (max-width: 40rem) {
  .site-header__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding-block: 0.75rem;
  }

  .site-header__list {
    flex-wrap: wrap;
  }
}
</style>
