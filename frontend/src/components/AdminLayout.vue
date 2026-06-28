<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <h3 style="font-family:'Playfair Display';color:var(--brown);margin-bottom:16px">⚙️ Admin</h3>
      <router-link to="/admin" class="admin-link">📊 Dashboard</router-link>
      <router-link to="/admin/products" class="admin-link">📦 Productos</router-link>
      <router-link to="/admin/categories" class="admin-link">📁 Categorías</router-link>
      <router-link to="/admin/combos" class="admin-link">✨ Combos</router-link>
      <router-link to="/admin/orders" class="admin-link">📋 Pedidos</router-link>
      <router-link to="/admin/discounts" class="admin-link">🏷️ Códigos</router-link>
      <router-link to="/admin/reviews" class="admin-link">⭐ Reseñas</router-link>
      <router-link to="/admin/settings" class="admin-link">⚙️ Configuración</router-link>
      <button @click="logout" class="admin-link" style="margin-top:auto;background:none;border:none;cursor:pointer;text-align:left;padding:10px 14px;color:var(--red)">🚪 Salir</button>
    </aside>
    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/')
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
