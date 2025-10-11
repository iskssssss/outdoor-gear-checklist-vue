import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.scss'
import './assets/styles/themes.scss' // 引入主题样式

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

