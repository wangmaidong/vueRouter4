import { createRouter, createWebHistory } from '@/vue-router'
import Home from '@/Home.vue'
import About from '@/About.vue'
let routes = [
  {
    path: '/home',
    component: Home
  },
  {
    path: '/About',
    component: About
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
