<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>⚙️ Configuración de la tienda</h2>
      <button class="btn-add" @click="load">🔄 Recargar</button>
    </div>

    <div class="settings-grid">
      <div class="setting-group">
        <h3>🏪 Tienda</h3>
        <label>Nombre</label>
        <input v-model="form.store_name" placeholder="Nombre del negocio">
        <label>Logo de la tienda</label>
        <input type="file" accept="image/*" @change="uploadStoreLogo" style="font-size:12px;padding:4px;margin-bottom:6px">
        <input v-model="form.logo" placeholder="URL del logo (se genera al subir)">
        <label>Rubro</label>
        <select v-model="form.rubro">
          <option value="fiambres">🥩 Fiambrería</option>
          <option value="ferreteria">🔧 Ferretería</option>
          <option value="herramientas">🔧 Herramientas</option>
          <option value="verduleria">🥬 Verdulería</option>
          <option value="carniceria">🥩 Carnicería</option>
          <option value="panaderia">🥐 Panadería</option>
          <option value="libreria">📚 Librería</option>
          <option value="indumentaria">👕 Indumentaria</option>
        </select>
        <label>Tema de colores</label>
        <select v-model="form.theme_preset">
          <option v-for="t in themes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <label>Subtítulo (header)</label>
        <input v-model="form.subtitle" placeholder="Ej: Productos frescos">
        <label>Promo banner</label>
        <input v-model="form.promo" placeholder="Ej: 🎉 Promo del mes">
      </div>

      <div class="setting-group">
        <h3>📞 Contacto</h3>
        <label>WhatsApp</label>
        <input v-model="form.whatsapp" placeholder="Ej: 542934463759">
        <label>Moneda</label>
        <input v-model="form.currency" placeholder="ARS">
      </div>

      <div class="setting-group">
        <h3>🚚 Envíos</h3>
        <label>Envío gratis desde $</label>
        <input v-model="form.shipping_free" type="number" placeholder="25000">
        <label>Costo de envío $</label>
        <input v-model="form.shipping_cost" type="number" placeholder="2000">
      </div>

      <div class="setting-group">
        <h3>📍 Información</h3>
        <label>Horarios</label>
        <input v-model="form.info_hours" placeholder="Ej: Lun a Sáb 8-13 / 17-21">
        <label>Teléfono info</label>
        <input v-model="form.info_phone" placeholder="Teléfono de contacto">
        <label>Info envíos</label>
        <input v-model="form.info_delivery" placeholder="Ej: Consultá disponibilidad">
        <label>Medios de pago</label>
        <input v-model="form.info_payment" placeholder="Ej: Efectivo · Transferencia">
      </div>

      <div class="setting-group">
        <h3>💰 Mercado Pago</h3>
        <label>Alias</label>
        <input v-model="form.mp_alias" placeholder="Ej: tienda.facil.mp">
        <label>CVU</label>
        <input v-model="form.mp_cvu" placeholder="Número de CVU (22 dígitos)">
        <label>Titular</label>
        <input v-model="form.mp_holder" placeholder="Nombre del titular">
      </div>
      <div class="setting-group">
        <h3>🏦 Transferencia bancaria</h3>
        <label>Banco</label>
        <input v-model="form.bank_entity" placeholder="Ej: Banco Nación">
        <label>CBU</label>
        <input v-model="form.bank_cbu" placeholder="Número de CBU (22 dígitos)">
        <label>Alias bancario</label>
        <input v-model="form.bank_alias" placeholder="Ej: tienda.banco.alias">
        <label>Titular</label>
        <input v-model="form.bank_holder" placeholder="Nombre del titular">
      </div>

      <div class="setting-group" v-if="auth.isSuperAdmin" style="border:2px solid var(--red)">
        <h3>⚠️ Sistema</h3>

        <label>Logo principal de Multitienda</label>
        <input type="file" accept="image/*" @change="uploadMainLogo" ref="logoInput" style="font-size:12px;padding:4px;margin-bottom:10px">
        <p v-if="logoMsg" style="font-size:12px;margin-bottom:8px" :style="{color: logoMsg.includes('Error') ? 'var(--red)' : 'green'}">{{ logoMsg }}</p>

        <label style="margin-top:0">Rubro para datos de ejemplo</label>
        <select v-model="resetRubro" style="margin-bottom:10px">
          <option value="ferreteria">🔧 Ferretería</option>
          <option value="herramientas">🔧 Herramientas</option>
        </select>

        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn-outline" @click="cleanData" :disabled="cleaning" style="flex:1">🗑️ Limpiar todo</button>
          <button class="btn-seed" @click="seedData" :disabled="seeding" style="flex:1">🌱 Poblar datos</button>
        </div>

        <button class="btn-danger" @click="resetSystem" :disabled="resetting">{{ resetting ? 'Reseteando...' : '🔄 Reset + Poblar (full)' }}</button>

        <hr style="margin:16px 0;border:none;border-top:1px solid var(--warm)">

        <label>Backup / Restore</label>
        <p style="font-size:12px;color:var(--light-text);margin-bottom:8px">Descargá un backup JSON de todos los datos o restaurá desde uno.</p>
        <button class="btn-backup" @click="downloadBackup" :disabled="backingUp">{{ backingUp ? 'Descargando...' : '⬇️ Descargar backup' }}</button>
        <div style="margin-top:8px">
          <label style="font-size:11px">Restaurar desde archivo JSON</label>
          <input type="file" accept=".json" @change="restoreBackup" ref="fileInput" style="font-size:12px;padding:4px">
        </div>
        <p v-if="sysMsg" class="sys-msg">{{ sysMsg }}</p>
      </div>
    </div>

    <button class="btn-save" @click="save">💾 Guardar configuración</button>
    <p v-if="msg" class="msg">{{ msg }}</p>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'
