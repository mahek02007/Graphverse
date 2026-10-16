import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_ITEMS = [
  { to: '/',               label: 'Home',            exact: true },
  { to: '/social-network', label: 'Social Network' },
  { to: '/utilities',      label: 'Utilities' },
  { to: '/web-graph',      label: 'Web Graph' },
  { to: '/google-maps',    label: 'Maps' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on navigation
  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMenuOpen(false)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <svg className="navbar__logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="20" r="5" fill="#00d4ff"/>
            <circle cx="30" cy="10" r="5" fill="#7c3aed"/>
            <circle cx="30" cy="30" r="5" fill="#06b6d4"/>
            <line x1="15" y1="17" x2="25" y2="13" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="23" x2="25" y2="27" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="15" x2="30" y2="25" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="navbar__logo-text">
            Graph<span className="navbar__logo-accent">Verse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <Link to="/social-network" className="btn btn-primary navbar__cta">
          Launch Simulator
        </Link>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="navbar__drawer-nav">
          {NAV_ITEMS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link to="/social-network" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Launch Simulator
          </Link>
        </nav>
      </div>
    </header>
  )
}
