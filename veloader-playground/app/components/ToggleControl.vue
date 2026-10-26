<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label
    class="toggle"
    :class="{ 'toggle--disabled': disabled }"
    :for="id"
  >
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="toggle__input"
      :disabled="disabled"
    />
    <span class="toggle__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
}

.toggle--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.toggle__input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent);
}

.toggle__label {
  text-transform: capitalize;
}
</style>
