<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">转 盘</h1>
      <div class="header-actions">
        <button
          v-if="currentWheel"
          class="btn btn-ghost btn-sm"
          @click="createNewWheel"
        >
          + 新建
        </button>
        <a
          href="https://github.com/ayu-asd/zhuanpan"
          target="_blank"
          class="github-link"
          title="GitHub 源码"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <ThemeSwitch
          :current-theme="wheelStore.currentTheme"
          @select="switchTheme"
        />
      </div>
    </header>

    <section class="wheel-section">
      <div v-if="!currentWheel" class="empty-state" style="padding: 60px 0;">
        <p style="margin-bottom: 16px; font-size: 1.1rem;">还没有转盘，创建一个吧</p>
        <button class="btn btn-primary btn-lg" @click="createNewWheel">
          + 创建转盘
        </button>
      </div>

      <template v-else>
        <div style="text-align: center; margin-bottom: -8px;">
          <div style="font-family: var(--font-display); font-size: 0.8rem; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase;">
            当前转盘
          </div>
          <div style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-top: 4px;">
            {{ currentWheel.name }}
          </div>
        </div>

        <WheelCanvas ref="wheelCanvasRef" />

        <div class="wheel-controls">
          <button
            class="btn btn-primary btn-spin"
            :disabled="!canSpin"
            @click="handleSpin"
          >
            开始
          </button>
        </div>
      </template>
    </section>

    <aside class="side-panel">
      <ItemManager
        v-if="currentWheel"
        :items="currentWheel.items"
        @add-item="handleAddItems"
        @remove-item="wheelStore.removeItem"
        @clear-all="wheelStore.clearAllItems"
      />

      <WheelManager
        :wheels="wheelStore.wheels"
        :current-wheel-id="wheelStore.currentWheel?.id || null"
        @save="handleSave"
        @load="wheelStore.loadWheel"
        @rename="wheelStore.renameWheel"
        @duplicate="wheelStore.duplicateWheel"
        @delete="handleDelete"
      />

      <HistoryPanel
        :items="wheelStore.history"
        @clear="wheelStore.clearHistory"
      />
    </aside>

    <SpinResult
      :visible="showResult"
      :result="lastResult"
      @close="showResult = false"
      @remove-temp="handleRemoveTemp"
      @remove-save="handleRemoveSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { wheelStore, applyTheme } from './stores/wheelStore.js'
import WheelCanvas from './components/WheelCanvas.vue'
import ItemManager from './components/ItemManager.vue'
import SpinResult from './components/SpinResult.vue'
import WheelManager from './components/WheelManager.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'
import HistoryPanel from './components/HistoryPanel.vue'

const wheelCanvasRef = ref(null)
const showResult = ref(false)
const lastResult = ref(null)

const currentWheel = computed(() => wheelStore.currentWheel)
const canSpin = computed(() => {
  const w = wheelStore.currentWheel
  return w && w.items.length >= 2
})

let isSpinning = false

function switchTheme(theme) {
  wheelStore.setTheme(theme)
  applyTheme(theme)
}

function createNewWheel() {
  const count = wheelStore.wheels.length + 1
  wheelStore.createWheel(`转盘 ${count}`, [])
}

function handleAddItems(textLines) {
  wheelStore.addItems(textLines)
}

async function handleSpin() {
  if (isSpinning) return
  const canvas = wheelCanvasRef.value
  if (!canvas) return

  isSpinning = true
  try {
    const result = await canvas.spin()
    if (result) {
      lastResult.value = result
      showResult.value = true
      const wheel = wheelStore.currentWheel
      if (wheel) {
        wheelStore.addHistory({
          wheelId: wheel.id,
          wheelName: wheel.name,
          itemId: result.id,
          itemText: result.text
        })
      }
    }
  } finally {
    isSpinning = false
  }
}

function handleRemoveTemp(itemId) {
  if (!itemId) return
  wheelStore.removeItemTemp(itemId)
}

function handleRemoveSave(itemId) {
  if (!itemId) return
  wheelStore.removeItemAndSave(itemId)
}

function handleSave(name) {
  const wheel = wheelStore.currentWheel
  if (wheel) {
    wheelStore.saveCurrentWheel(name || wheel.name)
  }
}

function handleDelete(id) {
  const wheel = wheelStore.currentWheel
  if (wheel && wheel.id === id) {
    lastResult.value = null
    showResult.value = false
  }
  wheelStore.deleteWheel(id)
}
</script>
