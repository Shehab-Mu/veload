<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    lead?: string;
  }>(),
  {
    eyebrow: "",
    lead: "",
  },
);
</script>

<template>
  <header class="page-intro">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h1 class="page-intro__title">{{ title }}</h1>
    <p v-if="lead" class="page-intro__lead">{{ lead }}</p>
    <slot />
  </header>
</template>

<style scoped>
.page-intro {
  max-width: 46rem;
  padding: 40px 0;
}

.page-intro__title {
  margin-top: 0.9rem;
  font-size: clamp(2.1rem, 4.6vw, 3.3rem);
  font-weight: 780;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.page-intro__lead {
  margin-top: 1.1rem;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}
</style>
