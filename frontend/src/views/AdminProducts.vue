<template>
  <AdminLayout>
    <div class="admin-header">
      <h2>📦 Productos</h2>
      <button class="btn-add" @click="openNew">+ Nuevo</button>
    </div>

    <div class="products-grid">
      <div class="product-admin-card" v-for="p in products" :key="p.id">
        <div class="admc-img" @click="edit(p)">
          <img v-if="p.image" :src="p.image" :alt="p.name" />
          <div v-else class="admc-emoji">{{ p.emoji }}</div>
        </div>
        <div class="admc-body">
          <div class="admc-cat">{{ p.category_name }}</div>
          <div class="admc-name">{{ p.name }}</div>
          <div class="admc-desc" v-if="p.description">{{ truncate(p.description, 50) }}</div>
          <div class="admc-price">{{ fmt(p.price) }} <span class="admc-unit" v-if="p.unit">/ {{ p.unit }}</span></div>
          <div class="admc-actions">
            <button class="admc-edit" @click="edit(p)">✏️ Editar</button>
            <button class="admc-del" @click="remove(p.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: showForm }" @click="showForm = false">
      <div class="modal" @click.stop>
        <div class="modal-handle"></div>
        <h3>{{ editing.id ? 'Editar' : 'Nuevo' }} Producto</h3>
        <select v-model="form.category_id">
          <option value="" disabled>— Seleccionar categoría —</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
        </select>
        <input v-model="form.name" placeholder="Nombre del producto">
        <textarea v-model="form.description" placeholder="Descripción (opcional)" rows="3"></textarea>
        <div class="row-inputs">
          <input v-model="form.price" placeholder="Precio $" type="number">
          <input v-model="form.unit" placeholder="Unidad (100g, kg, unidad)">
        </div>
        <input v-model="form.emoji" placeholder="Emoji 📦">
        <div class="image-tabs">
          <button :class="{ active: imageTab === 'url' }" @click="imageTab = 'url'">🔗 URL</button>
          <button :class="{ active: imageTab === 'upload' }" @click="imageTab = 'upload'">📁 Subir</button>
        </div>
        <input v-if="imageTab === 'url'" v-model="form.image" placeholder="URL de imagen (opcional)">
        <div v-if="imageTab === 'upload'" class="upload-area">
          <input type="file" accept="image/*" @change="handleUpload" ref="fileInput">
          <div v-if="uploading" class="upload-progress">Subiendo…</div>
        </div>
        <div class="image-preview" v-if="form.image">
          <img :src="form.image" />
        </div>
        <button class="modal-save-btn" @click="save">{{ editing.id ? 'Actualizar' : 'Crear' }}</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'
import AdminLayout from '../components/AdminLayout.vue'

const products = ref([])
const categories = ref([])
const showForm = ref(false)
const editing = ref({})
const form = ref({ category_id: '', name: '', description: '', price: '', unit: 'unidad', emoji: '📦', image: '' })
const imageTab = ref('url')
const uploading = ref(false)
const fileInput = ref(null)

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
function truncate(s, l) { return s?.length > l ? s.slice(0, l) + '…' : s }

async function load() {
  const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')])
  products.value = p.data
  categories.value = c.data
}

function openNew() {
  editing.value = {}
  form.value = { category_id: '', name: '', description: '', price: '', unit: 'unidad', emoji: '📦', image: '' }
  showForm.value = true
}

function edit(p) {
  editing.value = p
  form.value = {
    category_id: p.category_id,
    name: p.name,
    description: p.description || '',
    price: p.price,
    unit: p.unit || 'unidad',
    emoji: p.emoji || '📦',
    image: p.image || '',
  }
  imageTab.value = p.image ? 'url' : 'upload'
  showForm.value = true
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  const fd = new FormData()
  fd.append('image', file)
  try {
    const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    form.value.image = data.url
    imageTab.value = 'url'
  } catch (err) {
    alert('Error al subir imagen')
  }
  uploading.value = false
}

async function save() {
  const data = { ...form.value, price: parseFloat(form.value.price) || 0 }
  if (editing.value.id) {
    await api.put(`/products/${editing.value.id}`, data)
  } else {
    await api.post('/products', data)
  }
  showForm.value = false
  editing.value = {}
  load()
}

async function remove(id) {
  if (confirm('¿Eliminar producto?')) {
    await api.delete(`/products/${id}`)
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-add { background: var(--red); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.product-admin-card {
  background: var(--white);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--warm);
}
.admc-img {
  width: 100%;
  aspect-ratio: 1;
  background: var(--cream);
  overflow: hidden;
  cursor: pointer;
}
.admc-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admc-emoji {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}
.admc-body { padding: 12px; }
.admc-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--light-text); font-weight: 600; margin-bottom: 2px; }
.admc-name { font-size: 14px; font-weight: 700; color: var(--text); }
.admc-desc { font-size: 11px; color: var(--light-text); margin-top: 4px; }
.admc-price { font-size: 17px; font-weight: 800; color: var(--red); margin-top: 6px; }
.admc-unit { font-size: 11px; font-weight: 400; color: var(--light-text); }
.admc-actions { display: flex; gap: 6px; margin-top: 8px; }
.admc-edit { background: none; border: 1px solid var(--warm); border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); flex: 1; }
.admc-del { background: none; border: 1px solid var(--red); border-radius: 8px; padding: 6px 10px; cursor: pointer; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--white); border-radius: 24px 24px 0 0; padding: 24px 20px;
  padding-bottom: calc(env(safe-area-inset-bottom,0px) + 24px);
  width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
}
.modal-handle { width: 36px; height: 4px; background: var(--warm); border-radius: 2px; margin: 0 auto 20px; }
.modal h3 { font-family: 'Playfair Display'; color: var(--brown); margin-bottom: 16px; }
.modal input, .modal select, .modal textarea {
  width: 100%; border: 2px solid var(--warm); border-radius: 12px;
  padding: 13px 14px; font-size: 14px; font-family: var(--font-family, 'DM Sans', sans-serif);
  margin-bottom: 12px; outline: none; transition: border-color 0.15s;
}
.modal textarea { resize: vertical; font-size: 13px; }
.modal input:focus, .modal select:focus, .modal textarea:focus { border-color: var(--red); }
.row-inputs { display: flex; gap: 10px; }
.row-inputs input { flex: 1; }
.image-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.image-tabs button { flex: 1; padding: 9px; border: 2px solid var(--warm); border-radius: 10px; background: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); color: var(--light-text); transition: 0.15s; }
.image-tabs button.active { border-color: var(--red); color: var(--red); background: var(--red-light); }
.upload-area { margin-bottom: 12px; }
.upload-area input[type="file"] { width: 100%; padding: 20px; border: 2px dashed var(--warm); border-radius: 12px; cursor: pointer; font-size: 13px; font-family: var(--font-family, 'DM Sans', sans-serif); }
.upload-progress { text-align: center; font-size: 13px; color: var(--light-text); padding: 8px; }
.image-preview { margin-bottom: 12px; border-radius: 12px; overflow: hidden; }
.image-preview img { width: 100%; max-height: 160px; object-fit: cover; border-radius: 12px; }
.modal-save-btn { width: 100%; background: var(--red); color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif); }
</style>