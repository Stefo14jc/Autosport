import { useState, useCallback } from 'react'
import api from '../api/axiosClient'

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [meta, setMeta]               = useState({ total: 0, page: 1 })
  const [loading, setLoading]         = useState(false)

  const fetchMovimientos = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/movimientos', { params: { page, limit: 20 } })
      setMovimientos(data.data)
      setMeta({ total: data.total, page: data.page })
    } finally { setLoading(false) }
  }, [])

  const registrarMovimiento = useCallback(async (body) => {
    const { data } = await api.post('/movimientos', body)
    return data
  }, [])

  return { movimientos, meta, loading, fetchMovimientos, registrarMovimiento }
}