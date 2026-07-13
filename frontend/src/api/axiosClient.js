import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('as_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('as_token')
      localStorage.removeItem('as_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api