import { useAuthStore } from '../stores/auth.js'
import { themeOptions } from '../assets/store.config.js'

const auth = useAuthStore()
const form = ref({})
const msg = ref('')
const resetRubro = ref('herramientas')
const themes = themeOptions
const resetting = ref(false)
const cleaning = ref(false)
const seeding = ref(false)
const backingUp = ref(false)
const sysMsg = ref('')
const fileInput = ref(null)
const logoInput = ref(null)
const logoMsg = ref('')

async function uploadMainLogo() {
  const file = logoInput.value?.files?.[0]
  if (!file) return
  logoMsg.value = ''
  const formData = new FormData()
  formData.append('logo', file)
  try {
    const { data } = await api.post('/admin/system/upload-main-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    logoMsg.value = '✅ Logo actualizado. Refrescá la landing page.'
  } catch (e) {
    logoMsg.value = '❌ Error: ' + (e.response?.data?.error || e.message)
  }
}

async function uploadStoreLogo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  try {
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.logo = data.url
  } catch (err) {
    alert('Error al subir logo: ' + (err.response?.data?.error || err.message))
  }
}

async function load() {
  const { data } = await api.get('/settings')
  form.value = Object.keys(data).length ? data : {
    rubro: 'ferreteria',
    store_name: 'Ferretería',
    subtitle: 'Herramientas profesionales · Pedidos por WhatsApp',
    promo: '🔧 Envíos a toda la zona',
    whatsapp: '542934463759',
    currency: 'ARS',
    shipping_free: '50000',
    shipping_cost: '3000',
    info_hours: 'Lunes a Viernes · 8:00–18:00',
    info_phone: '',
    info_delivery: 'Consultá disponibilidad por zona',
    info_payment: 'Efectivo · Transferencia · Tarjeta',
    mp_alias: '',
    mp_cvu: '',
    mp_holder: '',
    bank_entity: '',
    bank_cbu: '',
    bank_alias: '',
    bank_holder: '',
  }
}

async function save() {
  msg.value = ''
  try {
    await api.put('/settings', form.value)
    msg.value = '✅ Configuración guardada.'
  } catch (e) {
    msg.value = '❌ Error al guardar: ' + (e.response?.data?.error || e.message)
  }
}

