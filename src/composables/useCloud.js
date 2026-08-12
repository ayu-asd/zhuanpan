import { useAuth } from './useAuth.js'

let syncLock = false

function mergeByKey(local, cloud, key) {
  const map = new Map()
  cloud.forEach(item => map.set(item[key], item))
  local.forEach(item => {
    const existing = map.get(item[key])
    if (!existing) {
      map.set(item[key], item)
    } else {
      const a = new Date(existing.updated_at || 0)
      const b = new Date(item.updated_at || 0)
      if (b > a) map.set(item[key], item)
    }
  })
  return [...map.values()]
}

export function useCloud() {
  const auth = useAuth()

  async function pushWheels(wheels) {
    if (!auth.user.value || syncLock) return
    syncLock = true
    try {
      await auth.api('/api/wheels', {
        method: 'POST',
        body: JSON.stringify(wheels),
      })
    } finally {
      syncLock = false
    }
  }

  async function pushHistory(entries) {
    if (!auth.user.value || syncLock) return
    syncLock = true
    try {
      await auth.api('/api/history', {
        method: 'POST',
        body: JSON.stringify(entries),
      })
    } finally {
      syncLock = false
    }
  }

  async function syncWheels(localWheels) {
    if (!auth.user.value) return localWheels
    try {
      const resp = await auth.api('/api/wheels')
      const cloud = resp.ok ? await resp.json() : []
      const merged = mergeByKey(localWheels, cloud, 'id')
      if (merged.length !== localWheels.length || JSON.stringify(merged) !== JSON.stringify(localWheels)) {
        await pushWheels(merged)
      }
      return merged
    } catch {
      return localWheels
    }
  }

  async function syncHistory(localHistory) {
    if (!auth.user.value) return localHistory
    try {
      const resp = await auth.api('/api/history')
      const cloud = resp.ok ? await resp.json() : []
      const merged = mergeByKey(localHistory, cloud, 'id')
      if (merged.length !== localHistory.length || JSON.stringify(merged) !== JSON.stringify(localHistory)) {
        await pushHistory(merged)
      }
      return merged
    } catch {
      return localHistory
    }
  }

  return {
    syncWheels,
    syncHistory,
    pushWheels,
    pushHistory,
  }
}