<template>
  <div id="app-root" :style="cssVars">
    <template v-if="!isAdmin">
      <header>
        <div class="header-inner">
          <div class="badge">{{ config.categories[0]?.icon || '🏪' }} {{ config.rubroLabel }}</div>
          <h1>{{ config.name }}</h1>
          <p class="header-sub">{{ config.subtitle }}</p>
        </div>
      </header>

      <div class="promo-banner">{{ config.promo }}</div>

      <div class="search-bar">
        <input class="search-input" v-model="searchQuery" type="text" placeholder="🔍 Buscar producto..." @input="filterProducts">
        <button class="sort-btn" :class="{ active: sortAsc }" @click="toggleSort">💲 Precio</button>
      </div>

      <nav class="nav-tabs">
        <div class="nav-tab" v-for="cat in filteredCategories" :key="cat.slug"
          :class="{ active: activeTab === cat.slug }"
          @click="scrollTo(cat.slug)">
          {{ cat.icon }} {{ cat.name }}
        </div>
      </nav>

      <main>
        <div class="section" v-for="cat in filteredCategories" :key="cat.slug" :id="cat.slug">
          <h2 class="section-title">{{ cat.icon }} {{ cat.name }}</h2>
          <div class="product-list">
            <ProductCard v-for="(p, i) in getProducts(cat.slug)" :key="p.id"
              :product="p" :index="i"
              @change-qty="changeQty" />
          </div>
        </div>

        <div class="section" id="combos" v-if="combos.length">
          <h2 class="section-title">✨ Combos Especiales</h2>
          <ComboCard v-for="(c, i) in combos" :key="c.id"
            :combo="c" :index="i"
            :in-cart="cart.combos[c.id]"
            @toggle="toggleCombo" />
        </div>

        <div class="section" id="qr">
          <h2 class="section-title">QR del Local</h2>
          <div class="qr-card">
            <p class="qr-card-title">¡Compartí tu catálogo!</p>
            <p class="qr-card-sub">Escaneá para hacer tu pedido desde el celular.</p>
            <div id="qrContainer" ref="qrContainer"></div>
            <div class="qr-actions">
              <button class="btn-brown" @click="downloadQR">⬇️ Descargar QR</button>
            </div>
          </div>
        </div>

        <div class="section" id="reviews">
          <h2 class="section-title">⭐ Reseñas</h2>
          <div class="reviews-list">
            <div class="review-card" v-for="r in reviews" :key="r.id">
              <div class="review-header">
                <div class="review-avatar">{{ r.customer_name.charAt(0) }}</div>
                <div>
                  <div class="review-name">{{ r.customer_name }}</div>
                  <div class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</div>
                </div>
              </div>
              <div class="review-text">{{ r.text }}</div>
            </div>
          </div>
          <p class="review-note">📝 ¿Ya compraste? Dejá tu reseña con el link que te enviamos cuando recibas tu pedido.</p>
        </div>

        <div class="section" id="info">
          <h2 class="section-title">📍 Información</h2>
          <div class="info-card">
            <div class="info-row">
              <div class="info-icon">⏰</div>
              <div><div class="info-label">Horario</div><div class="info-value">{{ config.info.hours }}</div></div>
            </div>
            <div class="info-row">
              <div class="info-icon">📞</div>
              <div><div class="info-label">WhatsApp</div><div class="info-value">{{ config.whatsapp || config.info.phone }}</div></div>
            </div>
            <div class="info-row">
              <div class="info-icon">🚚</div>
              <div><div class="info-label">Envíos</div><div class="info-value">{{ config.info.delivery }}</div></div>
            </div>
            <div class="info-row">
              <div class="info-icon">💳</div>
              <div><div class="info-label">Medios de pago</div><div class="info-value">{{ config.info.payment }}</div></div>
            </div>
          </div>
        </div>
      </main>

      <CartFab />
      <CartDrawer />

      <a class="wa-float" :href="waLink" target="_blank">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <button class="puntos-fab" :class="{ visible: customer }" @click="openPuntos">
        ⭐ {{ customer?.points || 0 }} puntos
      </button>

      <div class="modal-puntos" :class="{ open: showPuntos }" @click="closePuntosOutside">
        <div class="modal-puntos-inner">
          <div class="puntos-handle"></div>
          <div style="text-align:center;margin-bottom:4px;font-size:13px;color:var(--light-text)">Hola, <strong>{{ customer?.name || '' }}</strong> 👋</div>
          <div class="puntos-total">{{ customer?.points || 0 }}</div>
          <div class="puntos-label">puntos acumulados<br><small>Cada $10.000 gastados = 100 puntos · 1.000 puntos = $10.000 de descuento</small></div>
          <div id="codigoCanjeDiv" v-if="codigoCanje" style="background:var(--gold-light);border-radius:12px;padding:14px;text-align:center;margin-bottom:12px;">
            <div style="font-size:12px;color:var(--light-text);margin-bottom:4px">Tu código de descuento</div>
            <div style="font-size:22px;font-weight:900;color:var(--brown);letter-spacing:3px">{{ codigoCanje }}</div>
          </div>
          <button class="canjear-btn" @click="canjearPuntos" :disabled="(customer?.points || 0) < 1000">🎁 Canjear 1.000 puntos por $10.000 off</button>
          <button @click="cerrarSesionPuntos" style="width:100%;background:none;border:1px solid var(--warm);border-radius:12px;padding:10px;font-size:13px;color:var(--light-text);cursor:pointer;font-family:'DM Sans',sans-serif;margin-top:8px">Cerrar sesión</button>
        </div>
      </div>
    </template>

    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from './stores/cart.js'
