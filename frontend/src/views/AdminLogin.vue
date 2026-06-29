<template>
  <div class="admin-login">
    <div class="admin-login-card">
      <h2>🔐 Admin</h2>
      <input v-model="username" placeholder="Usuario" type="text" @keyup.enter="login">
      <input v-model="password" placeholder="Contraseña" type="password" @keyup.enter="login">
      <button @click="login" :disabled="loading">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
      <p v-if="error" style="color:var(--red);font-size:13px;margin-top:8px">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { tenantFromUrl } from '../services/api.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const tenant = computed(() => route.params.tenant || tenantFromUrl())

async function login() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push(tenant.value ? `/${tenant.value}/admin` : '/admin')
  } catch (err) {
    error.value = err.response?.data?.error || 'Credenciales incorrectas'
  }
  loading.value = false
}
</script>

<style scoped>
.admin-login {
  position: fixed; inset: 0; z-index: 999;
  background: var(--cream);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.admin-login-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 32px 24px;
  width: 100%; max-width: 360px;
  box-shadow: var(--shadow-md);
}
.admin-login-card h2 { font-family: 'Playfair Display', serif; color: var(--brown); margin-bottom: 20px; text-align: center; }
.admin-login-card input {
  width: 100%;
  border: 2px solid var(--warm);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  margin-bottom: 12px;
  outline: none;
}
.admin-login-card input:focus { border-color: var(--red); }
.admin-login-card button {
  width: 100%;
  background: var(--red);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-family, 'DM Sans', sans-serif);
  cursor: pointer;
}
.admin-login-card button:disabled { opacity: 0.6; }
</style>
