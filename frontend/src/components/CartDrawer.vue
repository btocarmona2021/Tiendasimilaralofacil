<template>
  <div class="cart-overlay" id="cartOverlay" @click="closeCart"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-drawer-handle"></div>
    <div class="cart-drawer-header">🛒 Tu pedido</div>
    <div class="cart-items">
      <div class="cart-item" v-for="item in cartItems" :key="'p'+item.id">
        <div class="cart-item-emoji">{{ item.emoji }}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">{{ item.name }}</div>
          <div class="cart-item-sub">{{ fmt(item.price) }} x {{ item.qty }}</div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-price">{{ fmt(item.price * item.qty) }}</div>
          <div class="cart-item-actions">
            <button class="cart-qty-btn" @click="cart.changeQty(item.id, -1)">−</button>
            <span class="cart-qty-num">{{ item.qty }}</span>
            <button class="cart-qty-btn" @click="cart.changeQty(item.id, 1)">+</button>
            <button class="cart-remove-btn" @click="cart.changeQty(item.id, -999)">🗑️</button>
          </div>
        </div>
      </div>
      <div class="cart-item" v-for="item in comboItems" :key="'c'+item.id">
        <div class="cart-item-emoji">{{ item.emoji }}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">{{ item.name }}</div>
          <div class="cart-item-sub">{{ item.products?.length || 0 }} productos</div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-price">{{ fmt(item.price) }}</div>
          <button class="cart-remove-btn" @click="cart.toggleCombo(item.id)">🗑️</button>
        </div>
      </div>
      <div v-if="cart.totalItems === 0" style="text-align:center;padding:40px 0;color:var(--light-text);font-size:14px">
        🛒 Tu carrito está vacío
      </div>
    </div>
    <div class="cart-drawer-footer">
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{ fmt(cart.subtotal) }}</span>
        </div>
        <div class="summary-row">
          <span>🚚 Envío</span>
          <span v-if="costoEnvio === 0" style="color:green;font-weight:700">¡Gratis!</span>
          <span v-else>{{ fmt(costoEnvio) }}</span>
        </div>
        <div class="summary-row" v-if="cart.descuentoCodigo > 0" style="color:var(--red)">
          <span>🏷️ Descuento</span>
          <span>-{{ fmt(cart.descuentoCodigo) }}</span>
        </div>
        <div class="total-row">
          <span>Total</span>
          <span>{{ fmt(totalConEnvio) }}</span>
        </div>
      </div>

      <div class="discount-input">
        <input type="text" v-model="codigoInput" placeholder="¿Tenés un código? Ingresalo acá">
        <button @click="aplicarCodigo">OK</button>
      </div>

      <div class="order-form">
        <div class="form-group">
          <label>👤 Tu nombre</label>
          <input type="text" v-model="nombre" placeholder="Ej: Juan Pérez">
        </div>
        <div class="form-group">
          <label>📞 Tu teléfono</label>
          <input type="tel" v-model="telefono" placeholder="Ej: 2934 123456">
        </div>
        <div class="form-group">
          <label>🚚 ¿Cómo recibís el pedido?</label>
          <select v-model="tipoEntrega" @change="toggleDireccion">
            <option value="retiro">🏪 Retiro en el local</option>
            <option value="envio">🏠 Envío a domicilio</option>
          </select>
        </div>
        <div class="form-group" v-if="tipoEntrega === 'envio'">
          <label>📍 Dirección de envío</label>
          <input type="text" v-model="direccion" placeholder="Ej: San Martín 450">
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>📅 Fecha</label>
            <input type="date" v-model="fecha">
          </div>
          <div class="form-group" style="flex:1">
            <label>🕐 Horario</label>
            <select v-model="horario">
              <option value="">-- Elegí --</option>
              <option>8:00 - 9:00</option>
              <option>9:00 - 10:00</option>
              <option>10:00 - 11:00</option>
              <option>11:00 - 12:00</option>
              <option>12:00 - 13:00</option>
              <option>17:00 - 18:00</option>
              <option>18:00 - 19:00</option>
              <option>19:00 - 20:00</option>
              <option>20:00 - 21:00</option>
            </select>
          </div>
        </div>
      </div>

      <button v-if="cart.totalItems > 0" class="clear-btn" @click="cart.clear(); closeCart()">🗑️ Vaciar carrito</button>

      <button class="whatsapp-btn" @click="sendWhatsApp" :disabled="enviando">
        <svg class="whatsapp-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Pedir por WhatsApp
      </button>

      <div class="mp-transfer-section" v-if="mpAlias">
        <button class="transfer-btn" @click="showTransfer = !showTransfer">
          <svg class="transfer-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Pagar con alias MP
        </button>
        <div class="transfer-data" v-if="showTransfer">
          <div class="transfer-row">
            <span class="transfer-label">Alias:</span>
            <span class="transfer-value">{{ mpAlias }}</span>
            <button class="copy-btn" @click="copy(mpAlias)">Copiar</button>
          </div>
          <div class="transfer-row" v-if="mpCvu">
            <span class="transfer-label">CVU:</span>
            <span class="transfer-value">{{ mpCvu }}</span>
            <button class="copy-btn" @click="copy(mpCvu)">Copiar</button>
          </div>
          <div class="transfer-row" v-if="mpHolder">
            <span class="transfer-label">Titular:</span>
            <span class="transfer-value">{{ mpHolder }}</span>
          </div>
          <p class="transfer-hint">Pagá desde la app de Mercado Pago con el alias o CVU</p>
          <button class="transfer-paid-btn" @click="sendTransferWA" :disabled="enviando">✅ Ya transferí — enviar pedido</button>
        </div>
      </div>

      <div class="bank-transfer-section" v-if="bankCbu">
        <button class="bank-btn" @click="showBank = !showBank">
          <svg class="bank-icon" viewBox="0 0 24 24"><path d="M12 2L2 7v1h20V7l-10-5zM4 10v7h2v-7H4zm6 0v7h2v-7h-2zm-6 9v2h20v-2H4zm12-9v7h2v-7h-2z"/></svg>
          Pagar por banco (CBU)
        </button>
        <div class="transfer-data bank-data" v-if="showBank">
          <div class="transfer-row" v-if="bankEntity">
            <span class="transfer-label">Banco:</span>
            <span class="transfer-value">{{ bankEntity }}</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">CBU:</span>
            <span class="transfer-value">{{ bankCbu }}</span>
            <button class="copy-btn" @click="copy(bankCbu)">Copiar</button>
          </div>
          <div class="transfer-row" v-if="bankAlias">
            <span class="transfer-label">Alias:</span>
            <span class="transfer-value">{{ bankAlias }}</span>
            <button class="copy-btn" @click="copy(bankAlias)">Copiar</button>
          </div>
          <div class="transfer-row" v-if="bankHolder">
            <span class="transfer-label">Titular:</span>
            <span class="transfer-value">{{ bankHolder }}</span>
          </div>
          <p class="transfer-hint">Transferí desde tu banco y confirmá tu pedido</p>
          <button class="transfer-paid-btn" @click="sendBankWA" :disabled="enviando">✅ Ya transferí — enviar pedido</button>
        </div>
      </div>

      <button class="mp-btn" @click="pagarMP" :disabled="enviando">
        <svg class="mp-icon" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.301 0-9.6-4.299-9.6-9.6S6.699 2.4 12 2.4s9.6 4.299 9.6 9.6-4.299 9.6-9.6 9.6zm-1.2-15.6h2.4v7.2h-2.4V6zm0 8.4h2.4v2.4h-2.4v-2.4z"/></svg>
        Pagar con Mercado Pago online
      </button>

      <div v-if="mpError" class="mp-error">{{ mpError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart.js'
import api from '../services/api.js'

const cart = useCartStore()
const codigoInput = ref('')
const nombre = ref(localStorage.getItem('checkout_nombre') || '')
const telefono = ref(localStorage.getItem('checkout_telefono') || '')
const tipoEntrega = ref('retiro')
const direccion = ref('')
const fecha = ref('')
const horario = ref('')
const whatsapp = ref('')
const ENVIO_GRATIS_DESDE = ref(50000)
const COSTO_ENVIO = ref(3000)
const enviando = ref(false)
const mpError = ref('')
const mpAlias = ref('')
const mpCvu = ref('')
const mpHolder = ref('')
const bankEntity = ref('')
const bankCbu = ref('')
const bankAlias = ref('')
const bankHolder = ref('')
const showTransfer = ref(false)
const showBank = ref(false)
const copiado = ref('')

const cartItems = computed(() => {
  const items = []
  for (const [id, qty] of Object.entries(cart.items)) {
    const p = cart.productsMap[Number(id)]
    if (p) items.push({ ...p, qty })
  }
  return items
})

const comboItems = computed(() => {
  const items = []
  for (const [cid, active] of Object.entries(cart.combos)) {
    if (active) {
      const c = cart.combosMap[cid]
      if (c) items.push(c)
    }
  }
  return items
})

const costoEnvio = computed(() => {
  if (tipoEntrega.value !== 'envio') return 0
  return cart.subtotal >= ENVIO_GRATIS_DESDE.value ? 0 : COSTO_ENVIO.value
})

const totalConEnvio = computed(() => cart.subtotal + costoEnvio.value - cart.descuentoCodigo)

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open')
  document.getElementById('cartDrawer')?.classList.remove('open')
}

function toggleDireccion() {}

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

async function aplicarCodigo() {
  if (!codigoInput.value.trim()) return
  try {
    const { data } = await api.post('/discount-codes/validate', { code: codigoInput.value.trim() })
    cart.descuentoCodigo = Number(data.discount_amount)
    cart.codigoAplicado = data
    alert(`✅ Código aplicado. Descuento de ${fmt(cart.descuentoCodigo)}`)
  } catch {
    alert('Código inválido o ya usado.')
  }
}

function validarForm() {
  if (!nombre.value || !telefono.value) {
    alert('Completá tu nombre y teléfono')
    return false
  }
  if (!fecha.value || !horario.value) {
    alert('Seleccioná fecha y horario')
    return false
  }
  return true
}

async function sendWhatsApp() {
  if (!validarForm()) return
  enviando.value = true

  localStorage.setItem('checkout_nombre', nombre.value)
  localStorage.setItem('checkout_telefono', telefono.value)

  const lines = ['🛒 *Nuevo Pedido*', '']
  for (const item of cartItems.value) {
    lines.push(`• ${item.emoji} ${item.name} x${item.qty} = ${fmt(item.price * item.qty)}`)
  }
  for (const item of comboItems.value) {
    lines.push(`• ${item.emoji} ${item.name} (Combo) = ${fmt(item.price)}`)
  }
  lines.push('')
  lines.push(`📦 Subtotal: ${fmt(cart.subtotal)}`)
  if (costoEnvio.value > 0) lines.push(`🚚 Envío: ${fmt(costoEnvio.value)}`)
  else if (tipoEntrega.value === 'envio') lines.push('🚚 Envío: ¡Gratis!')
  lines.push(`💰 *Total: ${fmt(totalConEnvio.value)}*`)
  lines.push('')
  lines.push(`👤 ${nombre.value}`)
  lines.push(`📞 ${telefono.value}`)
  if (tipoEntrega.value === 'envio') lines.push(`📍 ${direccion.value}`)
  else lines.push('🏪 Retiro en el local')
  lines.push(`📅 ${fecha.value} · ${horario.value}`)

  const msg = encodeURIComponent(lines.join('\n'))
  window.open(`https://wa.me/${whatsapp.value.replace(/\D/g, '')}?text=${msg}`, '_blank')

  try {
    await api.post('/orders', {
      customer_name: nombre.value,
      customer_phone: telefono.value,
      delivery_type: tipoEntrega.value,
      address: direccion.value || null,
      pickup_date: fecha.value,
      pickup_time: horario.value,
      items: cartItems.value.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.qty, unit_price: i.price })),
      combos: comboItems.value.map(i => ({ combo_id: i.id, combo_name: i.name, price: i.price })),
      subtotal: cart.subtotal,
      shipping: costoEnvio.value,
      discount: cart.descuentoCodigo,
      total: totalConEnvio.value,
    })

    if (cart.codigoAplicado) {
      await api.post('/discount-codes/mark-used', { id: cart.codigoAplicado.id })
    }

    cart.clear()
    closeCart()
  } catch (err) {
    console.error('Error al guardar pedido:', err)
  }
  enviando.value = false
}

