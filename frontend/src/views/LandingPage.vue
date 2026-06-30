<template>
  <div class="landing">
    <section class="hero">
      <h1>Multitienda</h1>
      <p>Tu tienda online en simples pasos · Pedidos por WhatsApp</p>
    </section>

    <section class="stores" v-if="tiendas.length">
      <div class="store-grid">
        <router-link v-for="t in tiendas" :key="t.slug" :to="`/${t.slug}/`" class="store-card">
          <div class="store-icon">{{ iconMap[t.rubro] || '🏪' }}</div>
          <h3>{{ t.store_name }}</h3>
          <p>{{ t.subtitle || t.rubro }}</p>
        </router-link>
      </div>
    </section>
    <p v-else class="loading">Cargando tiendas...</p>

    <section class="contact">
      <p>¿Querés tener tu propia tienda online?</p>
      <a href="https://wa.me/542920286288" target="_blank" class="wa-btn">📱 Contactanos por WhatsApp</a>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const tiendas = ref([])

const iconMap = {
  ferreteria: '🔧', verduleria: '🥦', carniceria: '🥩',
  panaderia: '🥖', libreria: '📚', indumentaria: '👕',
  perfumeria: '🧴', deportes: '⚽', limpieza: '🧹',
  petshop: '🐾', jugueteria: '🧸', kiosco: '🍬',
  rotiseria: '🍗', accesorios: '💍',
}

onMounted(async () => {
  try {
    const { data } = await api.get('/tiendas')
    tiendas.value = data
  } catch {}
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: linear-gradient(160deg, #C0392B 0%, #96281B 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}
.hero {
  text-align: center;
  padding: 60px 20px 40px;
}
.hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  margin: 0 0 12px;
}
.hero p { font-size: 18px; opacity: 0.9; }
.stores { padding: 20px; max-width: 1000px; margin: 0 auto; }
.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.store-card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(4px);
  border-radius: 18px;
  padding: 24px;
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s, background 0.2s;
}
.store-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.2); }
.store-icon { font-size: 40px; margin-bottom: 8px; }
.store-card h3 { margin: 0 0 4px; font-size: 18px; }
.store-card p { margin: 0; font-size: 14px; opacity: 0.8; }
.loading { text-align: center; padding: 40px; font-size: 18px; opacity: 0.7; }
.contact {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}
.wa-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 14px 28px;
  background: #25D366;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
}
</style>
