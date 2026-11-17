import { useState } from 'react'

// Recuerda qué archivos no existen para no volver a pedirlos (evita parpadeos)
const faltantes = new Set()

// Muestra /productos/<imagen>. Si el archivo aún no existe, dibuja un placeholder con la marca.
export default function ProductImage({ producto, className = '' }) {
  const src = `/productos/${producto.imagen}${producto._v ? `?v=${producto._v}` : ''}`
  const [rota, setRota] = useState(() => faltantes.has(src))

  if (rota || !producto.imagen) {
    return (
      <div className={`pimg pimg--empty ${className}`} title={`Falta public/productos/${producto.imagen}`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 12 83 31v38L50 88 17 69V31Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        </svg>
        <span className="pimg__brand">{producto.marca}</span>
        <span className="pimg__file">{producto.imagen}</span>
      </div>
    )
  }
  return (
    <img
      className={`pimg ${className}`}
      src={src}
      alt={producto.nombre}
      loading="lazy"
      onError={() => { faltantes.add(src); setRota(true) }}
    />
  )
}
