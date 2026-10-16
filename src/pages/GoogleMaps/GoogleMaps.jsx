import { useState, useRef, useCallback } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../SocialNetwork/SocialNetwork.css'
import './GoogleMaps.css'

/* ── Graph definition ── */
const INIT_NODES = [
  { id: 'A', x: 120, y: 80,  label: 'Home',      color: '#10b981' },
  { id: 'B', x: 320, y: 60,  label: 'Park',       color: '#f59e0b' },
  { id: 'C', x: 520, y: 100, label: 'Library',   color: '#7c3aed' },
  { id: 'D', x: 160, y: 240, label: 'Market',    color: '#ec4899' },
  { id: 'E', x: 360, y: 210, label: 'School',    color: '#00d4ff' },
  { id: 'F', x: 560, y: 270, label: 'Hospital',  color: '#a78bfa' },
  { id: 'G', x: 260, y: 360, label: 'Station',   color: '#06b6d4' },
  { id: 'H', x: 480, y: 380, label: 'Mall',      color: '#f59e0b' },
]

const INIT_EDGES = [
  { from:'A', to:'B', w:4 }, { from:'A', to:'D', w:6 },
  { from:'B', to:'C', w:3 }, { from:'B', to:'E', w:5 },
  { from:'C', to:'F', w:4 }, { from:'D', to:'E', w:2 },
  { from:'D', to:'G', w:7 }, { from:'E', to:'F', w:3 },
  { from:'E', to:'G', w:4 }, { from:'F', to:'H', w:5 },
  { from:'G', to:'H', w:3 }, { from:'B', to:'D', w:8 },
]

/* ── Dijkstra's Algorithm ── */
function dijkstra(nodes, edges, startId, endId) {
  const dist = {}, prev = {}, visited = new Set()
  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[startId] = 0

  // Build adjacency
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(({from,to,w}) => {
    adj[from].push({node:to, w})
    adj[to].push({node:from, w})   // undirected
  })

  const steps = []  // for animation

  while (visited.size < nodes.length) {
    // Pick unvisited node with min dist
    let u = null
    nodes.forEach(n => {
      if (!visited.has(n.id) && (u === null || dist[n.id] < dist[u])) u = n.id
    })
    if (u === null || dist[u] === Infinity) break

    visited.add(u)
    steps.push({ visiting: u, dist: {...dist}, prev: {...prev} })

    if (u === endId) break

    adj[u].forEach(({node:v, w}) => {
      const alt = dist[u] + w
      if (alt < dist[v]) {
        dist[v] = alt
        prev[v] = u
        steps.push({ visiting: u, relaxing: v, dist: {...dist}, prev: {...prev} })
      }
    })
  }

  // Reconstruct path
  const path = []
  let cur = endId
  while (cur !== null) {
    path.unshift(cur)
    cur = prev[cur]
  }
  if (path[0] !== startId) return { steps, path: [], totalCost: Infinity }
  const totalCost = dist[endId]
  return { steps, path, totalCost }
}

const ICON = (
  <svg viewBox="0 0 48 48" fill="none">
    <circle cx="8"  cy="8"  r="4" fill="#f59e0b" opacity=".9"/>
    <circle cx="40" cy="8"  r="4" fill="#f59e0b" opacity=".7"/>
    <circle cx="8"  cy="40" r="4" fill="#f59e0b" opacity=".7"/>
    <circle cx="40" cy="40" r="4" fill="#f59e0b" opacity=".55"/>
    <circle cx="24" cy="24" r="4" fill="#10b981"/>
    <line x1="12" y1="8"  x2="36" y2="8"  stroke="#f59e0b" strokeWidth="1.8"/>
    <line x1="8"  y1="12" x2="8"  y2="36" stroke="#f59e0b" strokeWidth="1.8"/>
    <line x1="12" y1="10" x2="21" y2="22" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
    <text x="13" y="7" fontSize="5" fill="#f59e0b" fontFamily="monospace">4</text>
  </svg>
)

