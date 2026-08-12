import { saveUser, getUserByGhId } from './_lib/kv.js'
import { signToken } from './_lib/jwt.js'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_API_URL = 'https://api.github.com/user'

function getHeader(req, name) {
  if (req.headers && typeof req.headers.get === 'function') {
    return req.headers.get(name)
  }
  return (req.headers && req.headers[name]) || null
}

function getBaseUrl(req) {
  const proto = getHeader(req, 'x-forwarded-proto') || 'https'
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host')
  if (host) return `${proto}://${host}`
  const configured = process.env.AUTH_REDIRECT_URI
  if (configured) {
    const u = new URL(configured)
    return `${u.protocol}//${u.host}`
  }
  return 'https://localhost'
}

function getRedirectUri(req) {
  return `${getBaseUrl(req)}/api/auth`
}

function makeId() {
  return 'gh-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

async function exchangeCode(code) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
  })
  const resp = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const data = await resp.json()
  if (data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to exchange code')
  }
  return data.access_token
}

async function getGithubUser(accessToken) {
  const resp = await fetch(GITHUB_API_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'zhuanpan', Accept: 'application/vnd.github+json' },
  })
  return await resp.json()
}

export default async function handler(req, res) {
  const baseUrl = getBaseUrl(req)
  const redirectUri = getRedirectUri(req)
  const requestUrl = new URL(req.url || '/', baseUrl + '/')
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const accessToken = await exchangeCode(code)
      const ghUser = await getGithubUser(accessToken)
      const ghId = String(ghUser.id)

      let user = await getUserByGhId(ghId)
      if (!user) {
        user = { id: makeId(), github_id: ghId, created_at: new Date().toISOString() }
      }
      user.login = ghUser.login
      user.name = ghUser.name || ghUser.login
      user.avatar_url = ghUser.avatar_url
      user.updated_at = new Date().toISOString()
      await saveUser(user)

      const token = signToken({ userId: user.id, githubId: ghId })
      const frontUrl = `${baseUrl}/#/login?token=${encodeURIComponent(token)}`
      res.redirect(frontUrl)
    } catch (e) {
      res.status(500).send(`登录失败: ${e.message}`)
    }
    return
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state: 'login',
  })
  res.redirect(`${GITHUB_AUTH_URL}?${params}`)
}