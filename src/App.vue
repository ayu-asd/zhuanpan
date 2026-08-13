<template>
  <div class="app-container">
    <header class="app-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <h1 class="app-title">转 盘</h1>
        <a
          href="https://github.com/ayu-asd/zhuanpan"
          target="_blank"
          class="github-link"
          title="GitHub 源码"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-ghost btn-sm"
          @click="createNewWheel"
        >
          + 新建
        </button>
        <UserMenu
          :user="auth.user.value"
          @login="auth.login"
          @logout="handleLogout"
        />
        <ThemeSwitch
          :current-theme="wheelStore.currentTheme"
          @select="switchTheme"
        />
      </div>
    </header>

    <section class="wheel-section" style="min-height: 480px;">
      <div v-show="loaded" style="display: contents;">
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
      </div>
      <div v-show="!loaded" class="loading-placeholder" style="padding: 60px 0; text-align: center; color: var(--text-muted);">
        加载中...
      </div>
    </section>

    <aside class="side-panel">
      <ItemManager
        v-if="loaded && currentWheel"
        :items="currentWheel.items"
        @add-item="handleAddItems"
        @remove-item="handleRemoveItem"
        @clear-all="handleClearAll"
      />

      <WheelManager
        v-if="loaded"
        :wheels="wheelStore.wheels"
        :current-wheel-id="wheelStore.currentWheel?.id || null"
        @load="handleLoad"
        @rename="handleRename"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
      />

      <HistoryPanel
        v-if="loaded"
        :items="wheelStore.history"
        @clear="handleClearHistory"
      />
    </aside>

    <SpinResult
      :visible="showResult"
      :result="lastResult"
      @close="showResult = false"
      @remove-local="handleRemoveLocal"
      @remove-save="handleRemoveSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wheelStore, applyTheme } from './stores/wheelStore.js'
import { useAuth } from './composables/useAuth.js'
import { useCloud } from './composables/useCloud.js'
import WheelCanvas from './components/WheelCanvas.vue'
import ItemManager from './components/ItemManager.vue'
import SpinResult from './components/SpinResult.vue'
import WheelManager from './components/WheelManager.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import UserMenu from './components/UserMenu.vue'

const auth = useAuth()
const cloud = useCloud()

const wheelCanvasRef = ref(null)
const showResult = ref(false)
const lastResult = ref(null)
const loaded = ref(false)

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
  if (auth.user.value) {
    cloud.pushWheels(wheelStore.getData().wheels).catch(console.error)
  }
}

async function syncAllFromCloud() {
  if (!auth.user.value) return
  
  const { wheels: cloudWheels, history: cloudHistory } = await cloud.syncAll()
  
  // 使用云端数据（不覆盖本地）
  wheelStore.setWheels(cloudWheels)
  wheelStore.setHistory(cloudHistory)
}

function handleLogout() {
  auth.logout()
  wheelStore.loadFromStorage()
  applyTheme(wheelStore.currentTheme)
}

async function handleAddItems(textLines) {
  wheelStore.addItems(textLines)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleRemoveItem(itemId) {
  wheelStore.removeItem(itemId)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleClearAll() {
  wheelStore.clearAllItems()
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleLoad(id) {
  wheelStore.loadWheel(id)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleRename(id, name) {
  wheelStore.renameWheel(id, name)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleDuplicate(id) {
  wheelStore.duplicateWheel(id)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleDelete(id) {
  const wheel = wheelStore.currentWheel
  if (wheel && wheel.id === id) {
    lastResult.value = null
    showResult.value = false
  }
  wheelStore.deleteWheel(id)
  if (auth.user.value) {
    await cloud.pushWheels(wheelStore.getData().wheels)
  }
}

async function handleClearHistory() {
  wheelStore.clearHistory()
  if (auth.user.value) {
    await cloud.pushHistory([])
  }
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
        const newEntry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          wheelId: wheel.id,
          wheelName: wheel.name,
          itemText: result.text,
          timestamp: new Date().toISOString()
        }
        
        if (auth.user.value) {
          // 已登录：写云端
          const newHistory = [newEntry, ...wheelStore.history]
          await cloud.pushHistory(newHistory)
          wheelStore.setHistory(newHistory)
        } else {
          // 未登录：只更新本地
          wheelStore.addHistory(newEntry)
        }
      }
    }
  } finally {
    isSpinning = false
  }
}

async function handleRemoveLocal(itemId) {
  if (!itemId) return
  wheelStore.removeItemTemp(itemId)
}

async function handleRemoveSave(itemId) {
  if (!itemId) return
  wheelStore.removeItemAndSave(itemId)
  if (auth.user.value) {
    try {
      await cloud.pushWheels(wheelStore.getData().wheels)
    } catch (e) {
      console.error('同步失败:', e)
    }
  }
}

onMounted(async () => {
  auth.checkLoginFromUrl()
  await auth.loadUser()
  if (auth.user.value) {
    await syncAllFromCloud()
  } else {
    wheelStore.loadFromStorage()
  }
  loaded.value = true
})
</script>
