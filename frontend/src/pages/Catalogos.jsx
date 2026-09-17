import { useEffect, useState } from 'react'
import Topbar from '../components/layout/Topbar'
import api from '../api/axiosClient'
import './Usuarios.css'

export default function Catalogos() {
  const [tab, setTab] = useState('categorias') // 'categorias' | 'ubicaciones'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/${tab}`)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [tab])

  const abrirCrear = () => {
    setNombre('')
    setEditando(null)
    setError('')
    setModal(true)
  }

  const abrirEditar = (item) => {
    setNombre(item.nombre)
    setEditando(item.id)
    setError('')
    setModal(true)
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError('El nombre no puede estar vacío.')
      return
    }
    setError('')
    setSaving(true)

    try {
      if (editando) {
        await api.put(`/${tab}/${editando}`, { nombre })
      } else {
        await api.post(`/${tab}`, { nombre })
      }
      setModal(false)
      fetchItems()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm(`¿Eliminar esta ${tab === 'categorias' ? 'categoría' : 'ubicación'}?`)) return
    try {
      await api.delete(`/${tab}/${id}`)
      fetchItems()
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div className="page">
      <Topbar title="Catálogos del Sistema" />
      <div className="page__body">
        
        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${tab === 'categorias' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setTab('categorias')}
          >
            Categorías
          </button>
          <button
            className={`btn ${tab === 'ubicaciones' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setTab('ubicaciones')}
          >
            Ubicaciones / Estanterías
          </button>
        </div>

        <div className="rep-toolbar">
          <h2 className="usr-subtitle">
            Gestión de {tab === 'categorias' ? 'Categorías' : 'Ubicaciones'}
          </h2>
          <button className="btn btn--primary" onClick={abrirCrear}>
            + Nueva {tab === 'categorias' ? 'Categoría' : 'Ubicación'}
          </button>
        </div>

        {loading ? (
          <p className="rep-loading">Cargando...</p>
        ) : (
          <div className="rep-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td data-label="ID">#{i.id}</td>
                    <td data-label="Nombre"><strong>{i.nombre}</strong></td>
                    <td data-label="Acciones">
                      <div className="rep-actions">
                        <button className="btn btn--ghost btn--sm" onClick={() => abrirEditar(i)}>
                          ✏ Editar
                        </button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleEliminar(i.id)}>
                          ✕ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="rep-empty">No hay registros cargados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editando ? 'Editar' : 'Nueva'} {tab === 'categorias' ? 'Categoría' : 'Ubicación'}
              </h2>
              <button className="modal__close" onClick={() => setModal(false)}>✕</button>
            </div>
            
            <div className="usr-form" style={{ display: 'block' }}>
              <div className="form-field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={`Ej: ${tab === 'categorias' ? 'Luces LED' : 'Estantería B3'}`}
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleGuardar} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}