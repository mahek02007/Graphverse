import { useState, useCallback } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import PresentationBar from '../../components/PresentationMode/PresentationBar'
import '../SocialNetwork/SocialNetwork.css'
import './UtilitiesProblem.css'

/* ── Static positions for K₃,₃ layout ── */
const HOUSES = [
  { id: 'H1', x: 160, y: 110, label: 'House 1', emoji: '🏠' },
  { id: 'H2', x: 350, y: 110, label: 'House 2', emoji: '🏠' },
  { id: 'H3', x: 540, y: 110, label: 'House 3', emoji: '🏠' },
]

const UTILITIES = [
  { id: 'W', x: 160, y: 330, label: 'Water',       emoji: '💧', color: '#06b6d4' },
  { id: 'G', x: 350, y: 330, label: 'Gas',         emoji: '🔥', color: '#f59e0b' },
  { id: 'E', x: 540, y: 330, label: 'Electricity', emoji: '⚡', color: '#a78bfa' },
]

const ALL_CONNECTIONS = [
  { house: 'H1', util: 'W' }, { house: 'H1', util: 'G' }, { house: 'H1', util: 'E' },
  { house: 'H2', util: 'W' }, { house: 'H2', util: 'G' }, { house: 'H2', util: 'E' },
  { house: 'H3', util: 'W' }, { house: 'H3', util: 'G' }, { house: 'H3', util: 'E' },
]

// 8 non-crossing connections (excluding H3-E) for presentation demonstration
const EIGHT_CLEAN_CONNECTIONS = [
  { house: 'H1', util: 'W' }, { house: 'H1', util: 'G' }, { house: 'H1', util: 'E' },
  { house: 'H2', util: 'W' }, { house: 'H2', util: 'G' }, { house: 'H2', util: 'E' },
  { house: 'H3', util: 'W' }, { house: 'H3', util: 'G' },
]

/* ── Crossing detection (line segment intersection) ── */
function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1x = bx - ax, d1y = by - ay, d2x = dx - cx, d2y = dy - cy
  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-9) return false
  const t = ((cx - ax) * d2y - (cy - ay) * d2x) / denom
  const u = ((cx - ax) * d1y - (cy - ay) * d1x) / denom
  return t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95
}

function countCrossings(active) {
  let count = 0
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j]
      if (segmentsIntersect(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2)) count++
    }
  }
  return count
}

const HOUSE_COLOR = '#7c3aed'

/* ════════════════════════════════════════════════════════════
   CLASSROOM PRESENTATION SLIDES
   ════════════════════════════════════════════════════════════ */

const UTILITIES_SLIDES = [
  {
    id: 'setup',
    title: 'Slide 1 — The Three Utilities Puzzle Setup',
    mainConcept: 'Three houses must each connect to three municipal utility plants (Water, Gas, Electricity) without any pipelines crossing each other.',
    talkingPoints: [
      'In graph theory, this is the Complete Bipartite Graph K₃,₃ (3 houses + 3 utilities).',
      'There are exactly 3 × 3 = 9 total edges needed for a complete solution.',
      'A graph that can be drawn on a plane with zero crossing edges is called a Planar Graph.',
    ],
    highlightSummary: 'Initial bipartite graph layout: Houses on top, Utilities on the bottom.',
  },
  {
    id: 'eight-edges',
    title: 'Slide 2 — The First 8 Connections (Planar Drawing)',
    mainConcept: 'It is easy to draw 8 out of the 9 connections cleanly without a single crossing line.',
    talkingPoints: [
      'Demonstrate the 8 connections: notice how each line partitions the 2D surface into distinct regions (faces).',
      'According to the Jordan Curve Theorem, closed loops create an "inside" and an "outside".',
      'House 3 and Electricity are now separated by an enclosing ring of existing pipelines!',
    ],
    highlightSummary: '8 connections drawn with 0 crossings. Only 1 connection remains.',
  },
  {
    id: 'ninth-crossing',
    title: 'Slide 3 — The Trapped 9th Connection',
    mainConcept: 'When we draw the 9th connection between House 3 and Electricity, a crossing is mathematically unavoidable.',
    talkingPoints: [
      'Point out the dashed red crossing line: you cannot route the 9th pipe without breaching a boundary.',
      'No matter how you curve, detour, or warp the lines in 2D, at least one intersection must occur.',
    ],
    highlightSummary: 'All 9 edges are connected, producing crossing intersections.',
  },
  {
    id: 'euler-proof',
    title: 'Slide 4 — Mathematical Proof via Euler\'s Formula',
    mainConcept: 'Euler\'s Polyhedral Formula (V − E + F = 2) provides a rigorous, indisputable proof of non-planarity.',
    talkingPoints: [
      'For K₃,₃: V = 6 vertices, E = 9 edges. If planar, F = 2 − 6 + 9 = 5 faces.',
      'Because the graph is bipartite, it has no odd cycles. The shortest cycle has length 4.',
      'Therefore: 2E ≥ 4F → 2(9) ≥ 4(5) → 18 ≥ 20. This is a mathematical contradiction! Thus, K₃,₃ cannot be planar.',
    ],
    highlightSummary: 'Contradiction: 18 ≥ 20 is false, proving planarity is impossible.',
  },
  {
    id: 'kuratowski',
    title: 'Slide 5 — Kuratowski\'s Theorem & Modern Applications',
    mainConcept: 'Kuratowski\'s Theorem states that a graph is planar if and only if it contains no subdivision of K₅ or K₃,₃.',
    talkingPoints: [
      'K₃,₃ is one of the two foundational "forbidden subgraphs" of planar graph theory.',
      'Real-world impact: Printed Circuit Board (PCB) routing and microchip VLSI layout algorithms check for K₃,₃ to determine when extra vertical via layers are needed.',
    ],
    highlightSummary: 'K₃,₃ is the quintessential non-planar benchmark in discrete mathematics.',
  },
]