export default function GoogleMaps() {
  const [nodes]  = useState(INIT_NODES)
  const [edges]  = useState(INIT_EDGES)
  const [start, setStart]   = useState('A')
  const [end,   setEnd]     = useState('H')
  const [result, setResult] = useState(null)
  const [animStep, setAnimStep]   = useState(-1)
  const [running, setRunning]     = useState(false)
  const [showWeights, setShowWeights] = useState(true)
  const [log, setLog] = useState(['Select source and destination, then run Dijkstra\'s algorithm.'])

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 8))

  const runDijkstra = useCallback(() => {
    if (start === end) { addLog('Source and destination must be different!'); return }
    setRunning(true)
    setResult(null)
    setAnimStep(-1)
    addLog(`Running Dijkstra from ${nodes.find(n=>n.id===start)?.label} to ${nodes.find(n=>n.id===end)?.label}…`)

    const { steps, path, totalCost } = dijkstra(nodes, edges, start, end)
    let i = 0
    const interval = setInterval(() => {
      setAnimStep(i)
      if (steps[i]?.visiting) addLog(`Visiting: ${nodes.find(n=>n.id===steps[i].visiting)?.label} (dist=${steps[i].dist[steps[i].visiting]===Infinity?'∞':steps[i].dist[steps[i].visiting]})`)
      i++
      if (i >= steps.length) {
        clearInterval(interval)
        setResult({ path, totalCost, dist: steps[steps.length-1]?.dist || {} })
        setRunning(false)
        if (path.length > 1) {
          const pathNames = path.map(id=>nodes.find(n=>n.id===id)?.label).join(' → ')
          addLog(`✅ Shortest path: ${pathNames} (cost: ${totalCost})`)
        } else {
          addLog('❌ No path found!')
        }
        setAnimStep(steps.length)
      }
    }, 150)
  }, [nodes, edges, start, end])

  const reset = () => {
    setResult(null)
    setAnimStep(-1)
    setRunning(false)
    setLog(['Graph reset. Select start/end and run algorithm.'])
  }

  // Determine visual state of each node
  const getNodeState = (id) => {
    if (!result && animStep < 0) return 'default'
    if (result?.path?.includes(id)) return 'path'
    if (id === start) return 'start'
    if (id === end)   return 'end'
    return 'visited'
  }

  // Determine edge state
  const getEdgeState = (from, to) => {
    if (!result) return 'default'
    const path = result.path
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i]===from&&path[i+1]===to)||(path[i]===to&&path[i+1]===from)) return 'path'
    }
    return 'default'
  }

  // Edge midpoint for weight label
  const edgeMid = (from, to) => {
    const fn = nodes.find(n=>n.id===from), tn = nodes.find(n=>n.id===to)
    return { x: (fn.x+tn.x)/2, y: (fn.y+tn.y)/2 }
  }

  return (
    <div className="simulation-page">
      <PageHeader
        badge="Weighted Graph"
        badgeClass="amber"
        icon={ICON}
        title="Google Maps Simulation"
        subtitle="Navigate a city modelled as a weighted graph. Run Dijkstra's algorithm step-by-step and watch it find the shortest path in real time."
        concepts={[
          { label: 'Weighted Graph',        desc: 'Edges carry a numeric cost (distance/time)' },
          { label: 'Dijkstra\'s Algorithm', desc: 'Greedy shortest-path using a priority queue' },
          { label: 'Shortest Path',         desc: 'Minimum total cost from source to destination' },
          { label: 'Relaxation',            desc: 'Updating distances when a shorter route is found' },
          { label: 'Priority Queue',        desc: 'Efficiently selects the next nearest unvisited node' },
        ]}
      />

      <section className="simulation-body section-sm">
        <div className="container">
          <div className="sim-layout">
            {/* Controls */}
            <aside className="sim-controls">
              <h3 className="sim-controls__title">Dijkstra Controls</h3>

              <div className="sim-control-group">
                <label className="sim-label">Start Node</label>
                <select className="gm-select" value={start} onChange={e=>setStart(e.target.value)}>
                  {nodes.map(n=>(
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div className="sim-control-group">
                <label className="sim-label">End Node</label>
                <select className="gm-select" value={end} onChange={e=>setEnd(e.target.value)}>
                  {nodes.map(n=>(
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div className="sim-control-group">
                <div className="action-buttons">
                  <button className="btn btn-primary btn-sm" onClick={runDijkstra} disabled={running}>
                    {running ? '⏳ Running…' : '▶ Find Shortest Path'}
                  </button>
                  <button
                    className={`mode-btn ${showWeights?'mode-btn--active':''}`}
                    onClick={()=>setShowWeights(v=>!v)}
                  >
                    {showWeights ? '👁 Hide' : '👁 Show'} Weights
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className="sim-control-group">
                  <label className="sim-label">Result</label>
                  <div className="gm-result">
                    <div className="gm-result-row">
                      <span>Total Cost:</span>
                      <strong style={{color:'var(--color-amber)'}}>{result.totalCost === Infinity ? '∞ (no path)' : result.totalCost}</strong>
                    </div>
                    <div className="gm-result-row">
                      <span>Hops:</span>
                      <strong style={{color:'var(--color-emerald)'}}>{result.path.length - 1}</strong>
                    </div>
                    <div className="gm-result-path">
                      {result.path.map((id,i)=>(
                        <span key={id}>
                          <span className="gm-path-node" style={{color:nodes.find(n=>n.id===id)?.color}}>
                            {nodes.find(n=>n.id===id)?.label}
                          </span>
                          {i < result.path.length-1 && <span className="gm-path-arrow">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Distance table */}
              {result && (
                <div className="sim-control-group">
                  <label className="sim-label">All Distances from {nodes.find(n=>n.id===start)?.label}</label>
                  <div className="gm-dist-table">
                    {nodes.map(n=>(
                      <div key={n.id} className={`gm-dist-row ${result.path.includes(n.id)?'gm-dist-row--path':''}`}>
                        <span style={{color:n.color,fontWeight:600}}>{n.label}</span>
                        <span style={{color:'var(--color-text-muted)',fontSize:'0.75rem'}}>{n.id}</span>
                        <span className="gm-dist-val">
                          {result.dist[n.id]===undefined||result.dist[n.id]===Infinity?'∞':result.dist[n.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log */}
              <div className="sim-control-group">
                <label className="sim-label">Algorithm Log</label>
                <div className="activity-log">
                  {log.map((l,i)=>(
                    <p key={i} className="activity-log-line" style={{opacity:1-i*0.11}}>{l}</p>
                  ))}
                </div>
              </div>
            </aside>

            {/* Canvas */}
            <div className="sim-canvas-wrap">
              <div className="sim-canvas-header">
                <span className="sim-canvas-title">City Road Map — Weighted Graph</span>
                <span className="sim-canvas-stats">
                  {nodes.length} locations · {edges.length} roads
                  {result ? ` · Shortest: ${result.totalCost===Infinity?'∞':result.totalCost} units` : ''}
                </span>
              </div>

              <svg className="sim-svg" viewBox="0 0 700 440">
                <defs>
                  {nodes.map(n=>(
                    <radialGradient key={n.id} id={`gm-grd-${n.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor={n.color} stopOpacity="0.25"/>
                      <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
                    </radialGradient>
                  ))}
                </defs>

                {/* Edges */}
                {edges.map(({from,to,w})=>{
                  const fn=nodes.find(n=>n.id===from), tn=nodes.find(n=>n.id===to)
                  if(!fn||!tn) return null
                  const state=getEdgeState(from,to)
                  const mid=edgeMid(from,to)
                  return (
                    <g key={`${from}-${to}`}>
                      <line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                        stroke={state==='path'?'#10b981':'#334155'}
                        strokeWidth={state==='path'?3.5:1.5}
                        strokeOpacity={state==='path'?0.9:0.4}
                        strokeLinecap="round"
                      />
                      {showWeights && (
                        <>
                          <rect x={mid.x-10} y={mid.y-9} width="20" height="14" rx="4"
                            fill="rgba(5,11,24,0.85)" stroke={state==='path'?'#10b981':'rgba(255,255,255,0.08)'} strokeWidth="1"/>
                          <text x={mid.x} y={mid.y+2} textAnchor="middle" fontSize="9"
                            fontFamily="Space Grotesk,monospace" fontWeight="700"
                            fill={state==='path'?'#10b981':'#94aabe'}
                          >
                            {w}
                          </text>
                        </>
                      )}
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map(n=>{
                  const isStart=n.id===start, isEnd=n.id===end
                  const inPath=result?.path?.includes(n.id)
                  const dist=result?.dist?.[n.id]
                  return (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r={36} fill={`url(#gm-grd-${n.id})`}/>
                      {inPath && <circle cx={n.x} cy={n.y} r={30} fill="none" stroke="#10b981" strokeWidth="2" opacity="0.7"/>}
                      {(isStart||isEnd) && (
                        <circle cx={n.x} cy={n.y} r={32} fill="none"
                          stroke={isStart?'#10b981':'#ef4444'} strokeWidth="2.5" opacity="0.9"
                        />
                      )}
                      <circle cx={n.x} cy={n.y} r={24}
                        fill={n.color} fillOpacity={inPath?1:0.65}
                        stroke={n.color} strokeWidth="1.5" strokeOpacity="0.5"
                      />
                      {/* Node label */}
                      <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="9.5"
                        fontFamily="Space Grotesk,sans-serif" fontWeight="700" fill="#050b18"
                      >
                        {n.id}
                      </text>
                      <text x={n.x} y={n.y-30} textAnchor="middle" fontSize="10"
                        fontFamily="Inter,sans-serif" fontWeight="600" fill={n.color} opacity="0.9"
                      >
                        {n.label}
                      </text>
                      {/* Distance badge */}
                      {dist !== undefined && dist !== Infinity && (
                        <g>
                          <rect x={n.x+16} y={n.y-36} width="26" height="14" rx="4"
                            fill="rgba(5,11,24,0.9)" stroke={inPath?'#10b981':'rgba(255,255,255,0.1)'} strokeWidth="1"/>
                          <text x={n.x+29} y={n.y-26} textAnchor="middle" fontSize="8.5"
                            fontFamily="monospace" fontWeight="700"
                            fill={inPath?'#10b981':'#94aabe'}
                          >
                            {dist}
                          </text>
                        </g>
                      )}
                      {/* START / END labels */}
                      {isStart && (
                        <text x={n.x} y={n.y+40} textAnchor="middle" fontSize="9"
                          fontFamily="Inter,sans-serif" fontWeight="700" fill="#10b981"
                        >START</text>
                      )}
                      {isEnd && (
                        <text x={n.x} y={n.y+40} textAnchor="middle" fontSize="9"
                          fontFamily="Inter,sans-serif" fontWeight="700" fill="#ef4444"
                        >END</text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h4 className="info-card__title">Dijkstra's Algorithm</h4>
              <p className="info-card__text">
                A greedy algorithm that always visits the <em>nearest unvisited</em> node first.
                It guarantees the shortest path in graphs with <strong>non-negative edge weights</strong>.
                Time complexity: O((V + E) log V) with a priority queue.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Weighted Graph</h4>
              <p className="info-card__text">
                Each edge has a numeric weight representing cost, distance, or time.
                The goal is to find the path minimising the <strong>total weight sum</strong>,
                not just the number of hops.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">Real Applications</h4>
              <p className="info-card__text">
                Google Maps, GPS systems, airline routing, and network packet delivery all use variants of
                Dijkstra's (or A*). It powers billions of route requests every day.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
