import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axiosClient";
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
          <h3>{accesorio.nombre}</h3>
          <p className="qrscanner__code">Código: {accesorio.codigo}</p>

          <div className="qrscanner__details">
            <p>
              <strong>Categoría:</strong>{" "}
              {accesorio.categoria || "Sin categoría"}
            </p>
            <p>
              <strong>Ubicación:</strong> {accesorio.ubicacion || "No asignada"}
            </p>
            <p>
              <strong>Precio:</strong> $
              {parseFloat(accesorio.precio_unitario || 0).toFixed(2)}
            </p>
            <p>
              <strong>Stock actual:</strong> {accesorio.stock_actual} unidades
            </p>
          </div>

          <div className="qrscanner__actions">
            <button
              className="btn btn--primary"
              onClick={() => onScanned(accesorio.id)}>
              Continuar / Seleccionar
            </button>
            <button className="btn btn--ghost" onClick={reintentar}>
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
