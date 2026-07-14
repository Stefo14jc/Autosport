import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LogoCarro from '../../pages/LogoCarro'
import './Sidebar.css'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',   roles: ['admin', 'bodeguero'] },
  { to: '/accesorios',  label: 'Accesorios',  roles: ['admin', 'bodeguero'] },
  { to: '/movimientos', label: 'Movimientos', roles: ['admin', 'bodeguero'] },
  { to: '/reportes',    label: 'Reportes',    roles: ['admin', 'bodeguero'] },
  { to: '/usuarios',    label: 'Usuarios',    roles: ['admin'] },
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => { logout(); navigate('/login') }

  const sidebarContent = (
    <>
      <div className="sidebar__brand">
        <LogoCarro className="sidebar__logo-svg" style={{ width: '80px', height: 'auto' }} />
        <span className="sidebar__title">AUTO<span>SPORT</span></span>
      </div>

      <nav className="sidebar__nav">
        {NAV.filter(n => n.roles.includes(usuario?.rol)).map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
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
    </>
  )

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-header__brand">
          <LogoCarro style={{ width: '48px', height: 'auto' }} />
          <span className="sidebar__title">AUTO<span>SPORT</span></span>
        </div>
        <button
          className="mobile-header__hamburger"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >☰</button>
      </header>

      <aside className="sidebar sidebar--desktop">
        {sidebarContent}
      </aside>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 110,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 120,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s ease',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            alignSelf: 'flex-end',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '16px 16px 0',
          }}
        >✕</button>
        {sidebarContent}
      </aside>
    </>
  )
}