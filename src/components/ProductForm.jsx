import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { IconX } from './Icons.jsx'
import { Hexagon } from './Logo.jsx'

const VACIO = { nombre: '', marca: '', id_categoria: '', descripcion: '', precio: '', precio_antes: '', stock: '', stock_minimo: 5, imagen: '' }
const GENERICAS = /^(laptop|impresora|multifuncional|audifonos|audífonos|gamer|celular|teclado|mouse|consola|parlante|bluetooth|kit|de|para|con|y)$/i

// Misma regla que el servidor: Marca + 2 palabras del modelo + "_Cool"
function sugerirImagen(nombre, marca, ext = '.jpg') {
  const palabras = nombre.split(/\s+/).filter(w => w && !GENERICAS.test(w) && w.toLowerCase() !== marca.toLowerCase())
  const base = [marca, ...palabras.slice(0, 2)].join(' ')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map(p => p[0].toUpperCase() + p.slice(1)).join('').slice(0, 40)
  return base ? `${base}_Cool${ext}` : ''
}

// Panel deslizante para crear / editar productos
export default function ProductForm({ producto, categorias, onClose, onSaved }) {
  const editando = Boolean(producto?.id_producto)
  const [f, setF] = useState(() => (editando ? { ...VACIO, ...producto, precio_antes: producto.precio_antes ?? '' } : VACIO))
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(editando ? `/productos/${producto.imagen}` : '')
  const [manual, setManual] = useState(editando)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const sugerida = useMemo(() => sugerirImagen(f.nombre, f.marca), [f.nombre, f.marca])
  const imagenFinal = manual ? f.imagen : sugerida

  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }))

  function elegirArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const fd = new FormData()
      for (const k of ['nombre', 'marca', 'id_categoria', 'descripcion', 'precio', 'precio_antes', 'stock', 'stock_minimo']) {
        fd.append(k, f[k] ?? '')
      }
      fd.append('imagen', archivo ? '' : imagenFinal)
      if (archivo) fd.append('archivo', archivo)
      const res = editando
        ? await api.form(`/productos/${producto.id_producto}`, 'PUT', fd)
        : await api.form('/productos', 'POST', fd)
      onSaved(res, editando)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="sheet-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="sheet" onSubmit={guardar}>
        <header className="sheet__head">
          <div>
            <span className="eyebrow">{editando ? `Producto #${producto.id_producto}` : 'Nuevo registro'}</span>
            <h2>{editando ? 'Editar producto' : 'Agregar producto'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar"><IconX /></button>
        </header>

        <label className="drop">
          {preview ? (
            <img src={preview} alt="" onError={() => setPreview('')} />
          ) : (
            <span className="drop__empty">
              <Hexagon size={46} stroke={8} />
              <b>Subir imagen</b>
              <small>JPG, PNG o WEBP · máx 5MB</small>
            </span>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirArchivo} />
        </label>

        <div className="grid-2">
          <Field label="Nombre del producto" full>
            <input required value={f.nombre} onChange={set('nombre')} placeholder="Laptop Acer Nitro V 15" />
          </Field>
          <Field label="Marca">
            <input required value={f.marca} onChange={set('marca')} placeholder="Acer" />
          </Field>
          <Field label="Categoría">
            <select required value={f.id_categoria} onChange={set('id_categoria')}>
              <option value="">Seleccionar…</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.icono} {c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Precio (S/)">
            <input required type="number" min="0" step="0.01" value={f.precio} onChange={set('precio')} placeholder="0.00" />
          </Field>
          <Field label="Precio anterior (opcional)">
            <input type="number" min="0" step="0.01" value={f.precio_antes} onChange={set('precio_antes')} placeholder="Para mostrar OFERTA" />
          </Field>
          <Field label="Stock">
            <input required type="number" min="0" step="1" value={f.stock} onChange={set('stock')} />
          </Field>
          <Field label="Stock mínimo (alerta)">
            <input required type="number" min="0" step="1" value={f.stock_minimo} onChange={set('stock_minimo')} />
          </Field>
          <Field label="Descripción" full>
            <textarea rows="3" value={f.descripcion ?? ''} onChange={set('descripcion')} placeholder="Características principales" />
          </Field>
          <Field label="Archivo de imagen" full>
            <div className="file-name">
              {archivo ? (
                <code>{sugerirImagen(f.nombre, f.marca, '.' + (archivo.type.split('/')[1] === 'jpeg' ? 'jpg' : archivo.type.split('/')[1]))}</code>
              ) : manual ? (
                <input value={f.imagen} onChange={set('imagen')} placeholder="AcerNitro_Cool.jpg" />
              ) : (
                <code>{sugerida || 'Marca + Modelo_Cool.jpg'}</code>
              )}
              {!archivo && (
                <button type="button" className="link-btn" onClick={() => { setManual(m => !m); setF(s => ({ ...s, imagen: s.imagen || sugerida })) }}>
                  {manual ? 'Usar automático' : 'Editar nombre'}
                </button>
              )}
            </div>
            <small className="hint">Se busca en <code>public/productos/</code></small>
          </Field>
        </div>

        {error && <p className="form-error">{error}</p>}

        <footer className="sheet__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn--red" disabled={guardando}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear producto'}</button>
        </footer>
      </form>
    </div>
  )
}

function Field({ label, full, children }) {
  return (
    <div className={`field ${full ? 'field--full' : ''}`}>
      <span>{label}</span>
      {children}
    </div>
  )
}
