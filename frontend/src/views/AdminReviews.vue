<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>⭐ Reseñas</h2>
    </div>
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Cliente</th><th>Texto</th><th>Rating</th><th>Aprobada</th><th>Acciones</th></tr></thead>
      <tbody>
        <tr v-for="r in reviews" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.customer_name }}</td>
          <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ r.text }}</td>
          <td>{{ '★'.repeat(r.rating) }}</td>
          <td>{{ r.is_approved ? '✅' : '❌' }}</td>
          <td>
            <button v-if="!r.is_approved" class="btn-sm" @click="approve(r.id)">✅ Aprobar</button>
            <button class="btn-sm btn-danger" @click="remove(r.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const reviews = ref([])

async function load() {
  const { data } = await api.get('/reviews/all')
  reviews.value = data
}

async function approve(id) {
  await api.put(`/reviews/${id}/approve`)
  load()
}

async function remove(id) {
  if (confirm('¿Eliminar reseña?')) {
    await api.delete(`/reviews/${id}`)
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.admin-table { width: 100%; border-collapse: collapse; background: var(--white); border-radius: var(--radius-sm); overflow: hidden; }
.admin-table th, .admin-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--warm); font-size: 13px; }
.admin-table th { background: var(--cream); font-weight: 600; color: var(--light-text); text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; }
.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
.btn-danger { border-color: var(--red); }
</style>
