<template>
  <div class="detail-page">
    <div class="detail-header">
      <button class="detail-back" @click="goBack">← Volver</button>
    </div>
    <div v-if="loading" class="detail-loading">Cargando...</div>
    <div v-else-if="error" class="detail-error">{{ error }}</div>
    <template v-else-if="product">
      <div class="detail-image">
        <img v-if="product.image" :src="product.image" :alt="product.name" />
        <span v-else class="detail-emoji">{{ product.emoji }}</span>
      </div>
      <div class="detail-body">
        <span class="detail-category">{{ product.category_name }}</span>
        <h1 class="detail-title">{{ product.name }}</h1>
        <p class="detail-desc" v-if="product.description">{{ product.description }}</p>
        <div class="detail-price-row">
          <span class="detail-price">{{ fmt(product.price) }}</span>
          <span class="detail-unit" v-if="product.unit && product.unit !== 'unidad'">/{{ product.unit }}</span>
        </div>
        <div class="detail-actions">
          <div class="detail-qty" v-if="qty > 0">
            <button class="qty-btn" @click="change(-1)">−</button>
            <span>{{ qty }}</span>
            <button class="qty-btn" @click="change(1)">+</button>
          </div>
          <button v-else class="detail-add-btn" @click="change(1)">Agregar al carrito</button>
        </div>
      </div>
    </template>
    <CartFab />
    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart.js'
import api from '../services/api.js'
import CartFab from '../components/CartFab.vue'
import CartDrawer from '../components/CartDrawer.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref('')

const qty = computed(() => (product.value ? cart.items[product.value.id] || 0 : 0))

function change(delta) {
  if (!product.value) return
  cart.changeQty(product.value.id, delta)
}

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/products/${route.params.id}`)
    product.value = data
  } catch (e) {
    error.value = 'Producto no encontrado'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page {
  max-width: 480px; margin: 0 auto;
  padding: 0 0 120px; min-height: 100vh;
  background: var(--cream);
}
.detail-header {
  position: sticky; top: 0; z-index: 10;
  background: var(--cream); padding: 16px;
}
.detail-back {
  background: var(--white); border: 1px solid var(--warm);
  border-radius: 50px; padding: 8px 18px; font-size: 14px;
  font-weight: 600; color: var(--text); cursor: pointer;
  font-family: var(--font-family, 'DM Sans', sans-serif);
}
.detail-loading, .detail-error {
  text-align: center; padding: 60px 20px;
  font-size: 16px; color: var(--light-text);
}
.detail-image {
  width: 100%; aspect-ratio: 1; background: #f5f0e8;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; border-radius: 0;
}
.detail-image img { width: 100%; height: 100%; object-fit: cover; }
.detail-emoji { font-size: 100px; }
.detail-body { padding: 24px 20px; }
.detail-category {
  display: inline-block; font-size: 11px; font-weight: 600;
  color: var(--light-text); letter-spacing: 1.5px; text-transform: uppercase;
  background: var(--warm); padding: 4px 12px; border-radius: 10px;
  margin-bottom: 10px;
}
.detail-title {
  font-family: var(--font-family, 'Playfair Display', serif);
  font-size: 28px; font-weight: 800; color: var(--text);
  margin-bottom: 10px;
}
.detail-desc {
  font-size: 15px; color: var(--light-text); line-height: 1.6;
  margin-bottom: 20px;
}
.detail-price-row { margin-bottom: 24px; }
.detail-price { font-size: 34px; font-weight: 800; color: var(--red); }
.detail-unit { font-size: 16px; color: var(--light-text); margin-left: 6px; }
.detail-actions { display: flex; flex-direction: column; gap: 12px; }
.detail-qty {
  display: flex; align-items: center; gap: 12px;
  background: var(--white); border-radius: 50px; padding: 10px 20px;
  justify-content: center; box-shadow: var(--shadow-sm);
}
.detail-qty .qty-btn {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--red); color: #fff; font-size: 20px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.detail-qty span { font-size: 20px; font-weight: 700; color: var(--text); min-width: 36px; text-align: center; }
.detail-add-btn {
  width: 100%; background: var(--red); color: #fff; border: none;
  border-radius: 50px; padding: 16px; font-size: 18px; font-weight: 700;
  cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif);
}
@media (min-width: 768px) {
  .detail-page { max-width: 800px; padding: 20px 20px 120px; }
  .detail-image { max-width: 600px; margin: 0 auto; border-radius: var(--radius); }
  .detail-body { max-width: 600px; margin: 0 auto; }
}
</style>
