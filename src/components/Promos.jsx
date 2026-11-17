import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROMOS } from '../data/promos.js'
import { IconArrow } from './Icons.jsx'
import './Promos.css'

const DURACION = 6000 // ms por anuncio

// Carrusel grande para el Inicio: banner + lista lateral de anuncios
export function PromoHero({ promos = PROMOS }) {
  const [idx, setIdx] = useState(0)
  const [pausa, setPausa] = useState(false)
  const navigate = useNavigate()
  const n = promos.length

  useEffect(() => {
    if (pausa || n < 2) return
    const t = setTimeout(() => setIdx(i => (i + 1) % n), DURACION)
    return () => clearTimeout(t)
  }, [idx, pausa, n])

  if (!n) return null
  const ir = d => setIdx(i => (i + d + n) % n)

  return (
    <section className="tile tile--promo" onPointerEnter={() => setPausa(true)} onPointerLeave={() => setPausa(false)}>
      <div className="promo-hero">
        <div className="promo-stage" role="region" aria-roledescription="carrusel" aria-label="Promociones">
          {promos.map((p, i) => (
            <button
              key={p.id}
              className={`promo-slide ${i === idx ? 'is-on' : ''}`}
              onClick={() => navigate(p.to)}
              tabIndex={i === idx ? 0 : -1}
              aria-hidden={i !== idx}
              aria-label={`${p.titulo}: ${p.precio}`}
            >
              <img src={`/promos/${p.imagen}`} alt={p.titulo} loading={i === 0 ? 'eager' : 'lazy'} />
            </button>
          ))}
          <button className="promo-nav promo-nav--prev" onClick={() => ir(-1)} aria-label="Anterior"><IconArrow /></button>
          <button className="promo-nav promo-nav--next" onClick={() => ir(1)} aria-label="Siguiente"><IconArrow /></button>
          <div className="promo-bars">
            {promos.map((p, i) => (
              <button key={p.id} onClick={() => setIdx(i)} aria-label={`Ver ${p.titulo}`}
                className={`promo-bar ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-on' : ''}`}>
                <i key={i === idx ? `on-${idx}` : 'off'} style={{ animationDuration: `${DURACION}ms`, animationPlayState: pausa ? 'paused' : 'running' }} />
              </button>
            ))}
          </div>
        </div>

        <aside className="promo-list">
          <header>
            <span className="eyebrow">Anuncios</span>
            <b>Promociones de la semana</b>
          </header>
          {promos.map((p, i) => (
            <button key={p.id} className={`promo-item ${i === idx ? 'is-on' : ''}`} onClick={() => setIdx(i)}>
              <img src={`/promos/${p.imagen}`} alt="" />
              <span className="promo-item__txt">
                <b>{p.titulo}</b>
                <small>{p.detalle}</small>
              </span>
              <span className="promo-item__price">
                <s>{p.antes}</s>
                <strong>{p.precio}</strong>
              </span>
            </button>
          ))}
        </aside>
      </div>
    </section>
  )
}

// Franja horizontal para la página de Productos
export function PromoStrip({ promos = PROMOS }) {
  const rail = useRef(null)
  const mover = d => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  if (!promos.length) return null

  return (
    <section className="promo-strip">
      <div className="promo-strip__head">
        <h2>Promociones <span className="tag-red">¡STOCK LIMITADO!</span></h2>
        <div className="promo-strip__arrows">
          <button className="icon-btn" onClick={() => mover(-1)} aria-label="Anterior"><IconArrow style={{ transform: 'rotate(180deg)' }} /></button>
          <button className="icon-btn" onClick={() => mover(1)} aria-label="Siguiente"><IconArrow /></button>
        </div>
      </div>
      <div className="promo-rail" ref={rail}>
        {promos.map((p, i) => (
          <Link key={p.id} to={p.to} className="promo-card" style={{ '--i': i }}>
            <span className="promo-card__media">
              <img src={`/promos/${p.imagen}`} alt={p.titulo} loading="lazy" />
              <span className="promo-card__tag">{p.etiqueta}</span>
            </span>
            <span className="promo-card__body">
              <span className="promo-card__txt">
                <b>{p.titulo}</b>
                <small>{p.detalle}</small>
              </span>
              <span className="promo-card__cta">{p.precio} <IconArrow /></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
