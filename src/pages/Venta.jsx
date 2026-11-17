import { useEffect, useState } from 'react'
import { api, soles } from '../api.js'
import useCatalogo from '../hooks/useCatalogo.js'
import ProductImage from '../components/ProductImage.jsx'
import Logo from '../components/Logo.jsx'
import { useToast } from '../components/Toast.jsx'
import { IconCart, IconMinus, IconPlus, IconPrint, IconSearch, IconTrash, IconUser, IconX } from '../components/Icons.jsx'

export default function Venta() {
  const { productos, recargar } = useCatalogo()
  const [q, setQ] = useState('')
  const [carrito, setCarrito] = useState([]) // [{producto, cantidad}]
  const [cliente, setCliente] = useState({ nombre: '', dni: '' })
  const [dniConocido, setDniConocido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [boleta, setBoleta] = useState(null)
  const [historial, setHistorial] = useState([])
  const toast = useToast()

  const cargarHistorial = () => api.get('/ventas').then(setHistorial).catch(() => {})
  useEffect(() => { cargarHistorial() }, [])

  // Autocompletar nombre si el DNI ya existe en CoolBoxBD
  useEffect(() => {
    if (!/^\d{8}$/.test(cliente.dni)) return
    let vivo = true
    api.get(`/clientes/${cliente.dni}`)
      .then(c => { if (vivo) { setCliente(s => ({ ...s, nombre: c.nombre })); setDniConocido(c.dni) } })
      .catch(() => {})
    return () => { vivo = false }
  }, [cliente.dni])
  const clienteConocido = Boolean(dniConocido) && dniConocido === cliente.dni

  const enCarrito = id => carrito.find(i => i.producto.id_producto === id)?.cantidad || 0

  function agregar(p) {
    if (enCarrito(p.id_producto) >= p.stock) { toast(`Solo hay ${p.stock} unidades de ${p.marca}`, 'error'); return }
    setCarrito(c => {
      const ex = c.find(i => i.producto.id_producto === p.id_producto)
      return ex ? c.map(i => (i === ex ? { ...i, cantidad: i.cantidad + 1 } : i)) : [...c, { producto: p, cantidad: 1 }]
    })
  }
  function cambiar(id, delta) {
    setCarrito(c => c.flatMap(i => {
      if (i.producto.id_producto !== id) return [i]
      const n = Math.min(i.cantidad + delta, i.producto.stock)
      return n > 0 ? [{ ...i, cantidad: n }] : []
    }))
  }

  const total = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0)
  const opGravada = total / 1.18
  const unidades = carrito.reduce((s, i) => s + i.cantidad, 0)
  const lista = productos.filter(p => `${p.nombre} ${p.marca}`.toLowerCase().includes(q.toLowerCase()))

  async function registrar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      const r = await api.post('/ventas', {
        cliente,
        items: carrito.map(i => ({ id_producto: i.producto.id_producto, cantidad: i.cantidad })),
      })
      setBoleta({ ...r, cliente: { ...cliente }, items: carrito, fecha: new Date() })
      setCarrito([])
      setCliente({ nombre: '', dni: '' })
      toast(`Venta N° ${String(r.id_venta).padStart(6, '0')} registrada`)
      recargar()
      cargarHistorial()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  async function anular(v) {
    if (!confirm(`¿Anular la venta N° ${v.id_venta}? El stock será devuelto.`)) return
    try {
      await api.del(`/ventas/${v.id_venta}`)
      toast('Venta anulada y stock devuelto')
      recargar()
      cargarHistorial()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Punto de venta</span>
          <h1>Realizar venta</h1>
        </div>
      </section>

      <div className="pos">
        <div className="pos__catalog">
          <label className="search">
            <IconSearch />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto para agregar…" />
          </label>
          <div className="pos__grid">
            {lista.map(p => {
              const n = enCarrito(p.id_producto)
              const sinStock = p.stock - n <= 0
              return (
                <button key={p.id_producto} className={`pos-item ${n ? 'is-in' : ''} pos-item--${p.estado_stock}`} onClick={() => agregar(p)} disabled={p.stock === 0}>
                  <ProductImage producto={p} />
                  <span className="pos-item__brand">{p.marca}</span>
                  <span className="pos-item__name">{p.nombre}</span>
                  <span className="pos-item__price">{soles(p.precio)}</span>
                  <span className="pos-item__stock">{p.stock === 0 ? 'Agotado' : `${p.stock - n} disp.`}</span>
                  {n > 0 && <span className="pos-item__count">{n}</span>}
                  {!sinStock && <span className="pos-item__add"><IconPlus /></span>}
                </button>
              )
            })}
          </div>
        </div>

        <form className="ticket" onSubmit={registrar}>
          <div className="ticket__head">
            <Logo size={24} />
            <span>Boleta de venta</span>
          </div>

          <div className="ticket__client">
            <div className="field">
              <span>DNI del cliente</span>
              <input required inputMode="numeric" pattern="\d{8}" maxLength={8} placeholder="8 dígitos"
                value={cliente.dni} onChange={e => setCliente(s => ({ ...s, dni: e.target.value.replace(/\D/g, '') }))} />
            </div>
            <div className="field">
              <span>Nombre completo {clienteConocido && <em className="badge-ok"><IconUser /> cliente registrado</em>}</span>
              <input required placeholder="Nombres y apellidos" value={cliente.nombre} onChange={e => setCliente(s => ({ ...s, nombre: e.target.value }))} />
            </div>
          </div>

          <div className="ticket__items">
            {!carrito.length && (
              <div className="ticket__empty"><IconCart /><span>Toca un producto para agregarlo</span></div>
            )}
            {carrito.map(({ producto: p, cantidad }) => (
              <div key={p.id_producto} className="line">
                <ProductImage producto={p} />
                <div className="line__info">
                  <b>{p.nombre}</b>
                  <small>{soles(p.precio)} c/u</small>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => cambiar(p.id_producto, -1)} aria-label="Quitar uno">{cantidad === 1 ? <IconTrash /> : <IconMinus />}</button>
                  <span>{cantidad}</span>
                  <button type="button" onClick={() => cambiar(p.id_producto, 1)} disabled={cantidad >= p.stock} aria-label="Agregar uno"><IconPlus /></button>
                </div>
                <strong className="line__sub">{soles(p.precio * cantidad)}</strong>
              </div>
            ))}
          </div>

          <div className="ticket__totals">
            <div><span>Op. gravada</span><span>{soles(opGravada)}</span></div>
            <div><span>IGV (18%)</span><span>{soles(total - opGravada)}</span></div>
            <div className="ticket__total"><span>Total · {unidades} und.</span><strong>{soles(total)}</strong></div>
          </div>

          <button className="btn btn--red btn--lg btn--block" disabled={!carrito.length || enviando}>
            {enviando ? 'Registrando…' : `Cobrar ${soles(total)}`}
          </button>
        </form>
      </div>

      <section className="block">
        <div className="block__head"><h2>Últimas ventas</h2></div>
        <div className="history">
          {historial.map(v => (
            <div key={v.id_venta} className="history__row">
              <span className="history__num">N° {String(v.id_venta).padStart(6, '0')}</span>
              <span className="history__cli"><b>{v.cliente}</b><small>DNI {v.dni}</small></span>
              <span className="history__date">{new Date(v.fecha.replace(' ', 'T')).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span className="history__units">{v.unidades} und.</span>
              <strong>{soles(v.total)}</strong>
              <button className="icon-btn icon-btn--danger" onClick={() => anular(v)} title="Anular venta"><IconX /></button>
            </div>
          ))}
          {!historial.length && <p className="empty">Aún no hay ventas registradas.</p>}
        </div>
      </section>

      {boleta && (
        <div className="sheet-backdrop sheet-backdrop--center" onMouseDown={e => e.target === e.currentTarget && setBoleta(null)}>
          <div className="receipt print-area">
            <div className="receipt__ok">✓</div>
            <Logo size={30} tagline />
            <p className="receipt__num">Boleta N° B001-{String(boleta.id_venta).padStart(6, '0')}</p>
            <p className="receipt__meta">{boleta.fecha.toLocaleString('es-PE')}</p>
            <p className="receipt__meta"><b>{boleta.cliente.nombre}</b> · DNI {boleta.cliente.dni}</p>
            <div className="receipt__items">
              {boleta.items.map(i => (
                <div key={i.producto.id_producto}>
                  <span>{i.cantidad} × {i.producto.nombre}</span>
                  <span>{soles(i.producto.precio * i.cantidad)}</span>
                </div>
              ))}
            </div>
            <div className="receipt__total"><span>TOTAL</span><strong>{soles(boleta.total)}</strong></div>
            <p className="receipt__thanks">Precios bajos con garantía · ¡Gracias por su compra!</p>
            <div className="confirm__btns no-print">
              <button className="btn btn--ghost" onClick={() => window.print()}><IconPrint /> Imprimir</button>
              <button className="btn btn--red" onClick={() => setBoleta(null)}>Nueva venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
