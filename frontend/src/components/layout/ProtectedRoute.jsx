import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { usuario } = useAuth()
  const location    = useLocation()

  if (!usuario) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/dashboard" replace />
  return children
}