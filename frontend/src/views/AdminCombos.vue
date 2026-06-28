<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>✨ Combos</h2>
      <button class="btn-add" @click="openNew">+ Nuevo</button>
    </div>
    <div class="combo-list">
      <div v-for="c in combos" :key="c.id" class="combo-card-admin">
        <div class="combo-card-header">
          <span class="combo-card-emoji">{{ c.emoji }}</span>
          <div>
            <div class="combo-card-name">{{ c.name }}</div>
            <div class="combo-card-desc">{{ c.description }}</div>
          </div>
        </div>
        <div class="combo-card-products">
          <div v-for="p in c.products" :key="p.id" class="combo-card-product">
            <img v-if="p.image" :src="p.image" class="combo-card-product-img" />
            <span v-else class="combo-card-product-emoji">{{ p.emoji }}</span>
            <span class="combo-card-product-name">{{ p.name }}</span>
            <span class="combo-card-product-price">{{ fmt(p.price) }}</span>
          </div>
        </div>
        <div class="combo-card-footer">
          <div>
            <span class="combo-card-sum">{{ fmt(sumProducts(c.products)) }}</span>
            <span class="combo-card-price"> → {{ fmt(c.price) }}</span>
          </div>
          <div class="combo-card-actions">
            <button class="btn-sm" @click="edit(c)">✏️</button>
            <button class="btn-sm btn-danger" @click="remove(c.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: showForm }" @click="showForm = false">
      <div class="modal modal--tall" @click.stop>
        <h3>{{ editing.id ? 'Editar' : 'Nuevo' }} Combo</h3>
        <input v-model="form.name" placeholder="Nombre del combo">
        <input v-model="form.description" placeholder="Descripción (ej: Incluye 3 productos)">
        <input v-model="form.price" placeholder="Precio del combo" type="number">
        <input v-model="form.emoji" placeholder="Emoji (ej: 🔧🛠️)">

        <label class="product-select-label">Productos incluidos</label>
        <div class="product-select-list">
          <div v-for="p in allProducts" :key="p.id"
            class="product-select-item"
            :class="{ selected: selectedIds.has(p.id) }"
            @click="toggleProduct(p.id)">
            <div class="product-select-check">{{ selectedIds.has(p.id) ? '✅' : '⬜' }}</div>
            <img v-if="p.image" :src="p.image" class="product-select-img" />
            <span v-else class="product-select-emoji">{{ p.emoji }}</span>
            <div class="product-select-info">
              <div class="product-select-name">{{ p.name }}</div>
              <div class="product-select-price">{{ fmt(p.price) }}</div>
            </div>
          </div>
        </div>

        <div class="combo-total-bar" v-if="selectedIds.size > 0">
          <span>Suma individual: {{ fmt(sumSelected) }}</span>
          <span v-if="form.price && sumSelected > Number(form.price)" class="combo-savings">Ahorro: {{ fmt(sumSelected - Number(form.price)) }}</span>
        </div>

        <button class="modal-save-btn" @click="save">{{ editing.id ? 'Actualizar' : 'Crear' }}</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const combos = ref([])
const allProducts = ref([])
const showForm = ref(false)
const editing = ref({})
const selectedIds = ref(new Set())
const form = ref({ name: '', description: '', emoji: '✨', price: '' })

const sumSelected = computed(() => {
  let total = 0
  for (const p of allProducts.value) {
    if (selectedIds.value.has(p.id)) total += Number(p.price)
  }
  return total
})

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
function sumProducts(products) {
  return products.reduce((a, p) => a + Number(p.price), 0)
}

async function load() {
  const [cData, pData] = await Promise.all([
    api.get('/combos/all'),
    api.get('/products')
  ])
  combos.value = cData.data
  allProducts.value = pData.data
}

function openNew() {
  editing.value = {}
  form.value = { name: '', description: '', emoji: '✨', price: '' }
  selectedIds.value = new Set()
  showForm.value = true
}

function edit(c) {
  editing.value = c
  form.value = { name: c.name, description: c.description, emoji: c.emoji, price: c.price }
  selectedIds.value = new Set((c.products || []).map(p => p.id))
  showForm.value = true
}

function toggleProduct(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

async function save() {
  const body = {
    name: form.value.name,
    description: form.value.description,
    emoji: form.value.emoji,
    price: form.value.price,
    product_ids: [...selectedIds.value],
  }
  if (editing.value.id) await api.put(`/combos/${editing.value.id}`, body)
  else await api.post('/combos', body)
  showForm.value = false
  editing.value = {}
  load()
}

async function remove(id) {
  if (confirm('¿Eliminar combo?')) {
    await api.delete(`/combos/${id}`)
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); }

.combo-list { display: flex; flex-direction: column; gap: 12px; }
.combo-card-admin {
  background: var(--white); border-radius: var(--radius-sm); padding: 16px;
  box-shadow: var(--shadow-sm);
}
.combo-card-header { display: flex; gap: 12px; margin-bottom: 10px; }
.combo-card-emoji { font-size: 28px; }
.combo-card-name { font-weight: 700; font-size: 15px; color: var(--text); }
.combo-card-desc { font-size: 12px; color: var(--light-text); margin-top: 2px; }

.combo-card-products { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.combo-card-product {
  display: flex; align-items: center; gap: 8px;
  background: var(--cream); border-radius: 8px; padding: 6px 10px;
}
.combo-card-product-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
.combo-card-product-emoji { font-size: 18px; }
.combo-card-product-name { font-size: 12px; flex: 1; color: var(--text); }
.combo-card-product-price { font-size: 12px; font-weight: 600; color: var(--red); }

.combo-card-footer { display: flex; justify-content: space-between; align-items: center; }
.combo-card-sum { font-size: 11px; color: var(--light-text); text-decoration: line-through; }
.combo-card-price { font-size: 16px; font-weight: 700; color: var(--red); }

.btn-sm { background: none; border: 1px solid var(--warm); border-radius: 8px; padding: 6px 10px; cursor: pointer; margin-right: 4px; }
.btn-danger { border-color: var(--red); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal { background: var(--white); border-radius: 24px; padding: 24px 20px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
.modal h3 { font-family: 'Playfair Display'; color: var(--brown); margin-bottom: 16px; }
.modal input { width: 100%; border: 2px solid var(--warm); border-radius: 12px; padding: 13px 14px; font-size: 14px; font-family: var(--font-family, 'DM Sans', sans-serif); margin-bottom: 12px; outline: none; box-sizing: border-box; }
.modal input:focus { border-color: var(--red); }

.product-select-label { display: block; font-size: 12px; font-weight: 600; color: var(--light-text); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.product-select-list { max-height: 240px; overflow-y: auto; border: 2px solid var(--warm); border-radius: 12px; padding: 4px; margin-bottom: 12px; }
.product-select-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-radius: 8px; cursor: pointer; transition: background 0.1s;
}
.product-select-item:hover { background: var(--cream); }
.product-select-item.selected { background: var(--red-light, #FDECEA); }
.product-select-check { font-size: 14px; flex-shrink: 0; }
.product-select-img { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; }
.product-select-emoji { font-size: 20px; }
.product-select-info { flex: 1; min-width: 0; }
.product-select-name { font-size: 13px; font-weight: 500; color: var(--text); }
.product-select-price { font-size: 11px; color: var(--light-text); }

.combo-total-bar {
  display: flex; justify-content: space-between; font-size: 12px;
  background: var(--cream); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px;
}
.combo-savings { color: var(--red); font-weight: 600; }

.modal-save-btn { width: 100%; background: var(--red); color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
</style>
