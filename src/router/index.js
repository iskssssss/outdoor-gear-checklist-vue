import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/views/HomePage.vue'
import DocPage from '../components/views/DocPage.vue'
import ChangelogPage from '../components/views/ChangelogPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/doc',
    name: 'Doc',
    component: DocPage
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: ChangelogPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
