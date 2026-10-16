import { Link } from 'react-router-dom'
import HeroGraph from './HeroGraph'
import './Home.css'

/* ── Application cards data ─────────────────────────────── */
const APPS = [
  {
    id: 'social-network',
    to: '/social-network',
    badge: 'Directed Graph',
    badgeClass: 'badge-electric',
    number: '01',
    title: 'Social Media Network',
    description:
      'Explore how friendship, follows, and influence spread through directed graphs. See how communities form and how information propagates.',
    concepts: ['Directed Edges', 'In/Out Degree', 'Reachability', 'Connected Components'],
    gradient: 'card-gradient--electric',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="12" r="6" fill="#00d4ff" opacity="0.9"/>
        <circle cx="10" cy="34" r="5" fill="#00d4ff" opacity="0.65"/>
        <circle cx="38" cy="34" r="5" fill="#00d4ff" opacity="0.65"/>
        <circle cx="24" cy="38" r="5" fill="#00d4ff" opacity="0.45"/>
        <line x1="24" y1="18" x2="11" y2="30" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="24" y1="18" x2="37" y2="30" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="13" y1="35" x2="21" y2="35" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round"/>
        <polygon points="21,33 24,38 21,37" fill="#00d4ff"/>
      </svg>
    ),
  },
  {
    id: 'utilities',
    to: '/utilities',
    badge: 'Bipartite Graph',
    badgeClass: 'badge-violet',
    number: '02',
    title: 'Three Utilities Problem',
    description:
      'The classic puzzle: can you connect 3 houses to 3 utilities without crossings? Discover why K₃,₃ is non-planar and what that means.',
    concepts: ['Bipartite Graphs', 'Planarity', 'K₃,₃', 'Kuratowski\'s Theorem'],
    gradient: 'card-gradient--violet',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6"  y="28" width="8" height="12" rx="2" fill="#a78bfa" opacity="0.85"/>
        <rect x="20" y="28" width="8" height="12" rx="2" fill="#a78bfa" opacity="0.65"/>
        <rect x="34" y="28" width="8" height="12" rx="2" fill="#a78bfa" opacity="0.45"/>
        <circle cx="10" cy="10" r="5" fill="#7c3aed" opacity="0.9"/>
        <circle cx="24" cy="10" r="5" fill="#7c3aed" opacity="0.7"/>
        <circle cx="38" cy="10" r="5" fill="#7c3aed" opacity="0.5"/>
        <line x1="10" y1="15" x2="10" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
        <line x1="10" y1="15" x2="24" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
        <line x1="24" y1="15" x2="10" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
        <line x1="24" y1="15" x2="38" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
      </svg>
    ),
  },
  {
    id: 'web-graph',
    to: '/web-graph',
    badge: 'PageRank Algorithm',
    badgeClass: 'badge-pink',
    number: '03',
    title: 'Web Graph & PageRank',
    description:
      'Model the internet as a directed graph and watch Google\'s PageRank algorithm determine which pages are most important.',
    concepts: ['PageRank', 'Directed Graphs', 'Random Walk', 'Eigenvector Centrality'],
    gradient: 'card-gradient--pink',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="8" fill="none" stroke="#ec4899" strokeWidth="2"/>
        <circle cx="24" cy="24" r="3" fill="#ec4899"/>
        <circle cx="8"  cy="12" r="4" fill="#ec4899" opacity="0.7"/>
        <circle cx="40" cy="12" r="4" fill="#ec4899" opacity="0.55"/>
        <circle cx="8"  cy="38" r="4" fill="#ec4899" opacity="0.4"/>
        <circle cx="40" cy="38" r="4" fill="#ec4899" opacity="0.55"/>
        <line x1="12" y1="14" x2="18" y2="20" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="36" y1="14" x2="30" y2="20" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="36" x2="18" y2="28" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="36" y1="36" x2="30" y2="28" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'google-maps',
    to: '/google-maps',
    badge: 'Weighted Graph',
    badgeClass: 'badge-amber',
    number: '04',
    title: 'Google Maps Simulation',
    description:
      'Navigate a city using weighted graphs. Run Dijkstra\'s algorithm step-by-step to find the shortest path between any two nodes.',
    concepts: ['Weighted Edges', 'Dijkstra\'s Algorithm', 'Shortest Path', 'Priority Queue'],
    gradient: 'card-gradient--amber',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8"  cy="8"  r="4" fill="#f59e0b" opacity="0.9"/>
        <circle cx="40" cy="8"  r="4" fill="#f59e0b" opacity="0.7"/>
        <circle cx="8"  cy="40" r="4" fill="#f59e0b" opacity="0.7"/>
        <circle cx="40" cy="40" r="4" fill="#f59e0b" opacity="0.55"/>
        <circle cx="24" cy="24" r="4" fill="#10b981"/>
        <line x1="12" y1="8"  x2="36" y2="8"  stroke="#f59e0b" strokeWidth="1.8"/>
        <line x1="8"  y1="12" x2="8"  y2="36" stroke="#f59e0b" strokeWidth="1.8"/>
        <line x1="12" y1="10" x2="21" y2="22" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <text x="14" y="7" fontSize="5" fill="#f59e0b" fontFamily="monospace">4</text>
        <text x="2"  y="26" fontSize="5" fill="#f59e0b" fontFamily="monospace">7</text>
        <text x="14" y="18" fontSize="5" fill="#10b981" fontFamily="monospace">3</text>
      </svg>
    ),
  },
]

