import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function TopBar() {
  const [hora, setHora] = useState(() => new Date())
  const [online, setOnline] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 30_000)
    const ping = () =>
      fetch('/api/categorias').then(r => setOnline(r.ok)).catch(() => setOnline(false))
    ping()
    const p = setInterval(ping, 20_000)
    return () => { clearInterval(t); clearInterval(p) }
  }, [])

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand" aria-label="Coolbox inicio">
        <Logo size={30} tagline />
      </Link>
      <div className="topbar__meta">
        <span className={`pill-status ${online ? 'is-on' : online === false ? 'is-off' : ''}`}>
          <i />
          {online ? 'CoolBoxBD conectada' : online === false ? 'Sin conexión a la BD' : 'Conectando…'}
        </span>
        <span className="topbar__time">
          {hora.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })} ·{' '}
          {hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </header>
  )
}
