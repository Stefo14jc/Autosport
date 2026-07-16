import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accesorios from './pages/Accesorios'
import Movimientos from './pages/Movimientos'
import Usuarios from './pages/Usuarios'
import { useAuth } from './context/AuthContext'
import Reportes from './pages/Reportes'
import ScanView from './pages/ScanView'
import LogoCarro from './pages/LogoCarro'

function Layout() {
  const { usuario } = useAuth()
  return usuario ? <Sidebar /> : null
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/accesorios/scan/:id" element={<ScanView />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/accesorios" element={<ProtectedRoute><Accesorios /></ProtectedRoute>} />
            <Route path="/movimientos" element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
            <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute roles={['admin']}><Usuarios /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}