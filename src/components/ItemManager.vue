<template>
  <div class="panel-card">
    <div class="panel-title">
      <span>奖项管理</span>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="!hasItems"
        @click="$emit('clear-all')"
      >
        清空
      </button>
    </div>

    <div class="input-group" style="flex-direction: column;">
      <textarea
        v-model="newItemText"
        class="input textarea-input"
        placeholder="每行输入一个奖项&#10;支持批量粘贴"
        rows="3"
        @keydown="handleKeydown"
      ></textarea>
      <button
        class="btn btn-primary btn-sm"
        :disabled="!newItemText.trim()"
        @click="addItems"
        style="align-self: flex-end;"
      >
        添加
      </button>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      暂无奖项，请添加
    </div>
    <div v-else class="item-list">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="item-row"
      >
        <span
          class="item-color"
          :style="{ backgroundColor: getColor(index) }"
        ></span>
        <span class="item-text">{{ item.text }}</span>
        <button
          class="item-delete"
          title="删除"
          @click="$emit('remove-item', item.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-item', 'remove-item', 'clear-all'])

const newItemText = ref('')

const hasItems = computed(() => props.items.length > 0)

const segmentColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
  '#F1948A', '#85929E', '#73C6B6', '#E59866',
  '#A3E4D7', '#AED6F1', '#FAD7A0', '#D5F5E3'
]

function getColor(index) {
  return segmentColors[index % segmentColors.length]
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addItems()
  }
}

function addItems() {
  const raw = newItemText.value
  if (!raw.trim()) return
  const lines = raw.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
  if (lines.length === 0) return
  emit('add-item', lines)
  newItemText.value = ''
}
</script>

<style scoped>
.textarea-input {
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
  font-family: var(--font-body);
}
</style>
