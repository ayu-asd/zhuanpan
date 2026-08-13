import { getUserByGhId } from './_lib/kv.js'
import { getUserFromRequest, json, unauthorized } from './_lib/jwt.js'

export default async function handler(req, res) {
  const auth = getUserFromRequest(req)
  if (!auth) return unauthorized(res)

  const user = await getUserByGhId(auth.githubId)
  if (!user) return json(res, { error: '用户不存在' }, 404)

  return json(res, {
    id: user.id,
    userId: user.id,
    githubId: auth.githubId,
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
  })
}