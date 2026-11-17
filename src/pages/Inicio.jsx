import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, descuento, soles } from '../api.js'
import useCatalogo from '../hooks/useCatalogo.js'
import { Hexagon } from '../components/Logo.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { IconAlert, IconArrow, IconBox, IconCart, IconCheck, IconPlus } from '../components/Icons.jsx'
import { TIENDA } from '../data/tienda.js'
import { PromoHero } from '../components/Promos.jsx'
import './Inicio.css'

/* ---------- utilidades ---------- */
function useAhora(ms = 1000) {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), ms)
    return () => clearInterval(id)
  }, [ms])
  return t
}

function Contador({ valor, formato = v => Math.round(v).toLocaleString('es-PE') }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, t0
    const step = t => {
      t0 ??= t
      const k = Math.min((t - t0) / 1100, 1)
      setV(valor * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [valor])
  return <>{formato(v)}</>
}

const solesCorto = v => (v >= 1000 ? `S/ ${(v / 1000).toFixed(1)}k` : `S/ ${Math.round(v)}`)

/* ---------- página ---------- */
export default function Inicio() {
  const { productos } = useCatalogo()
  const [res, setRes] = useState(null)
  const [est, setEst] = useState(null)

  useEffect(() => {
    api.get('/resumen').then(setRes).catch(() => {})
    api.get('/estadisticas').then(setEst).catch(() => {})
  }, [])

  const ofertas = productos.filter(p => descuento(p) > 0).sort((a, b) => descuento(b) - descuento(a)).slice(0, 9)
  const criticos = productos.filter(p => p.estado_stock !== 'ok').sort((a, b) => a.stock - b.stock)
  const hoy = est?.dias.at(-1)

  return (
    <div className="page dash">
      <Ticker ofertas={ofertas} criticos={criticos} />

      <div className="bento">
        <Saludo />

        <section className="tile tile--comb">
          <header className="tile__head">
            <h2>Panal de indicadores</h2>
            <span className="live-dot">En vivo</span>
          </header>
          <div className="comb">
            <HexKpi label="Productos" valor={res?.productos} />
            <HexKpi label="Unidades" valor={res?.unidades} />
            <HexKpi label="Ventas hoy" valor={hoy?.ventas} />
            <HexKpi label="Ingresos" valor={res?.ingresos} formato={solesCorto} red />
            <HexKpi label="Valor stock" valor={res?.valor_inventario} formato={solesCorto} dark />
            <HexKpi label="Alertas" valor={res ? res.bajo_stock + res.agotados : null} to="/inventario" alert={res && res.bajo_stock + res.agotados > 0} />
          </div>
        </section>

        <PromoHero />

        <VentasChart dias={est?.dias} />

        <SaludStock productos={productos} criticos={criticos} />

        <Coverflow items={ofertas} />

        <TopVendidos top={est?.top} />

        <section className="tile tile--cats">
          <header className="tile__head"><h2>Stock por categoría</h2></header>
          <div className="cat-cloud">
            {est?.categorias.map((c, i) => (
              <Link key={c.id_categoria} to={`/productos?cat=${c.id_categoria}`} className="cat-hex" style={{ '--i': i }}>
                <span className="cat-hex__icon">{c.icono}</span>
                <b>{c.unidades}</b>
                <small>{c.nombre}</small>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------- Letrero LED ---------- */
function Ticker({ ofertas, criticos }) {
  const msgs = [
    ...ofertas.map(p => ({ t: `${p.marca} ${p.nombre} a ${soles(p.precio)} (−${descuento(p)}%)`, k: 'oferta' })),
    ...criticos.map(p => ({ t: `${p.nombre}: ${p.stock === 0 ? 'AGOTADO' : `quedan ${p.stock}`}`, k: 'alerta' })),
  ]
  if (!msgs.length) msgs.push({ t: TIENDA.slogan, k: 'oferta' })
  const fila = [...msgs, ...msgs]
  return (
    <div className="ticker" aria-label="Ofertas y alertas">
      <span className="ticker__badge">COOLBOX LIVE</span>
      <div className="ticker__track" style={{ '--dur': `${Math.max(msgs.length * 5, 20)}s` }}>
        {fila.map((m, i) => (
          <span key={i} className={`ticker__msg ticker__msg--${m.k}`}>
            <Hexagon size={12} stroke={18} color={m.k === 'oferta' ? '#ffe500' : 'var(--red)'} />
            {m.k === 'oferta' ? 'OFERTA' : 'STOCK'} · {m.t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- Saludo con reloj ---------- */
function Saludo() {
  const ahora = useAhora()
  const h = ahora.getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const hh = String(h).padStart(2, '0')
  const mm = String(ahora.getMinutes()).padStart(2, '0')
  return (
    <section className="tile tile--hello">
      <div className="hello__glow" aria-hidden="true" />
      <Hexagon size={260} stroke={9} className="hello__hex" />
      <span className="eyebrow eyebrow--light">{TIENDA.nombre}</span>
      <h1 className="hello__title">{saludo},<br />equipo <em>Coolbox</em></h1>
      <div className="clock" aria-label={`${hh}:${mm}`}>
        <span>{hh}</span><i>:</i><span>{mm}</span>
        <small>{ahora.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
      </div>
      <div className="hello__actions">
        <Link to="/venta" className="action action--red"><IconCart /><span>Nueva venta</span><IconArrow /></Link>
        <Link to="/productos" className="action"><IconPlus /><span>Productos</span><IconArrow /></Link>
      </div>
    </section>
  )
}

/* ---------- Hexágono KPI ---------- */
function HexKpi({ label, valor, formato, red, dark, alert, to }) {
  const Tag = to ? Link : 'div'
  return (
    <Tag to={to} className={`hexkpi ${red ? 'hexkpi--red' : ''} ${dark ? 'hexkpi--dark' : ''} ${alert ? 'hexkpi--alert' : ''}`}>
      <span className="hexkpi__val">{valor == null ? '—' : <Contador valor={Number(valor)} formato={formato} />}</span>
      <span className="hexkpi__label">{alert && <IconAlert />}{label}</span>
    </Tag>
  )
}

/* ---------- Gráfico de ventas (área, una serie) ---------- */
function VentasChart({ dias }) {
  const [hover, setHover] = useState(null)
  const W = 640, H = 220, P = { t: 18, r: 16, b: 30, l: 16 }
  const data = dias || []
  const max = Math.max(...data.map(d => d.total), 1)
  const nice = Math.ceil(max / 500) * 500
  const x = i => P.l + (i * (W - P.l - P.r)) / Math.max(data.length - 1, 1)
  const y = v => H - P.b - (v / nice) * (H - P.t - P.b)
  const linea = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.total)}`).join('')
  const area = data.length ? `${linea}L${x(data.length - 1)},${H - P.b}L${x(0)},${H - P.b}Z` : ''
  const total7 = data.reduce((s, d) => s + d.total, 0)
  const ventas7 = data.reduce((s, d) => s + d.ventas, 0)
  const dia = s => new Date(`${s}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
  const h = hover != null ? data[hover] : null

  return (
    <section className="tile tile--chart">
      <header className="tile__head">
        <div>
          <h2>Ingresos · últimos 7 días</h2>
          <p className="tile__sub">{ventas7} ventas en la semana</p>
        </div>
        <strong className="tile__big">{soles(total7)}</strong>
      </header>
      <div className="chart" onPointerLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Ingresos por día de los últimos 7 días">
          <defs>
            <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--red)" stopOpacity=".28" />
              <stop offset="1" stopColor="var(--red)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map(k => (
            <line key={k} x1={P.l} x2={W - P.r} y1={y(nice * k)} y2={y(nice * k)} className="chart__grid" />
          ))}
          <path d={area} fill="url(#gArea)" />
          <path d={linea} className="chart__line" />
          {h && <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} className="chart__cross" />}
          {data.map((d, i) => (
            <g key={d.dia}>
              {(d.total > 0 || hover === i) && (
                <circle cx={x(i)} cy={y(d.total)} r={hover === i ? 6 : 4} className="chart__dot" />
              )}
              <rect x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent"
                onPointerEnter={() => setHover(i)} />
            </g>
          ))}
        </svg>
        <div className="chart__x">
          {data.map((d, i) => <span key={d.dia} className={hover === i ? 'is-on' : ''}>{dia(d.dia)}</span>)}
        </div>
        <div className="chart__y"><span>{soles(nice)}</span><span>{soles(nice / 2)}</span></div>
        {h && (
          <div className="chart__tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.total) / H) * 100}%` }}>
            <b>{dia(h.dia)}</b>
            <span>{soles(h.total)}</span>
            <small>{h.ventas} {h.ventas === 1 ? 'venta' : 'ventas'}</small>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Salud del stock ---------- */
function SaludStock({ productos, criticos }) {
  const n = productos.length || 1
  const seg = [
    { k: 'ok', label: 'En stock', v: productos.filter(p => p.estado_stock === 'ok').length, Icon: IconCheck },
    { k: 'bajo', label: 'Bajo stock', v: productos.filter(p => p.estado_stock === 'bajo').length, Icon: IconAlert },
    { k: 'agotado', label: 'Agotado', v: productos.filter(p => p.estado_stock === 'agotado').length, Icon: IconAlert },
  ]
  const pct = Math.round((seg[0].v / n) * 100)
  return (
    <section className="tile tile--health">
      <header className="tile__head">
        <h2>Salud del stock</h2>
        <Link to="/inventario" className="link-btn">Inventario <IconArrow /></Link>
      </header>
      <div className="health__score">
        <b><Contador valor={pct} />%</b>
        <span>del catálogo con stock saludable</span>
      </div>
      <div className="segbar" role="img" aria-label={seg.map(s => `${s.label}: ${s.v}`).join(', ')}>
        {seg.filter(s => s.v).map(s => (
          <i key={s.k} className={`segbar__${s.k}`} style={{ flexGrow: s.v }} title={`${s.label}: ${s.v}`} />
        ))}
      </div>
      <ul className="health__legend">
        {seg.map(({ k, label, v, Icon }) => (
          <li key={k}><span className={`sw sw--${k}`}><Icon /></span>{label}<b>{v}</b></li>
        ))}
      </ul>
      <div className="health__list">
        {criticos.slice(0, 4).map(p => (
          <div key={p.id_producto} className={`crit crit--${p.estado_stock}`}>
            <span className="crit__n">{p.stock}</span>
            <span className="crit__name">{p.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Carrusel 3D de ofertas ---------- */
function Coverflow({ items }) {
  const [activo, setActivo] = useState(0)
  const [pausa, setPausa] = useState(false)
  const n = items.length
  useEffect(() => {
    if (pausa || n < 2) return
    const id = setInterval(() => setActivo(a => (a + 1) % n), 2800)
    return () => clearInterval(id)
  }, [pausa, n])
  if (!n) return <section className="tile tile--flow" />
  const actual = items[activo % n]

  return (
    <section className="tile tile--flow" onPointerEnter={() => setPausa(true)} onPointerLeave={() => setPausa(false)}>
      <header className="tile__head">
        <h2>Vitrina de ofertas</h2>
        <span className="tag-red">¡SÚPER COMBO!</span>
      </header>
      <div className="flow">
        {items.map((p, i) => {
          let off = i - (activo % n)
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const vis = Math.abs(off) <= 2
          return (
            <button key={p.id_producto} className={`flow__card ${off === 0 ? 'is-front' : ''}`} onClick={() => setActivo(i)}
              style={{ '--off': off, '--abs': Math.abs(off), opacity: vis ? 1 - Math.abs(off) * 0.28 : 0, pointerEvents: vis ? 'auto' : 'none' }}
              aria-label={p.nombre} tabIndex={vis ? 0 : -1}>
              <span className="flow__off">−{descuento(p)}%</span>
              <ProductImage producto={p} />
            </button>
          )
        })}
      </div>
      <div className="flow__info" key={actual.id_producto}>
        <span className="pcard__brand">{actual.marca}</span>
        <b>{actual.nombre}</b>
        <div><s>{soles(actual.precio_antes)}</s> <strong>{soles(actual.precio)}</strong></div>
      </div>
      <div className="flow__dots">
        {items.map((p, i) => <button key={p.id_producto} className={i === activo % n ? 'is-on' : ''} onClick={() => setActivo(i)} aria-label={`Oferta ${i + 1}`} />)}
      </div>
    </section>
  )
}

/* ---------- Ranking más vendidos ---------- */
function TopVendidos({ top }) {
  const max = Math.max(...(top || []).map(t => t.unidades), 1)
  return (
    <section className="tile tile--top">
      <header className="tile__head">
        <h2>Más vendidos</h2>
        <IconBox />
      </header>
      {!top?.length && <p className="empty">Aún no hay ventas.</p>}
      <ol className="rank">
        {top?.map((t, i) => (
          <li key={t.id_producto} style={{ '--i': i, '--w': `${(t.unidades / max) * 100}%` }}>
            <span className="rank__pos">{i + 1}</span>
            <ProductImage producto={t} />
            <div className="rank__info">
              <b>{t.nombre}</b>
              <div className="rank__bar"><i /></div>
            </div>
            <div className="rank__num">
              <b>{t.unidades} und.</b>
              <small>{soles(t.monto)}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
