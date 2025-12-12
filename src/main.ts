import './assets/null.scss'
import './assets/root.scss'
import './assets/layout.scss'
import './assets/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
