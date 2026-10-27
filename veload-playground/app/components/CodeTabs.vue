<script setup lang="ts">
import { ref, watch, useId } from "vue";
import CodeBlock from "./CodeBlock.vue";
import type { CodeTab } from "~/types/code";

const props = withDefaults(
  defineProps<{
    tabs: CodeTab[];
    label?: string;
  }>(),
  {
    label: "Usage",
  },
);

const activeId = ref(props.tabs[0]?.id ?? "");


const instanceId = useId();

function tabId(id: string): string {
  return `tab-${instanceId}-${id}`;
}

function panelId(id: string): string {
  return `panel-${instanceId}-${id}`;
}

watch(
  () => props.tabs,
  (tabs) => {
    if (!tabs.some((tab) => tab.id === activeId.value)) {
      activeId.value = tabs[0]?.id ?? "";
    }
  },
);

function select(id: string): void {
  activeId.value = id;
}

function moveFocus(index: number): void {
  const total = props.tabs.length;

  if (total === 0) {
    return;
  }

  const next = (index + total) % total;
  const tab = props.tabs[next];

  if (!tab) {
    return;
  }

  activeId.value = tab.id;

  const element = document.getElementById(tabId(tab.id));
  element?.focus();
}
</script>

<template>
  <div class="code-tabs">
    <div class="code-tabs__list" role="tablist" :aria-label="label">
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(tab.id)"
        :key="tab.id"
        type="button"
        role="tab"
        class="code-tabs__tab"
        :class="{ 'code-tabs__tab--active': tab.id === activeId }"
        :aria-selected="tab.id === activeId"
        :aria-controls="panelId(tab.id)"
        :tabindex="tab.id === activeId ? 0 : -1"
        @click="select(tab.id)"
        @keydown.left.prevent="moveFocus(index - 1)"
        @keydown.right.prevent="moveFocus(index + 1)"
        @keydown.home.prevent="moveFocus(0)"
        @keydown.end.prevent="moveFocus(tabs.length - 1)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      v-for="tab in tabs"
      v-show="tab.id === activeId"
      :id="panelId(tab.id)"
      :key="`panel-${tab.id}`"
      role="tabpanel"
      class="code-tabs__panel"
      :aria-labelledby="tabId(tab.id)"
      tabindex="0"
    >
      <CodeBlock :code="tab.code" :language="tab.language ?? 'ts'" />
    </div>
  </div>
</template>

<style scoped>
.code-tabs {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
  min-width: 0;
}

.code-tabs__panel {
  min-width: 0;
}

.code-tabs__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.code-tabs__tab {
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.code-tabs__tab:hover {
  border-color: var(--accent-border);
  color: var(--accent-strong);
}

.code-tabs__tab--active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.code-tabs__panel:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius);
}
</style>