/* ── Graph Concept legend items ─────────────────────────── */
const CONCEPTS = [
  {
    term: 'Node (Vertex)',
    icon: <circle cx="12" cy="12" r="8" fill="#00d4ff" />,
    desc: 'A fundamental unit — represents entities like people, cities, or web pages.',
    color: '#00d4ff',
  },
  {
    term: 'Edge',
    icon: (
      <>
        <circle cx="4"  cy="12" r="3" fill="#94aabe" />
        <circle cx="20" cy="12" r="3" fill="#94aabe" />
        <line x1="7" y1="12" x2="17" y2="12" stroke="#94aabe" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    desc: 'A connection between two nodes — can be roads, friendships, or hyperlinks.',
    color: '#94aabe',
  },
  {
    term: 'Directed Edge',
    icon: (
      <>
        <circle cx="3"  cy="12" r="3" fill="#7c3aed" />
        <circle cx="21" cy="12" r="3" fill="#7c3aed" />
        <line x1="6" y1="12" x2="15" y2="12" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <polygon points="15,9 21,12 15,15" fill="#7c3aed" />
      </>
    ),
    desc: 'An edge with direction — like a one-way street or a "follows" on Twitter.',
    color: '#7c3aed',
  },
  {
    term: 'Weighted Edge',
    icon: (
      <>
        <circle cx="3"  cy="12" r="3" fill="#f59e0b" />
        <circle cx="21" cy="12" r="3" fill="#f59e0b" />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <text x="9" y="9" fontSize="6" fill="#f59e0b" fontFamily="monospace" fontWeight="bold">5</text>
      </>
    ),
    desc: 'An edge with a numeric cost — distance, time, or bandwidth between nodes.',
    color: '#f59e0b',
  },
]

/* ── Learning objectives ────────────────────────────────── */
const OBJECTIVES = [
  { icon: '🧠', text: 'Understand core graph theory concepts through hands-on interaction' },
  { icon: '🌐', text: 'See how social networks, the web, and navigation use graph structures' },
  { icon: '⚡', text: 'Run real algorithms (Dijkstra, PageRank) and observe results visually' },
  { icon: '📐', text: 'Explore planarity, bipartiteness, and other theoretical properties' },
]

/* ── Component ──────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__blob hero__blob--3" />
          <div className="hero__grid" />
        </div>

        <div className="container hero__inner">
          <div className="hero__content">
            <div className="section-label">Interactive Educational Simulator</div>

            <h1 id="hero-title" className="hero__title">
              Graph<span className="hero__title-accent">Verse</span>
            </h1>

            <p className="hero__subtitle">
              Discover how graphs power the digital world.
            </p>

            <p className="hero__desc">
              From social media and the internet to navigation and network theory —
              graph theory is everywhere. Explore four real-world applications through
              interactive simulations and step-by-step algorithm visualizations.
            </p>

            <div className="hero__actions">
              <Link to="/social-network" id="start-exploring-btn" className="btn btn-primary hero__btn-main">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Exploring
              </Link>
              <a href="#simulations" className="btn btn-outline">
                View Simulations
              </a>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-value">4</span>
                <span className="hero__stat-label">Simulations</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">6+</span>
                <span className="hero__stat-label">Algorithms</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">∞</span>
                <span className="hero__stat-label">Interactions</span>
              </div>
            </div>
          </div>

          {/* Animated graph visualization */}
          <div className="hero__visual" aria-hidden="true">
            <HeroGraph />
          </div>
        </div>
      </section>

      {/* ── Graph Concepts Legend ── */}
      <section className="section-sm concepts-section" aria-labelledby="concepts-title">
        <div className="container">
          <div className="section-label">Foundations</div>
          <h2 id="concepts-title" className="section-title">Graph Theory Basics</h2>
          <p className="section-desc">
            Before exploring the simulations, familiarise yourself with the four fundamental building blocks of every graph.
          </p>

          <div className="concepts-grid">
            {CONCEPTS.map(({ term, icon, desc, color }) => (
              <div key={term} className="concept-card">
                <div className="concept-card__icon-wrap">
                  <svg viewBox="0 0 24 24" width="40" height="40" overflow="visible">
                    {icon}
                  </svg>
                </div>
                <h3 className="concept-card__term" style={{ color }}>
                  {term}
                </h3>
                <p className="concept-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Cards ── */}
      <section id="simulations" className="section apps-section" aria-labelledby="apps-title">
        <div className="container">
          <div className="section-label">Simulations</div>
          <h2 id="apps-title" className="section-title">Four Real-World Applications</h2>
          <p className="section-desc">
            Each simulation is fully interactive — build graphs, run algorithms, and see results in real time.
          </p>

          <div className="apps-grid">
            {APPS.map(({ id, to, badge, badgeClass, number, title, description, concepts, gradient, icon }) => (
              <Link key={id} to={to} id={`app-card-${id}`} className={`app-card ${gradient}`}>
                <div className="app-card__number">{number}</div>

                <div className="app-card__icon">{icon}</div>

                <div className="app-card__meta">
                  <span className={`badge ${badgeClass}`}>{badge}</span>
                </div>

                <h3 className="app-card__title">{title}</h3>
                <p className="app-card__desc">{description}</p>

                <ul className="app-card__concepts">
                  {concepts.map(c => (
                    <li key={c} className="app-card__concept-tag">{c}</li>
                  ))}
                </ul>

                <div className="app-card__cta">
                  <span>Launch Simulation</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Objectives ── */}
      <section className="section-sm objectives-section" aria-labelledby="objectives-title">
        <div className="container">
          <div className="objectives-inner">
            <div className="objectives-text">
              <div className="section-label">Learning Goals</div>
              <h2 id="objectives-title" className="section-title">What You Will Learn</h2>
              <p className="section-desc">
                GraphVerse is designed to bridge the gap between abstract graph theory and its tangible applications in computer science and daily life.
              </p>
              <Link to="/social-network" className="btn btn-primary" style={{ marginTop: '24px' }}>
                Begin Your Journey
              </Link>
            </div>

            <div className="objectives-list">
              {OBJECTIVES.map(({ icon, text }) => (
                <div key={text} className="objective-item">
                  <span className="objective-item__icon" role="img" aria-hidden="true">{icon}</span>
                  <span className="objective-item__text">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
