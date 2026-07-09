<template>
  <div style="display: flex; gap: 8px; align-items: center;">
    <button
      v-for="(theme, key) in themes"
      :key="key"
      class="theme-btn"
      :class="{ active: currentTheme === key }"
      @click="$emit('select', key)"
      :title="theme.name"
    >
      {{ theme.icon }}
      <span class="theme-tooltip">{{ theme.name }}</span>
    </button>
  </div>
</template>

<script setup>
import { themes } from '../styles/themes.js'

defineProps({
  currentTheme: { type: String, default: 'neon' }
})

defineEmits(['select'])
</script>
