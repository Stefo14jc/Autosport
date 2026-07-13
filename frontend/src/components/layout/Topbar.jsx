import { useTheme } from '../../context/ThemeContext'
import './Topbar.css'

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