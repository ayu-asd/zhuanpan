<template>
  <div class="panel-card" v-if="items.length > 0">
    <div class="panel-title">
      <span>开奖记录</span>
      <button class="btn btn-ghost btn-sm" @click="$emit('clear')">
        清空
      </button>
    </div>
    <div class="history-list">
      <div
        v-for="(entry, i) in items"
        :key="entry.id"
        class="history-item"
      >
        <span class="history-index">#{{ items.length - i }}</span>
        <span class="history-wheel">{{ entry.wheelName }}</span>
        <span class="history-result">{{ entry.itemText }}</span>
        <span class="history-time">{{ formatTime(entry.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})

defineEmits(['clear'])

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  font-size: 0.8rem;
  animation: slideIn 0.2s ease;
}

.history-index {
  color: var(--text-muted);
  font-size: 0.7rem;
  min-width: 24px;
}

.history-wheel {
  color: var(--text-muted);
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
  flex-shrink: 0;
}

.history-result {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  color: var(--text-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}
</style>
