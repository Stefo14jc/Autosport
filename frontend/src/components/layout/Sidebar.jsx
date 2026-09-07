import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LogoCarro from '../../pages/LogoCarro'
import './Sidebar.css'

const ICONS = {
  '/dashboard':   '▦',
  '/accesorios':  '⚙',
  '/movimientos': '↕',
  '/reportes':    '📊',
  '/usuarios':    '👤',
}

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
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => { logout(); navigate('/login') }

  const sidebarContent = (isMobile = false) => (
    <>
      <div className={`sidebar__brand${collapsed && !isMobile ? ' sidebar__brand--collapsed' : ''}`}>
        <LogoCarro style={{ width: collapsed && !isMobile ? '36px' : '56px', height: 'auto', transition: 'width 0.3s ease', flexShrink: 0 }} />
        {(!collapsed || isMobile) && (
          <span className="sidebar__title">AUTO<span>SPORT</span></span>
        )}
        {!isMobile && (
          <button className="sidebar__collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Colapsar'}>
            {collapsed ? '»' : '«'}
          </button>
        )}
      </div>

      <nav className="sidebar__nav">
        {NAV.filter(n => n.roles.includes(usuario?.rol)).map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            title={n.label}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}${collapsed && !isMobile ? ' sidebar__link--icon-only' : ''}`}
          >
            <span className="sidebar__icon">{ICONS[n.to]}</span>
            {(!collapsed || isMobile) && <span className="sidebar__link-label">{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`sidebar__footer${collapsed && !isMobile ? ' sidebar__footer--collapsed' : ''}`}>
        <div className="sidebar__user">
          <div className="sidebar__avatar">{usuario?.nombre?.[0]}</div>
          {(!collapsed || isMobile) && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{usuario?.nombre}</p>
              <p className="sidebar__user-role">{usuario?.rol}</p>
            </div>
          )}
        </div>
        {(!collapsed || isMobile) && (
          <button className="sidebar__logout" onClick={handleLogout}>Cerrar sesión</button>
        )}
        {collapsed && !isMobile && (
          <button className="sidebar__logout sidebar__logout--icon" onClick={handleLogout} title="Cerrar sesión">⏻</button>
        )}
      </div>
    </>
  )

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-header__brand">
          <LogoCarro style={{ width: '42px', height: 'auto' }} />
          <span className="sidebar__title">AUTO<span>SPORT</span></span>
        </div>
        <button className="mobile-header__hamburger" onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>
      </header>

      <aside className={`sidebar sidebar--desktop${collapsed ? ' sidebar--collapsed' : ''}`}>
        {sidebarContent(false)}
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar sidebar--mobile${open ? ' sidebar--mobile-open' : ''}`}>
        <button className="sidebar__close" onClick={() => setOpen(false)}>✕</button>
        {sidebarContent(true)}
      </aside>
    </>
  )
}