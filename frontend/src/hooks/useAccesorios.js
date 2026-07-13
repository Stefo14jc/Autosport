import { useState, useCallback } from 'react'
import api from '../api/axiosClient'

export function useAccesorios() {
  const [accesorios, setAccesorios] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const fetchAccesorios = useCallback(async (params = {}) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.get('/accesorios', { params })
      setAccesorios(data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar accesorios')
    } finally { setLoading(false) }
  }, [])

  const crearAccesorio    = useCallback(async (body) => { const { data } = await api.post('/accesorios', body); return data }, [])
  const actualizarAccesorio = useCallback(async (id, body) => { const { data } = await api.put(`/accesorios/${id}`, body); return data }, [])
  const eliminarAccesorio = useCallback(async (id) => { await api.delete(`/accesorios/${id}`) }, [])

  return { accesorios, loading, error,setAccesorios, fetchAccesorios, crearAccesorio, actualizarAccesorio, eliminarAccesorio }
}