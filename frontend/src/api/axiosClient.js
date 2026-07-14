import axios from 'axios'

// Obtenemos la URL de las variables de entorno
const envUrl = import.meta.env.VITE_API_URL;

// Si la URL existe pero no empieza con http o https, le inyectamos 'https://' automáticamente
const formattedBaseURL = envUrl 
  ? (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`) 
  : 'http://localhost:5000';

const api = axios.create({ 
  baseURL: formattedBaseURL 
})

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