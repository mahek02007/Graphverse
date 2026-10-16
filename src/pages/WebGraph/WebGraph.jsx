import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../SocialNetwork/SocialNetwork.css'
import './WebGraph.css'

/* ── Initial graph ── */
const INIT_NODES = [
  { id: 'A', x: 350, y: 80,  label: 'GraphVerse',  color: '#ec4899', rank: 0 },
  { id: 'B', x: 160, y: 200, label: 'Algorithms',  color: '#00d4ff', rank: 0 },
  { id: 'C', x: 540, y: 200, label: 'Graphs',      color: '#7c3aed', rank: 0 },
  { id: 'D', x: 100, y: 340, label: 'Sorting',     color: '#10b981', rank: 0 },
  { id: 'E', x: 350, y: 280, label: 'Pathfinding',  color: '#f59e0b', rank: 0 },
  { id: 'F', x: 580, y: 360, label: 'Networks',    color: '#a78bfa', rank: 0 },
  { id: 'G', x: 220, y: 380, label: 'Trees',       color: '#06b6d4', rank: 0 },
]

const INIT_EDGES = [
  { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
  { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
  { from: 'C', to: 'E' }, { from: 'C', to: 'F' },
  { from: 'D', to: 'G' }, { from: 'E', to: 'A' },
  { from: 'F', to: 'A' }, { from: 'G', to: 'B' },
  { from: 'F', to: 'E' }, { from: 'E', to: 'G' },
]

/* ── PageRank algorithm ── */
function pageRank(nodes, edges, iterations = 50, damping = 0.85) {
  const n = nodes.length
  const ids = nodes.map(n => n.id)
  const rank = {}
  ids.forEach(id => { rank[id] = 1 / n })

  const outLinks = {}
  ids.forEach(id => { outLinks[id] = edges.filter(e => e.from === id).map(e => e.to) })

  for (let i = 0; i < iterations; i++) {
    const newRank = {}
    ids.forEach(id => {
      let sum = 0
      ids.forEach(j => {
        if (outLinks[j].includes(id)) {
          sum += rank[j] / (outLinks[j].length || 1)
        }
      })
      newRank[id] = (1 - damping) / n + damping * sum
    })
    ids.forEach(id => { rank[id] = newRank[id] })
  }

  // Normalize to 0-1
  const values = Object.values(rank)
  const max = Math.max(...values)
  const min = Math.min(...values)
  ids.forEach(id => { rank[id] = (rank[id] - min) / (max - min + 1e-10) })
  return rank
}

function arrowHead(fx, fy, tx, ty, r) {
  const dx=tx-fx, dy=ty-fy
  const d=Math.sqrt(dx*dx+dy*dy)||1
  const nx=dx/d, ny=dy/d
  const ex=tx-nx*(r+6), ey=ty-ny*(r+6)
  const sx=fx+nx*(r+4), sy=fy+ny*(r+4)
  const ang=Math.atan2(dy,dx), s=8
  return { sx,sy,ex,ey,
    pts:`${ex},${ey} ${ex-s*Math.cos(ang-Math.PI/6)},${ey-s*Math.sin(ang-Math.PI/6)} ${ex-s*Math.cos(ang+Math.PI/6)},${ey-s*Math.sin(ang+Math.PI/6)}`
  }
}

function rankColor(r) {
  // low: blue → high: pink
  const h = 280 - r * 200
  const s = 70 + r * 30
  const l = 55 + r * 15
  return `hsl(${h},${s}%,${l}%)`
}

const ICON = (
  <svg viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="8" fill="none" stroke="#ec4899" strokeWidth="2"/>
    <circle cx="24" cy="24" r="3" fill="#ec4899"/>
    <circle cx="8"  cy="12" r="4" fill="#ec4899" opacity=".7"/>
    <circle cx="40" cy="12" r="4" fill="#ec4899" opacity=".55"/>
    <circle cx="8"  cy="38" r="4" fill="#ec4899" opacity=".4"/>
    <circle cx="40" cy="38" r="4" fill="#ec4899" opacity=".55"/>
    <line x1="12" y1="14" x2="18" y2="20" stroke="#ec4899" strokeWidth="1.5"/>
    <line x1="36" y1="14" x2="30" y2="20" stroke="#ec4899" strokeWidth="1.5"/>
    <line x1="12" y1="36" x2="18" y2="28" stroke="#ec4899" strokeWidth="1.5"/>
    <line x1="36" y1="36" x2="30" y2="28" stroke="#ec4899" strokeWidth="1.5"/>
  </svg>
)

export default function WebGraph() {
  const [nodes, setNodes]   = useState(INIT_NODES)
  const [edges, setEdges]   = useState(INIT_EDGES)
  const [ranks, setRanks]   = useState({})
  const [running, setRunning] = useState(false)
  const [step, setStep]     = useState(0)
  const [damping, setDamping] = useState(0.85)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [edgeMode, setEdgeMode] = useState(false)
  const [edgeFrom, setEdgeFrom] = useState(null)
  const svgRef = useRef(null)
  const dragOffset = useRef({dx:0,dy:0})

  // Run PageRank
  const runPageRank = useCallback(() => {
    setRunning(true)
    setStep(0)
    const n = nodes.length
    const ids = nodes.map(n => n.id)
    const outLinks = {}
    ids.forEach(id => { outLinks[id] = edges.filter(e => e.from===id).map(e=>e.to) })

    let rank = {}
    ids.forEach(id => { rank[id] = 1/n })

    const steps = []
    for (let i = 0; i < 20; i++) {
      const nr = {}
      ids.forEach(id => {
        let sum = 0
        ids.forEach(j => {
          if (outLinks[j].includes(id)) sum += rank[j]/(outLinks[j].length||1)
        })
        nr[id] = (1-damping)/n + damping*sum
      })
      ids.forEach(id => { rank[id] = nr[id] })
      steps.push({...rank})
    }

    let i = 0
    const interval = setInterval(() => {
      setStep(i+1)
      const cur = steps[i]
      const vals = Object.values(cur)
      const max = Math.max(...vals), min = Math.min(...vals)
      const normalized = {}
      ids.forEach(id => { normalized[id] = (cur[id]-min)/(max-min+1e-10) })
      setRanks(normalized)
      setNodes(prev => prev.map(n => ({ ...n, rank: cur[n.id] })))
      i++
      if (i >= steps.length) { clearInterval(interval); setRunning(false) }
    }, 80)
  }, [nodes, edges, damping])

  const svgPoint = (e) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (clientX-rect.left)*(700/rect.width), y: (clientY-rect.top)*(440/rect.height) }
  }

  const onNodeDown = (e, id) => {
    e.stopPropagation()
    if (edgeMode) {
      if (!edgeFrom) { setEdgeFrom(id) }
      else if (edgeFrom !== id) {
        const exists = edges.some(ed=>ed.from===edgeFrom&&ed.to===id)
        if (!exists) setEdges(prev=>[...prev,{from:edgeFrom,to:id}])
        setEdgeFrom(null)
      }
      return
    }
    const pt = svgPoint(e)
    const node = nodes.find(n=>n.id===id)
    dragOffset.current = {dx:pt.x-node.x,dy:pt.y-node.y}
    setDragging(id)
  }

  const onMove = (e) => {
    if (!dragging) return
    const pt = svgPoint(e)
    setNodes(prev=>prev.map(n=>n.id===dragging?{...n,x:Math.max(30,Math.min(670,pt.x-dragOffset.current.dx)),y:Math.max(30,Math.min(410,pt.y-dragOffset.current.dy))}:n))
  }

  const reset = () => {
    setNodes(INIT_NODES)
    setEdges(INIT_EDGES)
    setRanks({})
    setStep(0)
    setRunning(false)
  }

  // sort by rank for leaderboard
  const sorted = [...nodes].sort((a,b)=>(ranks[b.id]||0)-(ranks[a.id]||0))

  return (
    <div className="simulation-page">
      <PageHeader
        badge="PageRank Algorithm"
        badgeClass="pink"
        icon={ICON}
        title="Web Graph & PageRank"
        subtitle="Model the web as a directed graph and run Google's PageRank algorithm. Watch how link structure determines page importance through iterative computation."
        concepts={[
          { label: 'Directed Web Graph', desc: 'Pages are nodes; hyperlinks are directed edges' },
          { label: 'PageRank',           desc: 'Importance score based on incoming link quality' },
          { label: 'Random Walk',        desc: 'Simulates a user clicking random links forever' },
          { label: 'Damping Factor',     desc: 'Probability of following a link (typically 0.85)' },
          { label: 'Power Iteration',    desc: 'Iterative method to compute eigenvector centrality' },
        ]}
      />

      <section className="simulation-body section-sm">
        <div className="container">
          <div className="sim-layout">
            {/* Controls */}
            <aside className="sim-controls">
              <h3 className="sim-controls__title">PageRank Controls</h3>

              <div className="sim-control-group">
                <label className="sim-label">Damping Factor (d)</label>
                <input type="range" min="0.5" max="0.99" step="0.01"
                  value={damping}
                  onChange={e=>setDamping(parseFloat(e.target.value))}
                  className="pr-slider"
                />
                <span className="pr-slider-val">{damping.toFixed(2)}</span>
                <p className="sim-hint">
                  d = probability of following a link. 1−d = chance of jumping to a random page.
                </p>
              </div>

              <div className="sim-control-group">
                <div className="action-buttons">
                  <button className="btn btn-primary btn-sm" onClick={runPageRank} disabled={running}>
                    {running ? `▶ Iterating… step ${step}/20` : '▶ Run PageRank'}
                  </button>
                  <button className={`mode-btn ${edgeMode?'mode-btn--active':''}`}
                    onClick={()=>{setEdgeMode(v=>!v);setEdgeFrom(null)}}
                  >Add Edge Mode</button>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
                </div>
                {edgeMode && (
                  <p className="sim-hint">{edgeFrom?`Source: "${nodes.find(n=>n.id===edgeFrom)?.label}" — click target.`:'Click source node first.'}</p>
                )}
              </div>

              {/* Rank leaderboard */}
              {Object.keys(ranks).length > 0 && (
                <div className="sim-control-group">
                  <label className="sim-label">PageRank Leaderboard</label>
                  <div className="pr-leaderboard">
                    {sorted.map((n,i)=>(
                      <div key={n.id} className="pr-rank-row">
                        <span className="pr-rank-pos">#{i+1}</span>
                        <span className="pr-rank-name" style={{color:n.color}}>{n.label}</span>
                        <div className="pr-rank-bar-wrap">
                          <div className="pr-rank-bar" style={{width:`${(ranks[n.id]||0)*100}%`,background:rankColor(ranks[n.id]||0)}}/>
                        </div>
                        <span className="pr-rank-score">{((ranks[n.id]||0)*100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="sim-control-group">
                <label className="sim-label">How It Works</label>
                <p style={{fontSize:'0.75rem',color:'var(--color-text-muted)',lineHeight:1.6}}>
                  Node size = PageRank score. Larger nodes have more incoming high-quality links.
                  Run PageRank to see scores animate to convergence.
                </p>
              </div>
            </aside>

            {/* Canvas */}
            <div className="sim-canvas-wrap">
              <div className="sim-canvas-header">
                <span className="sim-canvas-title">Web Graph — Directed Hyperlink Network</span>
                <span className="sim-canvas-stats">
                  {nodes.length} pages · {edges.length} links · Iteration: {step}/20
                </span>
              </div>

              <svg ref={svgRef} className="sim-svg" viewBox="0 0 700 440"
                onMouseMove={onMove} onMouseUp={()=>setDragging(null)}
                onMouseLeave={()=>setDragging(null)}
              >
                <defs>
                  {nodes.map(n=>(
                    <radialGradient key={n.id} id={`wg-grd-${n.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor={n.color} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
                    </radialGradient>
                  ))}
                </defs>

                {/* Edges */}
                {edges.map(({from,to})=>{
                  const fn=nodes.find(n=>n.id===from), tn=nodes.find(n=>n.id===to)
                  if(!fn||!tn) return null
                  const r=18+(ranks[to]||0)*12
                  const {sx,sy,ex,ey,pts}=arrowHead(fn.x,fn.y,tn.x,tn.y,r)
                  const highlight=hoveredNode&&(hoveredNode===from||hoveredNode===to)
                  return (
                    <g key={`${from}-${to}`}>
                      <line x1={sx} y1={sy} x2={ex} y2={ey}
                        stroke={highlight?fn.color:'#334155'}
                        strokeWidth={highlight?2:1.2}
                        strokeOpacity={highlight?0.85:0.3}
                      />
                      <polygon points={pts} fill={highlight?fn.color:'#334155'} opacity={highlight?0.85:0.3}/>
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map(n=>{
                  const r = 18+(ranks[n.id]||0)*18
                  return (
                    <g key={n.id}
                      onMouseDown={e=>onNodeDown(e,n.id)}
                      onMouseEnter={()=>setHoveredNode(n.id)}
                      onMouseLeave={()=>setHoveredNode(null)}
                      style={{cursor:edgeMode?'crosshair':'grab'}}
                    >
                      <circle cx={n.x} cy={n.y} r={r+16} fill={`url(#wg-grd-${n.id})`}/>
                      <circle cx={n.x} cy={n.y} r={r}
                        fill={n.color} fillOpacity="0.75"
                        stroke={n.color} strokeWidth="1.5" strokeOpacity="0.5"
                      />
                      {ranks[n.id] && (
                        <text x={n.x} y={n.y+4} textAnchor="middle" fontSize={Math.max(8,r*0.45)}
                          fontFamily="Space Grotesk,sans-serif" fontWeight="700" fill="#050b18"
                        >
                          {((ranks[n.id]||0)*100).toFixed(0)}%
                        </text>
                      )}
                      <text x={n.x} y={n.y-r-8} textAnchor="middle" fontSize="10"
                        fontFamily="Inter,sans-serif" fontWeight="600" fill={n.color} opacity="0.9"
                      >
                        {n.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h4 className="info-card__title">PageRank Formula</h4>
              <p className="info-card__text">
                PR(u) = (1−d)/N + d × Σ [PR(v) / OutLinks(v)] for all pages v linking to u.
                <em> d ≈ 0.85</em> is the damping factor. Each iteration refines the score.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Random Surfer Model</h4>
              <p className="info-card__text">
                Imagine a user who keeps clicking random links. PageRank is the <strong>long-run probability</strong> of landing on any page.
                Pages with many high-quality incoming links rank higher.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Convergence</h4>
              <p className="info-card__text">
                PageRank is computed via <em>power iteration</em>. After ~20–50 iterations, scores converge
                to a stable eigenvector of the web's link matrix. The algorithm that built Google Search.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
