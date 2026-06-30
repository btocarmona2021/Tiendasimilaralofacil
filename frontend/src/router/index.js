import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetail from '../views/ProductDetail.vue'
import ReviewView from '../views/ReviewView.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminProducts from '../views/AdminProducts.vue'
import AdminCategories from '../views/AdminCategories.vue'
import AdminCombos from '../views/AdminCombos.vue'
import AdminOrders from '../views/AdminOrders.vue'
import AdminDiscounts from '../views/AdminDiscounts.vue'
import AdminReviews from '../views/AdminReviews.vue'
import AdminSettings from '../views/AdminSettings.vue'
import AdminUsers from '../views/AdminUsers.vue'

const routes = [
  { path: '/', name: 'landing', component: LandingPage },
  { path: '/:tenant/', name: 'store-home', component: CatalogView },
  { path: '/:tenant/product/:id', name: 'store-product-detail', component: ProductDetail },
  { path: '/:tenant/review/:token', name: 'store-review', component: ReviewView },
  { path: '/product/:id', name: 'product-detail', component: ProductDetail },
  { path: '/review/:token', name: 'review', component: ReviewView },
  { path: '/admin/login', name: 'admin-login', component: AdminLogin },
  { path: '/admin', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/products', name: 'admin-products', component: AdminProducts, meta: { requiresAuth: true } },
  { path: '/admin/categories', name: 'admin-categories', component: AdminCategories, meta: { requiresAuth: true } },
  { path: '/admin/combos', name: 'admin-combos', component: AdminCombos, meta: { requiresAuth: true } },
  { path: '/admin/orders', name: 'admin-orders', component: AdminOrders, meta: { requiresAuth: true } },
  { path: '/admin/discounts', name: 'admin-discounts', component: AdminDiscounts, meta: { requiresAuth: true } },
  { path: '/admin/reviews', name: 'admin-reviews', component: AdminReviews, meta: { requiresAuth: true } },
  { path: '/admin/settings', name: 'admin-settings', component: AdminSettings, meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/login', name: 'tenant-admin-login', component: AdminLogin },
  { path: '/:tenant/admin', name: 'tenant-admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/products', name: 'tenant-admin-products', component: AdminProducts, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/categories', name: 'tenant-admin-categories', component: AdminCategories, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/combos', name: 'tenant-admin-combos', component: AdminCombos, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/orders', name: 'tenant-admin-orders', component: AdminOrders, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/discounts', name: 'tenant-admin-discounts', component: AdminDiscounts, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/reviews', name: 'tenant-admin-reviews', component: AdminReviews, meta: { requiresAuth: true } },
  { path: '/:tenant/admin/settings', name: 'tenant-admin-settings', component: AdminSettings, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory('/multitienda/'),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      const tenant = to.params.tenant
      return next({ name: tenant ? 'tenant-admin-login' : 'admin-login', params: { tenant } })
    }
  }
  next()
})

export default router
