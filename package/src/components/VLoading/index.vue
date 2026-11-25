<script setup lang="ts">
import { computed } from "vue";
import VSpinner from "../VSpinner/index.vue";
import type { VLoadingProps } from "./types";

const props = withDefaults(defineProps<VLoadingProps>(), {
  loading: false,
  label: "Loading",
  inertContent: true,
  indicatorSize: 28,
});

const resolvedLabel = computed(() =>
  typeof props.label === "string" ? props.label.trim() : "",
);

const resolvedIndicatorSize = computed(() =>
  Number.isFinite(props.indicatorSize)
    ? Math.max(0, props.indicatorSize)
    : 28,
);

const isInert = computed(() => props.loading && props.inertContent);

const overlayAttrs = computed(() =>
  resolvedLabel.value.length > 0
    ? { role: "status" as const }
    : { "aria-hidden": "true" as const },
);
</script>

<template>
  <div
    class="v-loading"
    :class="{
      'v-loading--active': loading,
      'v-loading--blocking': isInert,
    }"
    :aria-busy="loading ? 'true' : undefined"
  >
    <div
      class="v-loading__content"
      :inert="isInert || undefined"
    >
      <slot />
    </div>

    <div
      v-if="loading"
      class="v-loading__overlay"
      v-bind="overlayAttrs"
    >
      <slot name="indicator">
        <VSpinner
          :size="resolvedIndicatorSize"
          decorative
        />
      </slot>

      <span
        v-if="resolvedLabel.length > 0"
        class="v-loading__label"
      >
        {{ resolvedLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.v-loading {
  position: relative;
  isolation: isolate;
}

.v-loading__content {
  min-width: 0;
}

.v-loading__overlay {
  position: absolute;
  inset: 0;
  z-index: var(--v-loading-z-index, 10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: var(--v-loading-radius, inherit);
  background-color: var(
    --v-loading-overlay-background,
    rgba(255, 255, 255, 0.72)
  );
  backdrop-filter: var(--v-loading-backdrop-filter, none);
  color: var(--v-loading-color, #334155);
  pointer-events: none;
}

.v-loading--blocking .v-loading__overlay {
  pointer-events: auto;
}

.v-loading__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .v-loading__overlay {
    backdrop-filter: none;
  }
}
</style>
