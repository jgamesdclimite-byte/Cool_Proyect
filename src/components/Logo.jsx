// Logo Coolbox: hexágono rojo + wordmark redondeado "coolbox"
export function Hexagon({ size = 40, stroke = 15, color = 'var(--red)', className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 12 83 31v38L50 88 17 69V31Z"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ size = 34, light = false, tagline = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`} style={{ '--logo-size': `${size}px` }}>
      <Hexagon size={size} />
      <span className="logo__text">
        <span className="logo__word">coolbox</span>
        {tagline && <span className="logo__tag">Tecnología &amp; Electrónica</span>}
      </span>
    </span>
  )
}
