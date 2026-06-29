<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>📋 Pedidos</h2>
      <div class="header-tabs">
        <button v-for="f in filters" :key="f.key"
          :class="['tab-btn', { active: activeFilter === f.key }]"
          @click="activeFilter = f.key">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="order-list">
      <div v-for="o in filteredOrders" :key="o.id" class="order-card" @click="viewOrder(o)">
        <div class="order-card-header">
          <span class="order-id">#{{ o.id }}</span>
          <span :class="['order-badge', o.status]">{{ statusLabel(o.status) }}</span>
          <span class="order-payment" v-if="o.payment_method === 'mercadopago'">💳 MP</span>
        </div>
        <div class="order-card-body">
          <div class="order-client">
            <span class="order-name">{{ o.customer_name }}</span>
            <span class="order-phone">{{ o.customer_phone }}</span>
          </div>
          <div class="order-total">{{ fmt(o.total) }}</div>
        </div>
        <div class="order-card-footer">
          <span>📅 {{ new Date(o.created_at).toLocaleDateString() }}</span>
          <span v-if="o.pickup_date">🕐 {{ o.pickup_date }} {{ o.pickup_time }}</span>
        </div>
      </div>
      <div v-if="filteredOrders.length === 0" class="empty-state">
        No hay pedidos {{ activeFilter !== 'todas' ? activeFilter : '' }}
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: selected }" @click="selected = null">
      <div class="modal" @click.stop v-if="selected">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h3>Pedido #{{ selected.id }}</h3>
          <span :class="['order-badge', selected.status]">{{ statusLabel(selected.status) }}</span>
        </div>

        <div class="modal-section">
          <div class="modal-label">Cliente</div>
          <div class="modal-value">{{ selected.customer_name }} · {{ selected.customer_phone }}</div>
        </div>
        <div class="modal-section" v-if="selected.address">
          <div class="modal-label">Dirección</div>
          <div class="modal-value">{{ selected.address }}</div>
        </div>
        <div class="modal-section">
          <div class="modal-label">Retiro / Entrega</div>
          <div class="modal-value">{{ selected.pickup_date }} · {{ selected.pickup_time }}</div>
        </div>

        <div class="modal-section">
          <div class="modal-label">Productos</div>
          <div v-for="item in selected.items" :key="item.id" class="modal-item">
            <span>{{ item.product_name }} × {{ item.quantity }}</span>
            <span>{{ fmt(item.unit_price * item.quantity) }}</span>
          </div>
          <div v-for="item in selected.combos" :key="item.id" class="modal-item">
            <span>✨ {{ item.combo_name }}</span>
            <span>{{ fmt(item.price) }}</span>
          </div>
        </div>

        <div class="modal-totals">
          <div class="modal-total-row"><span>Subtotal</span><span>{{ fmt(selected.subtotal) }}</span></div>
          <div class="modal-total-row"><span>Envío</span><span>{{ fmt(selected.shipping) }}</span></div>
          <div class="modal-total-row" v-if="selected.discount > 0" style="color:var(--red)">
            <span>Descuento</span><span>-{{ fmt(selected.discount) }}</span>
          </div>
          <div class="modal-total-row modal-total-final"><span>Total</span><span>{{ fmt(selected.total) }}</span></div>
        </div>

        <div class="modal-actions">
          <label style="font-size:11px;font-weight:600;color:var(--light-text);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px">Estado</label>
          <div class="status-grid">
            <button v-for="s in statuses" :key="s.value"
              :class="['status-btn', { active: selected.status === s.value }]"
              @click="updateStatus(selected.id, s.value)">
              {{ s.icon }} {{ s.label }}
            </button>
          </div>
        </div>
        <button v-if="selected.status === 'entregado' && selected.review_token" class="review-link-btn" @click="copyReviewLink(selected.review_token)">
          🔗 Copiar link de reseña
        </button>
        <button class="delete-btn" @click="removeOrder(selected.id)">🗑️ Eliminar pedido</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const orders = ref([])
const selected = ref(null)
const activeFilter = ref('todas')

const filters = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: '⏳ Pendientes' },
  { key: 'confirmado', label: '✅ Confirmadas' },
  { key: 'cancelado', label: '❌ Canceladas' },
]

const statuses = [
  { value: 'pendiente', label: 'Pendiente', icon: '⏳' },
  { value: 'confirmado', label: 'Confirmado', icon: '✅' },
  { value: 'preparando', label: 'Preparando', icon: '👨‍🍳' },
  { value: 'listo', label: 'Listo', icon: '📦' },
  { value: 'entregado', label: 'Entregado', icon: '🎉' },
  { value: 'cancelado', label: 'Cancelado', icon: '❌' },
]

