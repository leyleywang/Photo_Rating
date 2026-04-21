import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DeAi from '../views/DeAi.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/deai',
    name: 'DeAi',
    component: DeAi
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
