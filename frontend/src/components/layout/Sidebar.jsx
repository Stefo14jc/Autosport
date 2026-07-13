import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'
import LogoCarro from '../../pages/LogoCarro' // Importamos el componente del logo

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',  roles: ['admin', 'bodeguero'] },
  { to: '/accesorios',   label: 'Accesorios',   roles: ['admin', 'bodeguero'] },
  { to: '/movimientos', label: 'Movimientos', roles: ['admin', 'bodeguero'] },
  { to: '/reportes',    label: 'Reportes',   roles: ['admin', 'bodeguero'] },
  { to: '/usuarios',    label: 'Usuarios',   roles: ['admin'] },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      {/* Añadido un flexbox simple para que el logo y el texto queden perfectamente alineados en la misma línea */}
      <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Cambiado el emoji viejo por el componente SVG con la silueta oficial */}
        <LogoCarro 
          className="sidebar__logo-svg" 
          style={{ width: '80px', height: 'auto' }} 
        />
        <span className="sidebar__title">AUTO<span>SPORT</span></span>
      </div>

      <nav className="sidebar__nav">
        {NAV.filter(n => n.roles.includes(usuario?.rol)).map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            <span className="sidebar__icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{usuario?.nombre?.[0]}</div>
          <div>
            <p className="sidebar__user-name">{usuario?.nombre}</p>
            <p className="sidebar__user-role">{usuario?.rol}</p>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}