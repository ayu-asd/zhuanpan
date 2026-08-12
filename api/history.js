import { getHistory, saveHistory } from './_lib/kv.js'
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
    const item = Array.isArray(body) ? body : [body]
    const merged = await saveHistory(auth.userId, item)
    return json(res, merged)
  }

  const history = await getHistory(auth.userId)
  return json(res, history)
}