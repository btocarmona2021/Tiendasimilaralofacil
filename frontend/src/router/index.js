import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '../views/CatalogView.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminProducts from '../views/AdminProducts.vue'
import AdminCategories from '../views/AdminCategories.vue'
import AdminCombos from '../views/AdminCombos.vue'
import AdminOrders from '../views/AdminOrders.vue'
import AdminDiscounts from '../views/AdminDiscounts.vue'
import AdminReviews from '../views/AdminReviews.vue'
import AdminSettings from '../views/AdminSettings.vue'

const routes = [
  { path: '/', name: 'home', component: CatalogView },
  { path: '/admin/login', name: 'admin-login', component: AdminLogin },
  { path: '/admin', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/products', name: 'admin-products', component: AdminProducts, meta: { requiresAuth: true } },
  { path: '/admin/categories', name: 'admin-categories', component: AdminCategories, meta: { requiresAuth: true } },
  { path: '/admin/combos', name: 'admin-combos', component: AdminCombos, meta: { requiresAuth: true } },
  { path: '/admin/orders', name: 'admin-orders', component: AdminOrders, meta: { requiresAuth: true } },
  { path: '/admin/discounts', name: 'admin-discounts', component: AdminDiscounts, meta: { requiresAuth: true } },
  { path: '/admin/reviews', name: 'admin-reviews', component: AdminReviews, meta: { requiresAuth: true } },
  { path: '/admin/settings', name: 'admin-settings', component: AdminSettings, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory('/shop/'),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) return next({ name: 'admin-login' })
  }
  next()
})

export default router
