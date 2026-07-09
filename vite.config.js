import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isVercel = process.env.VERCEL === '1'

export default defineConfig({
  base: isVercel ? '/' : './',
  plugins: [
    vue(),
    !isVercel && {
      name: 'file-protocol',
      closeBundle() {
        const htmlPath = resolve(__dirname, 'dist/index.html')
        let html = readFileSync(htmlPath, 'utf-8')
        html = html
          .replace(/\s+type="module"/g, '')
          .replace(/\s+crossorigin/g, '')
        const scripts = html.match(/<script[^>]*><\/script>/g) || []
        scripts.forEach(s => { html = html.replace(s, '') })
        const assets = readdirSync(resolve(__dirname, 'dist/assets'))
        const cssFile = assets.find(f => f.endsWith('.css'))
        if (cssFile && !html.includes(cssFile)) {
          html = html.replace('</head>', `  <link rel="stylesheet" href="./assets/${cssFile}">\n  </head>`)
        }
        html = html.replace('</body>', '  <script src="./assets/app.js"></script>\n</body>')
        writeFileSync(htmlPath, html, 'utf-8')
      }
    }
  ].filter(Boolean),
  build: isVercel ? {} : {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
      }
    },
  }
})
