<script setup lang="ts">
import { computed } from "vue";
import { toCssLength } from "../../utils/css";
import type { VProgressProps } from "./types";

const props = withDefaults(defineProps<VProgressProps>(), {
  value: null,
  min: 0,
  max: 100,
  label: "Progress",
  height: 8,
});

function normalizeColor(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const color = value.trim();
  return color.length > 0 ? color : undefined;
}

const hasValidRange = computed(
  () =>
    Number.isFinite(props.min) &&
    Number.isFinite(props.max) &&
    props.max > props.min,
);

const safeMin = computed(() => (hasValidRange.value ? props.min : 0));

const safeMax = computed(() => (hasValidRange.value ? props.max : 100));

const isDeterminate = computed(
  () =>
    typeof props.value === "number" &&
    Number.isFinite(props.value) &&
    hasValidRange.value,
);

const clampedValue = computed(() => {
  if (!isDeterminate.value || typeof props.value !== "number") {
    return safeMin.value;
  }

  return Math.min(safeMax.value, Math.max(safeMin.value, props.value));
});

const percentage = computed(() => {
  if (!isDeterminate.value) {
    return 0;
  }

  const range = safeMax.value - safeMin.value;
  return ((clampedValue.value - safeMin.value) / range) * 100;
});

const resolvedLabel = computed(() =>
  typeof props.label === "string" ? props.label.trim() : "",
);

const resolvedValueText = computed(() => {
  if (!isDeterminate.value) {
    return undefined;
  }

  const text =
    typeof props.valueText === "string" ? props.valueText.trim() : "";
  return text.length > 0 ? text : undefined;
});

const rootStyle = computed(() => ({
  height: toCssLength(props.height, "8px"),
  backgroundColor: normalizeColor(props.trackColor),
}));

const barStyle = computed(() => ({
  width: isDeterminate.value ? `${percentage.value}%` : undefined,
  backgroundColor: normalizeColor(props.color),
}));
</script>

<template>
  <div
    class="v-progress"
    :class="{
      'v-progress--indeterminate': !isDeterminate,
      'v-progress--determinate': isDeterminate,
    }"
    role="progressbar"
    :aria-label="resolvedLabel.length > 0 ? resolvedLabel : undefined"
    :aria-valuemin="isDeterminate ? safeMin : undefined"
    :aria-valuemax="isDeterminate ? safeMax : undefined"
    :aria-valuenow="isDeterminate ? clampedValue : undefined"
    :aria-valuetext="resolvedValueText"
    :style="rootStyle"
  >
    <div
      class="v-progress__bar"
      aria-hidden="true"
      :style="barStyle"
    />
  </div>
</template>

<style scoped>
.v-progress {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--v-progress-radius, 999px);
  background-color: var(--v-progress-track-color, #e2e8f0);
}

.v-progress__bar {
  height: 100%;
  border-radius: inherit;
  background-color: var(--v-progress-color, #2563eb);
  transition: width 200ms ease;
}

.v-progress--indeterminate .v-progress__bar {
  width: 40%;
  animation: veloader-progress-indeterminate
    var(--v-progress-duration, 1.4s) ease-in-out infinite;
}

@keyframes veloader-progress-indeterminate {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-progress__bar {
    transition: none;
  }

  .v-progress--indeterminate .v-progress__bar {
    width: 100%;
    opacity: 0.55;
    animation: none;
    transform: none;
  }
}
</style>
