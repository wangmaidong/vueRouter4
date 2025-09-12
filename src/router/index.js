import { createRouter, createWebHistory } from '@/vue-router'
import Home from '@/Home.vue'
import About from '@/About.vue'
import MyView from '@/Myview.vue'
import A from '@/A.vue'
import B from '@/B.vue'
let routes = [
  {
    path: '/home', 
    name: 'home',
    component: Home
  },
  {
    path: '/About',
    name: 'about',
    component: About
  },
  {
    path: '/my',
    name: 'my',
    component: MyView,
    children: [
      {
        path: 'a',
        name: 'a',
        component: A
      },
      {
        path: 'b',
        name: 'b',
        component: B
      }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
