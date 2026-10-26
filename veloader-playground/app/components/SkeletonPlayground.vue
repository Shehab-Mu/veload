<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { SkeletonPresetMeta } from "~/data/catalog";
import { getSkeletonPresetComponent } from "~/data/catalog";
import { skeletonPresetPropNames } from "~/data/component-props";
import { buildPropDocs, patternPropDefinitions } from "~/data/prop-docs";
import {
  installSnippet,
  skeletonComposition,
  skeletonSfc,
  skeletonTemplate,
  skeletonTypes,
  stylesheetSnippet,
} from "~/utils/code";
import type { SkeletonControlState } from "~/utils/code";
import {
  DEFAULT_BASE_COLOR,
  DEFAULT_HIGHLIGHT_COLOR,
  toPickerColor,
} from "~/utils/color";
import { skeletonDefaults } from "~/utils/defaults";
import type { CodeTab } from "~/types/code";
import CodeTabs from "./CodeTabs.vue";
import PropTable from "./PropTable.vue";
import ToggleControl from "./ToggleControl.vue";
import { VPatternSkeleton } from "veloader";

const props = defineProps<{
  entry: SkeletonPresetMeta;
}>();

const component = computed(() => getSkeletonPresetComponent(props.entry.name));
const defaults = computed(() => skeletonDefaults());

/**
 * The controls are rendered on the server, but they only react to input once
 * the client application has mounted. Until then they are disabled, so a value
 * typed into them is never silently discarded during hydration.
 *
 * The readiness is tied to the mount of the client application instead of an
 * arbitrary delay, and the region is marked as busy while it is not ready.
 */
const isReady = ref(false);

onMounted(() => {
  isReady.value = true;
});

const supportedProps = computed(
  () => skeletonPresetPropNames[props.entry.name] ?? [],
);

