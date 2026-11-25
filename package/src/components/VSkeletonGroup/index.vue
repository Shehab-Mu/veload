<script setup lang="ts">
import { computed } from "vue";
import type { VSkeletonGroupProps } from "./types";

const props = withDefaults(defineProps<VSkeletonGroupProps>(), {
  gap: "0.75rem",
  decorative: false,
});

const label = computed(() => typeof props.label === "string" ? props.label.trim() : "");
const rootAttrs = computed(() => {
  if (props.decorative) return { "aria-hidden": "true" as const };
  if (label.value) return { role: "status" as const, "aria-label": label.value, "aria-busy": "true" as const };
  return {};
});
</script>

<template>
  <div class="v-skeleton-group" :style="{ gap }" v-bind="rootAttrs"><slot /></div>
</template>

<style scoped>
.v-skeleton-group { display: grid; width: 100%; }
</style>
