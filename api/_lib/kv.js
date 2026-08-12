import { kv } from '@vercel/kv'

const USER_KEY = (ghId) => `user:${ghId}`
const WHEELS_KEY = (userId) => `wheels:${userId}`
const HISTORY_KEY = (userId) => `history:${userId}`

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
  const list = (await kv.get(HISTORY_KEY(userId))) || []
  const merged = [...history, ...list]
    .filter(
      (item, i, arr) =>
        arr.findIndex((x) => x.id === item.id) === i
    )
    .slice(0, 200)
  await kv.set(HISTORY_KEY(userId), merged)
  return merged
}