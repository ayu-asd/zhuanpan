<template>
  <div class="panel-card">
    <div class="panel-title">
      <span>转盘管理</span>
      <button class="btn btn-primary btn-sm" @click="saveCurrent">
        保存
      </button>
    </div>

    <div v-if="wheels.length === 0" class="empty-state">
      暂无保存的转盘
    </div>
    <div v-else class="wheel-list">
      <div
        v-for="wheel in wheels"
        :key="wheel.id"
        class="wheel-list-item"
        :class="{ active: wheel.id === currentWheelId }"
        @click="loadWheel(wheel.id)"
      >
        <span class="wheel-list-name">{{ wheel.name }}</span>
        <span class="wheel-list-count">{{ wheel.items.length }}项</span>
        <div class="wheel-list-actions">
          <button
            class="icon-btn"
            title="重命名"
            @click.stop="startRename(wheel)"
          >
            ✎
          </button>
          <button
            class="icon-btn"
            title="复制"
            @click.stop="$emit('duplicate', wheel.id)"
          >
            ⧉
          </button>
          <button
            class="icon-btn danger"
            title="删除"
            @click.stop="$emit('delete', wheel.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div v-if="renamingWheel" class="input-group" style="margin-top: 8px;">
      <input
        ref="renameInputRef"
        v-model="renameText"
        class="input"
        placeholder="输入新名称"
        @keyup.enter="confirmRename"
        @keyup.escape="cancelRename"
      />
      <button class="btn btn-primary btn-sm" @click="confirmRename">确定</button>
      <button class="btn btn-ghost btn-sm" @click="cancelRename">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  wheels: { type: Array, default: () => [] },
  currentWheelId: { type: String, default: null }
})

const emit = defineEmits([
  'save',
  'load',
  'rename',
  'duplicate',
  'delete'
])

const renamingWheel = ref(null)
const renameText = ref('')
const renameInputRef = ref(null)

function saveCurrent() {
  const wheel = props.wheels.find(w => w.id === props.currentWheelId)
  const defaultName = `转盘 ${props.wheels.length + 1}`
  emit('save', wheel?.name || defaultName)
}

function startRename(wheel) {
  renamingWheel.value = wheel.id
  renameText.value = wheel.name
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

function confirmRename() {
  const text = renameText.value.trim()
  if (text && renamingWheel.value) {
    emit('rename', renamingWheel.value, text)
  }
  renamingWheel.value = null
}

function cancelRename() {
  renamingWheel.value = null
}

function loadWheel(id) {
  if (id !== props.currentWheelId) {
    emit('load', id)
  }
}
</script>
