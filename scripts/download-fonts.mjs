import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const fontDir = resolve(root, 'public', 'fonts')

const FONT_URL =
  'https://fonts.googleapis.com/css2?' +
  'family=Orbitron:wght@400;700;900&' +
  'family=JetBrains+Mono:wght@400;500;700&' +
  'family=Press+Start+2P&' +
  'family=VT323&' +
  'family=DM+Serif+Display:ital@0;1&' +
  'family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&' +
  'display=swap'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function download(url, dest) {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed: ${url}`)
  const buffer = Buffer.from(await resp.arrayBuffer())
  writeFileSync(dest, buffer)
  return dest
}

async function main() {
  mkdirSync(fontDir, { recursive: true })

  const resp = await fetch(FONT_URL, { headers: { 'User-Agent': UA } })
  const css = await resp.text()

  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g
  const fontUrls = []
  const localCssParts = []
  let lastIdx = 0
  let match

  while ((match = urlRegex.exec(css)) !== null) {
    localCssParts.push(css.slice(lastIdx, match.index))
    const url = match[1]
    const filename = url.split('/').pop().split('?')[0]
    fontUrls.push({ url, filename })
    localCssParts.push(`url(./fonts/${filename})`)
    lastIdx = match.index + match[0].length
  }
  localCssParts.push(css.slice(lastIdx))

  const fontCss = localCssParts.join('')
  writeFileSync(resolve(fontDir, '..', 'fonts.css'), fontCss, 'utf-8')

  for (const { url, filename } of fontUrls) {
    const dest = resolve(fontDir, filename)
    console.log(`Downloading ${filename}...`)
    await download(url, dest)
  }

  console.log(`Done! ${fontUrls.length} fonts downloaded.`)
}

main().catch(console.error)
