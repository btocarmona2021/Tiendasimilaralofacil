<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>🏷️ Códigos de Descuento</h2>
      <button class="btn-add" @click="showForm = true">+ Generar</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Código</th><th>Descuento</th><th>Usado</th><th>Cliente</th><th>Creado</th></tr></thead>
      <tbody>
        <tr v-for="d in discounts" :key="d.id">
          <td>{{ d.id }}</td>
          <td style="font-family:monospace;font-weight:700">{{ d.code }}</td>
          <td>{{ fmt(d.discount_amount) }}</td>
          <td>{{ d.usado ? '✅' : '❌' }}</td>
          <td>{{ d.customer_id || '—' }}</td>
          <td>{{ new Date(d.created_at).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>

    <div class="modal-overlay" :class="{ open: showForm }" @click="showForm = false">
      <div class="modal" @click.stop>
        <div class="modal-handle"></div>
        <h3>Nuevo Código</h3>
        <input v-model="code" placeholder="Código (ej: DESCUENTO10)">
        <input v-model="amount" placeholder="Monto descuento" type="number">
        <button class="modal-save-btn" @click="save">Crear</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const discounts = ref([])
const showForm = ref(false)
const code = ref('')
const amount = ref('')

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

async function load() {
  const { data } = await api.get('/discount-codes')
  discounts.value = data
}

async function save() {
  await api.post('/discount-codes', { code: code.value, discount_amount: amount.value })
  showForm.value = false
  code.value = ''
  amount.value = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; }
.admin-table { width: 100%; border-collapse: collapse; background: var(--white); border-radius: var(--radius-sm); overflow: hidden; }
.admin-table th, .admin-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--warm); font-size: 13px; }
.admin-table th { background: var(--cream); font-weight: 600; color: var(--light-text); text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal { background: var(--white); border-radius: 24px; padding: 24px 20px; width: 100%; max-width: 480px; }
.modal-handle { display: none; }
.modal h3 { font-family: 'Playfair Display'; color: var(--brown); margin-bottom: 16px; }
.modal input { width: 100%; border: 2px solid var(--warm); border-radius: 12px; padding: 13px 14px; font-size: 14px; margin-bottom: 12px; outline: none; }
.modal-save-btn { width: 100%; background: var(--red); color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; }
</style>