async function pagarMP() {
  if (!validarForm()) return
  enviando.value = true
  mpError.value = ''

  localStorage.setItem('checkout_nombre', nombre.value)
  localStorage.setItem('checkout_telefono', telefono.value)

  try {
    const { data } = await api.post('/mercadopago/create-preference', {
      items: cartItems.value.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.qty, unit_price: i.price })),
      combos: comboItems.value.map(i => ({ combo_id: i.id, combo_name: i.name, price: i.price })),
      subtotal: cart.subtotal,
      shipping: costoEnvio.value,
      discount: cart.descuentoCodigo,
      total: totalConEnvio.value,
      customer_name: nombre.value,
      customer_phone: telefono.value,
      delivery_type: tipoEntrega.value,
      address: direccion.value || null,
      pickup_date: fecha.value,
      pickup_time: horario.value,
    })

    if (data.init_point) {
      window.location.href = data.init_point
    }
  } catch (err) {
    mpError.value = 'Error al conectar con Mercado Pago. Probá con WhatsApp.'
  }
  enviando.value = false
}

function copy(text) {
  navigator.clipboard.writeText(text)
  copiado.value = text
  setTimeout(() => copiado.value = '', 2000)
}

async function sendTransferWA() {
  if (!validarForm()) return
  enviando.value = true
  localStorage.setItem('checkout_nombre', nombre.value)
  localStorage.setItem('checkout_telefono', telefono.value)

  const lines = ['🛒 *Nuevo Pedido (Transferencia MP)*', '']
  for (const item of cartItems.value) {
    lines.push(`• ${item.emoji} ${item.name} x${item.qty} = ${fmt(item.price * item.qty)}`)
  }
  for (const item of comboItems.value) {
    lines.push(`• ${item.emoji} ${item.name} (Combo) = ${fmt(item.price)}`)
  }
  lines.push('')
  lines.push(`📦 Subtotal: ${fmt(cart.subtotal)}`)
  if (costoEnvio.value > 0) lines.push(`🚚 Envío: ${fmt(costoEnvio.value)}`)
  else if (tipoEntrega.value === 'envio') lines.push('🚚 Envío: ¡Gratis!')
  lines.push(`💰 *Total: ${fmt(totalConEnvio.value)}*`)
  lines.push('')
  lines.push(`👤 ${nombre.value}`)
  lines.push(`📞 ${telefono.value}`)
  if (tipoEntrega.value === 'envio') lines.push(`📍 ${direccion.value}`)
  else lines.push('🏪 Retiro en el local')
  lines.push(`📅 ${fecha.value} · ${horario.value}`)
  lines.push('')
  lines.push(`💳 Transferencia MP a: ${mpAlias.value}`)
  lines.push('✅ Ya transferí — confirmar pedido')

  const msg = encodeURIComponent(lines.join('\n'))
  window.open(`https://wa.me/${whatsapp.value.replace(/\D/g, '')}?text=${msg}`, '_blank')

  try {
    await api.post('/orders', {
      customer_name: nombre.value,
      customer_phone: telefono.value,
      delivery_type: tipoEntrega.value,
      address: direccion.value || null,
      pickup_date: fecha.value,
      pickup_time: horario.value,
      items: cartItems.value.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.qty, unit_price: i.price })),
      combos: comboItems.value.map(i => ({ combo_id: i.id, combo_name: i.name, price: i.price })),
      subtotal: cart.subtotal,
      shipping: costoEnvio.value,
      discount: cart.descuentoCodigo,
      total: totalConEnvio.value,
    })

    if (cart.codigoAplicado) {
      await api.post('/discount-codes/mark-used', { id: cart.codigoAplicado.id })
    }

    cart.clear()
    closeCart()
  } catch (err) {
    console.error('Error al guardar pedido:', err)
  }
  enviando.value = false
}