const state = reactive<SkeletonControlState>({
  rows: 3,
  columns: 3,
  animated: true,
  color: "",
  highlightColor: "",
  label: "",
  avatarSize: 48,
  mediaHeight: "",
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

const previewProps = computed(() => {
  const result: Record<string, unknown> = {};

  for (const name of supportedProps.value) {
    const value = (state as unknown as Record<string, unknown>)[name];

    if (value === "" || value === undefined || value === null) {
      continue;
    }

    result[name] = value;
  }

  return result;
});

const tabs = computed<CodeTab[]>(() => [
  {
    id: "vue",
    label: "Vue",
    language: "vue",
    code: skeletonSfc(props.entry, state, defaults.value),
  },
  {
    id: "composition",
    label: "Composition API",
    language: "vue",
    code: skeletonComposition(props.entry, state, defaults.value),
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "ts",
    code: skeletonTypes(props.entry, state, defaults.value),
  },
  {
    id: "install",
    label: "Install",
    language: "bash",
    code: installSnippet(),
  },
  {
    id: "css",
    label: "Stylesheet",
    language: "ts",
    code: stylesheetSnippet(),
  },
]);

const propDocs = computed(() =>
  buildPropDocs(
    VPatternSkeleton,
    patternPropDefinitions,
    supportedProps.value,
    { avatarSize: "48" },
  ),
);

const templateSnippet = computed(() =>
  skeletonTemplate(props.entry, state, defaults.value),
);

/**
 * The skeleton colours accept any CSS colour, including values with an alpha
 * channel, while a native colour picker can only show an opaque hexadecimal
 * colour. The text input therefore keeps the authoritative value, and the
 * picker follows it only when the value can be represented without losing the
 * transparency.
 */
const baseColorPicker = ref(DEFAULT_BASE_COLOR);
const highlightColorPicker = ref(DEFAULT_HIGHLIGHT_COLOR);

const baseColorHasAlpha = computed(() => toPickerColor(state.color)?.hasAlpha === true);
const highlightColorHasAlpha = computed(
  () => toPickerColor(state.highlightColor)?.hasAlpha === true,
);

function readValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

function onBaseColorText(event: Event): void {
  const value = readValue(event);
  state.color = value;

  const parsed = toPickerColor(value);

  if (parsed && !parsed.hasAlpha) {
    baseColorPicker.value = parsed.hex;
  }
}

function onBaseColorPicker(event: Event): void {
  const value = readValue(event);
  baseColorPicker.value = value;
  state.color = value;
}

function onHighlightColorText(event: Event): void {
  const value = readValue(event);
  state.highlightColor = value;

  const parsed = toPickerColor(value);

  if (parsed && !parsed.hasAlpha) {
    highlightColorPicker.value = parsed.hex;
  }
}

function onHighlightColorPicker(event: Event): void {
  const value = readValue(event);
  highlightColorPicker.value = value;
  state.highlightColor = value;
}
</script>

<template>
  <section class="playground" aria-label="Interactive preview">
    <div class="playground__workspace">
      <div class="playground__stage">
        <div class="playground__preview">
          <component :is="component" v-bind="previewProps" />
        </div>
        <p v-if="entry.pattern === 'dashboard'" class="playground__note">
          Table preview: one fixed header + {{ state.rows }} {{ state.rows === 1 ? 'data row' : 'data rows' }}.
          Statistics and chart are separate sections.
        </p>

        <p class="playground__template">
          <code>{{ templateSnippet }}</code>
        </p>
      </div>

      <div
        class="playground__controls"
        :aria-busy="isReady ? undefined : 'true'"
      >
        <h2 class="playground__controls-title">Controls</h2>

        <div class="playground__controls-grid">
          <div v-if="supportedProps.includes('rows')" class="control">
            <label for="skeleton-rows">
              {{ entry.pattern === 'dashboard' || entry.pattern === 'table' ? 'Data rows' : 'Rows' }} <span>{{ state.rows }}</span>
            </label>
            <input
              id="skeleton-rows"
              v-model.number="state.rows"
              :aria-describedby="entry.pattern === 'dashboard' || entry.pattern === 'table' ? 'skeleton-rows-hint' : undefined"
              type="range"
              min="1"
              max="12"
              step="1"
              :disabled="!isReady"
            />
            <p v-if="entry.pattern === 'dashboard' || entry.pattern === 'table'" id="skeleton-rows-hint" class="control__hint">
              {{ entry.pattern === 'dashboard' ? 'Data rows only. One fixed table header is always shown; statistics and chart are separate.' : 'Data rows only. The optional table header is separate.' }}
            </p>
          </div>

          <div v-if="supportedProps.includes('columns')" class="control">
            <label for="skeleton-columns">
              Columns <span>{{ state.columns }}</span>
            </label>
            <input
              id="skeleton-columns"
              v-model.number="state.columns"
              type="range"
              min="1"
              max="6"
              step="1"
              :disabled="!isReady"
            />
          </div>

          <div v-if="supportedProps.includes('avatarSize')" class="control">
            <label for="skeleton-avatar">
              Avatar size <span>{{ state.avatarSize }}px</span>
            </label>
            <input
              id="skeleton-avatar"
              v-model.number="state.avatarSize"
              type="range"
              min="24"
              max="120"
              step="4"
              :disabled="!isReady"
            />
          </div>

          <div
            v-if="supportedProps.includes('mediaHeight')"
            class="control control--wide"
          >
            <label for="skeleton-media">Media height</label>
            <input
              id="skeleton-media"
              v-model="state.mediaHeight"
              type="text"
              class="control__text"
              placeholder="10rem"
              autocomplete="off"
              :disabled="!isReady"
            />
          </div>

          <div
            v-if="supportedProps.includes('animated')"
            class="control control--inline control--wide"
          >
            <input
              id="skeleton-animated"
              v-model="state.animated"
              type="checkbox"
              class="control__checkbox"
              :disabled="!isReady"
            />
            <label for="skeleton-animated">Shimmer animation</label>
          </div>

          <div
            v-if="supportedProps.includes('color')"
            class="control control--wide"
          >
            <label for="skeleton-color">Base colour</label>
            <div class="control__row">
              <input
                id="skeleton-color-picker"
                :value="baseColorPicker"
                type="color"
                class="control__color"
                aria-label="Base colour picker"
                aria-describedby="skeleton-color-hint"
                :disabled="!isReady"
                @input="onBaseColorPicker"
              />
              <input
                id="skeleton-color"
                :value="state.color"
                type="text"
                class="control__text"
                placeholder="rgba(148, 163, 184, 0.28)"
                autocomplete="off"
                aria-describedby="skeleton-color-hint"
                :disabled="!isReady"
                @input="onBaseColorText"
              />
            </div>
            <p id="skeleton-color-hint" class="control__hint">
              <template v-if="baseColorHasAlpha">
                The picker cannot show transparency, so the rgba value is kept.
              </template>
              <template v-else>
                The picker cannot show transparency. Type an rgba() value to keep
                it.
              </template>
            </p>
          </div>

          <div
            v-if="supportedProps.includes('highlightColor')"
            class="control control--wide"
          >
            <label for="skeleton-highlight">Highlight colour</label>
            <div class="control__row">
              <input
                id="skeleton-highlight-picker"
                :value="highlightColorPicker"
                type="color"
                class="control__color"
                aria-label="Highlight colour picker"
                aria-describedby="skeleton-highlight-hint"
                :disabled="!isReady"
                @input="onHighlightColorPicker"
              />
              <input
                id="skeleton-highlight"
                :value="state.highlightColor"
                type="text"
                class="control__text"
                placeholder="rgba(255, 255, 255, 0.55)"
                autocomplete="off"
                aria-describedby="skeleton-highlight-hint"
                :disabled="!isReady"
                @input="onHighlightColorText"
              />
            </div>
            <p id="skeleton-highlight-hint" class="control__hint">
              <template v-if="highlightColorHasAlpha">
                The picker cannot show transparency, so the rgba value is kept.
              </template>
              <template v-else>
                The picker cannot show transparency. Type an rgba() value to keep
                it.
              </template>
            </p>
          </div>

          <div
            v-if="supportedProps.includes('label')"
            class="control control--wide"
          >
            <label for="skeleton-label">Accessible label</label>
            <input
              id="skeleton-label"
              v-model="state.label"
              type="text"
              class="control__text"
              placeholder="Loading profile"
              autocomplete="off"
              :disabled="!isReady"
            />
          </div>

          <fieldset
            v-if="supportedProps.some((name) => name.startsWith('show'))"
            class="control control--group control--wide"
          >
            <legend>Blocks</legend>
            <div class="control--group-body">
              <ToggleControl
                v-if="supportedProps.includes('showMedia')"
                id="skeleton-show-media"
                v-model="state.showMedia"
                label="Media"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showAvatar')"
                id="skeleton-show-avatar"
                v-model="state.showAvatar"
                label="Avatar"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showHeader')"
                id="skeleton-show-header"
                v-model="state.showHeader"
                label="Header"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showChart')"
                id="skeleton-show-chart"
                v-model="state.showChart"
                label="Chart"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showStats')"
                id="skeleton-show-stats"
                v-model="state.showStats"
                label="Stats"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showSubmit')"
                id="skeleton-show-submit"
                v-model="state.showSubmit"
                label="Submit"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showRating')"
                id="skeleton-show-rating"
                v-model="state.showRating"
                label="Rating"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showPrice')"
                id="skeleton-show-price"
                v-model="state.showPrice"
                label="Price"
                :disabled="!isReady"
              />
              <ToggleControl
                v-if="supportedProps.includes('showCta')"
                id="skeleton-show-cta"
                v-model="state.showCta"
                label="Call to action"
                :disabled="!isReady"
              />
            </div>
          </fieldset>
        </div>
      </div>

      <div class="playground__code">
        <h2 class="playground__section-title">Implementation</h2>
        <CodeTabs :tabs="tabs" label="Implementation examples" />
      </div>
    </div>

    <div class="playground__props">
      <h2 class="playground__section-title">Props</h2>
      <PropTable :props="propDocs" :caption="`${entry.name} props`" />
    </div>
  </section>
</template>

<style scoped>
.playground {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
}

/* One cohesive workspace: the preview and the controls sit side by side and
   the implementation is integrated underneath them. */
.playground__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.9fr);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.playground__stage {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.75rem;
  min-width: 0;
  padding: 1.25rem;
}

.playground__preview {
  display: grid;
  align-content: center;
  min-height: 12.5rem;
  padding: 1.5rem 1.25rem;
  border-radius: var(--radius);
  background: var(--surface-muted);
  color: var(--text);
}

.playground__preview :deep(.v-pattern-skeleton) {
  max-width: none;
}

.playground__note {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.6;
}

.playground__template {
  overflow-x: auto;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.playground__controls {
  display: grid;
  align-content: start;
  gap: 0.85rem;
  min-width: 0;
  padding: 1.25rem;
  border-left: 1px solid var(--border);
  background: var(--surface-muted);
}

.playground__controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1.1rem;
}

.control--wide {
  grid-column: 1 / -1;
}

.playground__code {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.75rem;
  min-width: 0;
  padding: 1.25rem;
  border-top: 1px solid var(--border);
}

.playground__props {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}

.playground__controls-title,
.playground__section-title {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.control {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.control label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
}

.control label span {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
}

.control input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

.control--inline {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.control--inline label {
  font-weight: 500;
  text-transform: capitalize;
}

.control--group {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.control--group-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.5rem;
}

.control--group legend {
  padding-inline: 0.35rem;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
}

.control__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent);
}

.control__row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.control__row .control__text {
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
}

.control__color {
  flex: none;
  width: 2.75rem;
  height: 1.9rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: transparent;
}

.control__text {
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  font-size: 0.85rem;
}

.control__text:focus-visible {
  border-color: var(--accent);
}

.control__hint {
  color: var(--text-muted);
  font-size: 0.72rem;
  line-height: 1.45;
}

.control input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 62rem) {
  .playground__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .playground__controls {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}

@media (max-width: 30rem) {
  .playground__controls-grid {
    grid-template-columns: 1fr;
  }

  .control--wide {
    grid-column: auto;
  }
}
</style>
