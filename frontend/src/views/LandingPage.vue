<template>
  <div class="landing">
    <header class="hero">
      <div class="hero-content">
        <h1>🚀 Multitienda</h1>
        <p class="hero-sub">Tu tienda online lista en 2 minutos</p>
        <p class="hero-text">Vendé por WhatsApp sin complicarte. Sin dominio, sin hosting, sin porcentajes.</p>
        <div class="hero-actions">
          <a href="/multitienda/admin/login" class="btn-primary">🔐 Acceso Admin</a>
          <a href="#tiendas" class="btn-secondary">Ver tiendas →</a>
        </div>
      </div>
    </header>

    <section class="benefits">
      <div v-for="b in benefits" :key="b.titulo" class="benefit-card">
        <span class="benefit-icon">{{ b.icon }}</span>
        <h3>{{ b.titulo }}</h3>
        <p>{{ b.desc }}</p>
      </div>
    </section>

    <section id="tiendas" class="tiendas-section">
      <h2>🏪 Tiendas disponibles</h2>
      <div v-if="tiendas.length" class="tiendas-grid">
        <div v-for="t in tiendas" :key="t.slug" class="tienda-card" :class="{ destacada: t.esModelo }">
          <span v-if="t.esModelo" class="destacada-badge">⭐ Tienda modelo</span>
          <div class="tienda-logo-wrap">
            <img v-if="t.logo" :src="t.logo" class="tienda-logo" />
            <span v-else class="tienda-emoji">🏪</span>
          </div>
          <div class="tienda-info">
            <h3>{{ t.store_name }}</h3>
            <span class="tienda-rubro">{{ t.rubro_label || t.rubro }}</span>
          </div>
          <div class="tienda-botones">
            <a :href="'/multitienda/' + t.slug + '/' " class="btn-ver">👁️ Ver tienda</a>
            <a v-if="!t.esModelo" :href="'/multitienda/' + t.slug + '/admin/login'" class="btn-admin">🔐 Admin (admin / admin123)</a>
          </div>
        </div>
      </div>
      <p v-else class="cargando">Cargando tiendas...</p>
    </section>

    <footer class="landing-footer">
      <p>Otro sistema creado por AC Computación de Alberto Carmona · 📱 2920-286288</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const tiendas = ref([])

const benefits = [
  { icon: '⚡', titulo: 'Rápido', desc: 'Creá tu tienda y empezá a vender en minutos.' },
  { icon: '📱', titulo: 'WhatsApp', desc: 'Tus clientes piden por WhatsApp, vos gestionás desde el panel.' },
  { icon: '🔧', titulo: 'Simple', desc: 'Sin conocimientos técnicos. Todo listo para usar.' },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/tiendas')
    tiendas.value = data
  } catch {}
})
</script>

<style scoped>
.landing { min-height: 100vh; background: var(--cream); }
.hero {
  background: linear-gradient(160deg, var(--brown, #5C3317) 0%, #2C1810 100%);
  color: #fff; padding: 60px 20px; text-align: center;
}
.hero-content { max-width: 600px; margin: 0 auto; }
.hero h1 { font-size: 42px; font-weight: 900; margin-bottom: 8px; }
.hero-sub { font-size: 18px; opacity: 0.85; margin-bottom: 4px; }
.hero-text { font-size: 14px; opacity: 0.7; margin-bottom: 24px; line-height: 1.5; }
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-primary {
  background: var(--gold); color: var(--brown); border: none; border-radius: 50px;
  padding: 14px 32px; font-weight: 700; text-decoration: none; font-size: 15px;
}
.btn-primary:hover { opacity: 0.9; }
.btn-secondary {
  background: #ffffff26; color: #fff; border: none; border-radius: 50px;
  padding: 14px 32px; font-weight: 600; text-decoration: none; font-size: 15px;
}
.btn-secondary:hover { background: #ffffff40; }

.benefits {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px; max-width: 960px; margin: 40px auto; padding: 0 20px;
}
.benefit-card {
  background: var(--white); border-radius: var(--radius); padding: 24px;
  box-shadow: var(--shadow-sm);
}
.benefit-icon { font-size: 32px; display: block; margin-bottom: 8px; }
.benefit-card h3 { font-size: 16px; color: var(--brown); margin-bottom: 4px; }
.benefit-card p { font-size: 13px; color: var(--light-text); line-height: 1.5; }

.tiendas-section { max-width: 960px; margin: 0 auto 60px; padding: 0 20px; }
.tiendas-section h2 {
  font-family: 'Playfair Display', serif; font-size: 28px; color: var(--brown);
  text-align: center; margin-bottom: 4px;
}
.tiendas-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;
}
.tienda-card {
  background: var(--white); border-radius: var(--radius-sm); padding: 20px;
  box-shadow: var(--shadow-sm); transition: transform 0.15s, box-shadow 0.15s;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  position: relative; text-decoration: none;
}
.tienda-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.tienda-card.destacada { border: 2px solid var(--gold); }
.destacada-badge {
  position: absolute; top: -8px; background: var(--gold); color: var(--brown);
  font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 10px;
}
.tienda-logo-wrap {
  width: 72px; height: 72px; border-radius: 14px; overflow: hidden;
  background: var(--cream); display: flex; align-items: center;
  justify-content: center; margin-bottom: 10px;
}
.tienda-logo { width: 100%; height: 100%; object-fit: contain; }
.tienda-emoji { font-size: 32px; }
.tienda-info { margin-bottom: 12px; }
.tienda-info h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
.tienda-rubro {
  font-size: 11px; color: var(--light-text); text-transform: uppercase; letter-spacing: 0.5px;
}
.tienda-botones { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.btn-ver {
  background: var(--red); color: #fff; border: none; border-radius: 8px;
  padding: 8px; font-weight: 600; text-decoration: none; font-size: 13px; text-align: center;
}
.btn-ver:hover { opacity: 0.85; }
.btn-admin {
  background: var(--brown); color: #fff; border: none; border-radius: 8px;
  padding: 8px; font-weight: 600; text-decoration: none; font-size: 12px; text-align: center;
}
.btn-admin:hover { opacity: 0.85; }

.cargando { text-align: center; padding: 40px; font-size: 18px; opacity: 0.7; }

.landing-footer {
  background: var(--brown); color: #fff; text-align: center; padding: 24px; font-size: 14px;
}
</style>
