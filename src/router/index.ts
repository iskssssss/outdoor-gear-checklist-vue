import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../components/views/HomePage.vue'
import DocPage from '../components/views/DocPage.vue'
import ChangelogPage from '../components/views/ChangelogPage.vue'

const routes: Array<RouteRecordRaw> = [
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
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 总是滚动到顶部
    return { top: 0 }
  }
})

export default router
