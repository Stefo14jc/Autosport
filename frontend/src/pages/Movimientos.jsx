import { useEffect } from "react";
import Topbar from "../components/layout/Topbar";
import { useMovimientos } from "../hooks/useMovimientos";
import "./Movimientos.css";

export default function Movimientos() {
  const { movimientos, meta, loading, fetchMovimientos } = useMovimientos();

  useEffect(() => {
    fetchMovimientos(1);
  }, [fetchMovimientos]);

  return (
    <div className="page">
      <Topbar title="Historial de Movimientos" />
      <div className="page__body">
        <div className="mov-meta">
          <span>{meta.total} movimientos en total</span>
        </div>
        {loading ? (
          <p className="rep-loading">Cargando movimientos...</p>
        ) : (
          <>
            <div className="rep-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Accesorio</th>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock Ant.</th>
                    <th>Stock Nuevo</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td data-label="Fecha" className="mov-fecha">
                        {new Date(m.created_at).toLocaleString("es-EC")}
                      </td>
                      <td data-label="Accesorio">{m.accesorio}</td>
                      <td data-label="Código">
                        <code className="rep-codigo">{m.codigo}</code>
                      </td>
                      <td data-label="Tipo">
                        <span className={`badge badge--${m.tipo}`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td data-label="Cantidad" className="mov-cantidad">
                        {m.tipo === "ingreso" ? "+" : "−"}
                        {m.cantidad}
                      </td>
                      <td data-label="Stock Ant.">{m.stock_anterior}</td>
                      <td data-label="Stock Nuevo">
                        <strong>{m.stock_nuevo}</strong>
                      </td>
                      <td data-label="Usuario">{m.usuario}</td>
                    </tr>
                  ))}
                  {movimientos.length === 0 && (
                    <tr>
                      <td colSpan={8} className="rep-empty">
                        Sin movimientos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mov-pagination">
              {Array.from(
                { length: Math.ceil(meta.total / 20) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  className={`mov-page-btn${meta.page === p ? " mov-page-btn--active" : ""}`}
                  onClick={() => fetchMovimientos(p)}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
