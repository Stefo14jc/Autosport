import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import QRScanner from "../components/qr/QRScanner";
import "./ScanView.css";

export default function ScanView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [rep, setRep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [stockModal, setStockModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [movForm, setMovForm] = useState({
    tipo: "ingreso",
    cantidad: "1",
    motivo: "",
  });

  const cargarAccesorio = async (targetId) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/accesorios/scan/${targetId}`);
      setRep(res.data);
    } catch {
      setError("Accesorio no encontrado o inactivo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAccesorio(id);
  }, [id]);

  const handleQrScaneado = (nuevoId) => {
    setScannerOpen(false);
    navigate(`/scan/${nuevoId}`);
  };

  const handleMovimiento = async () => {
    setError("");
    setSaving(true);
    try {
      await api.post("/movimientos", {
        accesorio_id: rep.id,
        tipo: movForm.tipo,
        cantidad: parseInt(movForm.cantidad) || 1,
        motivo: movForm.motivo,
        origen_qr: true,
      });
      setStockModal(false);
      setMovForm({ tipo: "ingreso", cantidad: "1", motivo: "" });
      cargarAccesorio(id);
    } catch (e) {
      if (e.response?.status === 401) {
        setError("Debes iniciar sesión para registrar movimientos.");
      } else {
        setError(e.response?.data?.error || "Error al registrar movimiento");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="scan-loading">
        <div className="scan-loading__spinner" />
        <p>Cargando accesorio...</p>
      </div>
    );

  if (error && !rep)
    return (
      <div className="scan-error">
        <span className="scan-error__icon">⚠</span>
        <h2>No encontrado</h2>
        <p>{error}</p>
      </div>
    );

  const porcentaje =
    rep.stock_minimo === 0
      ? 100
      : Math.min((rep.stock_actual / (rep.stock_minimo * 2)) * 100, 100);
  const nivel =
    rep.stock_actual === 0
      ? "critico"
      : rep.stock_actual <= rep.stock_minimo
        ? "alerta"
        : "optimo";
  const nivelLabel = {
    critico: "Sin stock",
    alerta: "Stock bajo",
    optimo: "Disponible",
  };
  const nivelColor = {
    critico: "#EF4444",
    alerta: "#F97316",
    optimo: "#22C55E",
  };

  return (
    <div className="scan-view">
      <header className="scan-header">
        <span className="scan-header__logo">
          AUTO<span>SPORT</span>
        </span>
        <span className="scan-header__tag">Ficha de Accesorio</span>
      </header>

      <main className="scan-main">
        <div className="scan-card">
          <div className="scan-card__top">
            <div className="scan-badge-codigo">{rep.codigo}</div>
            {rep.categoria && (
              <div className="scan-badge-cat">{rep.categoria}</div>
            )}
          </div>

          <h1 className="scan-nombre">{rep.nombre}</h1>
          {rep.descripcion && <p className="scan-desc">{rep.descripcion}</p>}

          <div className="scan-grid">
            <div className="scan-dato">
              <span className="scan-dato__icon">📍</span>
              <div>
                <p className="scan-dato__label">Ubicación en bodega</p>
                <p className="scan-dato__valor">
                  {rep.ubicacion || "No asignada"}
                </p>
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
                style={{ color: nivelColor[nivel] }}>
                {nivelLabel[nivel]}
              </span>
            </div>
            <div
              className="scan-stock__numero"
              style={{ color: nivelColor[nivel] }}>
              {rep.stock_actual}
              <span className="scan-stock__unidad"> unidades</span>
            </div>
            <div className="scan-stock__track">
              <div
                className="scan-stock__fill"
                style={{
                  width: `${Math.max(porcentaje, 4)}%`,
                  background: nivelColor[nivel],
                }}
              />
            </div>
            <p className="scan-stock__minimo">
              Mínimo requerido: {rep.stock_minimo} Unidades
            </p>
          </div>

          {/* ÚLTIMOS 5 MOVIMIENTOS */}
          <div className="scan-movimientos">
            <h3 className="scan-movimientos__titulo">Últimos Movimientos</h3>
            {rep.ultimos_movimientos && rep.ultimos_movimientos.length > 0 ? (
              <div className="scan-movimientos__lista">
                {rep.ultimos_movimientos.map((m) => (
                  <div key={m.id} className="scan-movimiento-card">
                    <div className="scan-movimiento-card__header">
                      <span className={`scan-badge-tipo scan-badge-tipo--${m.tipo}`}>
                        {m.tipo === "ingreso" ? "▲ +" : "▼ - "}{m.cantidad} un.
                      </span>
                      <span className="scan-movimiento-card__usuario">
                        {m.usuario || "Usuario"}
                      </span>
                    </div>
                    <div className="scan-movimiento-card__details">
                      <span className="scan-movimiento-card__fecha">
                        {new Date(m.created_at).toLocaleString("es-EC", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      {m.motivo && (
                        <span className="scan-movimiento-card__motivo">
                          • {m.motivo}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="scan-movimientos__empty">
                Sin movimientos registrados recientemente.
              </p>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="scan-actions-stack">
            <button
              className="btn btn--primary btn--full"
              onClick={() => {
                if (!usuario) {
                  navigate("/login");
                } else {
                  setStockModal(true);
                }
              }}>
              {usuario ? "Ajustar Stock" : "Iniciar Sesión para Ajustar"}
            </button>
            <button
              className="btn btn--ghost btn--full"
              onClick={() => setScannerOpen(true)}>
              Escanear otro
            </button>
          </div>
        </div>
      </main>

      {/* MODAL DE AJUSTE DE STOCK */}
      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Ajuste de Stock</h2>
              <button
                className="modal__close"
                onClick={() => setStockModal(false)}>
                ✕
              </button>
            </div>

            <div className="stock-modal-info">
              <p className="stock-modal-name">{rep.nombre}</p>
              <p className="stock-modal-code">{rep.codigo}</p>
              <p className="stock-modal-current">
                Stock actual: <strong>{rep.stock_actual}</strong>
              </p>
            </div>

            <div className="stock-tipo-btns">
              {["ingreso", "salida"].map((tipoReal) => (
                <button
                  key={tipoReal}
                  className={`stock-tipo-btn${
                    movForm.tipo === tipoReal
                      ? " stock-tipo-btn--active-" + tipoReal
                      : ""
                  }`}
                  onClick={() => setMovForm((f) => ({ ...f, tipo: tipoReal }))}>
                  {tipoReal === "ingreso" ? "▲ Ingreso" : "▼ Salida"}
                </button>
              ))}
            </div>

            <div className="stock-cantidad-wrap">
              <button
                className="stock-cant-btn"
                onClick={() =>
                  setMovForm((f) => ({
                    ...f,
                    cantidad: Math.max(1, (parseInt(f.cantidad) || 1) - 1),
                  }))
                }>
                −
              </button>
              <input
                className="stock-cant-input"
                type="number"
                min="1"
                value={movForm.cantidad}
                onChange={(e) =>
                  setMovForm((f) => ({ ...f, cantidad: e.target.value }))
                }
                onFocus={(e) => e.target.select()}
              />
              <button
                className="stock-cant-btn"
                onClick={() =>
                  setMovForm((f) => ({
                    ...f,
                    cantidad: (parseInt(f.cantidad) || 0) + 1,
                  }))
                }>
                +
              </button>
            </div>

            <div className="form-field" style={{ marginTop: "14px" }}>
              <label>Motivo (opcional)</label>
              <input
                type="text"
                value={movForm.motivo}
                onChange={(e) =>
                  setMovForm((f) => ({ ...f, motivo: e.target.value }))
                }
                placeholder="Ej: Ajuste rápido, Venta..."
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setStockModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn--primary"
                onClick={handleMovimiento}
                disabled={saving}>
                {saving ? "Registrando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ESCANEAR OTRO */}
      {scannerOpen && (
        <div className="modal-overlay" onClick={() => setScannerOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Escanear QR</h2>
              <button
                className="modal__close"
                onClick={() => setScannerOpen(false)}>
                ✕
              </button>
            </div>
            <QRScanner onScanned={handleQrScaneado} />
          </div>
        </div>
      )}

      <footer className="scan-footer">
        <p>Actualizado en tiempo real · AUTOSPORT © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}