import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Login.css'
import LogoCarro from './LogoCarro';

const QUICK = [
  { label: ' Admin',    email: 'admin@autosport.com',  password: 'admin123' },
  { label: ' Bodeguero', email: 'bodega@autosport.com', password: 'bodega123' },
]

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate              = useNavigate()

  // Al escribir, NO tocamos el error. Se queda en pantalla.
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e, emailToAuth, passwordToAuth) => {
    // CRUCIAL: Detiene de golpe cualquier recarga automática del navegador
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLoading(true)
    setError('') // Solo se limpia al intentar iniciar sesión de nuevo
    
    try {
      await login(emailToAuth, passwordToAuth)
      navigate('/dashboard')
    } catch (err) {
      // 1. Guardamos el mensaje que viene del backend
      const msgError = err.response?.data?.error || 'Error de autenticación: Credenciales inválidas'
      setError(msgError)
      
      // 2. ¡REQUISITO COMPLETADO!: Vaciamos los campos de texto para que el usuario vuelva a escribir
      setForm({ email: '', password: '' })
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="login">
      <button className="login__theme" onClick={toggleTheme} type="button">
        {theme === 'dark' ? ' Modo Claro' : ' Modo Oscuro'}
      </button>

      <div className="login__card">
        <div className="login__brand">
          <LogoCarro 
            className="login__logo-svg" 
            color="#F15A24" 
            style={{ width: '260px', height: 'auto', marginBottom: '8px' }} 
          />
          <h1 className="login__title">AUTO<span>SPORT</span></h1>
          <p className="login__subtitle">Sistema de Gestión de Accesorios</p>
        </div>

        <div className="login__quick">
          <p className="login__quick-label">Acceso rápido</p>
          <div className="login__quick-btns">
            {QUICK.map(q => (
              <button
                key={q.label}
                type="button" // Evita comportamientos de submit indeseados
                className="login__quick-btn"
                onClick={(e) => handleSubmit(e, q.email, q.password)}
                disabled={loading}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="login__divider"><span>o ingresa manualmente</span></div>

        {/* Capturamos el evento onSubmit aquí para frenar la recarga de raíz */}
        <form className="login__form" onSubmit={(e) => handleSubmit(e, form.email, form.password)}>
          <div className="login__field">
            <label>Email</label>
            <input
              name="email" 
              type="email" 
              value={form.email}
              onChange={handleChange} 
              placeholder="usuario@autosport.com"
              required
            />
          </div>
          <div className="login__field">
            <label>Contraseña</label>
            <input
              name="password" 
              type="password" 
              value={form.password}
              onChange={handleChange} 
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className="login__error">{error}</p>}
          
          <button
            type="submit"
            className="login__submit"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}