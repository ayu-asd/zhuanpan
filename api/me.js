import { getUserByGhId } from './_lib/kv.js'
import { getUserFromRequest, json, unauthorized } from './_lib/jwt.js'

export default async function handler(req) {
  const auth = getUserFromRequest(req)
  if (!auth) return unauthorized()

  const user = await getUserByGhId(auth.githubId)
  if (!user) return json({ error: '用户不存在' }, 404)

  return json({
    id: user.id,
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
  })
}