import { useEffect, useState, useCallback } from 'react'
import Topbar from '../components/layout/Topbar'
import StockBadge from '../components/ui/StockBadge'
import QRGenerator from '../components/qr/QRGenerator'
import QRScanner from '../components/qr/QRScanner'
import { useAccesorios } from '../hooks/useAccesorios'
import { useMovimientos } from '../hooks/useMovimientos'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosClient'
import './Accesorios.css'
import StockBar from '../components/ui/StockBar'

const EMPTY = {
  nombre: '', 
  descripcion: '',
  categoria_id: '', 
  precio_unitario: '', 
  stock_actual: '',
  stock_minimo: '5', 
  ubicacion_id: ''
}

export default function Accesorios() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'

  const { accesorios, setAccesorios, loading, fetchAccesorios, crearAccesorio, actualizarAccesorio, eliminarAccesorio } = useAccesorios()
  const { registrarMovimiento } = useMovimientos()

  const [busqueda, setBusqueda]       = useState('')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [editando, setEditando]       = useState(null)
  const [qrTarget, setQrTarget]       = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [stockModal, setStockModal]   = useState(null)
  
  const [movForm, setMovForm]         = useState({ tipo: 'ingreso', cantidad: '', motivo: '' })
  
  const [error, setError]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [categorias, setCategorias]   = useState([])
  const [ubicaciones, setUbicaciones] = useState([])

  useEffect(() => { fetchAccesorios() }, [fetchAccesorios])

  useEffect(() => {
    api.get('/categorias')
      .then(r => setCategorias(r.data))
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    api.get('/ubicaciones')
      .then(r => setUbicaciones(r.data))
      .catch(() => setUbicaciones([]))
  }, [])

  const accesoriosFiltrados = accesorios.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const abrirCrear = () => { setError(''); setForm(EMPTY); setEditando(null); setModal('form') }
  
  const abrirEditar = (r) => {
    setError('')
    setForm({
      codigo: r.codigo, 
      nombre: r.nombre, 
      descripcion: r.descripcion || '',
      categoria_id: r.categoria_id || '', 
      precio_unitario: r.precio_unitario,
      stock_actual: r.stock_actual, 
      stock_minimo: r.stock_minimo, 
      ubicacion_id: r.ubicacion_id || ''
    })
    setEditando(r.id)
    setModal('form')
  }

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleGuardar = async () => {
    setError(''); setSaving(true)
    const precioNum = parseFloat(form.precio_unitario)
if (isNaN(precioNum) || precioNum <= 0) {
  setError('El precio unitario debe ser mayor a cero.')
  setSaving(false)
  return
}

    // VALIDACIONES DE STOCK
    const stockVal  = parseInt(form.stock_actual)
    const minimoVal = parseInt(form.stock_minimo)
    
    if (isNaN(stockVal) || stockVal < 0) {
      setError('El stock no puede ser negativo.')
      setSaving(false)
      return
    }
    
    if (stockVal < minimoVal) {
      setError(`El stock asignado (${stockVal}) no puede ser menor que el stock mínimo (${minimoVal}).`)
      setSaving(false)
      return
    }

    try {
      const catId = form.categoria_id === '' || form.categoria_id === null ? null : parseInt(form.categoria_id)
      const ubiId = form.ubicacion_id === '' || form.ubicacion_id === null ? null : parseInt(form.ubicacion_id)

      const payload = {
        ...form,
        categoria_id: catId,
        ubicacion_id: ubiId,
        stock_actual: stockVal,
        stock_minimo: minimoVal
      }
      
      // Encontramos los textos correspondientes para pintarlos inmediatamente en la tabla
      const nombreCat = categorias.find(c => c.id === catId)?.nombre || '—'
      const nombreUbi = ubicaciones.find(u => u.id === ubiId)?.nombre || '—'

      if (editando) {
        const actualizado = await actualizarAccesorio(editando, payload)
        
        // CORREGIDO: Fusionamos los datos del servidor con los textos mapeados locales
        setAccesorios(prev =>
          prev.map(a => a.id === editando ? { 
            ...a, 
            ...actualizado, 
            categoria: nombreCat, 
            ubicacion: nombreUbi,
            stock_actual: stockVal,
            stock_minimo: minimoVal
          } : a)
        )
      } else {
        await crearAccesorio(payload)
        fetchAccesorios()
      }
      
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Desactivar este accesorio?')) return
    await eliminarAccesorio(id)
    fetchAccesorios()
  }

  const handleQrScaneado = useCallback((id) => {
    setScannerOpen(false)
    const rep = accesorios.find(r => r.id === id)
    if (rep) { setStockModal(rep); setMovForm({ tipo: 'ingreso', cantidad: '', motivo: '' }) }
  }, [accesorios])

  const handleMovimiento = async () => {
    setError(''); setSaving(true)
    try {
      await registrarMovimiento({
        accesorio_id: stockModal.id,
        tipo: movForm.tipo,
        cantidad: parseInt(movForm.cantidad) || 1,
        motivo: movForm.motivo,
        origen_qr: true
      })
      setStockModal(null)
      fetchAccesorios()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrar movimiento')
    } finally { setSaving(false) }
  }

  return (
    <div className="page">
      <Topbar title="Accesorios" />
      <div className="page__body">

        <div className="rep-toolbar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="rep-toolbar__actions">
            <button className="btn btn--ghost" onClick={() => setScannerOpen(true)}>
               Escanear QR
            </button>
            {isAdmin && (
              <button className="btn btn--primary" onClick={abrirCrear}>
                + Nuevo Accesorio
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="rep-loading">Cargando accesorios...</p>
        ) : (
          <div className="rep-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th><th>Nombre</th><th>Categoría</th>
                  <th>Precio</th><th>Estado de Stock</th><th>Ubicación</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accesoriosFiltrados.map(r => (
                  <tr key={r.id}>
                    <td><code className="rep-codigo">{r.codigo}</code></td>
                    <td>{r.nombre}</td>
                    <td>{r.categoria || '—'}</td>
                    <td>${parseFloat(r.precio_unitario).toFixed(2)}</td>
                    <td><StockBar actual={parseInt(r.stock_actual)} minimo={parseInt(r.stock_minimo)} /></td>
                    <td>{r.ubicacion || '—'}</td>
                    <td>
                      <div className="rep-actions">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => { setQrTarget(r); setModal('qr') }}
                          title="Ver QR"
                        >QR</button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => { setStockModal(r); setMovForm({ tipo: 'ingreso', cantidad: '', motivo: '' }) }}
                        >± Stock</button>
                        {isAdmin && (
                          <>
                            <button className="btn btn--ghost btn--sm" onClick={() => abrirEditar(r)}>✏</button>
                            <button className="btn btn--danger btn--sm" onClick={() => handleEliminar(r.id)}>✕</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {accesoriosFiltrados.length === 0 && (
                  <tr><td colSpan={7} className="rep-empty">No se encontraron accesorios</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'form' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editando ? 'Editar Accesorio' : 'Nuevo Accesorio'}</h2>
              <button className="modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="rep-form-grid">

              {editando && (
                <div className="form-field">
                  <label>Código (auto-generado)</label>
                  <input type="text" value={form.codigo || ''} disabled style={{ opacity: 0.5 }} />
                </div>
              )}

              <div className="form-field">
                  <label>Nombre</label>
                  <input name="nombre" type="text" value={form.nombre} onChange={handleFormChange} />
              </div>

              <div className="form-field" key="precio_unitario">
                <label>Precio Unitario</label>
                <div className="input-prefix-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="input-prefix-wrap__symbol" style={{ fontWeight: 'bold' }}>$</span>
                  <input
                    name="precio_unitario"
                    type="number"
                    value={form.precio_unitario}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* CAMPOS DE STOCK MAPEADOS DINÁMICAMENTE */}
              {[
                { name: 'stock_actual',    label: editando ? 'Stock Actual' : 'Stock Inicial',   type: 'number' },
                { name: 'stock_minimo',    label: 'Stock Mínimo',    type: 'number' },
              ].map(f => (
                <div className="form-field" key={f.name}>
                    <label>{f.label}</label>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleFormChange} />
                </div>
              ))}

              <div className="form-field">
                <label>Categoría</label>
                <select
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleFormChange}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Ubicación</label>
                <select
                  name="ubicacion_id"
                  value={form.ubicacion_id}
                  onChange={handleFormChange}
                >
                  <option value="">Sin ubicación</option>
                  {ubicaciones.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-field rep-form-grid--full">
                <label>Descripción</label>
                <textarea name="descripcion" rows={3} value={form.descripcion} onChange={handleFormChange} />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleGuardar} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'qr' && qrTarget && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Código QR — {qrTarget.codigo}</h2>
              <button className="modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <QRGenerator accesorio={qrTarget} />
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Ajuste de Stock</h2>
              <button className="modal__close" onClick={() => setStockModal(null)}>✕</button>
            </div>
            <div className="stock-modal-info">
              <p className="stock-modal-name">{stockModal.nombre}</p>
              <p className="stock-modal-code">{stockModal.codigo}</p>
              <p className="stock-modal-current">
                Stock actual: <strong>{stockModal.stock_actual}</strong>
              </p>
            </div>
            <div className="stock-tipo-btns">
              {['image_d8e6ce.png', 'salida'].map(t => {
                const tipoReal = t === 'image_d8e6ce.png' ? 'ingreso' : 'salida';
                return (
                  <button
                    key={tipoReal}
                    className={`stock-tipo-btn${movForm.tipo === tipoReal ? ' stock-tipo-btn--active-' + tipoReal : ''}`}
                    onClick={() => setMovForm(f => ({ ...f, tipo: tipoReal }))}
                  >{tipoReal === 'ingreso' ? '▲ Ingreso' : '▼ Salida'}</button>
                )
              })}
            </div>
            <div className="stock-cantidad-wrap">
              <button
                className="stock-cant-btn"
                onClick={() => setMovForm(f => ({ ...f, cantidad: Math.max(1, (parseInt(f.cantidad) || 1) - 1) }))}
              >−</button>
              <input
                className="stock-cant-input"
                type="number" min="1"
                value={movForm.cantidad}
                onChange={e => setMovForm(f => ({ ...f, cantidad: e.target.value }))}
                onFocus={e => e.target.select()}
              />
              <button
                className="stock-cant-btn"
                onClick={() => setMovForm(f => ({ ...f, cantidad: (parseInt(f.cantidad) || 0) + 1 }))}
              >+</button>
            </div>
            <div className="form-field" style={{ marginTop: '14px' }}>
              <label>Motivo (opcional)</label>
              <input
                type="text" value={movForm.motivo}
                onChange={e => setMovForm(f => ({ ...f, motivo: e.target.value }))}
                placeholder="Ej: Compra proveedor, Venta cliente..."
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setStockModal(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleMovimiento} disabled={saving}>
                {saving ? 'Registrando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <div className="modal-overlay" onClick={() => setScannerOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title"> Escanear QR</h2>
              <button className="modal__close" onClick={() => setScannerOpen(false)}>✕</button>
            </div>
            <QRScanner onScanned={handleQrScaneado} />
          </div>
        </div>
      )}
    </div>
  )
}