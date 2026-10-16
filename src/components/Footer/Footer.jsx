import { Link } from 'react-router-dom'
import './Footer.css'

const LINKS = [
  { to: '/',               label: 'Home' },
  { to: '/social-network', label: 'Social Network' },
  { to: '/utilities',      label: 'Utilities Problem' },
  { to: '/web-graph',      label: 'Web Graph' },
  { to: '/google-maps',    label: 'Maps Simulation' },
]

const CONCEPTS = [
  'Directed Graphs', 'Undirected Graphs', 'Bipartite Graphs',
  'Planarity', 'PageRank', 'Dijkstra\'s Algorithm',
  'Weighted Edges', 'Graph Traversal',
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="10" cy="20" r="5" fill="#00d4ff"/>
              <circle cx="30" cy="10" r="5" fill="#7c3aed"/>
              <circle cx="30" cy="30" r="5" fill="#06b6d4"/>
              <line x1="15" y1="17" x2="25" y2="13" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="23" x2="25" y2="27" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
              <line x1="30" y1="15" x2="30" y2="25" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Graph<span style={{color:'var(--color-electric)'}}>Verse</span></span>
          </div>
          <p className="footer__tagline">
            Discover how graph theory powers the digital world through interactive simulations.
          </p>
          <p className="footer__credit">
            Built for educational purposes · Graph Theory & Discrete Mathematics
          </p>
        </div>

        {/* Simulations */}
        <div className="footer__col">
          <h4 className="footer__heading">Simulations</h4>
          <ul className="footer__list">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="footer__link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concepts */}
        <div className="footer__col">
          <h4 className="footer__heading">Key Concepts</h4>
          <ul className="footer__list">
            {CONCEPTS.map(c => (
              <li key={c}><span className="footer__concept">{c}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {new Date().getFullYear()} GraphVerse · Interactive Graph Theory Simulator
          </p>
          <div className="footer__bottom-dots">
            <span className="glow-dot glow-dot-electric" />
            <span className="glow-dot glow-dot-violet" />
            <span className="glow-dot glow-dot-emerald" />
          </div>
        </div>
      </div>
    </footer>
  )
}
