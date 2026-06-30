<template>
  <div class="admin-panel">
    <AdminLayout>
      <h2>📊 Dashboard</h2>
      <div v-if="!tenant" class="global-welcome">
        <p style="font-size:18px;color:var(--brown);margin-bottom:16px">🛡️ Panel de Administración Global</p>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-num">{{ gstats.tenants }}</div>
            <div class="stat-label">Tiendas</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">{{ gstats.products }}</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">{{ gstats.orders }}</div>
            <div class="stat-label">Pedidos</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">{{ gstats.pending }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-card" style="grid-column:1/-1">
            <div class="stat-num" style="color:var(--gold)">${{ Number(gstats.todayRevenue).toLocaleString() }}</div>
            <div class="stat-label">Ventas hoy (total)</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--light-text);margin-top:16px">
          Usá el menú lateral para gestionar Tiendas, Planes, Usuarios o Configuración.
        </p>
      </div>
      <div v-else class="stats">
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
          <div class="stat-num" style="color:var(--gold)">${{ Number(stats.revenue || 0).toLocaleString() }}</div>
          <div class="stat-label">Ventas hoy</div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api, { tenantFromUrl } from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const tenant = tenantFromUrl()
const stats = ref({ products: 0, orders: 0, pending: 0, revenue: 0 })
const gstats = ref({ tenants: 0, products: 0, orders: 0, pending: 0, todayRevenue: 0 })

onMounted(async () => {
  if (!tenant) {
    try {
      const { data } = await api.get('/admin/system/stats')
      gstats.value = data
    } catch {}
    return
  }
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
.global-welcome { text-align: center; padding: 24px 0; }
</style>