async function sendBankWA() {
  if (!validarForm()) return
  enviando.value = true
  localStorage.setItem('checkout_nombre', nombre.value)
  localStorage.setItem('checkout_telefono', telefono.value)

  const lines = ['🛒 *Nuevo Pedido (Transferencia Bancaria)*', '']
  for (const item of cartItems.value) {
    lines.push(`• ${item.emoji} ${item.name} x${item.qty} = ${fmt(item.price * item.qty)}`)
  }
  for (const item of comboItems.value) {
    lines.push(`• ${item.emoji} ${item.name} (Combo) = ${fmt(item.price)}`)
  }
  lines.push('')
  lines.push(`📦 Subtotal: ${fmt(cart.subtotal)}`)
  if (costoEnvio.value > 0) lines.push(`🚚 Envío: ${fmt(costoEnvio.value)}`)
  else if (tipoEntrega.value === 'envio') lines.push('🚚 Envío: ¡Gratis!')
  lines.push(`💰 *Total: ${fmt(totalConEnvio.value)}*`)
  lines.push('')
  lines.push(`👤 ${nombre.value}`)
  lines.push(`📞 ${telefono.value}`)
  if (tipoEntrega.value === 'envio') lines.push(`📍 ${direccion.value}`)
  else lines.push('🏪 Retiro en el local')
  lines.push(`📅 ${fecha.value} · ${horario.value}`)
  lines.push('')
  lines.push(`💳 Transferencia bancaria a: ${bankCbu.value}`)
  lines.push('✅ Ya transferí — confirmar pedido')

  const msg = encodeURIComponent(lines.join('\n'))
  window.open(`https://wa.me/${whatsapp.value.replace(/\D/g, '')}?text=${msg}`, '_blank')

  try {
    await api.post('/orders', {
      customer_name: nombre.value,
      customer_phone: telefono.value,
      delivery_type: tipoEntrega.value,
      address: direccion.value || null,
      pickup_date: fecha.value,
      pickup_time: horario.value,
      items: cartItems.value.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.qty, unit_price: i.price })),
      combos: comboItems.value.map(i => ({ combo_id: i.id, combo_name: i.name, price: i.price })),
      subtotal: cart.subtotal,
      shipping: costoEnvio.value,
      discount: cart.descuentoCodigo,
      total: totalConEnvio.value,
    })

    if (cart.codigoAplicado) {
      await api.post('/discount-codes/mark-used', { id: cart.codigoAplicado.id })
    }

    cart.clear()
    closeCart()
  } catch (err) {
    console.error('Error al guardar pedido:', err)
  }
  enviando.value = false
}

