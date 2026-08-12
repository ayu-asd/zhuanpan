import jwt from 'jsonwebtoken'

const TOKEN_TTL = '30d'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET 未配置')
  return secret
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret())
  } catch {
    return null
  }
}

export function getUserFromRequest(req) {
  const header = req.headers.get('authorization')
  if (!header) return null
  const token = header.replace(/^Bearer\s+/i, '')
  return verifyToken(token)
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function unauthorized() {
  return json({ error: '未登录' }, 401)
}