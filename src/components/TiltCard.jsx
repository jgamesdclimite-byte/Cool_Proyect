import { useRef } from 'react'

// Tarjeta con inclinación 3D y brillo que sigue al cursor
export default function TiltCard({ as: Tag = 'article', className = '', children, max = 8, style, ...rest }) {
  const ref = useRef(null)

  function move(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * max}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * max}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }
  function leave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave} style={style} {...rest}>
      {children}
    </Tag>
  )
}