onMounted(async () => {
  try {
    const { data } = await api.get('/config')
    whatsapp.value = data.whatsapp || whatsapp.value
    ENVIO_GRATIS_DESDE.value = Number(data.shipping_free) || ENVIO_GRATIS_DESDE.value
    COSTO_ENVIO.value = Number(data.shipping_cost) || COSTO_ENVIO.value
    mpAlias.value = data.mp_alias || ''
    mpCvu.value = data.mp_cvu || ''
    mpHolder.value = data.mp_holder || ''
    bankEntity.value = data.bank_entity || ''
    bankCbu.value = data.bank_cbu || ''
    bankAlias.value = data.bank_alias || ''
    bankHolder.value = data.bank_holder || ''
  } catch {}
})
</script>

<style scoped>
.cart-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  opacity: 0; pointer-events: none;
  transition: opacity 0.25s;
}
.cart-overlay.open { opacity: 1; pointer-events: all; }
.cart-drawer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 201;
  background: var(--white);
  border-radius: 24px 24px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  max-width: 480px;
  margin: 0 auto;
}
.cart-drawer.open { transform: translateY(0); }
.cart-drawer-handle {
  width: 36px; height: 4px;
  background: var(--warm);
  border-radius: 2px;
  margin: 14px auto 0;
  flex-shrink: 0;
}
.cart-drawer-header {
  padding: 14px 20px 10px;
  font-family: var(--font-family, 'Playfair Display', serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--brown);
  flex-shrink: 0;
  border-bottom: 1px solid var(--warm);
}
.cart-items {
  overflow-y: auto;
  flex: 1;
  padding: 10px 16px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--warm);
}
.cart-item:last-child { border-bottom: none; }
.cart-item-emoji { font-size: 26px; }
.cart-item-info { flex: 1; }
.cart-item-name { font-size: 14px; font-weight: 600; color: var(--text); }
.cart-item-sub  { font-size: 12px; color: var(--light-text); margin-top: 2px; }
.cart-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.cart-item-price { font-size: 14px; font-weight: 700; color: var(--red); }
.cart-item-actions { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.cart-qty-btn {
  width: 26px; height: 26px; border-radius: 8px; border: none;
  background: var(--red); color: #fff; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.cart-qty-btn:active { background: var(--red-dark); }
.cart-qty-num { font-size: 13px; font-weight: 700; min-width: 18px; text-align: center; }
.cart-remove-btn {
  background: none; border: none; font-size: 14px; cursor: pointer;
  padding: 2px; opacity: 0.5; transition: opacity 0.15s;
}
.cart-remove-btn:hover { opacity: 1; }
.cart-drawer-footer {
  padding: 14px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  border-top: 1px solid var(--warm);
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 60vh;
}

.cart-summary {
  background: var(--cream);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-bottom: 10px;
}
.summary-row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--light-text);
  padding: 3px 0;
}
.total-row {
  display: flex; justify-content: space-between;
  font-size: 16px; font-weight: 700; color: var(--text);
  padding-top: 8px;
  margin-top: 6px;
  border-top: 1px solid var(--warm);
}
.total-row span:last-child { color: var(--red); font-size: 20px; }

