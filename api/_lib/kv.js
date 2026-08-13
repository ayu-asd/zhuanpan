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

export async function saveHistory(userId, history) {
  const clean = history.slice().reverse().map(h => ({
    id: h.id || makeId(),
    wheelId: h.wheelId || '',
    wheelName: h.wheelName || '',
    itemId: h.itemId || '',
    itemText: h.itemText || '',
    timestamp: h.timestamp || new Date().toISOString()
  }))
  await kv.set(HISTORY_KEY(userId), clean.slice(0, 200))
  return clean
}
