<template>
  <div id="app-root">
    <header>
      <div class="header-inner">
        <div class="badge">⭐ Reseña</div>
        <h1>Calificá tu compra</h1>
        <p class="header-sub">Tu opinión nos ayuda a mejorar</p>
      </div>
    </header>

    <main>
      <div v-if="loading" class="loading">Cargando...</div>

      <div v-else-if="error" class="error-card">
        <div class="error-icon">😕</div>
        <h3>{{ error }}</h3>
        <p v-if="error.includes('Ya dejaste')">Gracias por tu opinión. Si querés dejarnos más comentarios, escribinos por WhatsApp.</p>
        <p v-else>El link no es válido o ya fue usado. Si pensás que es un error, contactanos.</p>
      </div>

      <div v-else-if="submitted" class="success-card">
        <div class="success-icon">🎉</div>
        <h3>¡Gracias {{ name }}!</h3>
        <p>Tu reseña fue enviada y está pendiente de aprobación. Te avisaremos cuando esté publicada.</p>
      </div>

      <div v-else class="review-form-card">
        <div class="customer-info">
          <div class="customer-avatar">{{ name?.charAt(0) }}</div>
          <div>
            <div class="customer-name">{{ name }}</div>
            <div class="customer-products">
              Compraste: {{ items?.join(', ') }}
            </div>
          </div>
        </div>

        <div class="rating-section">
          <label>Puntuación</label>
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star"
              :class="{ filled: n <= rating }"
              @click="rating = n">
              {{ n <= rating ? '★' : '☆' }}
            </span>
          </div>
        </div>

        <div class="text-section">
          <label>Tu opinión</label>
          <textarea v-model="text" placeholder="Contanos tu experiencia... (mínimo 10 caracteres)" rows="4"></textarea>
        </div>

        <button class="submit-btn" @click="submit" :disabled="sending || !valid">
          {{ sending ? 'Enviando...' : 'Enviar reseña' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api.js'

const route = useRoute()
const token = route.params.token

const loading = ref(true)
const error = ref('')
const name = ref('')
const items = ref([])
const rating = ref(5)
const text = ref('')
const sending = ref(false)
const submitted = ref(false)

const valid = computed(() => text.value.trim().length >= 10)

async function load() {
  try {
    const { data } = await api.get(`/reviews/token/${token}`)
    name.value = data.customer_name
    items.value = data.items
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar'
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!valid.value || sending.value) return
  sending.value = true
  try {
    await api.post('/reviews/submit', { token, rating: rating.value, text: text.value })
    submitted.value = true
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al enviar la reseña'
  } finally {
    sending.value = false
  }
}

onMounted(load)
</script>

<style scoped>
#app-root { min-height: 100vh; background: var(--cream, #FAF4E8); }
header { background: var(--brown, #5C3317); color: #fff; padding: 30px 20px 24px; text-align: center; }
.header-inner { max-width: 480px; margin: 0 auto; }
.badge {
  display: inline-block; background: rgba(255,255,255,0.15); font-size: 10px;
  font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  padding: 5px 14px; border-radius: 50px; margin-bottom: 10px;
}
h1 { font-size: 28px; font-weight: 900; margin: 0 0 4px; font-family: 'Playfair Display', serif; }
.header-sub { font-size: 13px; opacity: 0.85; margin: 0; font-weight: 400; }

main { max-width: 480px; margin: 0 auto; padding: 24px 20px 80px; }
.loading { text-align: center; padding: 60px 0; color: var(--light-text); }

.error-card, .success-card {
  background: #fff; border-radius: 18px; padding: 40px 24px;
  text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.error-icon, .success-icon { font-size: 48px; margin-bottom: 12px; }
.error-card h3, .success-card h3 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--text); margin: 0 0 8px; }
.error-card p, .success-card p { font-size: 14px; color: var(--light-text); line-height: 1.5; margin: 0; }

.review-form-card {
  background: #fff; border-radius: 18px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.customer-info {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 20px; margin-bottom: 20px;
  border-bottom: 1px solid var(--warm, #F2E6CC);
}
.customer-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--red, #C0392B); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; flex-shrink: 0;
}
.customer-name { font-size: 16px; font-weight: 700; color: var(--text); }
.customer-products { font-size: 12px; color: var(--light-text); margin-top: 2px; }

.rating-section { margin-bottom: 20px; }
.rating-section label { display: block; font-size: 12px; font-weight: 600; color: var(--light-text); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.stars { display: flex; gap: 6px; }
.star {
  font-size: 32px; cursor: pointer; color: var(--warm, #ddd);
  transition: transform 0.15s, color 0.15s;
  user-select: none;
}
.star:hover { transform: scale(1.2); }
.star.filled { color: var(--gold, #D4A843); }

.text-section { margin-bottom: 20px; }
.text-section label { display: block; font-size: 12px; font-weight: 600; color: var(--light-text); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
textarea {
  width: 100%; border: 2px solid var(--warm, #F2E6CC); border-radius: 12px;
  padding: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
  resize: vertical; min-height: 80px; box-sizing: border-box;
  outline: none; transition: border-color 0.15s;
}
textarea:focus { border-color: var(--red, #C0392B); }

.submit-btn {
  width: 100%; padding: 14px; border: none; border-radius: 50px;
  background: var(--red, #C0392B); color: #fff;
  font-size: 16px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: opacity 0.15s;
}
.submit-btn:disabled { opacity: 0.5; cursor: default; }
.submit-btn:not(:disabled):hover { opacity: 0.9; }
</style>
