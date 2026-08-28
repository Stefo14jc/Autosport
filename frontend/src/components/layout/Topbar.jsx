import { useTheme } from '../../context/ThemeContext'
import './Topbar.css'
import { useOfflineSync } from '../../hooks/useOfflineSync'


export default function Topbar({ title }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <button className="topbar__theme" onClick={toggleTheme} title="Alternar tema">
        {theme === 'dark' ? ' Modo Claro' : ' Modo Oscuro'}
      </button>
    </header>
  )
}
export default function Topbar({ title }) {
  const { theme, toggleTheme } = useTheme()
  const { online, pendientes } = useOfflineSync()

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!online && (
          <span style={{
            background: 'rgba(239,68,68,.15)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            padding: '4px 12px',
            borderRadius: 'var(--radius)',
            fontSize: '12px',
            fontWeight: 600
          }}>
            Sin conexion {pendientes > 0 ? `(${pendientes} pendientes)` : ''}
          </span>
        )}
        {online && pendientes > 0 && (
          <span style={{
            background: 'rgba(249,115,22,.15)',
            border: '1px solid var(--orange)',
            color: 'var(--orange)',
            padding: '4px 12px',
            borderRadius: 'var(--radius)',
            fontSize: '12px',
            fontWeight: 600
          }}>
            Sincronizando {pendientes} movimientos...
          </span>
        )}
        <button className="topbar__theme" onClick={toggleTheme}>
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </header>
  )
}