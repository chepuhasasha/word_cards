import './assets/styles/null.scss'
import './assets/styles/root.scss'
import './assets/styles/layout.scss'
import './assets/styles/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
