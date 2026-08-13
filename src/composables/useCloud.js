import { useAuth } from './useAuth.js'

export function useCloud() {
  const auth = useAuth()

  async function api(path, options = {}) {
    const token = auth.getToken()
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    const resp = await fetch(path, { ...options, headers })
    if (resp.status === 401) {
      auth.user.value = null
      auth.clearToken()
    }
    return resp
  }

  async function pushWheels(wheels) {
    if (!auth.user.value) return
    try {
      await api('/api/wheels', { method: 'POST', body: JSON.stringify(wheels) })
    } catch (e) {
      console.error('同步转盘失败:', e)
    }
  }

  async function pushHistory(entries) {
    if (!auth.user.value) return
    try {
      await api('/api/history', { method: 'POST', body: JSON.stringify(entries) })
    } catch (e) {
      console.error('同步历史失败:', e)
    }
  }

  async function syncAll() {
    if (!auth.user.value) return { wheels: [], history: [] }
    try {
      const [wheelsResp, historyResp] = await Promise.all([
        api('/api/wheels'),
        api('/api/history')
      ])
      const cloudWheels = wheelsResp.ok ? await wheelsResp.json() : []
      const cloudHistory = historyResp.ok ? await historyResp.json() : []
      return { wheels: cloudWheels, history: cloudHistory }
    } catch (e) {
      console.error('云端同步失败:', e)
      return { wheels: [], history: [] }
    }
  }

  return {
    api,
    pushWheels,
    pushHistory,
    syncAll,
  }
}
