import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

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

export default defineConfig({
  base: resolveBasePath(),
  plugins: [vue(), vueDevTools()],
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
