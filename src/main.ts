import './assets/styles/null.scss'
import './assets/styles/root.scss'
import './assets/styles/layout.scss'
import './assets/styles/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// `virtual:pwa-register` — виртуальный модуль, который генерирует помощь для
// регистрации сервис-воркера на основе настроек `vite-plugin-pwa`.
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')

/**
 * Регистрирует сервис-воркер приложения для поддержки PWA.
 */
function registerServiceWorker() {
  registerSW()
}

registerServiceWorker()
