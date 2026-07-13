import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import StockBar from '../components/ui/StockBar'
import api from '../api/axiosClient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './Reportes.css'

const hoy = () => new Date().toISOString().split('T')[0]
const hace30 = () => {
  const d = new Date(); d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState(hace30)
  const [fechaFin, setFechaFin]       = useState(hoy)
  const [datos, setDatos]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [consultado, setConsultado]   = useState(false)
  const [error, setError]             = useState('')

  // ESTADO Y FETCH DEL DASHBOARD DIARIO
  const [diario, setDiario] = useState(null)
  
  useEffect(() => {
    api.get('/movimientos/dashboard-diario')
      .then(r => setDiario(r.data))
      .catch(() => {})
  }, [])

  const totalIngresos = datos.filter(d => d.tipo === 'ingreso').reduce((a, d) => a + parseInt(d.cantidad), 0)
  const totalSalidas  = datos.filter(d => d.tipo === 'salida').reduce((a, d) => a + parseInt(d.cantidad), 0)

  const consultar = async () => {
    setError('');if (!validarFechas()) return   // ← agrega esta línea
  setLoading(true)
    try {
      const { data } = await api.get('/movimientos/reporte', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      })
      setDatos(data); setConsultado(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al consultar')
    } finally { setLoading(false) }
  }
  const hoyStr = () => new Date().toISOString().split('T')[0]

const validarFechas = () => {
  const hoy   = new Date(hoyStr())
  const ini   = new Date(fechaInicio)
  const fin   = new Date(fechaFin)

  if (ini > hoy) {
    setError('La fecha de inicio no puede ser una fecha futura.')
    return false
  }
  if (fin < ini) {
    setError('La fecha fin no puede ser anterior a la fecha de inicio.')
    return false
  }
  return true
}


  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(18)
    doc.setTextColor(249, 115, 22)
    doc.text('AUTOSPORT — Reporte de Movimientos', 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 14, 26)
    doc.text(`Total ingresos: ${totalIngresos} uds | Total salidas: ${totalSalidas} uds`, 14, 32)

    autoTable(doc, {
      startY: 38,
      head: [['Fecha', 'Accesorio', 'Código', 'Tipo', 'Cantidad', 'Stock Ant.', 'Stock Nuevo', 'Motivo', 'Usuario']],
      body: datos.map(d => [
        new Date(d.created_at).toLocaleString('es-EC'),
        d.accesorio, d.codigo,
        d.tipo.toUpperCase(),
        d.cantidad, d.stock_anterior, d.stock_nuevo,
        d.motivo || '—', d.usuario
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' } }
    })

    doc.save(`Reporte_AUTOSPORT_${fechaInicio}_${fechaFin}.pdf`)
  }

const exportarExcel = () => {
  if (!datos || datos.length === 0) {
    setError('No hay datos para exportar.')
    return
  }

  const filas = datos.map(d => ({
    'Fecha':      new Date(d.created_at).toLocaleString('es-EC'),
    'Accesorio':  d.accesorio  ?? d.repuesto ?? '',
    'Usuario':    d.usuario    ?? '',
    'Tipo':       d.tipo       ?? '',
    'Cantidad':   d.cantidad   ?? '',
    'Motivo':     d.motivo     ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(filas)
  ws['!cols'] = [
    { wch: 22 }, { wch: 28 }, { wch: 20 },
    { wch: 10 }, { wch: 10 }, { wch: 35 }
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
  XLSX.writeFile(wb, `Movimientos_AUTOSPORT_${fechaInicio}_${fechaFin}.xlsx`)
}

  return (
    <div className="page">
      <Topbar title="Reportes de Movimientos" />
      <div className="page__body">

        {/* DASHBOARD DIARIO - INICIO */}
        {diario && (
          <div className="dash-diario">
            <h2 className="dash-diario__titulo">Actividad de Hoy</h2>
            
            <div className="dash-diario__kpis">
              <div className="dash-diario__kpi">
                <span className="dash-diario__val">{diario.totales.total_movimientos}</span>
                <span className="dash-diario__lbl">Movimientos</span>
              </div>
              <div className="dash-diario__kpi dash-diario__kpi--green">
                <span className="dash-diario__val">+{diario.totales.total_ingresos}</span>
                <span className="dash-diario__lbl">Unidades ingresadas</span>
              </div>
              <div className="dash-diario__kpi dash-diario__kpi--red">
                <span className="dash-diario__val">−{diario.totales.total_salidas}</span>
                <span className="dash-diario__lbl">Unidades despachadas</span>
              </div>
            </div>

            {diario.porUsuario.length > 0 && (
              <div className="dash-diario__tabla-wrap">
                <p className="dash-diario__subtitulo">Usuarios activos hoy</p>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Usuario</th><th>Rol</th><th>Movimientos</th>
                      <th>Ingresos</th><th>Salidas</th><th>Último registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diario.porUsuario.map((u, i) => (
                      <tr key={i}>
                        <td>{u.usuario}</td>
                        <td><span className={`rol-badge rol-badge--${u.rol}`}>{u.rol}</span></td>
                        <td>{u.movimientos}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>+{u.ingresos}</td>
                        <td style={{ color: 'var(--red)',   fontWeight: 600 }}>−{u.salidas}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(u.ultimo_movimiento).toLocaleTimeString('es-EC')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {diario.porUsuario.length === 0 && (
              <p className="dash-diario__vacio">Sin actividad registrada hoy todavía.</p>
            )}
          </div>
        )}
        {/* DASHBOARD DIARIO - FIN */}

        <div className="rep-filtros">
          <div className="form-field">
            <label>Fecha Inicio</label>
            <input type="date" value={fechaInicio} max={hoyStr()} onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Fecha Fin</label>
            <input type="date" value={fechaFin}max={hoyStr()} onChange={e => setFechaFin(e.target.value)} />
          </div>
          <button className="btn btn--primary rep-filtros__btn" onClick={consultar} disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {consultado && (
          <>
            <div className="rep-kpis">
              <div className="rep-kpi">
                <span className="rep-kpi__val">{datos.length}</span>
                <span className="rep-kpi__lbl">Movimientos</span>
              </div>
              <div className="rep-kpi rep-kpi--green">
                <span className="rep-kpi__val">+{totalIngresos}</span>
                <span className="rep-kpi__lbl">Unidades ingresadas</span>
              </div>
              <div className="rep-kpi rep-kpi--red">
                <span className="rep-kpi__val">−{totalSalidas}</span>
                <span className="rep-kpi__lbl">Unidades despachadas</span>
              </div>
            </div>

            <div className="rep-export">
              <button className="btn btn--ghost" onClick={exportarPDF} disabled={!datos.length}>
                Exportar PDF
              </button>
              <button className="btn btn--ghost" onClick={exportarExcel} disabled={!datos.length}>
                 Exportar Excel
              </button>
            </div>

            <div className="rep-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Accesorio</th><th>Código</th>
                    <th>Tipo</th><th>Cant.</th><th>Stock Ant.</th>
                    <th>Stock Nuevo</th><th>Estado Stock</th>
                    <th>Motivo</th><th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map(d => (
                    <tr key={d.id}>
                      <td className="mov-fecha">{new Date(d.created_at).toLocaleString('es-EC')}</td>
                      <td>{d.accesorio}</td>
                      <td><code className="rep-codigo">{d.codigo}</code></td>
                      <td><span className={`badge badge--${d.tipo}`}>{d.tipo}</span></td>
                      <td className="mov-cantidad">{d.tipo === 'ingreso' ? '+' : '−'}{d.cantidad}</td>
                      <td>{d.stock_anterior}</td>
                      <td><strong>{d.stock_nuevo}</strong></td>
                      <td><StockBar actual={parseInt(d.stock_actual)} minimo={parseInt(d.stock_minimo)} /></td>
                      <td className="rep-motivo">{d.motivo || <span className="rep-sin-motivo">Sin descripción</span>}</td>
                      <td>{d.usuario}</td>
                    </tr>
                  ))}
                  {datos.length === 0 && (
                    <tr>
                      <td colSpan={10} className="rep-empty">
                        No hay movimientos en el rango seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}