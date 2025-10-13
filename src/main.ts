import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.scss'
import './assets/styles/themes.scss' // 引入主题样式

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

