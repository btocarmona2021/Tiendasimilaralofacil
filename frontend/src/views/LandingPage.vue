<template>
  <div class="landing">
    <header class="hero">
      <div class="hero-content">
        <img v-if="hasLogo" :src="logoUrl" alt="Multitienda" class="hero-logo" />
        <h1 v-else>🚀 Multitienda</h1>
        <p class="hero-sub">Tu tienda online lista en 2 minutos</p>
        <p class="hero-text">Vendé por WhatsApp sin complicarte. Sin dominio, sin hosting, sin porcentajes.</p>
        <div class="hero-actions">
          <a href="/multitienda/admin/login" class="btn-primary">🔐 Acceso Admin</a>
          <a href="#tiendas" class="btn-secondary">Ver tiendas →</a>
        </div>
      </div>
    </header>

    <section class="benefits">
      <div class="benefit-card" v-for="b in benefits" :key="b.titulo">
        <span class="benefit-icon">{{ b.icon }}</span>
        <h3>{{ b.titulo }}</h3>
        <p>{{ b.desc }}</p>
      </div>
    </section>

    <section class="tiendas-section" id="tiendas">
      <h2>🏪 Tiendas disponibles</h2>
      <p class="section-sub">Elegí una tienda para ver sus productos</p>
      <div class="tiendas-grid" v-if="stores.length">
        <div class="tienda-card" :class="{ destacada: s.esModelo }" v-for="s in sorted" :key="s.slug">
          <span class="tienda-modelo-badge" v-if="s.esModelo">⭐ Tienda modelo</span>
          <div class="tienda-logo-wrap">
            <img v-if="s.logo" :src="s.logo" class="tienda-logo" />
            <span v-else class="tienda-emoji">🏪</span>
          </div>
          <div class="tienda-info">
            <h3>{{ s.store_name }}</h3>
            <span class="tienda-rubro">{{ s.rubro }}</span>
          </div>
          <div class="tienda-botones">
            <a :href="'/multitienda/' + s.slug + '/' " class="btn-ver">👁️ Ver tienda</a>
            <a v-if="!s.esModelo" :href="'/multitienda/' + s.slug + '/admin/login'" class="btn-admin">🔐 Admin (admin / admin123)</a>
          </div>
        </div>
      </div>
      <p v-else class="loading-text">Cargando tiendas...</p>
    </section>

    <footer class="landing-footer">
      <p>Otro sistema creado por <strong>AC Computación de Alberto Carmona</strong> · 📱 2920-286288</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'

const stores = ref([])
const hasLogo = ref(false)
const logoUrl = '/multitienda/uploads/logo.png'

const benefits = [
  { icon: '📱', titulo: 'Sin dominio ni hosting', desc: 'Tu tienda queda en tudominio.com/multitienda/tunegocio. Listo para compartir.' },
  { icon: '📦', titulo: 'Catálogo con fotos', desc: 'Agregá productos con fotos, precios, stock y variantes. Todo desde el celular.' },
  { icon: '💬', titulo: 'WhatsApp automático', desc: 'El cliente elige, paga y el pedido te llega directo a tu WhatsApp.' },
  { icon: '💳', titulo: 'Mercado Pago + Transferencia', desc: 'Cobrá con tu propio token de MP, alias, CVU o transferencia bancaria.' },
  { icon: '⭐', titulo: 'Reseñas + descuentos', desc: 'Tus clientes dejan reseñas. Usá códigos de descuento y programa de puntos.' },
  { icon: '📊', titulo: 'Panel completo', desc: 'Dashboard, pedidos, productos, stock, exportación a Excel. Todo desde un lugar.' },
]

const sorted = computed(() => {
  const arr = stores.value.map(s => ({ ...s, esModelo: s.slug.toLowerCase() === 'ferrestock' }))
  arr.sort((a, b) => (b.esModelo ? 1 : 0) - (a.esModelo ? 1 : 0))
  return arr
})

onMounted(async () => {
  try {
    const { data } = await api.get('/tiendas')
    stores.value = data
  } catch {}
  const img = new Image()
  img.onload = () => { hasLogo.value = true }
  img.src = logoUrl
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--cream);
}

.hero {
  background: linear-gradient(160deg, var(--brown, #5C3317) 0%, #2C1810 100%);
  color: #fff;
  padding: 60px 20px;
  text-align: center;
}
.hero-content {
  max-width: 600px;
  margin: 0 auto;
}
.hero-logo {
  max-width: 280px;
  margin-bottom: 12px;
}
.hero h1 {
  font-size: 42px;
  font-weight: 900;
  margin-bottom: 8px;
}
.hero-sub {
  font-size: 18px;
  opacity: 0.85;
  margin-bottom: 4px;
}
.hero-text {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 24px;
  line-height: 1.5;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-primary {
  background: var(--gold);
  color: var(--brown);
  border: none;
  border-radius: 50px;
  padding: 14px 32px;
  font-weight: 700;
  text-decoration: none;
  font-size: 15px;
}
.btn-primary:hover {
  opacity: 0.9;
}
.btn-secondary {
  background: #ffffff26;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 14px 32px;
  font-weight: 600;
  text-decoration: none;
  font-size: 15px;
}
.btn-secondary:hover {
  background: #ffffff40;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-width: 960px;
  margin: 40px auto;
  padding: 0 20px;
}
.benefit-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.benefit-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
.benefit-card h3 {
  font-size: 16px;
  color: var(--brown);
  margin-bottom: 4px;
}
.benefit-card p {
  font-size: 13px;
  color: var(--light-text);
  line-height: 1.5;
}

.tiendas-section {
  max-width: 960px;
  margin: 0 auto 60px;
  padding: 0 20px;
}
.tiendas-section h2 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--brown);
  text-align: center;
  margin-bottom: 4px;
}
.section-sub {
  text-align: center;
  color: var(--light-text);
  font-size: 14px;
  margin-bottom: 24px;
}
.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.tienda-card {
  background: var(--white);
  border-radius: var(--radius-sm);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  text-decoration: none;
}
.tienda-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.tienda-card.destacada {
  border: 2px solid var(--gold);
}
.tienda-modelo-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  background: var(--gold);
  color: var(--brown);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}
.tienda-logo-wrap {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.tienda-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.tienda-emoji {
  font-size: 32px;
}
.tienda-info {
  margin-bottom: 12px;
}
.tienda-info h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.tienda-rubro {
  font-size: 11px;
  color: var(--light-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tienda-botones {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.btn-ver, .btn-admin {
  display: block;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
}
.btn-ver {
  background: var(--red);
  color: #fff;
}
.btn-admin {
  background: var(--cream);
  color: var(--text);
}
.loading-text {
  text-align: center;
  color: var(--light-text);
  font-size: 14px;
  padding: 40px;
}
.landing-footer {
  background: var(--brown);
  color: #fff;
  text-align: center;
  padding: 24px;
  font-size: 14px;
}
.landing-footer a {
  color: var(--gold);
  font-weight: 600;
  text-decoration: none;
}
</style>
