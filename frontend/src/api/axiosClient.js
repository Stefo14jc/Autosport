import axios from 'axios'

// 1. Obtenemos la URL de las variables de entorno
const envUrl = import.meta.env.VITE_API_URL;

// 2. Limpiamos y aseguramos el https://
let formattedURL = envUrl 
  ? (envUrl.startsWith('http') ? envUrl : `https://${envUrl}`) 
  : 'http://localhost:5000';

// 3. Le agregamos el '/api' al final para que coincida con tu backend
if (!formattedURL.endsWith('/api')) {
  formattedURL += '/api';
}

// 4. Creamos la instancia de Axios
const api = axios.create({ 
  baseURL: formattedURL 
})

// === INTERCEPTORES ===
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