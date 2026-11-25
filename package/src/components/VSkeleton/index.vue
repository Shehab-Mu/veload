<script setup lang="ts">
import { computed } from "vue";
import { toCssLength } from "../../utils/css";
import type { SkeletonVariant, VSkeletonProps } from "./types";

const props = withDefaults(defineProps<VSkeletonProps>(), {
  variant: "text",
  animated: true,
});

const resolvedVariant = computed<SkeletonVariant>(() => {
  const variant = props.variant;
  return variant === "rect" || variant === "circle" ? variant : "text";
});

const resolvedWidth = computed(() =>
  toCssLength(
    props.width,
    resolvedVariant.value === "circle" ? "40px" : "100%",
  ),
);

const resolvedHeight = computed(() => {
  if (props.height !== undefined) {
    return toCssLength(
      props.height,
      resolvedVariant.value === "text" ? "1em" : "6rem",
    );
  }

  if (resolvedVariant.value === "circle") {
    return undefined;
  }

  return resolvedVariant.value === "text" ? "1em" : "6rem";
});

const resolvedRadius = computed(() => {
  if (props.borderRadius === undefined) {
    return undefined;
  }

  if (typeof props.borderRadius === "number") {
    return Number.isFinite(props.borderRadius)
      ? `${Math.max(0, props.borderRadius)}px`
      : undefined;
  }

  const radius = props.borderRadius.trim();
  return radius.length > 0 ? radius : undefined;
});

const skeletonStyle = computed(() => ({
  width: resolvedWidth.value,
  height: resolvedHeight.value,
  borderRadius: resolvedRadius.value,
  aspectRatio:
    resolvedVariant.value === "circle" && props.height === undefined
      ? "1 / 1"
      : undefined,
}));

const resolvedLabel = computed(() =>
  typeof props.label === "string" ? props.label.trim() : "",
);

const rootAttrs = computed(() =>
  resolvedLabel.value.length > 0
    ? {
        role: "status" as const,
        "aria-label": resolvedLabel.value,
        "aria-busy": "true" as const,
      }
    : { "aria-hidden": "true" as const },
);
</script>

<template>
  <span
    class="v-skeleton"
    :class="[
      `v-skeleton--${resolvedVariant}`,
      { 'v-skeleton--animated': animated },
    ]"
    :style="skeletonStyle"
    v-bind="rootAttrs"
  />
</template>

<style scoped>
.v-skeleton {
  display: block;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(
    --v-skeleton-base-color,
    rgba(148, 163, 184, 0.28)
  );
}

.v-skeleton--text {
  border-radius: var(--v-skeleton-radius, 0.25em);
}

.v-skeleton--rect {
  border-radius: var(--v-skeleton-radius, 0.5rem);
}

.v-skeleton--circle {
  border-radius: 50%;
}

.v-skeleton--animated::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    transparent,
    var(--v-skeleton-highlight-color, rgba(255, 255, 255, 0.55)),
    transparent
  );
  transform: translateX(-100%);
  animation: veload-skeleton-shimmer
    var(--v-skeleton-duration, 1.4s) ease-in-out infinite;
}

@keyframes veload-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .v-skeleton--animated::after {
    display: none;
    animation: none;
  }
}
</style>
