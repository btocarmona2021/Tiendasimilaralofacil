<template>
  <div class="admin-panel">
    <AdminLayout>
      <h2>📊 Dashboard</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-num">{{ stats.products }}</div>
          <div class="stat-label">Productos</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ stats.orders }}</div>
          <div class="stat-label">Pedidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ stats.pending }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:var(--gold)">{{ stats.revenue || 0 }}</div>
          <div class="stat-label">Ventas hoy</div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const stats = ref({ products: 0, orders: 0, pending: 0, revenue: 0 })

onMounted(async () => {
  try {
    const [pData, oData] = await Promise.all([
      api.get('/products'),
      api.get('/orders'),
    ])
    stats.value.products = pData.data.length
    stats.value.orders = oData.data.length
    stats.value.pending = oData.data.filter(o => o.status === 'pendiente').length
    stats.value.revenue = oData.data.filter(o => o.status !== 'cancelado').reduce((a, o) => a + Number(o.total), 0)
  } catch {}
})
</script>

<style scoped>
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.stat-card {
  background: var(--white);
  border-radius: var(--radius-sm);
  padding: 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.stat-num { font-size: 32px; font-weight: 900; color: var(--red); font-family: 'Playfair Display', serif; }
.stat-label { font-size: 12px; color: var(--light-text); margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
</style>
