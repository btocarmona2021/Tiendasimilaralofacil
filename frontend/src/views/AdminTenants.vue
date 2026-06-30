<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>🏪 Tiendas</h2>
      <button class="btn-add" @click="openCreate">+ Nueva tienda</button>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card">
        <h3>{{ editing ? 'Editar tienda' : 'Nueva tienda' }}</h3>

        <template v-if="!editing">
          <label>Slug</label>
          <input v-model="form.slug" placeholder="ej: mitienda">
          <label>Rubro</label>
          <select v-model="form.rubro">
            <option v-for="o in rubroOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <label>Usuario admin</label>
          <input v-model="form.admin_user" placeholder="admin">
          <label>Contraseña</label>
          <input v-model="form.admin_pass" type="password" placeholder="admin123">
        </template>

        <template v-if="editing">
          <label>Plan</label>
          <select v-model="form.plan_id">
            <option :value="null">Sin plan</option>
            <option v-for="p in planes" :key="p.id" :value="p.id">{{ p.nombre }} (${{ Number(p.precio).toLocaleString() }})</option>
          </select>
          <label>Fecha de vencimiento</label>
          <input v-model="form.fecha_vencimiento" type="date">
          <label>Activa</label>
          <select v-model="form.is_active">
            <option :value="1">Sí</option>
            <option :value="0">No</option>
          </select>
        </template>

        <div v-if="editing && editing.store_name" style="margin-top:12px;padding:12px;background:var(--cream);border-radius:8px;font-size:13px">
          <strong>{{ editing.store_name }}</strong><br>
          <span style="color:var(--light-text)">{{ editing.slug }}</span>
          <span v-if="editing.logo" style="display:block;margin-top:6px">
            <img :src="editing.logo" style="max-width:80px;max-height:40px;border-radius:4px">
          </span>
        </div>

        <div class="modal-actions">
          <button class="btn-save" @click="save">{{ editing ? 'Guardar' : 'Crear' }}</button>
          <button class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </div>
    </div>

    <div class="table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Slug</th>
          <th>Nombre</th>
          <th>Rubro</th>
          <th>Plan</th>
          <th>Vence</th>
          <th>Logo</th>
          <th>Estado</th>
          <th>Admin</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tenants" :key="t.id">
          <td><strong>{{ t.slug }}</strong></td>
          <td>{{ t.store_name }}</td>
          <td>{{ t.rubro }}</td>
          <td>{{ t.plan_nombre || '—' }}</td>
          <td>{{ t.fecha_vencimiento ? new Date(t.fecha_vencimiento).toLocaleDateString() : '—' }}</td>
          <td><img v-if="t.logo" :src="t.logo" class="mini-logo"></td>
          <td>{{ t.is_active ? '✅ Activa' : '❌ Inactiva' }}</td>
          <td><a :href="'/multitienda/' + t.slug + '/admin/'" target="_blank" class="admin-link-btn">🔗 Ir</a></td>
          <td>
            <button class="btn-sm" @click="edit(t)">✏️</button>
            <button class="btn-sm btn-danger" @click="remove(t)">🗑️</button>
          </td>
        </tr>
        <tr v-if="!tenants.length">
          <td colspan="9" style="text-align:center;color:var(--light-text);padding:24px">No hay tiendas</td>
        </tr>
      </tbody>
    </table>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const tenants = ref([])
const planes = ref([])
const showForm = ref(false)
const editing = ref(null)
const formError = ref('')
const form = ref({ slug: '', rubro: 'ferreteria', admin_user: 'admin', admin_pass: 'admin123', plan_id: null, fecha_vencimiento: '', is_active: 1 })

const rubroOptions = [
  { value: 'fiambres', label: '🥩 Fiambres' },
  { value: 'ferreteria', label: '🔧 Ferretería' },
  { value: 'herramientas', label: '🔧 Herramientas' },
  { value: 'verduleria', label: '🥬 Verdulería' },
  { value: 'carniceria', label: '🥩 Carnicería' },
  { value: 'panaderia', label: '🥐 Panadería' },
  { value: 'libreria', label: '📚 Librería' },
  { value: 'indumentaria', label: '👕 Indumentaria' },
]

async function load() {
  try {
    const [tData, pData] = await Promise.all([
      api.get('/admin/system/tenants'),
      api.get('/admin/planes'),
    ])
    tenants.value = tData.data
    planes.value = pData.data
  } catch {}
}

function openCreate() {
  editing.value = null
  form.value = { slug: '', rubro: 'ferreteria', admin_user: 'admin', admin_pass: 'admin123', plan_id: null, fecha_vencimiento: '', is_active: 1 }
  formError.value = ''
  showForm.value = true
}

function edit(t) {
  editing.value = t
  form.value = {
    plan_id: t.plan_id || null,
    fecha_vencimiento: t.fecha_vencimiento ? t.fecha_vencimiento.slice(0, 10) : '',
    is_active: t.is_active ? 1 : 0,
  }
  formError.value = ''
  showForm.value = true
}

async function save() {
  formError.value = ''
  try {
    if (editing.value) {
      const body = {}
      if (form.value.plan_id !== editing.value.plan_id) body.plan_id = form.value.plan_id
      if (form.value.fecha_vencimiento !== (editing.value.fecha_vencimiento || '').slice(0, 10)) body.fecha_vencimiento = form.value.fecha_vencimiento || null
      if (form.value.is_active !== editing.value.is_active) body.is_active = form.value.is_active
      if (Object.keys(body).length) {
        await api.put(`/admin/system/tenants/${editing.value.id}`, body)
      }
    } else {
      if (!form.value.slug) { formError.value = 'Slug requerido'; return }
      await api.post('/admin/system/tenants', form.value)
    }
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Error al guardar'
  }
}

async function remove(t) {
  if (!confirm(`¿Eliminar la tienda "${t.slug}"? Se borrarán todos sus productos, pedidos y reseñas.`)) return
  try {
    await api.delete(`/admin/system/tenants/${t.id}`)
    await load()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.admin-table th, .admin-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--warm); font-size: 13px; white-space: nowrap; }
.admin-table th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--light-text); background: var(--white); }
.admin-table tbody tr:hover { background: var(--cream); }
.mini-logo { max-width: 50px; max-height: 28px; border-radius: 4px; display: block; }
.admin-link-btn { display: inline-block; background: var(--red); color: #fff !important; text-decoration: none; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-card { background: #fff; border-radius: 14px; padding: 24px; width: 100%; max-width: 420px; }
.modal-card h3 { margin-bottom: 16px; color: var(--brown); }
.modal-card label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--light-text); margin-bottom: 4px; margin-top: 10px; font-weight: 600; }
.modal-card input, .modal-card select { width: 100%; border: 2px solid var(--warm); border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-bottom: 4px; outline: none; font-family: 'DM Sans', sans-serif; }
.modal-card input:focus, .modal-card select:focus { border-color: var(--red); }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn-save { flex: 1; background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 10px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.btn-cancel { flex: 1; background: var(--warm); color: var(--text); border: none; border-radius: 8px; padding: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.form-error { color: var(--red); font-size: 12px; margin-top: 8px; }
.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 13px; }
.btn-danger { color: var(--red); border-color: var(--red); }
</style>
