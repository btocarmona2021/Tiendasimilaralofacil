<template>
  <div class="modal-overlay" :class="{ open: product }" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">✕</button>
      <div class="modal-image">
        <img v-if="product.image" :src="product.image" :alt="product.name" />
        <span v-else class="modal-emoji">{{ product.emoji }}</span>
      </div>
      <div class="modal-body">
        <h2 class="modal-title">{{ product.name }}</h2>
        <p class="modal-desc" v-if="product.description">{{ product.description }}</p>
        <div class="modal-price-row">
          <span class="modal-price">{{ fmt(product.price) }}</span>
          <span class="modal-unit" v-if="product.unit && product.unit !== 'unidad'">/{{ product.unit }}</span>
        </div>
        <div class="modal-actions">
          <div class="modal-qty" v-if="qty > 0">
            <button class="qty-btn" @click="$emit('changeQty', product.id, -1)">−</button>
            <span>{{ qty }}</span>
            <button class="qty-btn" @click="$emit('changeQty', product.id, 1)">+</button>
          </div>
          <button v-else class="modal-add-btn" @click="$emit('changeQty', product.id, 1)">Agregar al carrito</button>
          <router-link class="modal-detail-link" :to="`/product/${product.id}`">Ver detalle completo →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart.js'

const props = defineProps({
  product: Object,
})
defineEmits(['close', 'changeQty'])

const cart = useCartStore()
const qty = computed(() => (props.product ? cart.items[props.product.id] || 0 : 0))
function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
  padding: 20px;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal-content {
  background: #fff; border-radius: var(--radius);
  max-width: 440px; width: 100%;
  overflow: hidden; position: relative;
  transform: translateY(20px); transition: transform 0.25s;
}
.modal-overlay.open .modal-content { transform: translateY(0); }
.modal-close {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.modal-image {
  width: 100%; aspect-ratio: 1; background: #f5f0e8;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.modal-image img { width: 100%; height: 100%; object-fit: cover; }
.modal-emoji { font-size: 80px; }
.modal-body { padding: 20px; }
.modal-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.modal-desc { font-size: 14px; color: var(--light-text); line-height: 1.5; margin-bottom: 14px; }
.modal-price-row { margin-bottom: 18px; }
.modal-price { font-size: 26px; font-weight: 800; color: var(--red); }
.modal-unit { font-size: 13px; color: var(--light-text); margin-left: 4px; }
.modal-actions { display: flex; flex-direction: column; gap: 10px; }
.modal-qty {
  display: flex; align-items: center; gap: 12px;
  background: var(--cream); border-radius: 50px; padding: 8px 16px;
  justify-content: center;
}
.qty-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: var(--red); color: #fff; font-size: 18px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.modal-qty span { font-size: 18px; font-weight: 700; color: var(--text); min-width: 32px; text-align: center; }
.modal-add-btn {
  width: 100%; background: var(--red); color: #fff; border: none;
  border-radius: 50px; padding: 14px; font-size: 16px; font-weight: 700;
  cursor: pointer; font-family: var(--font-family, 'DM Sans', sans-serif);
}
.modal-detail-link {
  text-align: center; font-size: 13px; color: var(--light-text);
  text-decoration: underline; cursor: pointer;
}
</style>
