import { Link } from 'react-router-dom'
import './PageHeader.css'

/**
 * Reusable page header used by all simulation pages.
 * Props:
 *  - badge               : string  — category badge text
 *  - badgeClass          : string  — badge class modifier (electric|violet|emerald|amber|pink)
 *  - icon                : node    — SVG icon element
 *  - title               : string  — page title
 *  - subtitle            : string  — description text
 *  - intro               : string  — short educational introduction premise
 *  - concepts            : [{label, desc}] — key concept pills
 *  - showHome            : boolean — whether to show the return to home button (default true)
 *  - presentationMode    : boolean — whether presentation mode is currently active
 *  - onTogglePresentation: function — callback to toggle presentation mode
 */
export default function PageHeader({
  badge,
  badgeClass = 'electric',
  icon,
  title,
  subtitle,
  intro,
  concepts = [],
  showHome = true,
  presentationMode = false,
  onTogglePresentation,
}) {
  return (
    <section className="page-header">
      {/* Decorative background blobs */}
      <div className="page-header__blob page-header__blob--1" aria-hidden="true" />
      <div className="page-header__blob page-header__blob--2" aria-hidden="true" />

      <div className="container page-header__inner">
        {/* Navigation Bar Row: Home link + Presentation Mode toggle */}
        <div className="page-header__nav-row">
          {showHome && (
            <Link to="/" className="page-header__home-btn" title="Return to GraphVerse Home Hub">
              <span className="page-header__home-arrow">←</span>
              <span>Home Hub</span>
            </Link>
          )}

          {onTogglePresentation && (
            <button
              type="button"
              className={`page-header__pres-btn ${presentationMode ? 'page-header__pres-btn--active' : ''}`}
              onClick={onTogglePresentation}
              title={presentationMode ? 'Exit classroom presentation mode' : 'Switch to large-format classroom presentation mode'}
            >
              <span className="page-header__pres-icon">🎓</span>
              <span>{presentationMode ? 'Exit Presentation Mode' : 'Student Presentation Mode'}</span>
            </button>
          )}
        </div>

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

        {intro && (
          <div className="page-header__intro-box">
            <span className="page-header__intro-badge">💡 Overview</span>
            <p className="page-header__intro-text">{intro}</p>
          </div>
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
