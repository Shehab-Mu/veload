<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { LoaderMeta } from "~/data/catalog";
import { getLoaderComponent } from "~/data/catalog";
import { buildLoaderPropDocs } from "~/data/prop-docs";
import {
  installSnippet,
  loaderComposition,
  loaderSfc,
  loaderTemplate,
  loaderTypes,
  stylesheetSnippet,
} from "~/utils/code";
import type { LoaderControlState } from "~/utils/code";
import { loaderDefaults } from "~/utils/defaults";
import type { CodeTab } from "~/types/code";
import CodeTabs from "./CodeTabs.vue";
import PropTable from "./PropTable.vue";

const props = defineProps<{
  entry: LoaderMeta;
}>();

const component = computed(() => getLoaderComponent(props.entry.name));
const defaults = computed(() => loaderDefaults(props.entry.defaultMarks));

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

const state = reactive<LoaderControlState>({
  size: 48,
  color: "#6d3ff2",
  duration: 1200,
  label: "Loading content",
  count: props.entry.defaultMarks,
  value: null,
  decorative: false,
});

const isDeterminate = computed({
  get: () => state.value !== null,
  set: (next: boolean) => {
    state.value = next ? 40 : null;
  },
});

const previewProps = computed(() => ({
  size: state.size,
  color: state.color,
  duration: state.duration,
  count: state.count,
  label: state.label,
  decorative: state.decorative,
  value: state.value,
}));

const tabs = computed<CodeTab[]>(() => [
  {
    id: "vue",
    label: "Vue",
    language: "vue",
    code: loaderSfc(props.entry, state, defaults.value),
  },
  {
    id: "composition",
    label: "Composition API",
    language: "vue",
    code: loaderComposition(props.entry, state, defaults.value),
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "ts",
    code: loaderTypes(props.entry, state),
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
  buildLoaderPropDocs({
    defaultMarks: props.entry.defaultMarks,
    supportsValue: props.entry.supportsValue,
    repeatCount: props.entry.repeatCount,
  }),
);

const templateSnippet = computed(() =>
  loaderTemplate(props.entry, state, defaults.value),
);

/**
 * The label of the package is an accessible name: `VLoader` renders it as the
 * `aria-label` of its `role="status"` element and never as visible text. The
 * playground mirrors it below the animation so the described state can be
 * read. The mirror is hidden from assistive technology because the status
 * region already announces the same name.
 */
const visibleLabel = computed(() => state.label.trim());
</script>

<template>
  <section class="playground" aria-label="Interactive preview">
    <div class="playground__workspace">
      <div class="playground__stage">
        <div class="playground__preview" :style="{ color: state.color }" role="region" aria-label="Loader preview" tabindex="0">
          <component :is="component" v-bind="previewProps" />
          <p v-if="visibleLabel" class="playground__label" aria-hidden="true">
            {{ visibleLabel }}
          </p>
        </div>

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
          <div class="control">
            <label for="loader-size">
              Size <span>{{ state.size }}px</span>
            </label>
            <input
              id="loader-size"
              v-model.number="state.size"
              type="range"
              min="16"
              max="120"
              step="1"
              :disabled="!isReady"
            />
          </div>

          <div class="control">
            <label for="loader-duration">
              Duration <span>{{ state.duration }}ms</span>
            </label>
            <input
              id="loader-duration"
              v-model.number="state.duration"
              type="range"
              min="200"
              max="3000"
              step="50"
              :disabled="!isReady"
            />
          </div>

          <div v-if="entry.repeatCount" class="control">
            <label for="loader-count">
              Marks <span>{{ state.count }}</span>
            </label>
            <input
              id="loader-count"
              v-model.number="state.count"
              type="range"
              min="1"
              max="12"
              step="1"
              :disabled="!isReady"
            />
          </div>

          <div class="control">
            <label for="loader-color">Colour</label>
            <div class="control__row">
              <input
                id="loader-color"
                v-model="state.color"
                type="color"
                class="control__color"
                :disabled="!isReady"
              />
              <span class="control__value">{{ state.color }}</span>
            </div>
          </div>

          <div class="control control--wide">
            <label for="loader-label">Accessible label</label>
            <input
              id="loader-label"
              v-model="state.label"
              type="text"
              class="control__text"
              autocomplete="off"
              aria-describedby="loader-label-hint"
              :disabled="!isReady"
            />
            <p id="loader-label-hint" class="control__hint">
              Sets the accessible name of the status region. The preview also
              shows the text so you can read the state you describe.
            </p>
          </div>

          <div
            v-if="entry.supportsValue"
            class="control control--inline control--wide"
          >
            <input
              id="loader-determinate"
              v-model="isDeterminate"
              type="checkbox"
              class="control__checkbox"
              :disabled="!isReady"
            />
            <label for="loader-determinate">Determinate value</label>
          </div>

          <div
            v-if="entry.supportsValue && state.value !== null"
            class="control control--wide"
          >
            <label for="loader-value">
              Value <span>{{ state.value }}%</span>
            </label>
            <input
              id="loader-value"
              v-model.number="state.value"
              type="range"
              min="0"
              max="100"
              step="1"
              :disabled="!isReady"
            />
          </div>

          <div class="control control--inline control--wide">
            <input
              id="loader-decorative"
              v-model="state.decorative"
              type="checkbox"
              class="control__checkbox"
              :disabled="!isReady"
            />
            <label for="loader-decorative">
              Decorative (hidden from screen readers)
            </label>
          </div>
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
  /* The loader and its visible label are centred as one group so the label
     always reads as belonging to the animation. */
  grid-template-rows: auto auto;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  overflow-x: auto;
  align-content: center;
  row-gap: 0.85rem;
  justify-items: safe center;
  min-height: 12.5rem;
  padding: 1.75rem 1.25rem;
  border-radius: var(--radius);
  background:
    radial-gradient(
      120% 120% at 50% 0%,
      color-mix(in srgb, currentColor 14%, transparent),
      transparent 70%
    ),
    var(--surface-muted);
}

.playground__label {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
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

.control__color {
  width: 2.75rem;
  height: 1.9rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: transparent;
}

.control__value {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.74rem;
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