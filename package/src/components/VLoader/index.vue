<script setup lang="ts">
import { computed } from "vue";
import { loaderVariants, type LoaderVariant, type VLoaderProps } from "./types";

const props = withDefaults(defineProps<VLoaderProps>(), {
  variant: "spin",
  color: "currentColor",
  size: 40,
  duration: 1000,
  label: "Loading",
  decorative: false,
  value: null,
});

const fixedCounts: Partial<Record<LoaderVariant, number>> = {
  breathing: 2,
  "dual-arc": 2,
};

const defaultCounts: Partial<Record<LoaderVariant, number>> = {
  grid: 4,
  heatmap: 9,
  squares: 9,
};

function normalizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value: unknown, fallback: number, minimum: number, maximum?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const normalized = Math.max(minimum, value);
  return maximum === undefined ? normalized : Math.min(maximum, normalized);
}

const variant = computed<LoaderVariant>(() => {
  const candidate = typeof props.variant === "string" ? props.variant : "";
  return loaderVariants.find((variant) => variant === candidate) ?? "spin";
});
const size = computed(() => normalizeNumber(props.size, 40, 12));
const duration = computed(() => normalizeNumber(props.duration, 1000, 100));
const count = computed(() => fixedCounts[variant.value]
  ?? Math.round(normalizeNumber(props.count, defaultCounts[variant.value] ?? 4, 1, 12)));
const color = computed(() => normalizeText(props.color, "currentColor"));
const label = computed(() => normalizeText(props.label));
const decorative = computed(() => Boolean(props.decorative) || label.value.length === 0);
const value = computed(() =>
  typeof props.value === "number" && Number.isFinite(props.value)
    ? Math.min(100, Math.max(0, props.value))
    : null,
);
const rootAttrs = computed(() => decorative.value
  ? { "aria-hidden": "true" as const }
  : { role: "status" as const, "aria-label": label.value });
const rootStyle = computed(() => ({
  "--vl-size": `${size.value}px`,
  "--vl-color": color.value,
  "--vl-duration": `${duration.value}ms`,
  "--vl-value": `${value.value ?? 72}%`,
  "--vl-total": String(count.value),
}));
const marks = computed(() => Array.from({ length: count.value }));
</script>

<template>
  <span class="v-loader" :class="`v-loader--${variant}`" :style="rootStyle" v-bind="rootAttrs">
    <span class="v-loader__visual" aria-hidden="true">
      <span v-for="(_, index) in marks" :key="index" class="v-loader__mark" :style="{ '--vl-index': index }" />
      <span v-if="variant === 'progress-ring' && value !== null" class="v-loader__value">{{ Math.round(value) }}%</span>
    </span>
  </span>
</template>

