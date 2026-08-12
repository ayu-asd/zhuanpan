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

function getHeader(req, name) {
  if (req.headers && typeof req.headers.get === 'function') {
    return req.headers.get(name)
  }
  return (req.headers && req.headers[name]) || null
}

export function getUserFromRequest(req) {
  const header = getHeader(req, 'authorization')
  if (!header) return null
  const token = header.replace(/^Bearer\s+/i, '').trim()
  return verifyToken(token)
}

export function json(res, data, status = 200) {
  res.status(status).json(data)
}

export function unauthorized(res) {
  json(res, { error: '未登录' }, 401)
}

export function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
  })
}