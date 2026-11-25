<script setup lang="ts">
import { computed } from "vue";
import VPatternSkeleton from "../VPatternSkeleton/index.vue";
import type { VSkeletonSwitchProps } from "./types";

const props = withDefaults(defineProps<VSkeletonSwitchProps>(), {
  loading: true,
  pattern: "lines",
  label: "Loading content",
  rows: 3,
  animated: true,
  showMedia: true,
  showAvatar: true,
  showHeader: true,
  showChart: true,
  showStats: true,
  showSubmit: true,
  showRating: true,
  showPrice: true,
  showCta: true,
});

const skeletonProps = computed(() => ({
  pattern: props.pattern,
  rows: props.rows,
  columns: props.columns,
  color: props.color,
  highlightColor: props.highlightColor,
  animated: props.animated,
  label: props.label,
  mediaHeight: props.mediaHeight,
  avatarSize: props.avatarSize,
  showMedia: props.showMedia,
  showAvatar: props.showAvatar,
  showHeader: props.showHeader,
  showChart: props.showChart,
  showStats: props.showStats,
  showSubmit: props.showSubmit,
  showRating: props.showRating,
  showPrice: props.showPrice,
  showCta: props.showCta,
}));
</script>

<template>
  <slot v-if="!loading" />
  <slot v-else name="skeleton"><VPatternSkeleton v-bind="skeletonProps" /></slot>
</template>
