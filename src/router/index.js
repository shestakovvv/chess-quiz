import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Chess',
      component: () => import('../views/ChessView.vue'),
    },
  ],
})

export default router
