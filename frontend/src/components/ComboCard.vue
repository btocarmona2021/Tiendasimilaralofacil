<template>
  <div class="combo-card" :class="{ 'in-cart': inCart }" :style="{ animationDelay: `${index * 0.06}s` }">
    <div class="combo-tag">✨ Combo especial</div>
    <div class="combo-name">{{ combo.emoji }} {{ combo.name }}</div>
    <p class="combo-desc">{{ combo.description }}</p>

    <div class="combo-products">
      <div v-for="p in combo.products" :key="p.id" class="combo-product">
        <div class="combo-product-img-wrap">
          <img v-if="p.image" :src="p.image" :alt="p.name" class="combo-product-img" />
          <span v-else class="combo-product-emoji">{{ p.emoji }}</span>
        </div>
        <div class="combo-product-info">
          <div class="combo-product-name">{{ p.name }}</div>
          <div class="combo-product-price">{{ fmt(p.price) }}</div>
        </div>
      </div>
    </div>

    <div class="combo-footer">
      <div>
        <div class="combo-sums">
          <span class="combo-sum-individual">{{ fmt(sumProducts) }}</span>
          <span class="combo-sum-arrow"> → </span>
          <span class="combo-sum-bundle">{{ fmt(combo.price) }}</span>
        </div>
        <div v-if="sumProducts > combo.price" class="combo-savings">Ahorrás {{ fmt(sumProducts - combo.price) }}</div>
      </div>
      <button class="combo-add-btn" :class="{ added: inCart }" @click="$emit('toggle', combo.id)">
        {{ inCart ? '✓ Agregado' : 'Agregar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  combo: Object,
  index: Number,
  inCart: Boolean,
})
defineEmits(['toggle'])

const sumProducts = computed(() =>
  (props.combo.products || []).reduce((a, p) => a + Number(p.price), 0)
)

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
</script>

<style scoped>
.combo-card {
  background: linear-gradient(135deg, #4a2510 0%, var(--brown) 50%, #7a4520 100%);
  border-radius: var(--radius);
  padding: 18px;
  color: #fff;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  box-shadow: var(--shadow-md);
  animation: fadeSlideIn 0.3s ease both;
}
.combo-card::before {
  content: '';
  position: absolute;
  top: -30px; right: -30px;
  width: 100px; height: 100px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}
.combo-card.in-cart { border-color: var(--gold); box-shadow: 0 4px 20px rgba(212,168,67,0.3); }
.combo-tag {
  display: inline-block;
  background: var(--gold);
  color: var(--brown);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 10px;
  margin-bottom: 8px;
}
.combo-name { font-family: var(--font-family, 'Playfair Display', serif); font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.combo-desc { font-size: 12px; opacity: 0.75; margin-bottom: 10px; line-height: 1.5; font-weight: 300; }

.combo-products { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.combo-product {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px; padding: 8px 10px;
}
.combo-product-img-wrap { flex-shrink: 0; }
.combo-product-img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
.combo-product-emoji { font-size: 24px; }
.combo-product-info { flex: 1; min-width: 0; }
.combo-product-name { font-size: 13px; font-weight: 500; }
.combo-product-price { font-size: 11px; opacity: 0.7; }

.combo-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.combo-sums { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.combo-sum-individual { font-size: 12px; opacity: 0.6; text-decoration: line-through; }
.combo-sum-arrow { font-size: 12px; opacity: 0.6; }
.combo-sum-bundle { font-family: var(--font-family, 'Playfair Display', serif); font-size: 20px; font-weight: 700; color: var(--gold); }
.combo-savings { font-size: 11px; color: #7fdb8a; font-weight: 600; margin-top: 2px; }
.combo-add-btn {
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.35);
  color: #fff;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.combo-add-btn:active { transform: scale(0.95); }
.combo-add-btn.added { background: var(--gold); border-color: var(--gold); color: var(--brown); }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
