import { getWheels, saveWheels } from './_lib/kv.js'
import { getUserFromRequest, json, unauthorized, readBody } from './_lib/jwt.js'

export default async function handler(req, res) {
  const auth = getUserFromRequest(req)
  if (!auth) return unauthorized(res)

  const method = req.method || 'GET'

  if (method === 'POST') {
    let body
    try {
      body = JSON.parse((await readBody(req)) || '[]')
    } catch {
      return json(res, { error: '请求体格式错误' }, 400)
    }
    if (!Array.isArray(body)) return json(res, { error: '数据格式错误' }, 400)
    await saveWheels(auth.userId, body)
    return json(res, { ok: true })
  }

  const wheels = await getWheels(auth.userId)
  return json(res, wheels)
}