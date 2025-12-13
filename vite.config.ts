import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const repository = process.env.GITHUB_REPOSITORY ?? ''
const repositoryName = repository.split('/')[1] ?? ''

/**
 * Определяет базовый путь сборки для GitHub Pages.
 *
 * Если репозиторий является пользовательским/организационным сайтом
 * (`<user>.github.io`), то базовый путь — корень. Для проектных страниц
 * используется поддиректория с именем репозитория.
 *
 * @returns {string} Базовый префикс для Vite.
 */
function resolveBasePath(): string {
  if (!repositoryName || repositoryName.endsWith('.github.io')) {
    return '/'
  }

  return `/${repositoryName}/`
}

/**
 * Создает конфигурацию PWA с учетом базового пути развертывания.
 *
 * @param {string} basePath Базовый путь, соответствующий `base` Vite.
 * @returns {import('vite').PluginOption} Плагин PWA с манифестом и сервис-воркером.
 */
function createPwaPlugin(basePath: string) {
  return VitePWA({
    registerType: 'autoUpdate',
    injectRegister: null,
    manifest: {
      name: 'Word Cards',
      short_name: 'Word Cards',
      id: basePath,
      start_url: basePath,
      scope: basePath,
      display: 'standalone',
      theme_color: '#181818',
      background_color: '#181818',
      icons: [
        {
          src: `${basePath}icons/icon-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: `${basePath}icons/icon-512.png`,
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: `${basePath}icons/icon-maskable-512.png`,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: `${basePath}index.html`,
    },
    includeAssets: [
      'favicon.ico',
      'apple-touch-icon.png',
      'icons/icon-192.png',
      'icons/icon-512.png',
      'icons/icon-maskable-512.png',
    ],
  })
}

const basePath = resolveBasePath()

export default defineConfig({
  base: basePath,
  plugins: [vue(), vueDevTools(), createPwaPlugin(basePath)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
  },
})
