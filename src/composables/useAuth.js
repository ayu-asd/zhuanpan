import { ref, computed } from 'vue'

const TOKEN_KEY = 'zhuanpan-token'

const user = ref(null)
const loading = ref(false)
const synced = ref(false)

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function api(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const resp = await fetch(path, { ...options, headers })
  if (resp.status === 401) {
    user.value = null
    clearToken()
  }
  return resp
}

function checkLoginFromUrl() {
  const hash = window.location.hash
  if (hash.startsWith('#/login?token=')) {
    const token = hash.split('token=')[1]
    setToken(token)
    window.location.hash = ''
    return true
  }
  return false
}

async function loadUser() {
  if (!getToken()) {
    user.value = null
    return null
  }
  loading.value = true
  try {
    const resp = await api('/api/me')
    if (resp.ok) {
      user.value = await resp.json()
    }
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
  return user.value
}

function login() {
  window.location.href = '/api/auth'
}

function logout() {
  clearToken()
  user.value = null
}

export function useAuth() {
  return {
    user,
    loading,
    synced,
    getToken,
    api,
    checkLoginFromUrl,
    loadUser,
    login,
    logout,
  }
}

export const isLoggedIn = computed(() => !!user.value)