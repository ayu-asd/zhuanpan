import { getWheels, saveWheels } from './_lib/kv.js'
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
    if (!Array.isArray(body)) return json({ error: '数据格式错误' }, 400)
    await saveWheels(auth.userId, body)
    return json({ ok: true })
  }

  const wheels = await getWheels(auth.userId)
  return json(wheels)
}