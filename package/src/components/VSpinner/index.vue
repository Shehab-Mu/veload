<script setup lang="ts">
import { computed } from "vue";
import type { VSpinnerProps } from "./types";

const props = withDefaults(defineProps<VSpinnerProps>(), {
  size: 24,
  color: "currentColor",
  label: "Loading",
  decorative: false,
});

const resolvedSize = computed(() =>
  Number.isFinite(props.size) ? Math.max(0, props.size) : 24,
);

const resolvedColor = computed(() => {
  const color = typeof props.color === "string" ? props.color.trim() : "";
  return color.length > 0 ? color : "currentColor";
});

const resolvedLabel = computed(() =>
  typeof props.label === "string" ? props.label.trim() : "",
);

const isDecorative = computed(
  () => props.decorative || resolvedLabel.value.length === 0,
);

const rootAttrs = computed(() =>
  isDecorative.value
    ? { "aria-hidden": "true" as const }
    : { role: "status" as const, "aria-label": resolvedLabel.value },
);
</script>

<template>
  <span
    class="v-spinner"
    v-bind="rootAttrs"
  >
    <span
      class="v-spinner__indicator"
      aria-hidden="true"
      :style="{
        width: `${resolvedSize}px`,
        height: `${resolvedSize}px`,
        borderTopColor: resolvedColor,
      }"
    />
  </span>
</template>

<style scoped>
.v-spinner {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.v-spinner__indicator {
  display: inline-block;
  flex: none;
  box-sizing: border-box;
  border: var(--v-spinner-border-width, 3px) solid
    var(--v-spinner-track-color, currentColor);
  border-radius: 50%;
  animation: veload-spin 0.75s linear infinite;
}

@keyframes veload-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-spinner__indicator {
    animation: none;
  }
}
</style>
