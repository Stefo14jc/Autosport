import './StockBar.css'

export default function StockBar({ actual, minimo }) {
  const porcentaje = minimo === 0 ? 100 : Math.min((actual / (minimo * 2)) * 100, 100)
  const nivel = actual === 0 ? 'critico' : actual <= minimo ? 'alerta' : actual <= minimo * 1.5 ? 'moderado' : 'optimo'
  const labels = { critico: 'Sin stock', alerta: 'Stock bajo', moderado: 'Moderado', optimo: 'Óptimo' }

  return (
    <div className="stock-bar">
      <div className="stock-bar__track">
        <div
          className={`stock-bar__fill stock-bar__fill--${nivel}`}
          style={{ width: `${Math.max(porcentaje, 4)}%` }}
        />
      </div>
      <div className="stock-bar__meta">
        <span className={`stock-bar__label stock-bar__label--${nivel}`}>{labels[nivel]}</span>
        <span className="stock-bar__nums">{actual} / mín {minimo}</span>
      </div>
    </div>
  )
}