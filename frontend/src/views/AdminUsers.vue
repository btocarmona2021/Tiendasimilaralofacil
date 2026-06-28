<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>👥 Usuarios Admin</h2>
      <button class="btn-add" @click="showForm = true">+ Nuevo usuario</button>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card">
        <h3>{{ editing ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
        <input v-model="form.username" placeholder="Usuario">
        <input v-model="form.password" :placeholder="editing ? 'Nueva contraseña (dejar vacío)' : 'Contraseña'" type="password">
        <select v-model="form.role">
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <div class="modal-actions">
          <button class="btn-save" @click="saveUser">{{ editing ? 'Guardar' : 'Crear' }}</button>
          <button class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </div>
    </div>

    <table class="admin-table">
      <thead><tr><th>ID</th><th>Usuario</th><th>Rol</th><th>Creado</th><th></th></tr></thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td><span class="role-badge" :class="u.role">{{ u.role === 'super_admin' ? '🛡️ Super Admin' : '👤 Admin' }}</span></td>
          <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
          <td>
            <button class="btn-sm" @click="editUser(u)">✏️</button>
            <button class="btn-sm btn-danger" @click="deleteUser(u)" v-if="u.role !== 'super_admin'">🗑️</button>
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

const users = ref([])
const showForm = ref(false)
const editing = ref(null)
const formError = ref('')
const form = ref({ username: '', password: '', role: 'admin' })

async function loadUsers() {
  const { data } = await api.get('/admin/users')
  users.value = data
}

async function saveUser() {
  formError.value = ''
  if (!form.value.username) { formError.value = 'Usuario requerido'; return }
  if (!editing.value && !form.value.password) { formError.value = 'Contraseña requerida'; return }
  try {
    if (editing.value) {
      const body = { username: form.value.username, role: form.value.role }
      if (form.value.password) body.password = form.value.password
      await api.put(`/admin/users/${editing.value.id}`, body)
    } else {
      await api.post('/admin/users', form.value)
    }
    showForm.value = false
    editing.value = null
    form.value = { username: '', password: '', role: 'admin' }
    await loadUsers()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Error al guardar'
  }
}

function editUser(u) {
  editing.value = u
  form.value = { username: u.username, password: '', role: u.role }
  showForm.value = true
}

async function deleteUser(u) {
  if (!confirm(`¿Eliminar usuario "${u.username}"?`)) return
  try {
    await api.delete(`/admin/users/${u.id}`)
    await loadUsers()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999;
  display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: #fff; border-radius: var(--radius); padding: 24px;
  width: 100%; max-width: 400px;
}
.modal-card h3 { margin-bottom: 16px; color: var(--brown); }
.modal-card input, .modal-card select {
  width: 100%; border: 2px solid var(--warm); border-radius: 10px;
  padding: 10px 12px; font-size: 14px; margin-bottom: 10px;
  font-family: 'DM Sans', sans-serif;
}
.modal-actions { display: flex; gap: 8px; margin-top: 8px; }
.btn-save { flex: 1; background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px; font-weight: 700; cursor: pointer; }
.btn-cancel { flex: 1; background: var(--warm); color: var(--text); border: none; border-radius: 10px; padding: 10px; cursor: pointer; }
.form-error { color: var(--red); font-size: 12px; margin-top: 8px; }
.role-badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
.role-badge.super_admin { background: #fff3cd; color: #856404; }
.role-badge.admin { background: var(--cream); color: var(--light-text); }
.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 8px; padding: 4px 8px; cursor: pointer; margin-right: 4px; }
.btn-danger { color: var(--red); border-color: var(--red); }
.admin-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.admin-table th, .admin-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--warm); font-size: 14px; }
.admin-table th { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--light-text); }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 600; cursor: pointer; }
</style>
