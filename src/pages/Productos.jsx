import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import useCatalogo from '../hooks/useCatalogo.js'
import ProductCard from '../components/ProductCard.jsx'
import ProductForm from '../components/ProductForm.jsx'
import { useToast } from '../components/Toast.jsx'
import { IconPlus, IconSearch } from '../components/Icons.jsx'
import { PromoStrip } from '../components/Promos.jsx'

export default function Productos() {
  const { productos, setProductos, categorias, cargando, error } = useCatalogo()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') || '')
  const [editando, setEditando] = useState(null) // null | {} | producto
  const [borrando, setBorrando] = useState(null)
  const toast = useToast()

  const cat = params.get('cat') || ''
  const lista = productos.filter(p =>
    (!cat || String(p.id_categoria) === cat) &&
    `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase().includes(q.toLowerCase()))

  function guardado(prod, editado) {
    const p = { ...prod, _v: Date.now() } // fuerza recargar la imagen recién subida
    setProductos(ps => (editado ? ps.map(x => (x.id_producto === p.id_producto ? p : x)) : [p, ...ps]))
    setEditando(null)
    toast(editado ? 'Producto actualizado' : 'Producto creado')
  }

  async function eliminar() {
    try {
      await api.del(`/productos/${borrando.id_producto}`)
      setProductos(ps => ps.filter(x => x.id_producto !== borrando.id_producto))
      toast('Producto eliminado')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBorrando(null)
    }
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Catálogo · CRUD</span>
          <h1>Productos <sup>{productos.length}</sup></h1>
        </div>
        <button className="btn btn--red btn--lg" onClick={() => setEditando({})}><IconPlus /> Nuevo producto</button>
      </section>

      {/* Los anuncios se muestran solo en la vista general (sin filtros ni búsqueda) */}
      {!cat && !q && <PromoStrip />}

      <div className="toolbar">
        <label className="search">
          <IconSearch />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, marca o categoría…" />
        </label>
        <div className="chips">
          <button className={`chip ${!cat ? 'is-on' : ''}`} onClick={() => setParams({})}>Todos</button>
          {categorias.map(c => (
            <button key={c.id_categoria} className={`chip ${cat === String(c.id_categoria) ? 'is-on' : ''}`} onClick={() => setParams({ cat: c.id_categoria })}>
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}
      {cargando ? (
        <div className="grid">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" />)}</div>
      ) : (
        <div className="grid">
          {lista.map((p, i) => (
            <ProductCard key={p.id_producto} producto={p} index={i} onEdit={setEditando} onDelete={setBorrando} />
          ))}
          {!lista.length && <p className="empty">No hay productos que coincidan.</p>}
        </div>
      )}

      {editando && (
        <ProductForm producto={editando} categorias={categorias} onClose={() => setEditando(null)} onSaved={guardado} />
      )}

      {borrando && (
        <div className="sheet-backdrop sheet-backdrop--center" onMouseDown={e => e.target === e.currentTarget && setBorrando(null)}>
          <div className="confirm">
            <h3>¿Eliminar producto?</h3>
            <p><b>{borrando.nombre}</b> se eliminará de CoolBoxBD. Esta acción no se puede deshacer.</p>
            <div className="confirm__btns">
              <button className="btn btn--ghost" onClick={() => setBorrando(null)}>Cancelar</button>
              <button className="btn btn--red" onClick={eliminar}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
