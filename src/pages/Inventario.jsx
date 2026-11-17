import { useState } from 'react'
import { api, ESTADOS, soles } from '../api.js'
import useCatalogo from '../hooks/useCatalogo.js'
import TiltCard from '../components/TiltCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { useToast } from '../components/Toast.jsx'
import { IconAlert, IconMinus, IconPlus, IconSearch } from '../components/Icons.jsx'

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ok', label: 'En stock' },
  { id: 'bajo', label: 'Bajo stock' },
  { id: 'agotado', label: 'Agotados' },
]
const PRIORIDAD = { agotado: 0, bajo: 1, ok: 2 }

export default function Inventario() {
  const { productos, setProductos, cargando, error } = useCatalogo()
  const [filtro, setFiltro] = useState('todos')
  const [q, setQ] = useState('')
  const toast = useToast()

  const cuenta = id => (id === 'todos' ? productos.length : productos.filter(p => p.estado_stock === id).length)
  const lista = productos
    .filter(p => (filtro === 'todos' || p.estado_stock === filtro) && `${p.nombre} ${p.marca}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => PRIORIDAD[a.estado_stock] - PRIORIDAD[b.estado_stock] || a.stock - b.stock)

  const valor = productos.reduce((s, p) => s + p.precio * p.stock, 0)
  const alertas = cuenta('bajo') + cuenta('agotado')

  async function ajustar(p, delta) {
    try {
      const nuevo = await api.patch(`/productos/${p.id_producto}/stock`, { delta })
      setProductos(ps => ps.map(x => (x.id_producto === p.id_producto ? nuevo : x)))
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Control de stock</span>
          <h1>Inventario</h1>
        </div>
        <div className="inv-kpis">
          <div><span>Valor en tienda</span><b>{soles(valor)}</b></div>
          <div className={alertas ? 'is-hot' : ''}><span>Alertas</span><b>{alertas}</b></div>
        </div>
      </section>

      {alertas > 0 && (
        <div className="alert-strip">
          <IconAlert />
          <span><b>{cuenta('bajo')}</b> productos con bajo stock y <b>{cuenta('agotado')}</b> agotados. Están resaltados en rojo.</span>
        </div>
      )}

      <div className="toolbar">
        <div className="segmented">
          {FILTROS.map(f => (
            <button key={f.id} className={`seg seg--${f.id} ${filtro === f.id ? 'is-on' : ''}`} onClick={() => setFiltro(f.id)}>
              {f.label} <span>{cuenta(f.id)}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <IconSearch />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar en inventario…" />
        </label>
      </div>

      {error && <div className="banner-error">{error}</div>}

      <div className="inv-grid">
        {cargando && Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton skeleton--short" />)}
        {lista.map((p, i) => {
          const est = ESTADOS[p.estado_stock]
          const tope = Math.max(p.stock_minimo * 3, p.stock, 1)
          const pct = Math.round((p.stock / tope) * 100)
          return (
            <TiltCard key={p.id_producto} className={`inv-card inv-card--${est.cls}`} max={5} style={{ '--i': i, '--pct': pct }}>
              {p.estado_stock !== 'ok' && (
                <span className="inv-card__flag"><IconAlert /> {est.label.toUpperCase()}</span>
              )}
              <div className="inv-card__top">
                <ProductImage producto={p} />
                <div className="ring" aria-label={`${p.stock} unidades`}>
                  <span>{p.stock}</span>
                  <small>und.</small>
                </div>
              </div>
              <div className="inv-card__info">
                <span className="pcard__brand">{p.marca} · {p.categoria}</span>
                <h3>{p.nombre}</h3>
                <div className="meter"><i /></div>
                <div className="inv-card__row">
                  <small>Mínimo: {p.stock_minimo} und.</small>
                  <small>{soles(p.precio)}</small>
                </div>
              </div>
              <div className="inv-card__adjust">
                <button onClick={() => ajustar(p, -1)} disabled={p.stock === 0} aria-label="Restar stock"><IconMinus /></button>
                <span className={`stock-chip stock-chip--${est.cls}`}>{est.label}</span>
                <button onClick={() => ajustar(p, 1)} aria-label="Sumar stock"><IconPlus /></button>
              </div>
            </TiltCard>
          )
        })}
        {!cargando && !lista.length && <p className="empty">Nada por aquí.</p>}
      </div>
    </div>
  )
}