function statusLabel(s) {
  const found = statuses.find(st => st.value === s)
  return found ? `${found.icon} ${found.label}` : s
}

const filteredOrders = computed(() => {
  if (activeFilter.value === 'todas') return orders.value
  return orders.value.filter(o => o.status === activeFilter.value)
})

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

async function load() {
  const { data } = await api.get('/orders')
  orders.value = data
}

async function updateStatus(id, status) {
  await api.put(`/orders/${id}/status`, { status })
  selected.value.status = status
  load()
}

async function viewOrder(o) {
  const { data } = await api.get(`/orders/${o.id}`)
  selected.value = data
}

async function removeOrder(id) {
  if (!confirm('¿Eliminar este pedido permanentemente?')) return
  await api.delete(`/orders/${id}`)
  selected.value = null
  load()
}

function copyReviewLink(token) {
  const tenant = window.location.pathname.match(/\/multitienda\/([^/]+)/)?.[1]
  const url = tenant
    ? `${window.location.origin}/multitienda/${tenant}/review/${token}`
    : `${window.location.origin}/multitienda/review/${token}`
  navigator.clipboard.writeText(url).then(() => {
    alert('✅ Link de reseña copiado:\n' + url)
  })
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.header-tabs { display: flex; gap: 6px; }
.tab-btn {
  background: var(--white); border: 1px solid var(--warm); border-radius: 20px;
  padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;
  color: var(--light-text); font-weight: 500;
}
.tab-btn.active { background: var(--red); color: #fff; border-color: var(--red); }

.order-list { display: flex; flex-direction: column; gap: 10px; }
.order-card {
  background: var(--white); border-radius: var(--radius-sm);
  padding: 14px 16px; cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s;
}
.order-card:hover { transform: translateX(4px); }
.order-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.order-id { font-weight: 800; font-size: 14px; color: var(--text); font-family: 'Playfair Display', serif; }
.order-badge {
  font-size: 10px; padding: 3px 8px; border-radius: 20px;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.order-badge.pendiente { background: #FFF3CD; color: #856404; }
.order-badge.confirmado { background: #D4EDDA; color: #155724; }
.order-badge.preparando { background: #CCE5FF; color: #004085; }
.order-badge.listo { background: #D6D8DB; color: #383D41; }
.order-badge.entregado { background: #C3E6CB; color: #1E7E34; }
.order-badge.cancelado { background: #F5C6CB; color: #721C24; }
.order-payment { font-size: 12px; }
.order-card-body { display: flex; justify-content: space-between; align-items: center; }
.order-name { font-size: 14px; font-weight: 600; color: var(--text); display: block; }
.order-phone { font-size: 12px; color: var(--light-text); }
.order-total { font-size: 18px; font-weight: 800; color: var(--red); font-family: 'Playfair Display', serif; }
.order-card-footer { display: flex; justify-content: space-between; font-size: 11px; color: var(--light-text); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--warm); }

.empty-state { text-align: center; padding: 40px 0; color: var(--light-text); font-size: 14px; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--white); border-radius: 24px 24px 0 0; padding: 24px 20px;
  padding-bottom: calc(env(safe-area-inset-bottom,0px) + 24px);
  width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto;
}
.modal-handle { width: 36px; height: 4px; background: var(--warm); border-radius: 2px; margin: 0 auto 20px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { font-family: 'Playfair Display'; color: var(--brown); font-size: 22px; }
.modal-section { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--warm); }
.modal-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--light-text); font-weight: 600; margin-bottom: 4px; }
.modal-value { font-size: 14px; color: var(--text); font-weight: 500; }
.modal-item { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: var(--text); }
.modal-totals { background: var(--cream); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px; }
.modal-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text); padding: 2px 0; }
.modal-total-final { font-size: 16px; font-weight: 700; border-top: 1px solid var(--warm); padding-top: 6px; margin-top: 4px; }
.modal-total-final span:last-child { color: var(--red); }
.modal-actions { margin-top: 8px; }
.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.status-btn {
  padding: 8px 6px; border: 1px solid var(--warm); border-radius: 10px;
  font-size: 11px; cursor: pointer; background: var(--white);
  font-family: 'DM Sans', sans-serif; color: var(--text);
  text-align: center; transition: 0.15s;
}
.status-btn.active { border-color: var(--red); background: var(--red-light); color: var(--red); font-weight: 600; }
.delete-btn {
  width: 100%; background: none; border: 1.5px solid var(--red); color: var(--red);
  border-radius: 12px; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 12px;
}
.review-link-btn {
  width: 100%; background: var(--brown, #5C3317); color: #fff; border: none;
  border-radius: 12px; padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 8px;
}
</style>