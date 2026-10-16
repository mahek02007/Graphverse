import './PageHeader.css'

/**
 * Reusable page header used by all simulation pages.
 * Props:
 *  - badge       : string  — category badge text
 *  - badgeClass  : string  — badge class modifier (electric|violet|emerald|amber)
 *  - icon        : node    — SVG icon element
 *  - title       : string  — page title
 *  - subtitle    : string  — description text
 *  - concepts    : [{label, desc}] — key concept pills
 */
export default function PageHeader({ badge, badgeClass = 'electric', icon, title, subtitle, concepts = [] }) {
  return (
    <section className="page-header">
      {/* Decorative background blobs */}
      <div className="page-header__blob page-header__blob--1" aria-hidden="true" />
      <div className="page-header__blob page-header__blob--2" aria-hidden="true" />

      <div className="container page-header__inner">
        <div className="page-header__meta">
          <span className={`badge badge-${badgeClass}`}>
            <span className={`glow-dot glow-dot-${badgeClass}`} />
            {badge}
          </span>
        </div>

        <div className="page-header__title-row">
          {icon && (
            <div className="page-header__icon" aria-hidden="true">
              {icon}
            </div>
          )}
          <h1 className="page-header__title">{title}</h1>
        </div>

        {subtitle && (
          <p className="page-header__subtitle">{subtitle}</p>
        )}

        {concepts.length > 0 && (
          <div className="page-header__concepts">
            {concepts.map(({ label, desc }) => (
              <div key={label} className="concept-pill" title={desc}>
                <span className="concept-pill__label">{label}</span>
                {desc && <span className="concept-pill__desc">{desc}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
