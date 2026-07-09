const STORAGE_KEY = 'zhuanpan-data'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const defaultData = {
  currentWheelId: null,
  wheels: [],
  theme: 'clean',
  history: []
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { ...defaultData, ...data }
    }
  } catch (e) {
    console.warn('Failed to load data:', e)
  }
  return { ...defaultData }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save data:', e)
  }
}

export function useStorage() {
  function getData() {
    return load()
  }

  function persistData(data) {
    save(data)
  }

  function getWheels() {
    return load().wheels
  }

  function getWheel(id) {
    return load().wheels.find(w => w.id === id) || null
  }

  function createWheel(name, items = []) {
    const data = load()
    const newWheel = {
      id: generateId(),
      name,
      items: items.map(item => ({
        id: generateId(),
        text: item.text || item
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.wheels.push(newWheel)
    data.currentWheelId = newWheel.id
    save(data)
    return newWheel
  }

  function updateWheel(id, updates) {
    const data = load()
    const idx = data.wheels.findIndex(w => w.id === id)
    if (idx === -1) return null
    data.wheels[idx] = { ...data.wheels[idx], ...updates, updatedAt: new Date().toISOString() }
    save(data)
    return data.wheels[idx]
  }

  function deleteWheel(id) {
    const data = load()
    data.wheels = data.wheels.filter(w => w.id !== id)
    if (data.currentWheelId === id) {
      data.currentWheelId = data.wheels.length > 0 ? data.wheels[0].id : null
    }
    save(data)
  }

  function setCurrentWheel(id) {
    const data = load()
    data.currentWheelId = id
    save(data)
  }

  function getTheme() {
    return load().theme || 'neon'
  }

  function setTheme(theme) {
    const data = load()
    data.theme = theme
    save(data)
  }

  function addHistory(entry) {
    const data = load()
    data.history.unshift({
      id: generateId(),
      ...entry,
      timestamp: new Date().toISOString()
    })
    if (data.history.length > 100) {
      data.history = data.history.slice(0, 100)
    }
    save(data)
  }

  function getHistory(limit = 50) {
    return load().history.slice(0, limit)
  }

  function clearHistory() {
    const data = load()
    data.history = []
    save(data)
  }

  return {
    getData,
    persistData,
    getWheels,
    getWheel,
    createWheel,
    updateWheel,
    deleteWheel,
    setCurrentWheel,
    getTheme,
    setTheme,
    addHistory,
    getHistory,
    clearHistory
  }
}
