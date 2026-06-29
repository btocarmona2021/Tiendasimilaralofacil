import axios from 'axios'

const RESERVED = ['api', 'admin', 'assets', 'seed-images', 'uploads']

export function tenantFromUrl() {
  const match = window.location.pathname.match(/\/multitienda\/([^/]+)/)
  if (match && !RESERVED.includes(match[1])) return match[1]
  return null
}

const api = axios.create({
  baseURL: '/multitienda/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const tenant = tenantFromUrl()
  if (tenant && !config.url.startsWith('/auth/')) {
    config.url = `/${tenant}${config.url}`
  }

  return config
})

export default api
