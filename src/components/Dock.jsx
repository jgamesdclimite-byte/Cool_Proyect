import { NavLink } from 'react-router-dom'
import { IconBox, IconCart, IconChart, IconHome, IconPin } from './Icons.jsx'

const LINKS = [
  { to: '/', label: 'Inicio', Icon: IconHome, end: true },
  { to: '/productos', label: 'Productos', Icon: IconBox },
  { to: '/venta', label: 'Vender', Icon: IconCart, accent: true },
  { to: '/inventario', label: 'Inventario', Icon: IconChart },
  { to: '/contacto', label: 'Contacto', Icon: IconPin },
]

// Navegación tipo "dock" flotante inferior con celdas hexagonales
export default function Dock() {
  return (
    <nav className="dock" aria-label="Navegación principal">
      {LINKS.map(({ to, label, Icon, end, accent }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `dock__item ${isActive ? 'is-active' : ''} ${accent ? 'dock__item--accent' : ''}`}>
          <span className="dock__hex"><Icon /></span>
          <span className="dock__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
