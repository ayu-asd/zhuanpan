import { saveUser, getUserByGhId } from './_lib/kv.js'
import { signToken } from './_lib/jwt.js'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_API_URL = 'https://api.github.com/user'

function getBaseUrl(req) {
  const configured = process.env.AUTH_REDIRECT_URI
  if (configured) {
    const u = new URL(configured)
    return `${u.protocol}//${u.host}`
  }
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  return `${proto}://${host}`
}

function getRedirectUri(req) {
  const configured = process.env.AUTH_REDIRECT_URI
  if (configured) return configured
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

export default async function handler(req) {
  const baseUrl = getBaseUrl(req)
  const redirectUri = getRedirectUri(req)
  const requestUrl = new URL(req.url, baseUrl + '/')
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
      return new Response(null, {
        status: 302,
        headers: { Location: frontUrl },
      })
    } catch (e) {
      return new Response(`登录失败: ${e.message}`, { status: 500 })
    }
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state: 'login',
  })
  return new Response(null, {
    status: 302,
    headers: { Location: `${GITHUB_AUTH_URL}?${params}` },
  })
}