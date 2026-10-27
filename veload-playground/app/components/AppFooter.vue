<script setup lang="ts">
const currentYear = new Date().getFullYear();

const sections = [
  {
    title: "Components",
    links: [
      { label: "All loaders", to: "/loaders" },
      { label: "All skeletons", to: "/skeletons" },
      { label: "API reference", to: "/docs/api" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Installation", to: "/docs/installation" },
      { label: "Accessibility", to: "/docs/accessibility" },
    ],
  },
];
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <p class="site-footer__name">Veload</p>
        <p class="site-footer__tagline">
          An accessible, dependency free loading toolkit for Vue 3.
        </p>
        <p class="site-footer__note">
          Install the MIT-licensed
          <a
            class="site-footer__link"
            href="https://www.npmjs.com/package/veload"
            target="_blank"
            rel="noreferrer"
          >veload</a>
          package or see the installation guide for Vue and Nuxt setup.
        </p>
      </div>

      <nav
        v-for="section in sections"
        :key="section.title"
        class="site-footer__section"
        :aria-label="section.title"
      >
        <p class="site-footer__title">{{ section.title }}</p>
        <ul class="site-footer__list">
          <li v-for="link in section.links" :key="link.to">
            <NuxtLink class="site-footer__link" :to="link.to">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="container site-footer__bottom">
      <p>
        © {{ currentYear }} Veload. All rights reserved.
        <span aria-hidden="true">·</span>
        Made by
        <a
          class="site-footer__link"
          href="https://www.linkedin.com/in/shehab-mu/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Shehab Muhammed on LinkedIn (opens in a new tab)"
        >Shehab Muhammed</a>
      </p>
      <a
        class="site-footer__link"
        href="https://github.com/Shehab-Mu/veload"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Veload on GitHub (opens in a new tab)"
      >GitHub</a>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
}

.site-footer__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 1fr));
  gap: 2.5rem;
  padding-block: 3rem 2rem;
}

.site-footer__name {
  font-size: 1.05rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.site-footer__tagline {
  max-width: 26rem;
  margin-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.site-footer__note {
  max-width: 30rem;
  margin-top: 1rem;
  color: var(--text-subtle);
  font-size: 0.8rem;
  line-height: 1.6;
}

.site-footer__title {
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-footer__list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.site-footer__link {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-decoration: none;
}

.site-footer__link:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}

.site-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  padding-block: 1.25rem 2rem;
  border-top: 1px solid var(--border);
  color: var(--text-subtle);
  font-size: 0.78rem;
}

.site-footer__bottom .site-footer__link {
  font-size: inherit;
}

@media (max-width: 48rem) {
  .site-footer__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