<style scoped>
.v-loader { display: inline-flex; inline-size: var(--vl-size); block-size: var(--vl-size); color: var(--vl-color); vertical-align: middle; contain: layout paint; }
.v-loader__visual { position: relative; display: block; inline-size: 100%; block-size: 100%; }
.v-loader__mark { position: absolute; display: block; box-sizing: border-box; background: currentColor; }
.v-loader__value { position: absolute; inset: 0; display: grid; place-items: center; font: 600 calc(var(--vl-size) * .22)/1 ui-sans-serif, system-ui, sans-serif; }
.v-loader--spin .v-loader__visual, .v-loader--gradient-ring .v-loader__visual, .v-loader--rotate .v-loader__visual { border: max(2px, calc(var(--vl-size) * .09)) solid color-mix(in srgb, currentColor 18%, transparent); border-top-color: currentColor; border-radius: 50%; animation: spin var(--vl-duration) linear infinite; }
.v-loader--gradient-ring .v-loader__visual { border: 0; background: conic-gradient(from 40deg, transparent, currentColor, color-mix(in srgb, currentColor 35%, white), transparent 78%); mask: radial-gradient(farthest-side, transparent calc(100% - max(2px, calc(var(--vl-size) * .1))), #000 0); }
.v-loader--rotate .v-loader__visual { border-radius: 28% 72% 72% 28%; animation-timing-function: cubic-bezier(.6,.05,.35,.95); }
.v-loader--ring .v-loader__visual { border: max(2px, calc(var(--vl-size) * .09)) solid currentColor; border-inline-end-color: transparent; border-radius: 50%; animation: spin calc(var(--vl-duration) * 1.25) cubic-bezier(.55,.1,.45,.9) infinite; }
.v-loader--pulse .v-loader__visual { border-radius: 50%; background: currentColor; animation: pulse var(--vl-duration) ease-in-out infinite; }
.v-loader--ripple .v-loader__visual { border: max(2px, calc(var(--vl-size) * .06)) solid currentColor; border-radius: 50%; animation: ripple var(--vl-duration) ease-out infinite; }
.v-loader--ripple .v-loader__mark { inset: 0; border: inherit; border-radius: inherit; background: none; animation: ripple var(--vl-duration) ease-out calc(var(--vl-duration) / -2) infinite; }
.v-loader--orbit .v-loader__visual { border: max(1px, calc(var(--vl-size) * .035)) solid color-mix(in srgb, currentColor 35%, transparent); border-radius: 50%; animation: spin calc(var(--vl-duration) * 1.6) linear infinite; }
.v-loader--orbit .v-loader__mark { inline-size: 22%; block-size: 22%; border-radius: 50%; inset: -11% auto auto 39%; transform-origin: 50% calc(var(--vl-size) * .61); animation: orbit var(--vl-duration) linear infinite; }
.v-loader--orbit-dots .v-loader__visual { animation: spin calc(var(--vl-duration) * 1.5) linear infinite; }
.v-loader--orbit-dots .v-loader__mark { inline-size: 19%; block-size: 19%; border-radius: 50%; inset: 40%; transform: rotate(calc(var(--vl-index) * 360deg / var(--vl-total))) translateY(calc(var(--vl-size) * -.38)); opacity: calc(.35 + var(--vl-index) / var(--vl-total)); }
.v-loader--spin-dots .v-loader__visual { animation: spin var(--vl-duration) steps(12) infinite; }
.v-loader--spin-dots .v-loader__mark { inline-size: 13%; block-size: 13%; border-radius: 50%; inset: 43.5%; transform: rotate(calc(var(--vl-index) * 360deg / var(--vl-total))) translateY(calc(var(--vl-size) * -.42)); transform-origin: center; opacity: calc(.2 + var(--vl-index) / var(--vl-total)); }
.v-loader--progress-ring .v-loader__visual { border-radius: 50%; background: conic-gradient(currentColor var(--vl-value), color-mix(in srgb, currentColor 14%, transparent) 0); mask: radial-gradient(farthest-side, transparent calc(100% - max(3px, calc(var(--vl-size) * .1))), #000 0); animation: progress-ring calc(var(--vl-duration) * 2) ease-in-out infinite alternate; }
.v-loader--progress-ring:has(.v-loader__value) .v-loader__visual { animation: none; }
.v-loader--dots, .v-loader--typing, .v-loader--bounce { inline-size: max(calc(var(--vl-size) * 1.5), calc(var(--vl-size) * (0.31 * var(--vl-total) - 0.12))); }
.v-loader--bars, .v-loader--equalizer, .v-loader--wave, .v-loader--stair { inline-size: max(calc(var(--vl-size) * 1.5), calc(var(--vl-size) * (0.21 * var(--vl-total) - 0.08))); }
.v-loader--dots .v-loader__visual, .v-loader--typing .v-loader__visual, .v-loader--bounce .v-loader__visual { display: flex; align-items: center; justify-content: center; gap: calc(var(--vl-size) * .12); }
.v-loader--dots .v-loader__mark, .v-loader--typing .v-loader__mark, .v-loader--bounce .v-loader__mark { position: relative; inline-size: calc(var(--vl-size) * .19); block-size: calc(var(--vl-size) * .19); border-radius: 50%; animation: dot var(--vl-duration) ease-in-out calc(var(--vl-index) * var(--vl-duration) / -8) infinite; }
.v-loader--typing .v-loader__mark { animation-name: typing; }
.v-loader--bounce .v-loader__mark { animation-name: bounce; box-shadow: 0 calc(var(--vl-size) * .18) 0 color-mix(in srgb, currentColor 14%, transparent); }
.v-loader--bars .v-loader__visual, .v-loader--equalizer .v-loader__visual, .v-loader--wave .v-loader__visual, .v-loader--stair .v-loader__visual { display: flex; align-items: center; justify-content: center; gap: calc(var(--vl-size) * .08); }
.v-loader--bars .v-loader__mark, .v-loader--equalizer .v-loader__mark, .v-loader--wave .v-loader__mark, .v-loader--stair .v-loader__mark { position: relative; inline-size: calc(var(--vl-size) * .13); block-size: 65%; border-radius: 999px; transform-origin: center; animation: bars var(--vl-duration) ease-in-out calc(var(--vl-index) * var(--vl-duration) / -7) infinite; }
.v-loader--equalizer .v-loader__mark { border-radius: calc(var(--vl-size) * .04); animation-name: equalizer; }
.v-loader--wave .v-loader__mark { block-size: 18%; border-radius: 50%; animation-name: wave; }
.v-loader--stair .v-loader__mark { align-self: flex-end; block-size: calc(18% + var(--vl-index) * 15%); animation-name: stair; }
.v-loader--grid .v-loader__visual, .v-loader--squares .v-loader__visual, .v-loader--heatmap .v-loader__visual { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12%; padding: 8%; }
.v-loader--grid .v-loader__mark, .v-loader--squares .v-loader__mark, .v-loader--heatmap .v-loader__mark { position: relative; border-radius: 20%; animation: grid var(--vl-duration) ease-in-out calc(var(--vl-index) * var(--vl-duration) / -6) infinite; }
.v-loader--squares .v-loader__visual { grid-template-columns: repeat(3, 1fr); }
.v-loader--squares .v-loader__mark { border-radius: 8%; animation-name: squares; }
.v-loader--heatmap .v-loader__visual { grid-template-columns: repeat(3, 1fr); gap: 7%; padding: 2%; }
.v-loader--heatmap .v-loader__mark { border-radius: 20%; animation-name: heatmap; }
.v-loader--card-flip .v-loader__visual, .v-loader--element .v-loader__visual, .v-loader--plane .v-loader__visual, .v-loader--logo-spin .v-loader__visual, .v-loader--morph .v-loader__visual, .v-loader--blob .v-loader__visual { background: currentColor; }
.v-loader--card-flip .v-loader__visual { inline-size: 72%; block-size: 72%; margin: 14%; border-radius: 12%; animation: card-flip var(--vl-duration) cubic-bezier(.6,.05,.3,.95) infinite; }
.v-loader--element .v-loader__visual { inline-size: 62%; block-size: 62%; margin: 19%; transform: rotate(45deg); border-radius: 10%; animation: element var(--vl-duration) ease-in-out infinite; }
.v-loader--plane .v-loader__visual { clip-path: polygon(50% 0, 100% 100%, 50% 78%, 0 100%); animation: plane var(--vl-duration) ease-in-out infinite; }
.v-loader--logo-spin .v-loader__visual { border-radius: 30% 70% 30% 70%; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); animation: spin calc(var(--vl-duration) * 1.2) cubic-bezier(.5,0,.5,1) infinite; }
.v-loader--morph .v-loader__visual { border-radius: 32% 68% 62% 38% / 35% 36% 64% 65%; animation: morph var(--vl-duration) ease-in-out infinite; }
.v-loader--blob .v-loader__visual { border-radius: 48% 52% 36% 64% / 57% 40% 60% 43%; animation: blob calc(var(--vl-duration) * 1.8) ease-in-out infinite; }
.v-loader--hashtag .v-loader__visual::before, .v-loader--hashtag .v-loader__visual::after { content: ""; position: absolute; inset: 8% 39%; border-radius: 999px; background: currentColor; transform: rotate(15deg); }
.v-loader--hashtag .v-loader__visual::after { transform: rotate(105deg); }
.v-loader--fallback .v-loader__visual { border: max(2px, calc(var(--vl-size) * .08)) dashed currentColor; border-radius: 50%; animation: spin calc(var(--vl-duration) * 1.4) linear infinite; }
.v-loader--signal .v-loader__visual { border: max(2px, calc(var(--vl-size) * .06)) solid currentColor; border-left-color: transparent; border-bottom-color: transparent; border-radius: 100% 0 0; animation: signal var(--vl-duration) ease-in-out infinite; }
.v-loader--snake .v-loader__visual { border: max(3px, calc(var(--vl-size) * .1)) solid transparent; border-top-color: currentColor; border-right-color: currentColor; border-radius: 50%; animation: snake var(--vl-duration) linear infinite; }
.v-loader--liquid .v-loader__visual { overflow: hidden; border: max(2px, calc(var(--vl-size) * .06)) solid currentColor; border-radius: 50%; }
.v-loader--liquid .v-loader__visual::after { content: ""; position: absolute; inline-size: 180%; block-size: 90%; inset: 42% auto auto -40%; background: currentColor; border-radius: 42%; animation: liquid var(--vl-duration) ease-in-out infinite; }
.v-loader--flow .v-loader__visual { overflow: hidden; border-radius: 999px; background: color-mix(in srgb, currentColor 15%, transparent); }
.v-loader--flow .v-loader__visual::after { content: ""; position: absolute; inset: 36% 0; border-radius: inherit; background: currentColor; animation: flow var(--vl-duration) ease-in-out infinite; }
.v-loader--breathing .v-loader__mark { border-radius: 50%; }
.v-loader--breathing .v-loader__mark:first-child {
  inset: 12%;
  border: max(1px, calc(var(--vl-size) * .045)) solid currentColor;
  background: none;
  opacity: .4;
  transform: scale(.86);
  animation: breathing-halo var(--vl-duration) cubic-bezier(.45, 0, .55, 1) infinite;
}
.v-loader--breathing .v-loader__mark:last-child { inset: 40%; }
.v-loader--dual-arc .v-loader__mark {
  inset: 5%;
  border: max(1px, calc(var(--vl-size) * .055)) solid transparent;
  border-top-color: currentColor;
  border-right-color: currentColor;
  border-radius: 50%;
  background: none;
  animation: spin var(--vl-duration) linear infinite;
}
.v-loader--dual-arc .v-loader__mark:last-child {
  inset: 25%;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: currentColor;
  border-left-color: currentColor;
  opacity: .65;
  animation-direction: reverse;
  animation-duration: calc(var(--vl-duration) * 1.25);
}
.v-loader--dot-sweep {
  inline-size: max(calc(var(--vl-size) * 1.5), calc(var(--vl-size) * (.34 * var(--vl-total) + .2)));
}
.v-loader--dot-sweep .v-loader__visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--vl-size) * .18);
}
.v-loader--dot-sweep .v-loader__mark {
  position: relative;
  flex-shrink: 0;
  inline-size: calc(var(--vl-size) * .16);
  block-size: calc(var(--vl-size) * .16);
  border-radius: 50%;
  opacity: .65;
  animation: dot-sweep var(--vl-duration) ease-in-out calc(var(--vl-index) * var(--vl-duration) / var(--vl-total) * -1) infinite;
}
.v-loader--sliding-bars {
  inline-size: calc(var(--vl-size) * 1.5);
  block-size: max(var(--vl-size), calc(var(--vl-size) * (.2 * var(--vl-total) + .1)));
}
.v-loader--sliding-bars .v-loader__visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--vl-size) * .1);
}
.v-loader--sliding-bars .v-loader__mark {
  position: relative;
  flex-shrink: 0;
  inline-size: calc(var(--vl-size) * .8);
  block-size: calc(var(--vl-size) * .1);
  border-radius: 999px;
  opacity: .85;
  animation: sliding-bars var(--vl-duration) cubic-bezier(.65, 0, .35, 1) infinite;
}
.v-loader--sliding-bars .v-loader__mark:nth-child(even) {
  opacity: .5;
  animation-delay: calc(var(--vl-duration) / -2);
}
@keyframes breathing-halo {
  0%, 100% { transform: scale(.86); opacity: .35; }
  50% { transform: scale(1.12); opacity: .7; }
}
@keyframes dot-sweep {
  0%, 100% { transform: translateX(-55%); opacity: .3; }
  50% { transform: translateX(55%); opacity: 1; }
}
@keyframes sliding-bars {
  0%, 100% { transform: translateX(-25%); }
  50% { transform: translateX(25%); }
}
@keyframes spin { to { transform: rotate(360deg); } } @keyframes orbit { to { transform: rotate(360deg); } } @keyframes pulse { 50% { transform: scale(.62); opacity: .45; } } @keyframes ripple { from { transform: scale(.2); opacity: 1; } to { transform: scale(1); opacity: 0; } } @keyframes progress-ring { to { transform: rotate(160deg); } } @keyframes dot { 50% { transform: translateY(-35%); opacity: .38; } } @keyframes typing { 50% { transform: scale(.65); opacity: .35; } } @keyframes bounce { 50% { transform: translateY(-65%); } } @keyframes bars { 50% { transform: scaleY(.28); opacity: .42; } } @keyframes equalizer { 50% { transform: scaleY(.22); } } @keyframes wave { 50% { transform: translateY(-100%) scale(1.25); } } @keyframes stair { 50% { transform: translateY(-38%); opacity: .4; } } @keyframes grid { 50% { transform: scale(.45); opacity: .35; } } @keyframes squares { 50% { transform: rotate(90deg) scale(.6); } } @keyframes heatmap { 50% { background: color-mix(in srgb, currentColor 28%, transparent); transform:scale(.78); } } @keyframes card-flip { 50% { transform:rotateY(180deg) scale(.82); } } @keyframes element { 50% { transform:rotate(225deg) scale(.68); border-radius:50%; } } @keyframes plane { 50% { transform:translateY(-16%) rotate(8deg); } } @keyframes morph { 50% { border-radius:64% 36% 38% 62% / 58% 65% 35% 42%; transform:rotate(90deg) scale(.82); } } @keyframes blob { 50% { border-radius:67% 33% 55% 45% / 36% 61% 39% 64%; transform:rotate(24deg) scale(.87); } } @keyframes signal { 50% { transform:scale(.72); opacity:.4; } } @keyframes snake { to { transform:rotate(360deg); } } @keyframes liquid { 50% { transform:translateX(22%) rotate(8deg); } } @keyframes flow { 50% { transform:translateX(60%); } }
@media (prefers-reduced-motion: reduce) { .v-loader *, .v-loader__visual, .v-loader__visual::before, .v-loader__visual::after { animation: none !important; transition: none !important; } .v-loader--ripple .v-loader__mark { display: none; } }
</style>
