import { useEffect, useState } from 'react'
import Topbar from '../components/layout/Topbar'
import api from '../api/axiosClient'
import './Usuarios.css'

const EMPTY = { nombre: '', email: '', password: '', rol: 'bodeguero' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [editando, setEditando] = useState(null)
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data } = await api.get('/usuarios')
    setUsuarios(data); setLoading(false)
  }

  useEffect(() => { fetchUsuarios() }, [])

  const abrirCrear  = () => { setForm(EMPTY); setEditando(null); setError(''); setModal(true) }
  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol })
    setEditando(u.id); setError(''); setModal(true)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleGuardar = async () => {
    setError(''); setSaving(true)
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i
    if (!emailRegex.test(form.email)) {
      setError('El correo debe terminar en .com (ej: usuario@gmail.com)')
      setSaving(false)
      return
    }
    if (!editando && (!form.password || form.password.length < 6)) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setSaving(false)
      return
    }
    if (editando && form.password && form.password.length < 6) {
      setError('Si cambias la contraseña, debe tener al menos 6 caracteres.')
      setSaving(false)
      return
    }
    try {
      if (editando) await api.put(`/usuarios/${editando}`, { ...form, activo: true })
      else await api.post('/usuarios', form)
      setModal(false); fetchUsuarios()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

const handleToggle = async (u) => {
    try {
      // Enviamos explícitamente solo el cambio de estado para evitar la validación de contraseñas
      await api.put(`/usuarios/${u.id}`, { 
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        activo: !u.activo 
      })
      fetchUsuarios() // Recarga la tabla para reflejar el cambio al lado
    } catch (e) {
      alert(e.response?.data?.error || 'Error al cambiar el estado del usuario')
    }
  }

  return (
    <div className="page">
      <Topbar title="Usuarios" />
      <div className="page__body">
        <div className="rep-toolbar">
          <h2 className="usr-subtitle">Gestión de usuarios del sistema</h2>
          <button className="btn btn--primary" onClick={abrirCrear}>+ Nuevo Usuario</button>
        </div>

        {loading ? <p className="rep-loading">Cargando...</p> : (
          <div className="rep-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td><span className={`rol-badge rol-badge--${u.rol}`}>{u.rol}</span></td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge--ingreso' : 'badge--salida'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="rep-actions">
                        <button className="btn btn--ghost btn--sm" onClick={() => abrirEditar(u)}>✏ Editar</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleToggle(u)}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal__close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="usr-form">
              {/* Renderizamos Nombre y Email dinámicamente sin incluir la contraseña aquí */}
              {[
                { name: 'nombre', label: 'Nombre completo', type: 'text' },
                { name: 'email',  label: 'Email',           type: 'email' },
              ].map(f => (
                <div className="form-field" key={f.name}>
                  <label>{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} />
                </div>
              ))}

              {/* CAMBIO DE CONTRASEÑA ESPECÍFICO */}
              <div className="form-field">
                <label>
                  {editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
                {form.password && form.password.length < 6 && (
                  <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '4px', display: 'block' }}>
                    Mínimo 6 caracteres ({form.password.length}/6)
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Rol</label>
                <select name="rol" value={form.rol} onChange={handleChange}>
                  <option value="bodeguero">Bodeguero</option>
                  <option value="admin">Administrador</option>
                </select>
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