<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>📁 Categorías</h2>
      <button class="btn-add" @click="editing = {}; showForm = true">+ Nueva</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Icono</th><th>Nombre</th><th>Slug</th><th>Orden</th><th>Acciones</th></tr></thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.icon }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.slug }}</td>
          <td>{{ c.sort_order }}</td>
          <td>
            <button class="btn-sm" @click="edit(c)">✏️</button>
            <button class="btn-sm btn-danger" @click="remove(c.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal-overlay" :class="{ open: showForm }" @click="showForm = false">
      <div class="modal" @click.stop>
        <div class="modal-handle"></div>
        <h3>{{ editing.id ? 'Editar' : 'Nueva' }} Categoría</h3>
        <input v-model="form.name" placeholder="Nombre">
        <input v-model="form.slug" placeholder="Slug (ej: herramientas)">
        <input v-model="form.icon" placeholder="Icono (emoji)">
        <input v-model="form.sort_order" placeholder="Orden" type="number">
        <button class="modal-save-btn" @click="save">{{ editing.id ? 'Actualizar' : 'Crear' }}</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const categories = ref([])
const showForm = ref(false)
const editing = ref({})
const form = ref({ name: '', slug: '', icon: '📦', sort_order: 0 })

async function load() {
  const { data } = await api.get('/categories')
  categories.value = data
}

function edit(c) {
  editing.value = c
  form.value = { name: c.name, slug: c.slug, icon: c.icon, sort_order: c.sort_order }
  showForm.value = true
}

async function save() {
  if (editing.value.id) await api.put(`/categories/${editing.value.id}`, form.value)
  else await api.post('/categories', form.value)
  showForm.value = false
  editing.value = {}
  form.value = { name: '', slug: '', icon: '📦', sort_order: 0 }
  load()
}

async function remove(id) {
  if (confirm('¿Eliminar categoría?')) {
    await api.delete(`/categories/${id}`)
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); }
.admin-table { width: 100%; border-collapse: collapse; background: var(--white); border-radius: var(--radius-sm); overflow: hidden; }
.admin-table th, .admin-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--warm); font-size: 13px; }
.admin-table th { background: var(--cream); font-weight: 600; color: var(--light-text); text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; }
.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 8px; padding: 6px 10px; cursor: pointer; margin-right: 4px; }
.btn-danger { border-color: var(--red); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-end; justify-content: center; opacity: 0; pointer-events: none; }
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal { background: var(--white); border-radius: 24px 24px 0 0; padding: 24px 20px; width: 100%; max-width: 480px; }
.modal-handle { width: 36px; height: 4px; background: var(--warm); border-radius: 2px; margin: 0 auto 20px; }
.modal h3 { font-family: 'Playfair Display'; color: var(--brown); margin-bottom: 16px; }
.modal input { width: 100%; border: 2px solid var(--warm); border-radius: 12px; padding: 13px 14px; font-size: 14px; font-family: var(--font-family, 'DM Sans', sans-serif); margin-bottom: 12px; outline: none; }
.modal input:focus { border-color: var(--red); }
.modal-save-btn { width: 100%; background: var(--red); color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; }
</style>
