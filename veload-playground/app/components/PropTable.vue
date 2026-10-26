<script setup lang="ts">
import { computed } from "vue";
import type { PropDoc } from "~/data/prop-docs";

const props = withDefaults(
  defineProps<{
    props: PropDoc[];
    caption?: string;
  }>(),
  {
    caption: "Props",
  },
);

const rows = computed(() => props.props);
</script>

<template>
  <div class="prop-table__wrapper">
    <table class="prop-table">
      <caption class="visually-hidden">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Prop</th>
          <th scope="col">Type</th>
          <th scope="col">Default</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prop in rows" :key="prop.name">
          <th scope="row"><code>{{ prop.name }}</code></th>
          <td><code class="prop-table__type">{{ prop.type }}</code></td>
          <td><code class="prop-table__default">{{ prop.default }}</code></td>
          <td class="prop-table__description">{{ prop.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.prop-table__wrapper {
  min-width: 0;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.prop-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  text-align: left;
}

.prop-table th,
.prop-table td {
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.prop-table thead th {
  background: var(--surface-muted);
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.prop-table tbody tr:last-child th,
.prop-table tbody tr:last-child td {
  border-bottom: 0;
}

.prop-table tbody th {
  font-weight: 600;
  white-space: nowrap;
}

.prop-table code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.prop-table__type {
  color: var(--accent-strong);
}

.prop-table__default {
  color: var(--text-muted);
}

.prop-table__description {
  min-width: 16rem;
  color: var(--text-muted);
}
</style>
