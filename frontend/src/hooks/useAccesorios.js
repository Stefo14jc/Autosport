import { useState, useCallback } from "react";
import api from "../api/axiosClient";

export function useAccesorios() {
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccesorios = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/accesorios", { params });
      setAccesorios(data);
      // Guardamos la copia local al recibir los datos con éxito
      localStorage.setItem("cache_accesorios", JSON.stringify(data));
    } catch (e) {
      // Si falla (por falta de red o error del servidor), buscamos en caché
      const cached = localStorage.getItem("cache_accesorios");
      if (cached) {
        setAccesorios(JSON.parse(cached));
      } else {
        // Si no hay caché, mostramos el error original o el de falta de conexión
        setError(
          e.response?.data?.error || "Sin conexión y sin datos en caché",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const crearAccesorio = useCallback(async (body) => {
    const { data } = await api.post("/accesorios", body);
    return data;
  }, []);
  const actualizarAccesorio = useCallback(async (id, body) => {
    const { data } = await api.put(`/accesorios/${id}`, body);
    return data;
  }, []);
  const eliminarAccesorio = useCallback(async (id) => {
    await api.delete(`/accesorios/${id}`);
  }, []);

  return {
    accesorios,
    loading,
    error,
    setAccesorios,
    fetchAccesorios,
    crearAccesorio,
    actualizarAccesorio,
    eliminarAccesorio,
  };
}
