import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/TradesHistory.vue')
  },
  {
    path: '/portfoliomanager',
    component: () => import('../views/PortfolioManager.vue')
  },
  {
    path: '/analysisreports',
    component: () => import('../views/AnalystReports.vue')
  },
  {
    path: '/stocksscreener',
    component: () => import('../views/StocksScreener.vue')
  },
  {
    path: '/dataanalyst',
    component: () => import('../views/DataAnalyst.vue')
  },
  {
    path: '/datamanager',
    component: () => import('../views/DataManager.vue')
  },
  {
    path: '/workersmanager',
    component: () => import('../views/WorkersManager.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
