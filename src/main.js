import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const tg = window.Telegram?.WebApp
tg?.ready()
tg?.expand()

const app = createApp(App)
app.provide('tg', tg)
app.use(router)
app.mount('#app')