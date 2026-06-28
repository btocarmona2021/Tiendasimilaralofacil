<template>
  <button class="cart-fab" :class="{ visible: cart.totalItems > 0 }" @click="openCart">
    🛒 Ver carrito
    <span class="cart-fab-badge">{{ cart.totalItems }}</span>
  </button>
</template>

<script setup>
import { useCartStore } from '../stores/cart.js'
const cart = useCartStore()

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open')
  document.getElementById('cartDrawer')?.classList.add('open')
}
</script>

<style scoped>
.cart-fab {
  position: fixed;
  bottom: 24px; right: 20px;
  z-index: 100;
  background: var(--red);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 14px 22px;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 24px rgba(192,57,43,0.45);
  transform: translateY(120px);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cart-fab.visible { transform: translateY(0); }
.cart-fab-badge {
  background: #fff;
  color: var(--red);
  border-radius: 50%;
  width: 22px; height: 22px;
  font-size: 12px;
  font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
</style>
