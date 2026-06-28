import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  async function login(user, pass) {
    const { data } = await api.post('/auth/login', { username: user, password: pass })
    token.value = data.token
    username.value = data.username
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  const isAuthenticated = ref(!!token.value)

  return { token, username, isAuthenticated, login, logout }
})