const ICON = (
  <svg viewBox="0 0 48 48" fill="none">
    <rect x="6" y="28" width="8" height="12" rx="2" fill="#a78bfa"/>
    <rect x="20" y="28" width="8" height="12" rx="2" fill="#a78bfa" opacity=".7"/>
    <rect x="34" y="28" width="8" height="12" rx="2" fill="#a78bfa" opacity=".5"/>
    <circle cx="10" cy="12" r="5" fill="#7c3aed"/>
    <circle cx="24" cy="12" r="5" fill="#7c3aed" opacity=".8"/>
    <circle cx="38" cy="12" r="5" fill="#7c3aed" opacity=".6"/>
    <line x1="10" y1="17" x2="10" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
    <line x1="10" y1="17" x2="24" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
    <line x1="24" y1="17" x2="10" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
    <line x1="24" y1="17" x2="38" y2="28" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3,2"/>
  </svg>
)

export default function UtilitiesProblem() {
  const [active, setActive] = useState([])      // connected {house, util, x1,y1,x2,y2}
  const [showProof, setShowProof] = useState(false)
  const [presMode, setPresMode] = useState(false)
  const [presStep, setPresStep] = useState(0)

  const toggle = (house, util) => {
    setActive(prev => {
      const exists = prev.find(e => e.house === house && e.util === util)
      if (exists) return prev.filter(e => e.house !== house || e.util !== util)
      const h = HOUSES.find(h => h.id === house)
      const u = UTILITIES.find(u => u.id === util)
      return [...prev, { house, util, x1: h.x, y1: h.y, x2: u.x, y2: u.y }]
    })
  }

  const isActive = (house, util) => active.some(e => e.house === house && e.util === util)
  const crossings = countCrossings(active)
  const complete  = active.length === 9
  const hasCross  = crossings > 0

  const showAllEdges = useCallback(() => {
    const all = ALL_CONNECTIONS.map(({ house, util }) => {
      const h = HOUSES.find(h => h.id === house)
      const u = UTILITIES.find(u => u.id === util)
      return { house, util, x1: h.x, y1: h.y, x2: u.x, y2: u.y }
    })
    setActive(all)
  }, [])

  const showEightEdges = useCallback(() => {
    const eight = EIGHT_CLEAN_CONNECTIONS.map(({ house, util }) => {
      const h = HOUSES.find(h => h.id === house)
      const u = UTILITIES.find(u => u.id === util)
      return { house, util, x1: h.x, y1: h.y, x2: u.x, y2: u.y }
    })
    setActive(eight)
  }, [])

  const reset = () => {
    setActive([])
    setShowProof(false)
  }

  // Handle slide changes in presentation mode
  const handleSelectSlide = (idx) => {
    setPresStep(idx)
    if (idx === 0) reset()
    else if (idx === 1) showEightEdges()
    else if (idx === 2) showAllEdges()
    else if (idx === 3) { showAllEdges(); setShowProof(true) }
    else if (idx === 4) { showAllEdges(); setShowProof(true) }
  }

  const handleNextSlide = () => {
    handleSelectSlide(Math.min(UTILITIES_SLIDES.length - 1, presStep + 1))
  }

  const handlePrevSlide = () => {
    handleSelectSlide(Math.max(0, presStep - 1))
  }

  return (
    <div className="simulation-page">
      <PageHeader
        badge="Bipartite Graph & Planarity"
        badgeClass="violet"
        icon={ICON}
        title="Three Utilities Problem"
        subtitle="The classic mathematical puzzle: connect 3 houses to 3 utilities without crossing lines. Discover why it is mathematically impossible — and what Kuratowski's theorem proves about planarity."
        intro="Can you connect 3 houses to Water, Gas, and Electricity without any utility pipelines crossing? This ancient puzzle introduces Bipartite Graphs (K₃,₃), Euler's Polyhedral Formula, and graph planarity."
        showHome={true}
        presentationMode={presMode}
        onTogglePresentation={() => {
          setPresMode(p => !p)
          if (!presMode) handleSelectSlide(0)
        }}
        concepts={[
          { label: 'Bipartite Graph', desc: 'Two disjoint sets of vertices, edges only between sets' },
          { label: 'K₃,₃ Complete Bipartite', desc: 'Complete bipartite graph with 3 houses and 3 utilities' },
          { label: 'Planarity', desc: 'Can the graph be drawn on a plane without edge crossings?' },
          { label: 'Kuratowski\'s Theorem', desc: 'A graph is planar iff it has no K₅ or K₃,₃ subdivision' },
          { label: 'Euler\'s Formula', desc: 'V - E + F = 2 for all connected planar graphs' },
        ]}
      />

      <section className="simulation-body section-sm">
        <div className="container">
          {/* ══════════════ CLASSROOM PRESENTATION MODE ══════════════ */}
          {presMode && (
            <PresentationBar
              slides={UTILITIES_SLIDES}
              currentIndex={presStep}
              onNext={handleNextSlide}
              onPrev={handlePrevSlide}
              onSelectSlide={handleSelectSlide}
              onExit={() => setPresMode(false)}
              themeColor="#a78bfa"
            />
          )}

          <div className={`sim-layout ${presMode ? 'sim-layout--pres' : ''}`}>
            {/* ══════════════ LEFT CONTROLS & LIVE STATS ══════════════ */}
            <aside className="sim-controls">
              {/* Live Statistics Panel */}
              <div className="sim-stats-card">
                <div className="sim-stats-header">
                  <span className="sim-stats-title">📊 Live Bipartite Stats</span>
                  <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    K₃,₃ Graph
                  </span>
                </div>
                <div className="sim-stats-grid">
                  <div className="sim-stat-box">
                    <span className="sim-stat-val" style={{ color: '#7c3aed' }}>3</span>
                    <span className="sim-stat-label">Houses (V₁)</span>
                  </div>
                  <div className="sim-stat-box">
                    <span className="sim-stat-val" style={{ color: '#06b6d4' }}>3</span>
                    <span className="sim-stat-label">Utilities (V₂)</span>
                  </div>
                  <div className="sim-stat-box">
                    <span className="sim-stat-val" style={{ color: '#00d4ff' }}>{active.length} / 9</span>
                    <span className="sim-stat-label">Edges (E)</span>
                  </div>
                  <div className="sim-stat-box">
                    <span className="sim-stat-val" style={{ color: hasCross ? '#ef4444' : '#10b981' }}>
                      {crossings}
                    </span>
                    <span className="sim-stat-label">Crossings</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(5, 11, 24, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Planarity:</span>
                    <strong style={{ color: hasCross ? '#ef4444' : (complete ? '#10b981' : '#f59e0b') }}>
                      {hasCross ? '❌ Non-Planar (Crossings)' : (complete ? '✅ Planar Drawing' : '⚡ Untested / Incomplete')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Euler Invariant:</span>
                    <span style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>V − E + F = 2</span>
                  </div>
                </div>
              </div>

              {/* Interactive Connection Grid */}
              <div className="sim-control-group">
                <label className="sim-label">Interactive Connection Grid</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Click cells to toggle utility connections. Try connecting all 9 pairs without crossing lines!
                </p>

                <div className="util-grid">
                  <div className="util-grid__header-row">
                    <div />
                    {UTILITIES.map(u => (
                      <div key={u.id} className="util-grid__header" style={{ color: u.color }}>
                        {u.emoji} {u.label}
                      </div>
                    ))}
                  </div>
                  {HOUSES.map(h => (
                    <div key={h.id} className="util-grid__row">
                      <div className="util-grid__row-label">{h.emoji} {h.label}</div>
                      {UTILITIES.map(u => (
                        <button
                          key={u.id}
                          className={`util-cell ${isActive(h.id, u.id) ? 'util-cell--active' : ''}`}
                          onClick={() => toggle(h.id, u.id)}
                          title={`${h.label} ↔ ${u.label}`}
                          style={isActive(h.id, u.id) ? { borderColor: u.color, background: `${u.color}22` } : {}}
                        >
                          {isActive(h.id, u.id) ? '✓' : '·'}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sim-control-group">
                <div className="action-buttons">
                  <button className="btn btn-primary btn-sm" onClick={showAllEdges}>
                    Show All 9 Edges (K₃,₃)
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowProof(v => !v)}>
                    {showProof ? '✕ Hide Mathematical Proof' : '📜 Show Mathematical Proof'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>
                    ↺ Reset Connections
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="sim-control-group">
                <label className="sim-label">Graph Legend</label>
                <div className="legend-item">
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#7c3aed' }} />
                  <span>House (Partition V₁)</span>
                </div>
                {UTILITIES.map(u => (
                  <div key={u.id} className="legend-item">
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: u.color }} />
                    <span>{u.label} (Partition V₂)</span>
                  </div>
                ))}
                <div className="legend-item">
                  <svg width="30" height="8">
                    <line x1="0" y1="4" x2="30" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
                  </svg>
                  <span>Crossing Intersection (Non-Planar)</span>
                </div>
              </div>
            </aside>

            {/* ══════════════ DEDICATED GRAPH CANVAS ══════════════ */}
            <div className="sim-canvas-wrap">
              <div className="sim-canvas-header">
                <span className="sim-canvas-title">K₃,₃ — Complete Bipartite Graph Partition</span>
                <span className="sim-canvas-stats">
                  {active.length}/9 edges connected · {crossings} crossing{crossings !== 1 ? 's' : ''}
                </span>
              </div>

              <svg className="sim-svg" viewBox="0 0 700 440">
                {/* Active connection lines */}
                {active.map(({ house, util, x1, y1, x2, y2 }) => {
                  const u = UTILITIES.find(u => u.id === util)
                  const otherEdges = active.filter(e => e.house !== house || e.util !== util)
                  const cross = otherEdges.some(e => segmentsIntersect(x1, y1, x2, y2, e.x1, e.y1, e.x2, e.y2))
                  return (
                    <line
                      key={`${house}-${util}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={cross ? '#ef4444' : u.color}
                      strokeWidth={cross ? 2.5 : 2}
                      strokeOpacity={cross ? 0.95 : 0.75}
                      strokeDasharray={cross ? '6,3' : 'none'}
                    />
                  )
                })}

                {/* Houses (Partition 1) */}
                {HOUSES.map(h => (
                  <g key={h.id}>
                    <circle cx={h.x} cy={h.y} r={32} fill={HOUSE_COLOR} fillOpacity="0.15" stroke={HOUSE_COLOR} strokeWidth="1.5" strokeOpacity="0.5" />
                    <circle cx={h.x} cy={h.y} r={24} fill={HOUSE_COLOR} fillOpacity="0.85" />
                    <text x={h.x} y={h.y + 6} textAnchor="middle" fontSize="15" fontFamily="sans-serif">{h.emoji}</text>
                    <text x={h.x} y={h.y - 36} textAnchor="middle" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="700" fill={HOUSE_COLOR}>
                      {h.label}
                    </text>
                  </g>
                ))}

                {/* Utilities (Partition 2) */}
                {UTILITIES.map(u => (
                  <g key={u.id}>
                    <circle cx={u.x} cy={u.y} r={32} fill={u.color} fillOpacity="0.15" stroke={u.color} strokeWidth="1.5" strokeOpacity="0.5" />
                    <circle cx={u.x} cy={u.y} r={24} fill={u.color} fillOpacity="0.85" />
                    <text x={u.x} y={u.y + 6} textAnchor="middle" fontSize="15" fontFamily="sans-serif">{u.emoji}</text>
                    <text x={u.x} y={u.y + 44} textAnchor="middle" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="700" fill={u.color}>
                      {u.label}
                    </text>
                  </g>
                ))}

                {/* Bipartite Partition Boundary Label */}
                <text x="350" y="226" textAnchor="middle" fontSize="11" fontFamily="Inter, sans-serif" fill="rgba(255,255,255,0.25)" fontWeight="700" letterSpacing="0.1em">
                  BIPARTITE PARTITION (EDGES ONLY BETWEEN SETS)
                </text>
                <line x1="80" y1="220" x2="620" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6,4" />
              </svg>
            </div>
          </div>

          {/* Mathematical Proof Panel */}
          {showProof && (
            <div className="proof-panel" style={{ marginTop: 'var(--space-6)' }}>
              <h3 className="proof-panel__title">📜 Formal Mathematical Proof: Why K₃,₃ is Non-Planar</h3>
              <div className="proof-steps">
                <div className="proof-step">
                  <span className="proof-step__num">1</span>
                  <div>
                    <strong>Euler&apos;s Polyhedral Formula:</strong> For any connected planar graph drawn in 2D space:
                    <code> V − E + F = 2</code>, where <em>V</em> = vertices, <em>E</em> = edges, and <em>F</em> = bounded and unbounded faces.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">2</span>
                  <div>
                    <strong>Calculate Theoretical Faces:</strong> For K₃,₃, we have V = 6 and E = 9.
                    If K₃,₃ were planar, it would require:
                    <code> F = 2 − V + E = 2 − 6 + 9 = 5 faces</code>.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">3</span>
                  <div>
                    <strong>Bipartite Face Boundary Constraint:</strong> K₃,₃ is bipartite, which means it contains <strong>no odd cycles</strong>.
                    Therefore, every face must be enclosed by at least 4 edges (shortest cycle length = 4).
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">4</span>
                  <div>
                    <strong>Proof by Contradiction:</strong> Each edge borders at most 2 faces, yielding the inequality <code>2E ≥ 4F</code> or <code>E ≥ 2F</code>.
                    Substituting our values: <code>9 ≥ 2(5) = 10</code>, which is <strong>mathematically false!</strong>
                    Contradiction established: K₃,₃ cannot be planar in 2D.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">✓</span>
                  <div>
                    <strong>Kuratowski&apos;s Theorem (1930):</strong> A finite graph is planar if and only if it does not contain a subgraph that is a subdivision of K₅ (complete 5-vertex graph) or K₃,₃.
                    Thus, the Three Utilities Problem is provably impossible on a plane.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conceptual Info Cards */}
          <div className="info-cards" style={{ marginTop: 'var(--space-6)' }}>
            <div className="info-card">
              <h4 className="info-card__title">📌 Complete Bipartite Graph</h4>
              <p className="info-card__text">
                A bipartite graph splits vertices into two disjoint sets $V_1$ (Houses) and $V_2$ (Utilities).
                Edges only connect across partitions, never within the same set.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">📐 Planar Embeddings</h4>
              <p className="info-card__text">
                A graph is planar if it can be embedded on the Euclidean plane such that no two edges intersect.
                Non-planar graphs require crossing bridges or higher-genus surfaces like a torus.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">🔌 Modern VLSI PCB Layout</h4>
              <p className="info-card__text">
                Planarity testing is fundamental to printed circuit board design. When a trace network contains a K₃,₃ or K₅ minor, engineers must route signals through multi-layer copper vias.
              </p>
            </div>
          </div>

          {/* ══════════════ WHAT DID WE LEARN? SUMMARY ══════════════ */}
          <section className="learning-summary-section">
            <div className="learning-summary-card">
              <span className="learning-summary-badge">🎓 Core Key Takeaways</span>
              <h3 className="learning-summary-title">What Did We Learn?</h3>
              <div className="learning-summary-grid">
                <div className="learning-summary-item">
                  <div className="learning-summary-icon">🧩</div>
                  <h4 className="learning-summary-heading">The Bipartite Property</h4>
                  <p className="learning-summary-desc">
                    In bipartite graphs G = (V₁, V₂, E), all cycles have even length (≥ 4). Edges only link distinct sets, modeling relationships between consumers and providers.
                  </p>
                </div>
                <div className="learning-summary-item">
                  <div className="learning-summary-icon">🚫</div>
                  <h4 className="learning-summary-heading">Planar Impossibility</h4>
                  <p className="learning-summary-desc">
                    Drawing 8 connections partitions the plane such that the 9th connection is topologically isolated, creating an inevitable edge crossing.
                  </p>
                </div>
                <div className="learning-summary-item">
                  <div className="learning-summary-icon">📐</div>
                  <h4 className="learning-summary-heading">Euler&apos;s Face Inequality</h4>
                  <p className="learning-summary-desc">
                    Euler&apos;s formula V − E + F = 2 combined with face cycle bounds (2E ≥ 4F) yields 9 ≥ 10, proving impossibility by algebraic contradiction.
                  </p>
                </div>
                <div className="learning-summary-item">
                  <div className="learning-summary-icon">🍩</div>
                  <h4 className="learning-summary-heading">Torus & 3D Solutions</h4>
                  <p className="learning-summary-desc">
                    While unsolvable on a 2D sheet of paper, K₃,₃ is fully planar on the surface of a torus (donut) or multi-layered computer chip!
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
