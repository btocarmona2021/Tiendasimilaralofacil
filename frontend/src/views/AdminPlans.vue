<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>🏪 Planes</h2>
      <button class="btn-add" @click="openCreate">+ Nuevo plan</button>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card">
        <h3>{{ editing ? 'Editar plan' : 'Nuevo plan' }}</h3>
        <label>Slug</label>
        <input v-model="form.slug" placeholder="ej: basico">
        <label>Nombre</label>
        <input v-model="form.nombre" placeholder="ej: Básico">
        <label>Precio ($)</label>
        <input v-model="form.precio" type="number" step="0.01" placeholder="0">
        <label>Límite de productos</label>
        <input v-model="form.limite_productos" type="number" placeholder="10">
        <label v-if="editing">
          <input type="checkbox" v-model="form.activo"> Activo
        </label>
        <div class="modal-actions">
          <button class="btn-save" @click="save">{{ editing ? 'Guardar' : 'Crear' }}</button>
          <button class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </div>
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Slug</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Límite</th>
          <th>Activo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in planes" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.slug }}</td>
          <td>{{ p.nombre }}</td>
          <td>${{ Number(p.precio).toLocaleString() }}</td>
          <td>{{ p.limite_productos === 9999 ? '∞ Ilimitado' : p.limite_productos }}</td>
          <td>{{ p.activo ? '✅' : '❌' }}</td>
          <td>
            <button class="btn-sm" @click="edit(p)">✏️</button>
            <button class="btn-sm btn-danger" @click="remove(p)">🗑️</button>
          </td>
        </tr>
        <tr v-if="!planes.length">
          <td colspan="7" style="text-align:center;color:var(--light-text);padding:24px">No hay planes creados</td>
        </tr>
      </tbody>
    </table>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const planes = ref([])
const showForm = ref(false)
const editing = ref(null)
const formError = ref('')
const form = ref({ slug: '', nombre: '', precio: 0, limite_productos: 10, activo: true })

async function load() {
  try {
    const { data } = await api.get('/admin/planes')
    planes.value = data
  } catch {}
}

function openCreate() {
  editing.value = null
  form.value = { slug: '', nombre: '', precio: 0, limite_productos: 10, activo: true }
  formError.value = ''
  showForm.value = true
}

function edit(p) {
  editing.value = p
  form.value = { slug: p.slug, nombre: p.nombre, precio: p.precio, limite_productos: p.limite_productos, activo: !!p.activo }
  formError.value = ''
  showForm.value = true
}

async function save() {
  formError.value = ''
  if (!form.value.slug || !form.value.nombre) {
    formError.value = 'Slug y nombre requeridos'
    return
  }
  try {
    if (editing.value) {
      await api.put(`/admin/planes/${editing.value.id}`, form.value)
    } else {
      await api.post('/admin/planes', form.value)
    }
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Error al guardar'
  }
}

async function remove(p) {
  if (!confirm(`¿Eliminar plan "${p.nombre}"?`)) return
  try {
    await api.delete(`/admin/planes/${p.id}`)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { background: #fff; border-radius: var(--radius); padding: 24px; width: 100%; max-width: 420px; }
.modal-card h3 { margin-bottom: 16px; color: var(--brown); }
.modal-card label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--light-text); margin-bottom: 4px; margin-top: 10px; font-weight: 600; }
.modal-card input { width: 100%; border: 2px solid var(--warm); border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-bottom: 4px; }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn-save { flex: 1; background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 10px; font-weight: 700; cursor: pointer; }
.btn-cancel { flex: 1; background: var(--warm); color: var(--text); border: none; border-radius: 8px; padding: 10px; cursor: pointer; }
.form-error { color: var(--red); font-size: 12px; margin-top: 8px; }
.admin-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.admin-table th, .admin-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--warm); font-size: 14px; }
.admin-table th { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--light-text); }
.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.btn-danger { color: var(--red); border-color: var(--red); }
</style>
