import './assets/null.sass'
import './assets/root.sass'
import './assets/layout.sass'
import './assets/animations.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
