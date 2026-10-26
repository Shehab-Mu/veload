<script setup lang="ts">
import { computed } from "vue";
import { useCopyCode } from "~/composables/useCopyCode";
import {
  escapeHtml,
  highlightBash,
  highlightTs,
  highlightVue,
} from "~/utils/highlight";

const props = withDefaults(
  defineProps<{
    code: string;
    language?: "vue" | "ts" | "bash" | "text";
    label?: string;
  }>(),
  {
    language: "ts",
    label: "",
  },
);

const { state, message, copy } = useCopyCode();

const highlighted = computed(() => {
  if (props.language === "vue") {
    return highlightVue(props.code);
  }

  if (props.language === "ts") {
    return highlightTs(props.code);
  }

  if (props.language === "bash") {
    return highlightBash(props.code);
  }

  return escapeHtml(props.code);
});

const buttonLabel = computed(() => {
  if (state.value === "copied") {
    return "Copied";
  }

  if (state.value === "error") {
    return "Try again";
  }

  return "Copy code";
});
</script>

<template>
  <figure class="code-block">
    <figcaption v-if="label" class="code-block__label">
      {{ label }}
    </figcaption>

    <div class="code-block__toolbar">
      <span class="code-block__language">{{ language }}</span>
      <button
        type="button"
        class="copy-button"
        :class="`copy-button--${state}`"
        :disabled="state === 'copied'"
        @click="copy(code)"
      >
        {{ buttonLabel }}
      </button>
    </div>

    <pre class="code-block__pre"><code v-html="highlighted" /></pre>

    <p class="code-block__status" role="status" aria-live="polite">
      {{ message }}
    </p>
  </figure>
</template>

<style scoped>
.code-block {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--code-bg);
}

.code-block__label {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--code-punctuation);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.code-block__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0.75rem 0.55rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.code-block__language {
  color: var(--code-punctuation);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.code-block__pre {
  margin: 0;
  min-width: 0;
  padding: 1rem 1.1rem 1.15rem;
  overflow-x: auto;
  color: var(--code-text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  tab-size: 2;
}

.code-block__pre code {
  font: inherit;
  white-space: pre;
}

.code-block__status {
  min-height: 0;
  padding: 0 1rem;
  color: var(--code-punctuation);
  font-size: 0.76rem;
}

.code-block__status:not(:empty) {
  padding-bottom: 0.7rem;
}

.copy-button {
  padding: 0.32rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--code-text);
  font-size: 0.74rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.copy-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.1);
}

.copy-button--copied {
  border-color: rgba(110, 231, 183, 0.5);
  color: var(--success);
}

.copy-button--error {
  border-color: rgba(253, 162, 155, 0.5);
  color: var(--danger);
}

.copy-button:disabled {
  cursor: default;
  opacity: 0.75;
}
</style>
