<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <h3 style="font-family:'Playfair Display';color:var(--brown);margin-bottom:16px">⚙️ Admin</h3>
      <router-link :to="adminPath('')" class="admin-link">📊 Dashboard</router-link>
      <router-link v-if="tenant" :to="adminPath('products')" class="admin-link">📦 Productos</router-link>
      <router-link v-if="tenant" :to="adminPath('categories')" class="admin-link">📁 Categorías</router-link>
      <router-link v-if="tenant" :to="adminPath('combos')" class="admin-link">✨ Combos</router-link>
      <router-link v-if="tenant" :to="adminPath('orders')" class="admin-link">📋 Pedidos</router-link>
      <router-link v-if="tenant" :to="adminPath('discounts')" class="admin-link">🏷️ Códigos</router-link>
      <router-link v-if="tenant" :to="adminPath('reviews')" class="admin-link">⭐ Reseñas</router-link>
      <router-link v-if="!tenant && isSuperAdmin" :to="adminPath('tenants')" class="admin-link">🏪 Tiendas</router-link>
      <router-link v-if="!tenant && isSuperAdmin" :to="adminPath('plans')" class="admin-link">📋 Planes</router-link>
      <router-link v-if="isSuperAdmin" :to="adminPath('users')" class="admin-link">👥 Usuarios</router-link>
      <router-link :to="adminPath('settings')" class="admin-link">⚙️ Configuración</router-link>
      <a v-if="tenant" :href="storeUrl" target="_blank" class="admin-link" style="margin-top:8px">👁️ Ver Tienda</a>
      <button @click="logout" class="admin-link" style="margin-top:auto;background:none;border:none;cursor:pointer;text-align:left;padding:10px 14px;color:var(--red)">🚪 Salir</button>
      <div v-if="isSuperAdmin" style="font-size:10px;color:var(--gold);text-align:center;margin-top:4px;font-weight:600">🛡️ Super Admin</div>
    </aside>
    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { computed } from 'vue'
import { tenantFromUrl } from '../services/api.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const tenant = tenantFromUrl()
const isSuperAdmin = computed(() => auth.role === 'super_admin')

function adminPath(section) {
  if (tenant) return `/${tenant}/admin/${section}`
  return `/admin/${section}`
}

const storeUrl = computed(() => {
  if (tenant) return `/multitienda/${tenant}/`
  return '/multitienda/'
})

function logout() {
  auth.logout()
  router.push(tenant ? `/${tenant}/` : '/')
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar {
  width: 200px;
  background: var(--white);
  border-right: 1px solid var(--warm);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}
.admin-link {
  display: block;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text);
  text-decoration: none;
  border-radius: 10px;
  margin-bottom: 4px;
}
.admin-link:hover, .admin-link.router-link-exact-active { background: var(--cream); color: var(--red); font-weight: 600; }
.admin-content { flex: 1; padding: 24px; max-width: 960px; }
</style>
