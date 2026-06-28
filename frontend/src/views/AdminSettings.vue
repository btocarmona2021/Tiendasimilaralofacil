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
        <label>Rubro</label>
        <select v-model="form.rubro">
          <option value="fiambres">🥩 Fiambrería</option>
          <option value="ferreteria">🔧 Ferretería</option>
          <option value="verduleria">🥬 Verdulería</option>
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
    </div>

    <button class="btn-save" @click="save">💾 Guardar configuración</button>
    <p v-if="msg" class="msg">{{ msg }}</p>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const form = ref({})
const msg = ref('')

async function load() {
  const { data } = await api.get('/settings')
  form.value = Object.keys(data).length ? data : {
    rubro: 'ferreteria',
    store_name: 'A lo Fácil – Ferretería',
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
  await api.put('/settings', form.value)
  msg.value = '✅ Configuración guardada. Recargá la página para ver los cambios.'
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
@media (max-width: 600px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
