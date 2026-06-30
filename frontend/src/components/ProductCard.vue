<template>
  <div v-if="!product" class="product-card product-card-empty">
    <div class="card-body"><p class="card-desc">Producto no disponible</p></div>
  </div>
  <div v-else class="product-card" :class="{ 'in-cart': qty > 0 }">
    <div class="card-image" @click="$emit('show-detail', product)">
      <img v-if="product.image" :src="product.image" :alt="product.name" />
      <div v-else class="card-placeholder">
        <span class="card-emoji-big">{{ product.emoji || '📦' }}</span>
      </div>
      <button class="card-add-mini" v-if="qty === 0" @click.stop="$emit('changeQty', product.id, 1)">+</button>
      <div class="card-qty" v-if="qty > 0">
        <button class="qty-mini" @click.stop="$emit('changeQty', product.id, -1)">−</button>
        <span>{{ qty }}</span>
        <button class="qty-mini" @click.stop="$emit('changeQty', product.id, 1)">+</button>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title" @click="$emit('show-detail', product)">{{ product.name }}</h3>
      <p class="card-desc" v-if="product.description">{{ product.description }}</p>
      <div class="card-bottom">
        <div>
          <span class="card-price">{{ fmt(product.price) }}</span>
          <span class="card-unit" v-if="product.unit && product.unit !== 'unidad'">/{{ product.unit }}</span>
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
  index: Number,
})
defineEmits(['changeQty', 'showDetail'])

const cart = useCartStore()
const qty = computed(() => props.product ? (cart.items[props.product.id] || 0) : 0)

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
  display: flex;
  gap: 0;
}
.product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.card-image {
  width: 110px;
  min-height: 110px;
  flex-shrink: 0;
  background: #f5f0e8;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}
.card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.card-emoji-big { font-size: 36px; }

.card-add-mini {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--red, #c0392b);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.card-qty {
  position: absolute;
  bottom: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--red, #c0392b);
  border-radius: 20px;
  padding: 2px 4px;
}
.card-qty span {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}
.qty-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 4px;
}
.card-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-bottom {
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-price {
  font-size: 17px;
  font-weight: 700;
  color: #c0392b;
}
.card-unit {
  font-size: 11px;
  color: #999;
  margin-left: 2px;
}

@media (min-width: 768px) {
  .product-card { flex-direction: column; }
  .card-image {
    width: 100%;
    min-height: 0;
    aspect-ratio: 1;
  }
  .card-image img { position: static; }
  .card-emoji-big { font-size: 48px; }
  .card-title { font-size: 16px; }
  .card-desc { -webkit-line-clamp: 3; }
  .card-price { font-size: 19px; }
  .card-add-mini { width: 32px; height: 32px; font-size: 20px; }
  .card-qty { bottom: 8px; right: 8px; }
}
</style>