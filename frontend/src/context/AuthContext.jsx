import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axiosClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('as_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('as_token') || null)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('as_token', data.token)
    localStorage.setItem('as_user', JSON.stringify(data.usuario))
    setToken(data.token)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('as_token')
    localStorage.removeItem('as_user')
    setToken(null)
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)