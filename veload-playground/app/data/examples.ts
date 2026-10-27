import type { CodeTab } from "~/types/code";



export const skeletonPrimitiveTabs: CodeTab[] = [
  {
    id: "vue",
    label: "Vue",
    language: "vue",
    code: `<script setup lang="ts">
import { VSkeleton } from "veload";
import "veload/style.css";
</script>

<template>
  <!-- A single line of text -->
  <VSkeleton />

  <!-- A card sized rectangle -->
  <VSkeleton variant="rect" width="100%" height="12rem" />

  <!-- An avatar -->
  <VSkeleton variant="circle" :width="48" label="Loading avatar" />
</template>`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "ts",
    code: `import { VSkeleton, type VSkeletonProps } from "veload";

const props: VSkeletonProps = {
  variant: "rect",
  width: "100%",
  height: "12rem",
};`,
  },
];

export const skeletonPatternTabs: CodeTab[] = [
  {
    id: "vue",
    label: "Vue",
    language: "vue",
    code: `<script setup lang="ts">
import { VPatternSkeleton } from "veload";
import "veload/style.css";
</script>

<template>
  <VPatternSkeleton pattern="article" :rows="4" label="Loading article" />
</template>`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "ts",
    code: `import { VPatternSkeleton, type VPatternSkeletonProps } from "veload";

const props: VPatternSkeletonProps = {
  pattern: "article",
  rows: 4,
  label: "Loading article",
};`,
  },
];

export const skeletonSwitchTabs: CodeTab[] = [
  {
    id: "vue",
    label: "Vue",
    language: "vue",
    code: `<script setup lang="ts">
import { ref } from "vue";
import { VSkeletonSwitch } from "veload";
import "veload/style.css";

const loading = ref(true);
</script>

<template>
  <VSkeletonSwitch :loading="loading" pattern="profile" label="Loading profile">
    <p>Profile content</p>
  </VSkeletonSwitch>
</template>`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "ts",
    code: `import { VSkeletonSwitch, type VSkeletonSwitchProps } from "veload";

const props: VSkeletonSwitchProps = {
  loading: true,
  pattern: "profile",
};`,
  },
];

export const installationCommands: CodeTab[] = [
  { id: "npm", label: "npm", language: "bash", code: "npm install veload" },
  { id: "pnpm", label: "pnpm", language: "bash", code: "pnpm add veload" },
  { id: "yarn", label: "Yarn", language: "bash", code: "yarn add veload" },
];

export const nuxtStylesheet = `// nuxt.config.ts
export default defineNuxtConfig({
  css: ["veload/style.css"],
});`;

export const viteStylesheet = `// main.ts
import { createApp } from "vue";
import "veload/style.css";
import App from "./App.vue";

createApp(App).mount("#app");`;

export const globalRegistration = `// main.ts (optional, instead of importing in each component)
import { createApp } from "vue";
import { VSpinner } from "veload";
import "veload/style.css";
import App from "./App.vue";

const app = createApp(App);
app.component("VSpinner", VSpinner);
app.mount("#app");`;

export const namedImports = `import {
  VLoading,
  VLoadingButton,
  VLoader,
  VProgress,
  VSkeleton,
  VSkeletonSwitch,
  VSpinner,
  useDelayedLoading,
  useLoading,
  useLoadingGroup,
} from "veload";`;

export const firstUse = `<script setup lang="ts">
import { ref } from "vue";
import { VLoading, useLoading } from "veload";
import "veload/style.css";

const { isLoading, execute } = useLoading();
const message = ref<string | null>(null);

async function load() {
  try {
    message.value = await execute(async () => {
      const response = await fetch("/api/message");
      if (!response.ok) throw new Error("Request failed");
      return (await response.json()) as string;
    });
  } catch (error) {
    message.value = error instanceof Error ? error.message : "Unknown error";
  }
}
</script>

<template>
  <VLoading :loading="isLoading" label="Loading message">
    <button type="button" @click="load">Reload</button>
    <p v-if="message">{{ message }}</p>
  </VLoading>
</template>`;

export const exportedTypes = `import type {
  LoaderVariant,
  NamedLoaderProps,
  VLoadingProps,
  VProgressProps,
  VSkeletonProps,
  VSpinnerProps,
  UseLoadingReturn,
} from "veload";`;

export const nuxtSsrUse = `<script setup lang="ts">
import { VLoading } from "veload";

const { data: message, status, error, refresh } =
  await useFetch<string>("/api/message");
</script>

<template>
  <VLoading :loading="status === 'pending'" label="Loading message">
    <button type="button" @click="refresh()">Reload</button>
    <p v-if="error">Could not load the message.</p>
    <p v-else-if="message">{{ message }}</p>
  </VLoading>
</template>`;

export const loaderTypes = `import {
  VLoader,
  type LoaderVariant,
  type NamedLoaderProps,
  type VProgressRingLoaderProps,
} from "veload";`;

export const decorativeExample = `<!-- Announced once, as a polite status -->
<VLoader label="Loading projects" />

<!-- Silent, because a parent region already announces the state -->
<VLoader decorative />

<!-- Silent, because the label is empty -->
<VLoader label="" />`;

export const skeletonLabelExample = `<!-- Decorative by default -->
<VArticleSkeleton />

<!-- Announced as a busy status region -->
<VArticleSkeleton label="Loading article" />`;

export const progressExample = `<!-- Determinate: the value is exposed to assistive technology -->
<VProgress :value="42" label="Uploading files" value-text="42 of 84 files" />

<!-- Indeterminate: no percentage is claimed -->
<VProgress label="Preparing download" />`;

export const loadingButtonExample = `<VLoadingButton :loading="isLoading" @click="save">
  Save changes
</VLoadingButton>`;

export const reducedMotionExample = `/* The library honours the operating system preference.
   You can align your own animations with the same query. */
@media (prefers-reduced-motion: reduce) {
  .my-fade {
    animation: none;
    transition: none;
  }
}`;
