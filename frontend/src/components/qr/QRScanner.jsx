import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QRScanner.css";

export default function QRScanner({ onScanned }) {
  const scannerRef = useRef(null);
  const idRef = useRef("qr-reader-" + Date.now());
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");

  // Función segura para detener y limpiar la cámara
  const detenerEscaner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error limpiando cámara:", err);
      }
    }
  };

  // Limpieza al desmontar el componente (evita pantalla negra)
  useEffect(() => {
    return () => {
      detenerEscaner();
    };
  }, []);

  // Procesa JSONs, URLs y IDs simples sin fallar
  const procesarLectura = async (decodedText) => {
    await detenerEscaner();

    let id = null;
    let codigo = "";

    try {
      const textoLimpio = decodedText.trim();

      // 1. Formato JSON (ej: {"id": 5, "codigo": "ACC-01"})
      if (textoLimpio.startsWith("{")) {
        const data = JSON.parse(textoLimpio);
        id = data.id;
        codigo = data.codigo || `ID: ${id}`;
      }
      // 2. Formato URL (ej: https://.../scan/5)
      else if (textoLimpio.includes("/scan/")) {
        const partes = textoLimpio.split("/scan/");
        id = partes[partes.length - 1].replace("/", "").trim();
        codigo = `ID: ${id}`;
      }
      // 3. Formato ID plano (ej: "5" o "ACC-01")
      else if (textoLimpio.length > 0) {
        id = textoLimpio;
        codigo = `ID: ${id}`;
      }

      if (id) {
        setEstado("success");
        setMensaje(` Accesorio detectado: ${codigo}`);
        setTimeout(() => onScanned(id), 600);
      } else {
        setEstado("error");
        setMensaje(" QR no corresponde a un accesorio AUTOSPORT");
      }
    } catch {
      setEstado("error");
      setMensaje(" QR inválido");
    }
  };

  const iniciar = async () => {
    setEstado("starting");
    setMensaje("");
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
    } catch (err) {
      setEstado("error");
      setMensaje("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const detener = async () => {
    await detenerEscaner();
    setEstado("idle");
    setMensaje("");
  };

  return (
    <div className="qrscanner">
      <div id={idRef.current} className="qrscanner__viewport" />

      {estado === "idle" && (
        <div className="qrscanner__idle">
          <p>
            Presiona el botón para activar la cámara y escanear el código QR del
            accesorio.
          </p>
          <button className="btn btn--primary" onClick={iniciar}>
            Activar Cámara
          </button>
        </div>
      )}

      {estado === "starting" && (
        <p className="qrscanner__msg">Iniciando cámara...</p>
      )}

      {estado === "scanning" && (
        <div className="qrscanner__scanning">
          <div className="qrscanner__pulse" />
          <p className="qrscanner__msg">Apunta la cámara al código QR</p>
          <button className="btn btn--ghost" onClick={detener}>
            Cancelar
          </button>
        </div>
      )}

      {(estado === "success" || estado === "error") && (
        <div className={`qrscanner__result qrscanner__result--${estado}`}>
          <p>{mensaje}</p>
          {estado === "error" && (
            <button
              className="btn btn--ghost"
              onClick={() => setEstado("idle")}>
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
