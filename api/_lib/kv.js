import { kv } from '@vercel/kv'

const USER_KEY = (ghId) => `user:${ghId}`
const WHEELS_KEY = (userId) => `wheels:${userId}`
const HISTORY_KEY = (userId) => `history:${userId}`

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function getUserByGhId(ghId) {
  return await kv.get(USER_KEY(ghId))
}

export async function saveUser(user) {
  await kv.set(USER_KEY(user.github_id), user)
}

export async function getWheels(userId) {
  return (await kv.get(WHEELS_KEY(userId))) || []
}

export async function saveWheels(userId, wheels) {
  await kv.set(WHEELS_KEY(userId), wheels)
}

export async function getHistory(userId) {
  return (await kv.get(HISTORY_KEY(userId))) || []
}

export async function saveHistory(userId, entries) {
  const list = (await kv.get(HISTORY_KEY(userId))) || []
  const newItems = entries.map(e => ({
    id: e.id || makeId(),
    wheelId: e.wheelId || '',
    wheelName: e.wheelName || '',
    itemId: e.itemId || '',
    itemText: e.itemText || '',
    timestamp: e.timestamp || new Date().toISOString()
  }))
  // 追加新条目，保留历史（最多200条）
  const merged = [...list, ...newItems].slice(0, 200)
  await kv.set(HISTORY_KEY(userId), merged)
  return merged
}
