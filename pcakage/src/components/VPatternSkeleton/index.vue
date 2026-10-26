<script setup lang="ts">
import { computed } from "vue";
import VSkeleton from "../VSkeleton/index.vue";
import type { SkeletonPattern, VPatternSkeletonProps } from "./types";

const props = withDefaults(defineProps<VPatternSkeletonProps>(), {
  pattern: "lines",
  rows: 3,
  columns: 3,
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

const patterns: readonly SkeletonPattern[] = ["lines", "article", "card", "profile", "list", "table", "media", "form", "dashboard", "feed", "product"];
function normalizeCount(value: unknown, fallback: number, maximum = 12): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(1, Math.round(value))) : fallback;
}
function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
const pattern = computed<SkeletonPattern>(() => patterns.includes(props.pattern as SkeletonPattern) ? props.pattern as SkeletonPattern : "lines");
const rows = computed(() => normalizeCount(props.rows, 3));
const columns = computed(() => normalizeCount(props.columns, 3, 6));
const avatarSize = computed(() => normalizeCount(props.avatarSize, 48, 160));
const label = computed(() => normalizeText(props.label) ?? "");
const attrs = computed(() => label.value ? { role: "status" as const, "aria-label": label.value, "aria-busy": "true" as const } : { "aria-hidden": "true" as const });
const style = computed(() => ({
  "--v-skeleton-base-color": normalizeText(props.color),
  "--v-skeleton-highlight-color": normalizeText(props.highlightColor),
}));
const tableGridStyle = computed(() => ({ gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))` }));
</script>

<template>
  <div class="v-pattern-skeleton" :class="`v-pattern-skeleton--${pattern}`" :style="style" v-bind="attrs">
    <template v-if="pattern === 'profile'">
      <VSkeleton v-if="showAvatar" variant="circle" :animated="animated" :width="avatarSize" />
      <div class="v-pattern-skeleton__body">
        <VSkeleton :animated="animated" width="42%" height="1rem" />
        <VSkeleton :animated="animated" width="64%" height=".75rem" />
        <VSkeleton v-for="row in rows" :key="row" :animated="animated" :width="row === rows ? '62%' : '100%'" height=".7rem" />
      </div>
      <div v-if="showStats" class="v-pattern-skeleton__stats"><VSkeleton v-for="stat in 3" :key="stat" variant="rect" :animated="animated" height="2.5rem" /></div>
    </template>

    <template v-else-if="pattern === 'feed'">
      <div v-for="item in rows" :key="item" class="v-pattern-skeleton__feed-item">
        <VSkeleton v-if="showAvatar" variant="circle" :animated="animated" :width="avatarSize" />
        <div class="v-pattern-skeleton__body"><VSkeleton :animated="animated" width="40%" height=".85rem" /><VSkeleton :animated="animated" width="100%" height=".75rem" /><VSkeleton :animated="animated" width="72%" height=".75rem" /></div>
      </div>
    </template>

    <template v-else-if="pattern === 'media'">
      <VSkeleton variant="rect" :animated="animated" :width="mediaHeight ? mediaHeight : '7.5rem'" height="5.5rem" />
      <div class="v-pattern-skeleton__body"><VSkeleton :animated="animated" width="36%" height=".7rem" /><VSkeleton :animated="animated" width="100%" height="1rem" /><VSkeleton v-for="row in rows" :key="row" :animated="animated" :width="row === rows ? '62%' : '86%'" height=".7rem" /></div>
    </template>

    <template v-else-if="pattern === 'product'">
      <VSkeleton variant="rect" :animated="animated" width="100%" :height="mediaHeight ?? '10rem'" />
      <VSkeleton :animated="animated" width="74%" height="1rem" />
      <VSkeleton v-if="showRating" variant="rect" :animated="animated" width="4.5rem" height="1.25rem" />
      <VSkeleton v-if="showPrice" :animated="animated" width="35%" height="1.15rem" />
      <VSkeleton v-if="showCta" variant="rect" :animated="animated" width="46%" height="2.25rem" />
    </template>

    <template v-else-if="pattern === 'card'">
      <VSkeleton v-if="showMedia" variant="rect" :animated="animated" width="100%" :height="mediaHeight ?? '6rem'" />
      <div v-if="showAvatar" class="v-pattern-skeleton__inline"><VSkeleton variant="circle" :animated="animated" :width="avatarSize" /><VSkeleton :animated="animated" width="45%" height=".8rem" /></div>
      <VSkeleton v-for="row in rows" :key="row" :animated="animated" :width="row === rows ? '72%' : '100%'" height=".75rem" />
    </template>

    <template v-else-if="pattern === 'table'">
      <div v-if="showHeader" class="v-pattern-skeleton__table-row v-pattern-skeleton__table-header" :style="tableGridStyle"><VSkeleton v-for="column in columns" :key="column" :animated="animated" height=".9rem" /></div>
      <div v-for="row in rows" :key="row" class="v-pattern-skeleton__table-row v-pattern-skeleton__data-row" :style="tableGridStyle"><VSkeleton v-for="column in columns" :key="column" :animated="animated" height=".75rem" /></div>
    </template>

    <template v-else-if="pattern === 'dashboard'">
      <div v-if="showStats" class="v-pattern-skeleton__stats"><VSkeleton v-for="stat in columns" :key="stat" variant="rect" :animated="animated" height="4.5rem" /></div>
      <VSkeleton v-if="showChart" variant="rect" :animated="animated" width="100%" :height="mediaHeight ?? '9rem'" />
      <div class="v-pattern-skeleton__table-row v-pattern-skeleton__table-header" :style="tableGridStyle"><VSkeleton v-for="column in columns" :key="column" :animated="animated" height=".7rem" /></div>
      <div v-for="row in rows" :key="row" class="v-pattern-skeleton__table-row v-pattern-skeleton__data-row" :style="tableGridStyle"><VSkeleton v-for="column in columns" :key="column" :animated="animated" height=".65rem" /></div>
    </template>

    <template v-else-if="pattern === 'form'">
      <div v-for="row in rows" :key="row" class="v-pattern-skeleton__field"><VSkeleton :animated="animated" width="30%" height=".7rem" /><VSkeleton variant="rect" :animated="animated" width="100%" height="2.5rem" /></div>
      <VSkeleton v-if="showSubmit" variant="rect" :animated="animated" width="8rem" height="2.5rem" />
    </template>

    <template v-else-if="pattern === 'list'">
      <div v-for="item in rows" :key="item" class="v-pattern-skeleton__feed-item"><VSkeleton v-if="showAvatar" variant="circle" :animated="animated" :width="avatarSize" /><div class="v-pattern-skeleton__body"><VSkeleton :animated="animated" width="76%" height=".85rem" /><VSkeleton :animated="animated" width="54%" height=".7rem" /></div></div>
    </template>

    <template v-else>
      <VSkeleton v-if="pattern === 'article' && showMedia" variant="rect" :animated="animated" width="100%" :height="mediaHeight ?? '10rem'" />
      <VSkeleton v-if="pattern === 'article'" :animated="animated" width="72%" height="1.35rem" />
      <VSkeleton v-for="row in rows" :key="row" :animated="animated" :width="row === rows ? '62%' : '100%'" height=".8rem" />
    </template>
  </div>
</template>

<style scoped>
.v-pattern-skeleton { display: grid; gap: .75rem; width: 100%; max-width: 38rem; }
.v-pattern-skeleton__body { display: grid; align-content: center; gap: .45rem; min-width: 0; }
.v-pattern-skeleton--profile { grid-template-columns: auto 1fr; align-items: start; }
.v-pattern-skeleton--profile .v-pattern-skeleton__stats { grid-column: 1 / -1; }
.v-pattern-skeleton--media { grid-template-columns: auto 1fr; align-items: start; }
.v-pattern-skeleton__feed-item, .v-pattern-skeleton__inline { display: flex; align-items: center; gap: .75rem; }
.v-pattern-skeleton__feed-item + .v-pattern-skeleton__feed-item { padding-top: .75rem; border-top: 1px solid color-mix(in srgb, currentColor 9%, transparent); }
.v-pattern-skeleton__feed-item .v-pattern-skeleton__body { flex: 1; }
.v-pattern-skeleton__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: .75rem; }
.v-pattern-skeleton__table-row { display: grid; gap: .75rem; align-items: center; padding: .55rem 0; border-bottom: 1px solid color-mix(in srgb, currentColor 9%, transparent); }
.v-pattern-skeleton__field { display: grid; gap: .4rem; }
</style>
