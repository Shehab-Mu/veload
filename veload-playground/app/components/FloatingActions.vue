<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const showScrollTop = ref(false);

function updateVisibility(): void {
  showScrollTop.value = window.scrollY > 400;
}

function scrollToTop(): void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

onMounted(() => {
  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateVisibility);
});
</script>

<template>
  <nav class="floating-actions" aria-label="Quick actions">
    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        class="floating-actions__item"
        type="button"
        aria-label="Scroll to top"
        title="Scroll to top"
        @click="scrollToTop"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 14 6-6 6 6" />
        </svg>
        <span class="floating-actions__tooltip" aria-hidden="true">Back to top</span>
      </button>
    </Transition>

    <a
      class="floating-actions__item"
      href="https://github.com/Shehab-Mo/veload"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star Veload on GitHub"
      title="Star Veload on GitHub"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.02 3.03 1.53.1-.74.4-1.25.72-1.54-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.41.36.77 1.04.77 2.1v3.13c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
      </svg>
      <span class="floating-actions__tooltip" aria-hidden="true">GitHub</span>
    </a>

    <a
      class="floating-actions__item"
      href="https://www.npmjs.com/package/veload"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Veload on npm"
      title="View Veload on npm"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.5 7.5h17v9h-8.5v-6h-3v6h-5.5z" />
        <path d="M9 10.5h3v6" />
      </svg>
      <span class="floating-actions__tooltip" aria-hidden="true">npm package</span>
    </a>
  </nav>
</template>

<style scoped>
.floating-actions {
  position: fixed;
  z-index: 30;
  right: max(0.75rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
}

.floating-actions__item {
  position: relative;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease;
}

.floating-actions__item:hover {
  transform: translateY(-1px);
  border-color: var(--accent-border);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.floating-actions__item svg {
  width: 1.2rem;
  height: 1.2rem;
}

.floating-actions__tooltip {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.65rem);
  padding: 0.35rem 0.55rem;
  transform: translate(0.25rem, -50%);
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.floating-actions__item:hover .floating-actions__tooltip,
.floating-actions__item:focus-visible .floating-actions__tooltip {
  transform: translate(0, -50%);
  opacity: 1;
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  transform: translateX(0.5rem);
  opacity: 0;
}

@media (max-width: 40rem) {
  .floating-actions {
    right: max(0.65rem, env(safe-area-inset-right));
    bottom: max(0.85rem, env(safe-area-inset-bottom));
    gap: 0.25rem;
    padding: 0.3rem;
  }

  .floating-actions__item {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 0.65rem;
  }

  .floating-actions__item svg {
    width: 1.1rem;
    height: 1.1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-actions__item,
  .floating-actions__tooltip,
  .scroll-top-enter-active,
  .scroll-top-leave-active {
    transition: none;
  }

  .floating-actions__item:hover {
    transform: none;
  }
}
</style>
