import Logo, { Hexagon } from '../components/Logo.jsx'
import TiltCard from '../components/TiltCard.jsx'
import { IconClock, IconGlobe, IconPin, IconShield, IconArrow } from '../components/Icons.jsx'
import { TIENDA } from '../data/tienda.js'

export default function Contacto() {
  return (
    <div className="page">
      <section className="contact-hero">
        <div>
          <span className="eyebrow eyebrow--light">Visítanos</span>
          <h1>{TIENDA.nombre}</h1>
          <p>{TIENDA.slogan}. Encuéntranos en {TIENDA.ciudad} o compra online en coolbox.pe.</p>
        </div>
        <div className="contact-hero__badge">
          <Hexagon size={150} stroke={12} />
          <Logo size={34} light />
        </div>
      </section>

      <div className="contact-grid">
        <div className="map-card">
          <iframe title="Ubicación Coolbox Huánuco" src={TIENDA.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a className="btn btn--red map-card__btn" href={TIENDA.mapsLink} target="_blank" rel="noreferrer">
            <IconPin /> Abrir en Maps
          </a>
        </div>

        <div className="info-stack">
          <TiltCard className="info-card" max={6}>
            <span className="info-card__icon"><IconPin /></span>
            <div>
              <h3>Ubicación</h3>
              <p>{TIENDA.nombre}<br />{TIENDA.ciudad}</p>
            </div>
          </TiltCard>
          <TiltCard className="info-card" max={6}>
            <span className="info-card__icon"><IconClock /></span>
            <div>
              <h3>Horario de atención</h3>
              {TIENDA.horario.map(h => <p key={h.dias}><b>{h.dias}:</b> {h.horas}</p>)}
            </div>
          </TiltCard>
          <TiltCard as="a" href={TIENDA.web} target="_blank" rel="noreferrer" className="info-card info-card--link" max={6}>
            <span className="info-card__icon"><IconGlobe /></span>
            <div>
              <h3>Tienda online</h3>
              <p>www.coolbox.pe</p>
            </div>
            <IconArrow className="info-card__go" />
          </TiltCard>
          <TiltCard className="info-card info-card--dark" max={6}>
            <span className="info-card__icon"><IconShield /></span>
            <div>
              <h3>Servicios</h3>
              <ul>{TIENDA.servicios.map(s => <li key={s}>{s}</li>)}</ul>
            </div>
          </TiltCard>
          <div className="socials">
            {TIENDA.redes.map(r => (
              <a key={r.red} href={r.url} target="_blank" rel="noreferrer" className="chip">{r.red}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