.discount-input {
  display: flex; gap: 8px; margin-bottom: 10px;
}
.discount-input input {
  flex: 1; border: 2px solid var(--warm); border-radius: 10px;
  padding: 10px 12px; font-size: 13px;
  font-family: 'DM Sans', sans-serif; color: var(--text); outline: none;
}
.discount-input button {
  background: var(--gold); color: var(--brown);
  border: none; border-radius: 10px; padding: 10px 14px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

.order-form {
  background: var(--cream);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-bottom: 10px;
}
.form-group { margin-bottom: 10px; }
.form-group:last-child { margin-bottom: 0; }
.form-row { display: flex; gap: 10px; }
.form-group label {
  font-size: 11px; font-weight: 600;
  color: var(--light-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block; margin-bottom: 5px;
}
.form-group input, .form-group select {
  width: 100%;
  border: 2px solid var(--warm);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  background: var(--white);
  outline: none;
}
.form-group input:focus, .form-group select:focus { border-color: var(--red); }

.whatsapp-btn {
  background: #25D366;
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 15px 28px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37,211,102,0.4);
  margin-bottom: 8px;
}
.whatsapp-icon { width: 20px; height: 20px; fill: #fff; }

.mp-btn {
  background: #009EE3;
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 15px 28px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,158,227,0.4);
}
.mp-icon { width: 20px; height: 20px; fill: #fff; }
.mp-error { color: var(--red); font-size: 12px; text-align: center; margin-top: 6px; }

.clear-btn {
  width: 100%; background: none; border: 1.5px solid var(--red); color: var(--red);
  border-radius: var(--radius); padding: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 8px;
}

.mp-transfer-section { margin-bottom: 8px; }
.transfer-btn {
  width: 100%; background: #00A650; color: #fff;
  border: none; border-radius: var(--radius); padding: 14px;
  font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; gap: 10px;
  justify-content: center; box-shadow: 0 4px 20px rgba(0,166,80,0.35);
}
.transfer-icon { width: 20px; height: 20px; fill: #fff; }
.transfer-data {
  background: #f0faf0; border: 2px solid #00A650; border-radius: var(--radius-sm);
  padding: 14px; margin-top: 8px;
}
.transfer-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
.transfer-label { font-weight: 600; color: #333; flex-shrink: 0; min-width: 40px; }
.transfer-value { color: #00A650; font-weight: 700; font-size: 14px; word-break: break-all; flex: 1; }
.copy-btn {
  background: #00A650; color: #fff; border: none; border-radius: 6px;
  padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; flex-shrink: 0;
}
.copy-btn:active { opacity: 0.7; }
.transfer-hint { font-size: 11px; color: #666; margin: 8px 0 10px; text-align: center; }
.transfer-paid-btn {
  width: 100%; background: #00A650; color: #fff; border: none;
  border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
}
.transfer-paid-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.whatsapp-btn:disabled, .mp-btn:disabled, .transfer-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.bank-transfer-section { margin-bottom: 8px; }
.bank-btn {
  width: 100%; background: #1a3a5c; color: #fff;
  border: none; border-radius: var(--radius); padding: 14px;
  font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; gap: 10px;
  justify-content: center; box-shadow: 0 4px 20px rgba(26,58,92,0.35);
}
.bank-icon { width: 20px; height: 20px; fill: #fff; }
.bank-data { background: #eef3f8; border-color: #1a3a5c; }
.bank-data .transfer-value { color: #1a3a5c; }
.bank-data .copy-btn { background: #1a3a5c; }

@media (min-width: 768px) {
  .cart-overlay { display: none; }
  .cart-drawer {
    left: auto; right: 0; bottom: 0; top: 0;
    max-height: 100vh;
    border-radius: 24px 0 0 24px;
    max-width: 420px;
    margin: 0;
    transform: translateX(100%);
  }
  .cart-drawer.open { transform: translateX(0); }
  .cart-drawer-handle { display: none; }
  .cart-drawer-header { padding: 24px 24px 14px; font-size: 22px; }
  .cart-items { padding: 10px 20px; }
  .cart-drawer-footer { padding: 14px 20px; padding-bottom: calc(env(safe-area-inset-bottom,0px) + 20px); }
}
</style>