import './StockBadge.css'

export default function StockBadge({ actual, minimo }) {
  const nivel = actual === 0 ? 'sin-stock' : actual <= minimo ? 'bajo' : 'ok'
  const labels = { 'sin-stock': 'Sin stock', bajo: 'Stock bajo', ok: 'OK' }
  return <span className={`stock-badge stock-badge--${nivel}`}>{labels[nivel]}: {actual}</span>
}