import TiltCard from './TiltCard.jsx'
import ProductImage from './ProductImage.jsx'
import { ESTADOS, descuento, soles } from '../api.js'
import { IconEdit, IconTrash } from './Icons.jsx'

export default function ProductCard({ producto: p, onEdit, onDelete, index = 0 }) {
  const off = descuento(p)
  const est = ESTADOS[p.estado_stock]
  return (
    <TiltCard className={`pcard pcard--${est.cls}`} style={{ '--i': index }}>
      {off > 0 && (
        <div className="price-tag">
          <b>OFERTA</b>
          <span>-{off}%</span>
        </div>
      )}
      <div className="pcard__media">
        <ProductImage producto={p} />
        <span className="pcard__cat">{p.icono} {p.categoria}</span>
      </div>
      <div className="pcard__body">
        <span className="pcard__brand">{p.marca}</span>
        <h3 className="pcard__name">{p.nombre}</h3>
        <p className="pcard__desc">{p.descripcion}</p>
        <div className="pcard__foot">
          <div className="pcard__price">
            {off > 0 && <s>{soles(p.precio_antes)}</s>}
            <strong>{soles(p.precio)}</strong>
          </div>
          <span className={`stock-chip stock-chip--${est.cls}`}>{est.label} · {p.stock}</span>
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="pcard__actions">
          {onEdit && <button className="icon-btn" onClick={() => onEdit(p)} aria-label="Editar"><IconEdit /></button>}
          {onDelete && <button className="icon-btn icon-btn--danger" onClick={() => onDelete(p)} aria-label="Eliminar"><IconTrash /></button>}
        </div>
      )}
    </TiltCard>
  )
}
