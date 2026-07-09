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
