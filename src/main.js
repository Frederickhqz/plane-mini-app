import { createApp } from 'vue'
import App from './App.vue'

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp
tg?.ready()
tg?.expand()

const app = createApp(App)
app.provide('tg', tg)
app.mount('#app')
