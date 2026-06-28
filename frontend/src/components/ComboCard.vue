<template>
  <div class="combo-card" :class="{ 'in-cart': inCart }" :style="{ animationDelay: `${index * 0.06}s` }">
    <div class="combo-tag">✨ Combo especial</div>
    <div class="combo-name">{{ combo.emoji }} {{ combo.name }}</div>
    <div class="combo-desc">{{ combo.description }}</div>
    <div class="combo-footer">
      <div class="combo-price">{{ fmt(combo.price) }}</div>
      <button class="combo-add-btn" :class="{ added: inCart }" @click="$emit('toggle', combo.id)">
        {{ inCart ? '✓ Agregado' : 'Agregar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  combo: Object,
  index: Number,
  inCart: Boolean,
})
defineEmits(['toggle'])

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }
</script>

<style scoped>
.combo-card {
  background: linear-gradient(135deg, #4a2510 0%, var(--brown) 50%, #7a4520 100%);
  border-radius: var(--radius);
  padding: 18px 18px 16px;
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
.combo-desc { font-size: 12px; opacity: 0.75; margin-bottom: 12px; line-height: 1.5; font-weight: 300; }
.combo-footer { display: flex; align-items: center; justify-content: space-between; }
.combo-price { font-family: var(--font-family, 'Playfair Display', serif); font-size: 22px; font-weight: 700; color: var(--gold); }
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
}
.combo-add-btn:active { transform: scale(0.95); }
.combo-add-btn.added { background: var(--gold); border-color: var(--gold); color: var(--brown); }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
