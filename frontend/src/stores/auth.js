import { defineStore } from 'pinia'
import { ref } from 'vue'
import api, { tenantFromUrl } from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')
  const tenantId = ref(localStorage.getItem('tenantId') || null)

  async function login(user, pass) {
    const tenant = tenantFromUrl()
    const { data } = await api.post('/auth/login', { username: user, password: pass, tenant: tenant || '' })
    token.value = data.token
    username.value = data.username
    role.value = data.role || 'admin'
    tenantId.value = data.tenantId || null
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role || 'admin')
    localStorage.setItem('tenantId', data.tenantId || '')
  }

  function logout() {
    token.value = ''
    username.value = ''
    role.value = ''
    tenantId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('tenantId')
  }

  return { token, username, role, tenantId, login, logout }
})
