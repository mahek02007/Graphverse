import { useState, useRef, useCallback } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
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

/* ── Crossing detection (line segment intersection) ── */
function ccw(ax,ay,bx,by,cx,cy) {
  return (cy-ay)*(bx-ax) > (by-ay)*(cx-ax)
}

function segmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy) {
  const d1x=bx-ax, d1y=by-ay, d2x=dx-cx, d2y=dy-cy
  const denom = d1x*d2y - d1y*d2x
  if (Math.abs(denom) < 1e-9) return false
  const t = ((cx-ax)*d2y - (cy-ay)*d2x) / denom
  const u = ((cx-ax)*d1y - (cy-ay)*d1x) / denom
  return t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95
}

function countCrossings(active) {
  let count = 0
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j]
      if (segmentsIntersect(a.x1,a.y1,a.x2,a.y2,b.x1,b.y1,b.x2,b.y2)) count++
    }
  }
  return count
}

const HOUSE_COLOR = '#7c3aed'
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
  const [showAll, setShowAll] = useState(false)
  const [showProof, setShowProof] = useState(false)

  const toggle = (house, util) => {
    const key = `${house}-${util}`
    setActive(prev => {
      const exists = prev.find(e => e.house===house && e.util===util)
      if (exists) return prev.filter(e => e.house!==house || e.util!==util)
      const h = HOUSES.find(h=>h.id===house)
      const u = UTILITIES.find(u=>u.id===util)
      return [...prev, { house, util, x1:h.x, y1:h.y, x2:u.x, y2:u.y }]
    })
  }

  const isActive = (house, util) => active.some(e => e.house===house && e.util===util)
  const crossings = countCrossings(active)
  const complete  = active.length === 9
  const hasCross  = crossings > 0

  const showAllEdges = () => {
    const all = ALL_CONNECTIONS.map(({house, util}) => {
      const h = HOUSES.find(h=>h.id===house)
      const u = UTILITIES.find(u=>u.id===util)
      return { house, util, x1:h.x, y1:h.y, x2:u.x, y2:u.y }
    })
    setActive(all)
    setShowAll(true)
  }

  const reset = () => { setActive([]); setShowAll(false) }

  return (
    <div className="simulation-page">
      <PageHeader
        badge="Bipartite Graph"
        badgeClass="violet"
        icon={ICON}
        title="Three Utilities Problem"
        subtitle="The classic unsolvable puzzle: connect 3 houses to 3 utilities without crossings. Discover why it's impossible — and what graph theory says about planarity."
        concepts={[
          { label: 'Bipartite Graph', desc: 'Two disjoint sets of vertices, edges only between sets' },
          { label: 'K₃,₃',           desc: 'Complete bipartite graph with 3+3 nodes' },
          { label: 'Planarity',       desc: 'Can the graph be drawn without edge crossings?' },
          { label: 'Kuratowski\'s Theorem', desc: 'A graph is planar iff it has no K₅ or K₃,₃ subdivision' },
          { label: 'Euler\'s Formula', desc: 'V - E + F = 2 for planar graphs' },
        ]}
      />

      <section className="simulation-body section-sm">
        <div className="container">
          <div className="sim-layout">
            {/* Controls */}
            <aside className="sim-controls">
              <h3 className="sim-controls__title">Controls</h3>

              <div className="sim-control-group">
                <label className="sim-label">Connection Grid</label>
                <p style={{fontSize:'0.75rem',color:'var(--color-text-muted)',lineHeight:1.5}}>
                  Click a cell to toggle a connection between a house and utility.
                  Try to connect all 9 pairs without crossings!
                </p>

                {/* Grid checkboxes */}
                <div className="util-grid">
                  <div className="util-grid__header-row">
                    <div/>
                    {UTILITIES.map(u => (
                      <div key={u.id} className="util-grid__header" style={{color:u.color}}>
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
                          className={`util-cell ${isActive(h.id,u.id) ? 'util-cell--active' : ''}`}
                          onClick={() => toggle(h.id, u.id)}
                          title={`${h.label} ↔ ${u.label}`}
                          style={isActive(h.id,u.id) ? {borderColor:u.color,background:`${u.color}22`} : {}}
                        >
                          {isActive(h.id,u.id) ? '✓' : '·'}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sim-control-group">
                <div className="util-status">
                  <div className="util-status-row">
                    <span>Connections:</span>
                    <strong className="util-status-val">{active.length} / 9</strong>
                  </div>
                  <div className="util-status-row">
                    <span>Crossings:</span>
                    <strong className="util-status-val" style={{color: hasCross ? '#ef4444' : '#10b981'}}>
                      {crossings}
                    </strong>
                  </div>
                  <div className="util-status-row">
                    <span>Status:</span>
                    <strong className="util-status-val" style={{color: complete ? (hasCross ? '#ef4444':'#10b981') : 'var(--color-text-muted)'}}>
                      {complete ? (hasCross ? '❌ Crossings!' : '✅ No crossings') : 'In progress'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="sim-control-group">
                <div className="action-buttons">
                  <button className="btn btn-outline btn-sm" onClick={showAllEdges}>
                    Show All 9 Edges
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowProof(v=>!v)}>
                    {showProof ? 'Hide' : 'Show'} Proof
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
                </div>
              </div>

              <div className="sim-control-group">
                <label className="sim-label">Legend</label>
                <div className="legend-item">
                  <div style={{width:14,height:14,borderRadius:'50%',background:'#7c3aed'}}/>
                  <span>House (source)</span>
                </div>
                {UTILITIES.map(u=>(
                  <div key={u.id} className="legend-item">
                    <div style={{width:14,height:14,borderRadius:'50%',background:u.color}}/>
                    <span>{u.label} (utility)</span>
                  </div>
                ))}
                <div className="legend-item">
                  <svg width="30" height="8"><line x1="0" y1="4" x2="30" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2"/></svg>
                  <span>Crossing (invalid)</span>
                </div>
              </div>
            </aside>

            {/* Canvas */}
            <div className="sim-canvas-wrap">
              <div className="sim-canvas-header">
                <span className="sim-canvas-title">K₃,₃ — Three Utilities Bipartite Graph</span>
                <span className="sim-canvas-stats">
                  {active.length}/9 edges · {crossings} crossing{crossings!==1?'s':''}
                </span>
              </div>

              <svg className="sim-svg" viewBox="0 0 700 440">
                {/* Active edges */}
                {active.map(({ house, util, x1, y1, x2, y2 }) => {
                  const u = UTILITIES.find(u=>u.id===util)
                  const otherEdges = active.filter(e=>e.house!==house||e.util!==util)
                  const cross = otherEdges.some(e => segmentsIntersect(x1,y1,x2,y2,e.x1,e.y1,e.x2,e.y2))
                  return (
                    <line key={`${house}-${util}`}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={cross ? '#ef4444' : u.color}
                      strokeWidth={cross ? 2 : 1.8}
                      strokeOpacity={cross ? 0.8 : 0.6}
                      strokeDasharray={cross ? '6,3' : 'none'}
                    />
                  )
                })}

                {/* Houses */}
                {HOUSES.map(h => (
                  <g key={h.id}>
                    <circle cx={h.x} cy={h.y} r={28} fill={HOUSE_COLOR} fillOpacity="0.15" stroke={HOUSE_COLOR} strokeWidth="1.5" strokeOpacity="0.5"/>
                    <circle cx={h.x} cy={h.y} r={22} fill={HOUSE_COLOR} fillOpacity="0.75"/>
                    <text x={h.x} y={h.y+5}  textAnchor="middle" fontSize="14" fontFamily="sans-serif">{h.emoji}</text>
                    <text x={h.x} y={h.y-32} textAnchor="middle" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" fill={HOUSE_COLOR}>{h.label}</text>
                  </g>
                ))}

                {/* Utilities */}
                {UTILITIES.map(u => (
                  <g key={u.id}>
                    <circle cx={u.x} cy={u.y} r={28} fill={u.color} fillOpacity="0.12" stroke={u.color} strokeWidth="1.5" strokeOpacity="0.5"/>
                    <circle cx={u.x} cy={u.y} r={22} fill={u.color} fillOpacity="0.75"/>
                    <text x={u.x} y={u.y+5}  textAnchor="middle" fontSize="14" fontFamily="sans-serif">{u.emoji}</text>
                    <text x={u.x} y={u.y+38} textAnchor="middle" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" fill={u.color}>{u.label}</text>
                  </g>
                ))}

                {/* Bipartite label */}
                <text x="350" y="230" textAnchor="middle" fontSize="11" fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.15)" fontWeight="600">BIPARTITE PARTITION</text>
                <line x1="80" y1="220" x2="620" y2="220" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="6,4"/>
              </svg>
            </div>
          </div>

          {/* Proof panel */}
          {showProof && (
            <div className="proof-panel">
              <h3 className="proof-panel__title">Why K₃,₃ is Non-Planar — The Proof</h3>
              <div className="proof-steps">
                <div className="proof-step">
                  <span className="proof-step__num">1</span>
                  <div>
                    <strong>Euler's Formula:</strong> For any connected planar graph: <code>V − E + F = 2</code>,
                    where V = vertices, E = edges, F = faces (regions).
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">2</span>
                  <div>
                    <strong>K₃,₃ stats:</strong> V = 6, E = 9.
                    If planar, F = 2 − V + E = 2 − 6 + 9 = <strong>5</strong>.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">3</span>
                  <div>
                    <strong>Bipartite constraint:</strong> K₃,₃ has no odd cycles (shortest cycle length = 4).
                    So every face must be bounded by ≥ 4 edges.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">4</span>
                  <div>
                    <strong>Contradiction:</strong> Each edge borders 2 faces, so 2E ≥ 4F → E ≥ 2F.
                    But 9 ≥ 2×5 = 10 is <strong>false</strong>. Contradiction! K₃,₃ cannot be planar.
                  </div>
                </div>
                <div className="proof-step">
                  <span className="proof-step__num">✓</span>
                  <div>
                    <strong>Kuratowski's Theorem:</strong> A graph is planar if and only if it contains no subdivision
                    of K₅ (complete graph on 5 nodes) or K₃,₃. The Three Utilities Problem is therefore provably unsolvable.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info cards */}
          <div className="info-cards">
            <div className="info-card">
              <h4 className="info-card__title">Bipartite Graph</h4>
              <p className="info-card__text">
                A graph whose vertices can be split into two disjoint sets where every edge connects a vertex from one set to the other.
                Here: <em>Houses</em> ↔ <em>Utilities</em>.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Planarity</h4>
              <p className="info-card__text">
                A graph is <em>planar</em> if it can be drawn on a plane with no crossing edges.
                K₃,₃ is the classic non-planar graph — it's mathematically <strong>impossible</strong> to draw it without crossings.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Real-World Impact</h4>
              <p className="info-card__text">
                Planarity testing is crucial in <strong>VLSI circuit design</strong> and <strong>PCB layout</strong>.
                Non-planar graphs require extra layers, increasing cost and complexity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