async function cleanData() {
  if (!confirm('¿Eliminar TODOS los datos (productos, pedidos, reseñas, etc.)?')) return
  cleaning.value = true
  sysMsg.value = ''
  try {
    const { data } = await api.post('/admin/system/clean')
    sysMsg.value = `✅ ${data.message}`
  } catch (e) {
    sysMsg.value = '❌ Error: ' + (e.response?.data?.error || e.message)
  }
  cleaning.value = false
}

async function seedData() {
  if (!confirm(`¿Poblar datos de ejemplo para "${resetRubro.value}"?`)) return
  seeding.value = true
  sysMsg.value = ''
  try {
    const { data } = await api.post('/admin/system/seed', { rubro: resetRubro.value })
    sysMsg.value = `✅ ${data.message}`
  } catch (e) {
    sysMsg.value = '❌ Error: ' + (e.response?.data?.error || e.message)
  }
  seeding.value = false
}

async function resetSystem() {
  if (!confirm(`¿Resetear todo el sistema para el rubro "${resetRubro.value}"? Se borrarán todos los productos, pedidos y reseñas.`)) return
  resetting.value = true
  sysMsg.value = ''
  try {
    const { data } = await api.post('/admin/system/reset', { rubro: resetRubro.value })
    sysMsg.value = `✅ ${data.message}`
  } catch (e) {
    sysMsg.value = '❌ Error al resetear: ' + (e.response?.data?.error || e.message)
  }
  resetting.value = false
}

async function downloadBackup() {
  backingUp.value = true
  sysMsg.value = ''
  try {
    const { data } = await api.get('/admin/system/backup')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    sysMsg.value = '✅ Backup descargado'
  } catch (e) {
    sysMsg.value = '❌ Error al descargar backup: ' + (e.response?.data?.error || e.message)
  }
  backingUp.value = false
}

async function restoreBackup(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!confirm('¿Restaurar desde este archivo? Se borrarán TODOS los datos actuales.')) return
  sysMsg.value = ''
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await api.post('/admin/system/restore', data)
    sysMsg.value = '✅ Restauración completada. Recargá la página.'
  } catch (e) {
    sysMsg.value = '❌ Error al restaurar: ' + (e.response?.data?.error || e.message)
  }
  fileInput.value.value = ''
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.setting-group { background: var(--white); border-radius: var(--radius-sm); padding: 18px; box-shadow: var(--shadow-sm); }
.setting-group h3 { font-size: 14px; color: var(--brown); margin-bottom: 12px; font-family: var(--font-family); }
.setting-group label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--light-text); margin-bottom: 4px; margin-top: 10px; font-weight: 600; }
.setting-group label:first-of-type { margin-top: 0; }
.setting-group input, .setting-group select {
  width: 100%; border: 2px solid var(--warm); border-radius: 8px;
  padding: 9px 12px; font-size: 13px;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  color: var(--text); background: var(--white); outline: none;
}
.setting-group input:focus, .setting-group select:focus { border-color: var(--red); }
.btn-save {
  width: 100%; margin-top: 20px;
  background: var(--red); color: #fff; border: none; border-radius: 12px;
  padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: var(--font-family, 'DM Sans', sans-serif);
}
.msg { text-align: center; font-size: 13px; color: green; margin-top: 12px; }
.sys-msg { text-align: center; font-size: 12px; margin-top: 8px; padding: 8px; border-radius: 8px; }
.sys-msg:not(:empty) { background: var(--cream); }
.btn-danger { width:100%; background: var(--red); color:#fff; border:none; border-radius:8px; padding:10px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.btn-danger:disabled { opacity:0.6; }
.btn-backup { width:100%; background: var(--brown); color:#fff; border:none; border-radius:8px; padding:10px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.btn-backup:disabled { opacity:0.6; }
.btn-outline { background: none; border:2px solid var(--red); color:var(--red); border-radius:8px; padding:10px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.btn-outline:disabled { opacity:0.6; }
.btn-seed { background: #27ae60; color:#fff; border:none; border-radius:8px; padding:10px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
.btn-seed:disabled { opacity:0.6; }
hr { border: none; border-top: 1px solid var(--warm); }
@media (max-width: 600px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
