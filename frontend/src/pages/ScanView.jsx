import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axiosClient'
import './ScanView.css'

export default function ScanView() {
  const { id } = useParams()
  const [rep, setRep]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get(`/accesorios/scan/${id}`)
      .then(r => setRep(r.data))
      .catch(() => setError('Accesorio no encontrado o inactivo'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="scan-loading">
      <div className="scan-loading__spinner" />
      <p>Cargando accesorio...</p>
    </div>
  )

  if (error) return (
    <div className="scan-error">
      <span className="scan-error__icon">⚠</span>
      <h2>No encontrado</h2>
      <p>{error}</p>
    </div>
  )

  const porcentaje = rep.stock_minimo === 0
    ? 100
    : Math.min((rep.stock_actual / (rep.stock_minimo * 2)) * 100, 100)
  const nivel = rep.stock_actual === 0
    ? 'critico'
    : rep.stock_actual <= rep.stock_minimo
    ? 'alerta'
    : 'optimo'
  const nivelLabel = { critico: 'Sin stock', alerta: ' Stock bajo', optimo: 'Disponible' }
  const nivelColor = { critico: '#EF4444', alerta: '#F97316', optimo: '#22C55E' }

  return (
    <div className="scan-view">
      <header className="scan-header">
        <span className="scan-header__logo">🏎 AUTO<span>SPORT</span></span>
        <span className="scan-header__tag">Ficha de Accesorio</span>
      </header>

      <main className="scan-main">
        <div className="scan-card">

          <div className="scan-card__top">
            <div className="scan-badge-codigo">{rep.codigo}</div>
            {rep.categoria && <div className="scan-badge-cat">{rep.categoria}</div>}
          </div>

          <h1 className="scan-nombre">{rep.nombre}</h1>
          {rep.descripcion && <p className="scan-desc">{rep.descripcion}</p>}

          <div className="scan-grid">
            <div className="scan-dato">
              <span className="scan-dato__icon">📍</span>
              <div>
                <p className="scan-dato__label">Ubicación en bodega</p>
                <p className="scan-dato__valor">{rep.ubicacion || 'No asignada'}</p>
              </div>
            </div>
            <div className="scan-dato">
              <span className="scan-dato__icon">💲</span>
              <div>
                <p className="scan-dato__label">Precio unitario</p>
                <p className="scan-dato__valor scan-dato__valor--precio">
                  ${parseFloat(rep.precio_unitario).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="scan-stock">
            <div className="scan-stock__header">
              <p className="scan-stock__label">Stock disponible</p>
              <span
                className="scan-stock__estado"
                style={{ color: nivelColor[nivel] }}
              >{nivelLabel[nivel]}</span>
            </div>
            <div className="scan-stock__numero" style={{ color: nivelColor[nivel] }}>
              {rep.stock_actual}
              <span className="scan-stock__unidad"> unidades</span>
            </div>
            <div className="scan-stock__track">
              <div
                className="scan-stock__fill"
                style={{
                  width: `${Math.max(porcentaje, 4)}%`,
                  background: nivelColor[nivel]
                }}
              />
            </div>
            <p className="scan-stock__minimo">Mínimo requerido: {rep.stock_minimo} uds</p>
          </div>

        </div>
      </main>

      <footer className="scan-footer">
        <p>Actualizado en tiempo real · AUTOSPORT © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}