import { reactive, computed } from 'vue'
import { useStorage } from '../composables/useStorage.js'
import { themes } from '../styles/themes.js'
import { useAuth } from '../composables/useAuth.js'

const storage = useStorage()
const auth = useAuth()
const data = reactive({
  currentWheelId: null,
  wheels: [],
  theme: 'clean',
  history: []
})

applyTheme(data.theme)

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function findCurrentWheel() {
  return data.wheels.find(w => w.id === data.currentWheelId) || null
}

function persist() {
  if (!auth.user.value) storage.persistData({ ...data })
}

export const wheelStore = {
  get currentWheel() {
    return findCurrentWheel()
  },

  get wheels() {
    return data.wheels
  },

  get currentTheme() {
    return data.theme
  },

  get history() {
    return data.history || []
  },

  get currentThemeConfig() {
    return themes[data.theme] || themes.clean
  },

  setTheme(theme) {
    if (themes[theme]) {
      data.theme = theme
      if (!auth.user.value) storage.setTheme(theme)
      applyTheme(theme)
    }
  },

  loadWheel(id) {
    data.currentWheelId = id
    persist()
  },

  createWheel(name, items = []) {
    const wheel = {
      id: id(),
      name,
      items: items.map(item => ({
        id: id(),
        text: item.text || item
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.wheels.push(wheel)
    data.currentWheelId = wheel.id
    persist()
  },

  addItems(textLines) {
    const current = findCurrentWheel()
    if (!current || !textLines || textLines.length === 0) return
    const newItems = textLines.map(text => ({
      id: id(),
      text
    }))
    current.items.push(...newItems)
    current.updatedAt = new Date().toISOString()
    persist()
  },

  removeItem(itemId) {
    const current = findCurrentWheel()
    if (!current) return
    current.items = current.items.filter(i => i.id !== itemId)
    current.updatedAt = new Date().toISOString()
    persist()
  },

  removeItemLocal(itemId) {
    const current = findCurrentWheel()
    if (!current) return false
    const idx = current.items.findIndex(i => i.id === itemId)
    if (idx === -1) return false
    current.items.splice(idx, 1)
    return true
  },

  removeItemAndSave(itemId) {
    this.removeItem(itemId)
  },

  renameWheel(id, name) {
    const wheel = data.wheels.find(w => w.id === id)
    if (!wheel) return
    wheel.name = name
    wheel.updatedAt = new Date().toISOString()
    persist()
  },

  duplicateWheel(wheelId) {
    const original = data.wheels.find(w => w.id === wheelId)
    if (!original) return
    const wheel = {
      id: id(),
      name: original.name + ' (副本)',
      items: original.items.map(i => ({ id: id(), text: i.text })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.wheels.push(wheel)
    data.currentWheelId = wheel.id
    persist()
  },

  deleteWheel(id) {
    data.wheels = data.wheels.filter(w => w.id !== id)
    if (data.currentWheelId === id) {
      data.currentWheelId = data.wheels.length > 0 ? data.wheels[0].id : null
    }
    persist()
  },

  clearAllItems() {
    const current = findCurrentWheel()
    if (!current) return
    current.items = []
    current.updatedAt = new Date().toISOString()
    persist()
  },

  addHistory(entry) {
    const h = data.history
    h.unshift({
      id: entry.id || id(),
      ...entry,
      timestamp: new Date().toISOString()
    })
    if (h.length > 100) h.length = 100
    persist()
  },

  clearHistory() {
    data.history = []
    persist()
  },

  setWheels(wheels) {
    const clean = wheels.map(w => ({
      ...w,
      items: (w.items || []).map(item => ({
        id: item.id || id(),
        text: item.text || ''
      }))
    }))
    data.wheels = clean
    const exists = clean.some(w => w.id === data.currentWheelId)
    if (!exists) {
      data.currentWheelId = clean.length > 0 ? clean[0].id : null
    }
  },

  setHistory(history) {
    const clean = history.map(h => ({
      id: h.id || id(),
      wheelId: h.wheelId || '',
      wheelName: h.wheelName || '',
      itemId: h.itemId || '',
      itemText: h.itemText || '',
      timestamp: h.timestamp || new Date().toISOString()
    }))
    data.history = clean.slice(0, 100)
  },

  getData() {
    return { wheels: [...data.wheels], history: [...(data.history || [])] }
  },

  loadFromStorage() {
    const local = storage.getData()
    data.wheels = local.wheels
    data.history = local.history
    data.currentWheelId = local.currentWheelId
    data.theme = local.theme
  }
}

export function applyTheme(themeName) {
  const theme = themes[themeName]
  if (!theme) return
  const root = document.documentElement
  Object.entries(theme.css).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
}