import api from './services/api.js'
import { presets, getPreset } from './assets/store.config.js'
import ProductCard from './components/ProductCard.vue'
import ComboCard from './components/ComboCard.vue'
import CartFab from './components/CartFab.vue'
import CartDrawer from './components/CartDrawer.vue'

const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => route.path.startsWith('/admin'))

const cart = useCartStore()

const rubro = ref('ferreteria')
const dbSettings = ref({})
const preset = computed(() => getPreset(rubro.value))

const config = computed(() => {
  const p = preset.value
  const d = dbSettings.value
  return {
    ...p,
    name: d.store_name || p.name,
    subtitle: d.subtitle || p.subtitle,
    promo: d.promo || p.promo,
    rubroLabel: d.rubro_label || p.rubroLabel,
    whatsapp: d.whatsapp || p.whatsapp,
    info: {
      hours: d.info_hours || p.info.hours,
      phone: d.info_phone || p.info.phone,
      delivery: d.info_delivery || p.info.delivery,
      payment: d.info_payment || p.info.payment,
    },
    shipping: {
      freeFrom: Number(d.shipping_free) || p.shipping.freeFrom,
      cost: Number(d.shipping_cost) || p.shipping.cost,
    },
  }
})

const searchQuery = ref('')
const sortAsc = ref(false)
const activeTab = ref('')
const products = ref([])
const combos = ref([])
const reviews = ref([])
const qrContainer = ref(null)
const customer = ref(null)
const showPuntos = ref(false)
const codigoCanje = ref('')

const filteredCategories = computed(() => {
  const cats = config.value.categories.filter(c =>
    getProducts(c.slug).length > 0
  )
  return cats
})

