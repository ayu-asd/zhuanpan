import { reactive } from 'vue'
import { useStorage } from '../composables/useStorage.js'
import { themes } from '../styles/themes.js'

const storage = useStorage()

const data = reactive(storage.getData())

function findCurrentWheel() {
  return data.wheels.find(w => w.id === data.currentWheelId) || null
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
    return themes[data.theme] || themes.neon
  },

  setTheme(theme) {
    if (themes[theme]) {
      data.theme = theme
      storage.setTheme(theme)
      applyTheme(theme)
    }
  },

  loadWheel(id) {
    data.currentWheelId = id
    storage.setCurrentWheel(id)
  },

  createWheel(name, items = []) {
    const wheel = storage.createWheel(name, items)
    data.wheels = storage.getWheels()
    data.currentWheelId = wheel.id
  },

  saveCurrentWheel(name) {
    const current = findCurrentWheel()
    if (!current) {
      const wheel = storage.createWheel(name, [])
      data.wheels = storage.getWheels()
      data.currentWheelId = wheel.id
      return wheel
    }
    storage.updateWheel(current.id, { name })
    data.wheels = storage.getWheels()
  },

  addItems(textLines) {
    const current = findCurrentWheel()
    if (!current || !textLines || textLines.length === 0) return
    const newItems = textLines.map(text => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text
    }))
    current.items.push(...newItems)
    storage.updateWheel(current.id, { items: [...current.items] })
    data.wheels = storage.getWheels()
  },

  removeItem(itemId) {
    const current = findCurrentWheel()
    if (!current) return
    current.items = current.items.filter(i => i.id !== itemId)
    storage.updateWheel(current.id, { items: [...current.items] })
    data.wheels = storage.getWheels()
  },

  removeItemTemp(itemId) {
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
    storage.updateWheel(id, { name })
    data.wheels = storage.getWheels()
  },

  duplicateWheel(id) {
    const original = storage.getWheel(id)
    if (!original) return
    const wheel = storage.createWheel(
      original.name + ' (副本)',
      original.items.map(i => ({ text: i.text }))
    )
    data.wheels = storage.getWheels()
    data.currentWheelId = wheel.id
  },

  deleteWheel(id) {
    storage.deleteWheel(id)
    data.wheels = storage.getWheels()
    if (data.currentWheelId === id) {
      data.currentWheelId = data.wheels.length > 0 ? data.wheels[0].id : null
    }
  },

  clearAllItems() {
    const current = findCurrentWheel()
    if (!current) return
    current.items = []
    storage.updateWheel(current.id, { items: [] })
    data.wheels = storage.getWheels()
  },

  addHistory(entry) {
    storage.addHistory(entry)
    const h = data.history
    h.unshift({
      id: entry.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      ...entry,
      timestamp: new Date().toISOString()
    })
    if (h.length > 100) h.length = 100
  },

  clearHistory() {
    storage.clearHistory()
    data.history = []
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

applyTheme(data.theme)
