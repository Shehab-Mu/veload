<script setup lang="ts">
import { computed } from "vue";
import VSpinner from "../VSpinner/index.vue";
import type { LoadingButtonType, VLoadingButtonProps } from "./types";

const props = withDefaults(defineProps<VLoadingButtonProps>(), {
  loading: false,
  disabled: false,
  type: "button",
  indicatorSize: 16,
});

const isDisabled = computed(() => props.disabled || props.loading);

const resolvedType = computed<LoadingButtonType>(() => {
  const type = props.type;
  return type === "submit" || type === "reset" ? type : "button";
});

const resolvedIndicatorSize = computed(() =>
  Number.isFinite(props.indicatorSize)
    ? Math.max(0, props.indicatorSize)
    : 16,
);
</script>

<template>
  <button
    class="v-loading-button"
    :class="{ 'v-loading-button--loading': loading }"
    :type="resolvedType"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
  >
    <span
      class="v-loading-button__content"
      :class="{ 'v-loading-button__content--hidden': loading }"
    >
      <slot />
    </span>

    <span
      v-if="loading"
      class="v-loading-button__indicator"
      aria-hidden="true"
    >
      <slot name="indicator">
        <VSpinner
          :size="resolvedIndicatorSize"
          decorative
        />
      </slot>
    </span>
  </button>
</template>

<style scoped>
.v-loading-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  box-sizing: border-box;
  cursor: pointer;
}

.v-loading-button:disabled {
  cursor: not-allowed;
}

.v-loading-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--v-loading-button-gap, 0.5rem);
}

.v-loading-button__content--hidden {
  opacity: 0;
  pointer-events: none;
}

.v-loading-button__indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .v-loading-button {
    transition: none;
  }
}
</style>
