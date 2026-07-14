import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './QRScanner.css'

export default function QRScanner({ onScanned }) {
  const scannerRef = useRef(null)
  const idRef      = useRef('qr-reader-' + Date.now())
  const [estado, setEstado]   = useState('idle')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const iniciar = async () => {
    setEstado('starting'); setMensaje('')
    try {
      const scanner = new Html5Qrcode(idRef.current)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {})
          setEstado('success')
          try {
            const data = JSON.parse(decodedText)
            if (data.id) {
              setMensaje(` Accesorio detectado: ${data.codigo}`)
              setTimeout(() => onScanned(data.id), 800)
            } else {
              setMensaje(' QR no corresponde a un accesorio AUTOSPORT')
              setEstado('error')
            }
          } catch {
            setMensaje(' QR inválido')
            setEstado('error')
          }
        },
        () => {}
      )
      setEstado('scanning')
    } catch (err) {
      setEstado('error')
      setMensaje('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const detener = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
    setEstado('idle'); setMensaje('')
  }

  return (
    <div className="qrscanner">
      <div id={idRef.current} className="qrscanner__viewport" />

      {estado === 'idle' && (
        <div className="qrscanner__idle">
          <p>Presiona el botón para activar la cámara y escanear el código QR del accesorio.</p>
          <button className="btn btn--primary" onClick={iniciar}>Activar Cámara</button>
        </div>
      )}

      {estado === 'starting' && (
        <p className="qrscanner__msg">Iniciando cámara...</p>
      )}

      {estado === 'scanning' && (
        <div className="qrscanner__scanning">
          <div className="qrscanner__pulse" />
          <p className="qrscanner__msg">Apunta la cámara al código QR</p>
          <button className="btn btn--ghost" onClick={detener}>Cancelar</button>
        </div>
      )}

      {(estado === 'success' || estado === 'error') && (
        <div className={`qrscanner__result qrscanner__result--${estado}`}>
          <p>{mensaje}</p>
          {estado === 'error' && (
            <button className="btn btn--ghost" onClick={() => setEstado('idle')}>Reintentar</button>
          )}
        </div>
      )}
    </div>
  )
}