const waLink = computed(() => {
  const phone = config.value.whatsapp || config.value.info.phone
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=Hola!%20Tengo%20una%20consulta%20%F0%9F%99%8C`
})

const cssVars = computed(() => ({
  '--cream': preset.value.theme.cream,
  '--warm': preset.value.theme.warm,
  '--red': preset.value.theme.primary,
  '--red-dark': preset.value.theme.secondary,
  '--red-light': preset.value.theme.redLight,
  '--gold': preset.value.theme.accent,
  '--gold-light': preset.value.theme.goldLight,
  '--brown': preset.value.theme.brown,
  '--text': preset.value.theme.text,
  '--light-text': preset.value.theme.lightText,
  '--white': preset.value.theme.white,
  '--shadow-sm': preset.value.theme.shadowSm,
  '--shadow-md': preset.value.theme.shadowMd,
  '--radius': preset.value.theme.radius,
  '--radius-sm': preset.value.theme.radiusSm,
  '--font-family': preset.value.theme.font,
  '--header-bg': preset.value.theme.headerBg,
}))

function getProducts(catSlug) {
  let filtered = products.value.filter(p => p.category_slug === catSlug)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q))
  }
  if (sortAsc.value) filtered.sort((a, b) => a.price - b.price)
  return filtered
}

function toggleSort() {
  sortAsc.value = !sortAsc.value
}

function filterProducts() {
  if (!searchQuery.value.trim()) {
    activeTab.value = config.value.categories[0]?.slug || ''
    return
  }
  const q = searchQuery.value.toLowerCase().trim()
  const found = products.value.filter(p =>
    p.name.toLowerCase().includes(q)
  )
  if (found.length > 0) {
    activeTab.value = found[0].category_slug
    scrollTo(found[0].category_slug)
  }
}

function scrollTo(slug) {
  activeTab.value = slug
  const el = document.getElementById(slug)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changeQty(id, delta) {
  cart.changeQty(id, delta)
}

function toggleCombo(cid) {
  cart.toggleCombo(cid)
}

async function loadData() {
  const [pData, cData, rData, cfgData] = await Promise.all([
    api.get('/products').catch(() => ({ data: [] })),
    api.get('/combos').catch(() => ({ data: [] })),
    api.get('/reviews').catch(() => ({ data: [] })),
    api.get('/config').catch(() => null),
  ])
  products.value = pData.data
  combos.value = cData.data
  reviews.value = rData.data

  if (cfgData?.data) {
    const s = cfgData.data
    dbSettings.value = s
    rubro.value = s.rubro || rubro.value
    document.title = s.store_name || document.title
  }

  if (config.value.categories.length > 0 && !activeTab.value) {
    activeTab.value = config.value.categories[0].slug
  }

  const pMap = {}
  products.value.forEach(p => { pMap[p.id] = p })
  cart.setProductsMap(pMap)

  const cMap = {}
  combos.value.forEach(c => { cMap[c.id] = c })
  cart.setCombosMap(cMap)
}

function cargarCliente() {
  const phone = localStorage.getItem('clientePhone')
  const name = localStorage.getItem('clienteName')
  if (phone) {
    api.get(`/customers/${phone}`).then(({ data }) => {
      customer.value = data
    }).catch(() => {})
  }
}

function openPuntos() {
  if (!customer.value) {
    const nombre = prompt('Tu nombre:')
    const telefono = prompt('Tu teléfono (sin 0 ni 15):')
    if (nombre && telefono) {
      api.post('/customers/register', { name: nombre, phone: telefono }).then(({ data }) => {
        customer.value = data
        localStorage.setItem('clientePhone', telefono)
        localStorage.setItem('clienteName', nombre)
        showPuntos.value = true
      })
    }
  } else {
    showPuntos.value = true
  }
}

function closePuntosOutside(e) {
  if (e.target.classList.contains('modal-puntos')) showPuntos.value = false
}

async function canjearPuntos() {
  if (!customer.value || customer.value.points < 1000) return
  const { data } = await api.post(`/customers/${customer.value.id}/points/redeem`, { points: 1000 })
  customer.value = data.customer
  codigoCanje.value = data.code
}

function cerrarSesionPuntos() {
  customer.value = null
  localStorage.removeItem('clientePhone')
  localStorage.removeItem('clienteName')
  showPuntos.value = false
}

function downloadQR() {
  const canvas = qrContainer.value?.querySelector('canvas')
  if (canvas) {
    const link = document.createElement('a')
    link.download = 'qr-tienda.png'
    link.href = canvas.toDataURL()
    link.click()
  }
}

function checkPaymentStatus() {
  const q = route.query
  const status = q.collection_status || q.status
  const paymentId = q.collection_id
  const preferenceId = q.preference_id

  if (status === 'approved' && (paymentId || preferenceId)) {
    api.post('/mercadopago/check-status', { payment_id: paymentId, preference_id: preferenceId }).then(({ data }) => {
      if (data.mp_status === 'approved' || data.status === 'confirmado') {
        alert('✅ Pago aprobado. ¡Gracias por tu compra!')
        cart.clear()
        router.replace({ query: {} })
      }
    }).catch(() => {})
  }
}

onMounted(async () => {
  checkPaymentStatus()
  await loadData()
  cargarCliente()

  await nextTick()
  if (typeof QRCode !== 'undefined' && qrContainer.value) {
    new QRCode(qrContainer.value, { text: window.location.href, width: 180, height: 180 })
  }
})
</script>

<style>
:root {
  --cream: #FAF4E8;
  --warm: #F2E6CC;
  --red: #C0392B;
  --red-dark: #96281B;
  --red-light: #FDECEA;
  --gold: #D4A843;
  --gold-light: #FDF3DC;
  --brown: #5C3317;
  --text: #2C1810;
  --light-text: #7A5C4A;
  --white: #ffffff;
  --shadow-sm: 0 2px 8px rgba(92,51,23,0.08);
  --shadow-md: 0 4px 16px rgba(92,51,23,0.12);
  --radius: 18px;
  --radius-sm: 12px;
}

* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html { scroll-behavior: smooth; }
body {
  background: var(--cream);
  font-family: var(--font-family, 'DM Sans', sans-serif);
  color: var(--text);
  min-height: 100vh;
  overscroll-behavior-y: contain;
}
header {
  background: var(--header-bg);
  position: relative;
  overflow: hidden;
}
header::before {
  content: '';
  position: absolute;
  top: -60px; right: -40px;
  width: 220px; height: 220px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}
header::after {
  content: '';
  position: absolute;
  bottom: -40px; left: 10%;
  width: 180px; height: 180px;
  background: var(--gold);
  border-radius: 50%;
  opacity: 0.12;
}
.header-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 28px) 20px 28px;
  position: relative;
  z-index: 1;
  text-align: center;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--gold);
  color: var(--brown);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 14px;
}
h1 {
  font-family: var(--font-family, 'Playfair Display', serif);
  font-size: clamp(38px, 10vw, 48px);
  font-weight: 900;
  color: #fff;
  line-height: 1.0;
  letter-spacing: -1px;
}
.header-sub {
  color: rgba(255,255,255,0.70);
  font-size: 13px;
  margin-top: 8px;
  font-weight: 300;
  letter-spacing: 0.3px;
}
.promo-banner {
  background: var(--gold);
  text-align: center;
  padding: 11px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--brown);
}
.nav-tabs {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--cream);
  border-bottom: 1px solid var(--warm);
  padding: 0 16px;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-tabs::-webkit-scrollbar { display: none; }
.nav-tab {
  flex-shrink: 0;
  padding: 13px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--light-text);
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.nav-tab.active {
  color: var(--red);
  border-bottom-color: var(--red);
  font-weight: 600;
}
main {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 14px 140px;
}
.section { margin-bottom: 32px; scroll-margin-top: 52px; }
.section-title {
  font-family: var(--font-family, 'Playfair Display', serif);
  font-size: 21px;
  color: var(--brown);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--warm);
}
.product-list { display: flex; flex-direction: column; gap: 10px; }
.reviews-list { display: flex; flex-direction: column; gap: 14px; }
.review-card {
  background: var(--white);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}
.review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.review-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.review-name { font-size: 14px; font-weight: 600; color: var(--text); }
.review-stars { font-size: 12px; color: var(--gold); }
.review-text { font-size: 13px; color: var(--light-text); line-height: 1.5; }
.review-note { font-size: 13px; color: var(--light-text); text-align: center; margin-top: 16px; padding: 10px; background: var(--cream); border-radius: var(--radius-sm); }

.qr-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 2px dashed var(--warm);
}
.qr-card-title { font-family: 'Playfair Display', serif; font-size: 19px; color: var(--brown); margin-bottom: 6px; }
.qr-card-sub { font-size: 12px; color: var(--light-text); margin-bottom: 20px; font-weight: 300; }
#qrContainer { display: flex; justify-content: center; margin-bottom: 14px; }
#qrContainer canvas, #qrContainer img { border-radius: 12px; border: 5px solid var(--warm); }
.qr-actions { display: flex; gap: 8px; justify-content: center; }
.btn-brown {
  background: var(--brown); color: #fff; border: none; border-radius: 12px;
  padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: var(--font-family, 'DM Sans', sans-serif);
}

.info-card { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 14px; }
.info-row { display: flex; align-items: center; gap: 14px; }
.info-icon { width: 42px; height: 42px; background: var(--gold-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--light-text); font-weight: 600; margin-bottom: 2px; }
.info-value { font-size: 14px; font-weight: 500; color: var(--text); }

.wa-float {
  position: fixed; bottom: 24px; left: 20px; z-index: 100;
  background: #25D366; border-radius: 50%; width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(37,211,102,0.5);
  cursor: pointer; text-decoration: none;
}
.wa-float svg { width: 30px; height: 30px; fill: #fff; }

.puntos-fab {
  position: fixed; bottom: 90px; left: 20px; z-index: 100;
  background: var(--gold); border-radius: 50px;
  padding: 10px 16px; font-size: 13px; font-weight: 700;
  color: var(--brown); cursor: pointer; border: none;
  box-shadow: 0 4px 16px rgba(212,168,67,0.4);
  display: none; align-items: center; gap: 6px;
  font-family: var(--font-family, 'DM Sans', sans-serif);
}
.puntos-fab.visible { display: flex; }

.modal-puntos {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 500; display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.25s;
}
.modal-puntos.open { opacity: 1; pointer-events: all; }
.modal-puntos-inner {
  background: var(--white); border-radius: 24px 24px 0 0;
  padding: 24px 20px;
  padding-bottom: calc(env(safe-area-inset-bottom,0px) + 24px);
  width: 100%; max-width: 480px;
  transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
}
.modal-puntos.open .modal-puntos-inner { transform: translateY(0); }
.puntos-handle { width: 36px; height: 4px; background: var(--warm); border-radius: 2px; margin: 0 auto 20px; }
.puntos-total { font-size: 48px; font-weight: 900; color: var(--gold); text-align: center; line-height: 1; }
.puntos-label { text-align: center; font-size: 13px; color: var(--light-text); margin-bottom: 20px; }
.canjear-btn {
  width: 100%; background: var(--gold); color: var(--brown);
  border: none; border-radius: var(--radius); padding: 15px;
  font-size: 15px; font-weight: 700; font-family: var(--font-family, 'DM Sans', sans-serif);
  cursor: pointer; margin-bottom: 8px;
}
.canjear-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.search-bar {
  max-width: 480px; margin: 12px auto 0; padding: 0 16px;
  display: flex; gap: 8px; align-items: center;
}
.search-input {
  flex: 1; border: 2px solid var(--warm); border-radius: 50px;
  padding: 10px 18px; font-size: 14px;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  color: var(--text); background: var(--white);
  outline: none; transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--red); }
.sort-btn {
  background: var(--white); border: 2px solid var(--warm);
  border-radius: 50px; padding: 10px 14px; font-size: 13px;
  font-weight: 600; color: var(--text); cursor: pointer;
  white-space: nowrap; font-family: var(--font-family, 'DM Sans', sans-serif);
}
.sort-btn.active { border-color: var(--red); color: var(--red); }

@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Desktop responsive */
@media (min-width: 768px) {
  header::before { width: 400px; height: 400px; top: -100px; right: -100px; }
  header::after { width: 300px; height: 300px; bottom: -80px; }
  .header-inner { max-width: 1200px; padding: 50px 24px 40px; }
  .badge { font-size: 11px; padding: 6px 18px; }
  h1 { font-size: clamp(48px, 6vw, 64px); }
  .header-sub { font-size: 15px; }
  .promo-banner { font-size: 14px; padding: 14px 24px; }

  .search-bar { max-width: 800px; padding: 16px 24px 0; }
  .search-input { font-size: 15px; padding: 12px 20px; }
  .sort-btn { padding: 12px 18px; font-size: 14px; }

  .nav-tabs { justify-content: center; gap: 8px; padding: 0 24px; }
  .nav-tab { padding: 15px 24px; font-size: 14px; }

  main { max-width: 1200px; padding: 32px 24px 140px; }
  .section-title { font-size: 26px; margin-bottom: 20px; }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  #combos .section-title { grid-column: 1 / -1; }
  #combos { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  #combos .combo-card { margin-bottom: 0; }

  .reviews-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .info-card {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .info-row { margin-bottom: 0; }
}
</style>
