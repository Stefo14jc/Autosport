import { useEffect, useState } from 'react'
import Topbar from '../components/layout/Topbar'
import api from '../api/axiosClient'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [categorias, setCategorias]     = useState([])
  const [ubicaciones, setUbicaciones]   = useState([])
  const [filtCatId, setFiltCatId]       = useState('')
  const [filtUbicId, setFiltUbicId]     = useState('')
  const [filtResultados, setFiltResultados] = useState([])
  const [filtLoading, setFiltLoading]   = useState(false)
  const [filtConsultado, setFiltConsultado] = useState(false)

  useEffect(() => {
    api.get('/accesorios/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => {})
    api.get('/ubicaciones').then(r => setUbicaciones(r.data)).catch(() => {})
  }, [])

  const handleFiltrar = async () => {
    if (!filtCatId && !filtUbicId) return
    setFiltLoading(true); setFiltConsultado(true)
    try {
      const params = {}
      if (filtCatId)  params.categoria_id = filtCatId
      if (filtUbicId) params.ubicacion_id = filtUbicId
      const { data } = await api.get('/accesorios/filtrar', { params })
      setFiltResultados(data)
    } catch { setFiltResultados([]) }
    finally { setFiltLoading(false) }
  }

  const handleLimpiarFiltro = () => {
    setFiltCatId(''); setFiltUbicId('')
    setFiltResultados([]); setFiltConsultado(false)
  }

  if (loading) return <div className="page-loader">Cargando...</div>

  return (
    <div className="page">
      <Topbar title="Dashboard" />
      <div className="page__body">

        <div className="dash-kpis">
          <div className="kpi-card">
            <div>
              <p className="kpi-card__value">{stats?.total_accesorios ?? 0}</p>
              <p className="kpi-card__label">Total Accesorios</p>
            </div>
          </div>
          <div className="kpi-card kpi-card--alert">
            <span className="kpi-card__icon">⚠</span>
            <div>
              <p className="kpi-card__value">{stats?.stock_bajo ?? 0}</p>
              <p className="kpi-card__label">Stock Bajo / Sin Stock</p>
            </div>
          </div>
        </div>

        <div className="dash-filtros-wrap">
          <h2 className="dash-filtros__titulo">Consulta de Accesorios</h2>

          <div className="dash-filtros__controles">
            <div className="form-field">
              <label>Filtrar por Categoría</label>
              <select value={filtCatId} onChange={e => { setFiltCatId(e.target.value); setFiltUbicId('') }}>
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="dash-filtros__sep">ó</div>

            <div className="form-field">
              <label>Filtrar por Estantería</label>
              <select value={filtUbicId} onChange={e => { setFiltUbicId(e.target.value); setFiltCatId('') }}>
                <option value="">Todas las ubicaciones</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>

            <div className="dash-filtros__btns">
              <button
                className="btn btn--primary"
                onClick={handleFiltrar}
                disabled={(!filtCatId && !filtUbicId) || filtLoading}
              >
                {filtLoading ? 'Buscando...' : 'Consultar'}
              </button>
              {filtConsultado && (
                <button className="btn btn--ghost" onClick={handleLimpiarFiltro}>Limpiar</button>
              )}
            </div>
          </div>

          {filtConsultado && (
            <div className="dash-filtros__resultados">
              {filtLoading ? (
                <p className="rep-loading">Buscando accesorios...</p>
              ) : filtResultados.length === 0 ? (
                <p className="rep-empty">No se encontraron accesorios con ese filtro.</p>
              ) : (
                <>
                  <p className="dash-filtros__count">{filtResultados.length} accesorio(s) encontrado(s)</p>
                  <div className="dash-filtros__tabla-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Stock</th>
                          <th>Categoría</th>
                          <th>Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtResultados.map(a => (
                          <tr key={a.id}>
                            <td><code className="rep-codigo">{a.codigo}</code></td>
                            <td>{a.nombre}</td>
                            <td>
                              <span style={{
                                color: a.stock_actual <= a.stock_minimo ? 'var(--red)' : 'var(--green)',
                                fontWeight: 700
                              }}>
                                {a.stock_actual}
                              </span>
                            </td>
                            <td>{a.categoria || '—'}</td>
                            <td>{a.ubicacion || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h2 className="dash-section__title">Últimos Movimientos</h2>
          <div className="dash-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accesorio</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats?.ultimos_movimientos?.map((m, i) => (
                  <tr key={i}>
                    <td>{m.accesorio}</td>
                    <td><span className={`badge badge--${m.tipo}`}>{m.tipo}</span></td>
                    <td>{m.cantidad}</td>
                    <td>{m.usuario}</td>
                    <td>{new Date(m.created_at).toLocaleString('es-EC')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}