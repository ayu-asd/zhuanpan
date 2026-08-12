import { getHistory, saveHistory } from './_lib/kv.js'
import { getUserFromRequest, json, unauthorized } from './_lib/jwt.js'

export default async function handler(req) {
  const auth = getUserFromRequest(req)
  if (!auth) return unauthorized()

  const method = req.method || 'GET'

  if (method === 'POST') {
    let body
    try {
      body = await req.json()
    } catch {
      return json({ error: '请求体格式错误' }, 400)
    }
    const item = Array.isArray(body) ? body : [body]
    const merged = await saveHistory(auth.userId, item)
    return json(merged)
  }

  const history = await getHistory(auth.userId)
  return json(history)
}