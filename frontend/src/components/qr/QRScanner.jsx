import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../api/axiosClient";
import "./QRScanner.css";

export default function QRScanner({ onScanned }) {
  const scannerRef = useRef(null);
  const idRef = useRef("qr-reader-" + Date.now());
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");
  const [accesorio, setAccesorio] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(false);

  const detenerEscaner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error al detener cámara:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      detenerEscaner();
    };
  }, []);

  const obtenerInfoAccesorio = async (id) => {
    setCargandoInfo(true);
    try {
      const res = await api.get(`/accesorios/scan/${id}`);
      setAccesorio(res.data);
      setEstado("info");
    } catch {
      setEstado("error");
      setMensaje("Accesorio no encontrado o inactivo en el sistema");
    } finally {
      setCargandoInfo(false);
    }
  };

  const procesarLectura = async (decodedText) => {
    await detenerEscaner();
    let id = null;
    try {
      const textoLimpio = decodedText.trim();
      if (textoLimpio.startsWith("{")) {
        const data = JSON.parse(textoLimpio);
        id = data.id;
      } else if (textoLimpio.includes("/scan/")) {
        const partes = textoLimpio.split("/scan/");
        id = partes[partes.length - 1].replace("/", "").trim();
      } else if (textoLimpio.length > 0) {
        id = textoLimpio;
      }

      if (id) {
        await obtenerInfoAccesorio(id);
      } else {
        setEstado("error");
        setMensaje("QR no corresponde a un accesorio AUTOSPORT");
      }
    } catch {
      setEstado("error");
      setMensaje("Código QR inválido");
    }
  };

  const iniciar = async () => {
    setEstado("starting");
    setMensaje("");
    setAccesorio(null);
    try {
      const scanner = new Html5Qrcode(idRef.current);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => procesarLectura(decodedText),
        () => {},
      );
      setEstado("scanning");
    } catch {
      setEstado("error");
      setMensaje("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const reintentar = () => {
    setEstado("idle");
    setMensaje("");
    setAccesorio(null);
  };

  return (
    <div className="qrscanner">
      <div
        id={idRef.current}
        className="qrscanner__viewport"
        style={{ display: estado === "info" ? "none" : "block" }}
      />

      {estado === "idle" && (
        <div className="qrscanner__idle">
          <p>
            Presiona el botón para activar la cámara y escanear el código QR.
          </p>
          <button className="btn btn--primary" onClick={iniciar}>
            Activar Cámara
          </button>
        </div>
      )}

      {estado === "starting" && (
        <p className="qrscanner__msg">Iniciando cámara...</p>
      )}
      {cargandoInfo && (
        <p className="qrscanner__msg">
          Consultando información del accesorio...
        </p>
      )}

      {estado === "scanning" && (
        <div className="qrscanner__scanning">
          <div className="qrscanner__pulse" />
          <p className="qrscanner__msg">Apunta la cámara al código QR</p>
          <button className="btn btn--ghost" onClick={reintentar}>
            Cancelar
          </button>
        </div>
      )}

      {estado === "info" && accesorio && (
        <div className="qrscanner__preview">
          {/* Cabecera centrada similar al Ajuste de Stock */}
          <div className="qrscanner__preview-header">
            <h3 className="qrscanner__title">{accesorio.nombre}</h3>
            <span className="qrscanner__code">{accesorio.codigo}</span>
          </div>

          {/* Tarjeta de detalles */}
          <div className="qrscanner__details-card">
            <div className="qrscanner__detail-row">
              <span className="qrscanner__detail-label">Categoría</span>
              <span className="qrscanner__detail-value">
                {accesorio.categoria || "Sin categoría"}
              </span>
            </div>
            <div className="qrscanner__detail-row">
              <span className="qrscanner__detail-label">Ubicación</span>
              <span className="qrscanner__detail-value">
                {accesorio.ubicacion || "No asignada"}
              </span>
            </div>
            <div className="qrscanner__detail-row">
              <span className="qrscanner__detail-label">Precio</span>
              <span className="qrscanner__detail-value">
                ${parseFloat(accesorio.precio_unitario || 0).toFixed(2)}
              </span>
            </div>
            <div className="qrscanner__detail-row qrscanner__detail-row--stock">
              <span className="qrscanner__detail-label">Stock actual</span>
              <span className="qrscanner__detail-value">
                <strong>{accesorio.stock_actual}</strong>
              </span>
            </div>
          </div>

          {/* Botones apilados con el mismo estilo */}
          <div className="qrscanner__actions-stack">
            <button
              className="btn btn--primary btn--full"
              onClick={() => onScanned(accesorio.id)}>
              Confirmar Selección
            </button>
            <button className="btn btn--ghost btn--full" onClick={reintentar}>
              Escanear otro
            </button>
          </div>
        </div>
      )}

      {estado === "error" && (
        <div className="qrscanner__result qrscanner__result--error">
          <p>{mensaje}</p>
          <button className="btn btn--ghost" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
