import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './QRGenerator.css'

export default function QRGenerator({ accesorio }) {
  const canvasRef = useRef(null)

  const qrValue = `${window.location.origin}/accesorios/scan/${accesorio.id}`

  const handleDescargar = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `QR_${accesorio.codigo}.png`
    a.click()
  }

  const handleImprimir = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const ventana = window.open('', '_blank')
    ventana.document.write(`
      <html>
        <head>
          <title>Etiqueta QR — ${accesorio.codigo}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; background: #fff; }
            .etiqueta { text-align: center; border: 2px solid #000; padding: 20px; width: 260px; border-radius: 8px; }
            .etiqueta img { width: 200px; height: 200px; }
            .etiqueta h2 { font-size: 16px; margin: 10px 0 4px; }
            .etiqueta p { font-size: 12px; color: #555; margin: 2px 0; }
            .etiqueta .codigo { font-size: 14px; font-weight: bold; color: #F97316; margin-top: 6px; }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          <div class="etiqueta">
            <img src="${dataUrl}" />
            <h2>${accesorio.nombre}</h2>
            <p class="codigo">${accesorio.codigo}</p>
            <p>Ubicación: ${accesorio.ubicacion || '—'}</p>
            <p>Stock mín: ${accesorio.stock_minimo}</p>
          </div>
        </body>
      </html>
    `)
    ventana.document.close()
  }

  return (
    <div className="qrgen">
      <div className="qrgen__canvas" ref={canvasRef}>
        <QRCodeCanvas
          value={qrValue}
          size={200}
          bgColor="#ffffff"
          fgColor="#0A0A0A"
          level="H"
          includeMargin
        />
      </div>
      <div className="qrgen__info">
        <p className="qrgen__nombre">{accesorio.nombre}</p>
        <p className="qrgen__codigo">{accesorio.codigo}</p>
        {accesorio.ubicacion && <p className="qrgen__ubicacion">{accesorio.ubicacion}</p>}
      </div>
      <div className="qrgen__actions">
        <button className="btn btn--ghost" onClick={handleDescargar}>⬇ Descargar QR</button>
        <button className="btn btn--primary" onClick={handleImprimir}>🖨 Imprimir Etiqueta</button>
      </div>
    </div>
  )
}