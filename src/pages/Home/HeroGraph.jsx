import { useEffect, useRef } from 'react'

/* Animated hero graph — a pulsing network drawn on SVG canvas */
const NODES = [
  { id: 'A', x: 200, y: 120, r: 16, color: '#00d4ff', label: 'A' },
  { id: 'B', x: 380, y: 80,  r: 12, color: '#7c3aed', label: 'B' },
  { id: 'C', x: 460, y: 220, r: 14, color: '#06b6d4', label: 'C' },
  { id: 'D', x: 320, y: 300, r: 11, color: '#10b981', label: 'D' },
  { id: 'E', x: 140, y: 270, r: 13, color: '#f59e0b', label: 'E' },
  { id: 'F', x: 90,  y: 170, r: 10, color: '#ec4899', label: 'F' },
  { id: 'G', x: 410, y: 350, r: 10, color: '#a78bfa', label: 'G' },
  { id: 'H', x: 260, y: 180, r: 9,  color: '#00d4ff', label: 'H' },
]

const EDGES = [
  { from: 'A', to: 'B', directed: true },
  { from: 'A', to: 'H', directed: false },
  { from: 'B', to: 'C', directed: true },
  { from: 'C', to: 'D', directed: false },
  { from: 'D', to: 'E', directed: true },
  { from: 'E', to: 'F', directed: false },
  { from: 'F', to: 'A', directed: true },
  { from: 'H', to: 'C', directed: false },
  { from: 'H', to: 'D', directed: true },
  { from: 'B', to: 'G', directed: false },
  { from: 'G', to: 'D', directed: true },
  { from: 'C', to: 'G', directed: false },
]

function getNode(id) {
  return NODES.find(n => n.id === id)
}

function arrowPoints(from, to, r) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist
  const ex = to.x - nx * (r + 4)
  const ey = to.y - ny * (r + 4)
  const sx = from.x + nx * (from.r + 2)
  const sy = from.y + ny * (from.r + 2)

  const size = 8
  const angle = Math.atan2(dy, dx)
  const p1x = ex - size * Math.cos(angle - Math.PI / 7)
  const p1y = ey - size * Math.sin(angle - Math.PI / 7)
  const p2x = ex - size * Math.cos(angle + Math.PI / 7)
  const p2y = ey - size * Math.sin(angle + Math.PI / 7)

  return { sx, sy, ex, ey, p1x, p1y, p2x, p2y }
}

export default function HeroGraph() {
  const animRef = useRef([])

  useEffect(() => {
    const nodes = NODES.map(n => ({
      ...n,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      ox: n.x,
      oy: n.y,
      phase: Math.random() * Math.PI * 2,
    }))
    animRef.current = nodes

    let frame
    let t = 0
    const svgEl = document.getElementById('hero-graph-svg')
    if (!svgEl) return

    const update = () => {
      t += 0.012
      nodes.forEach((node) => {
        node.x = node.ox + Math.sin(t + node.phase) * 14
        node.y = node.oy + Math.cos(t * 0.7 + node.phase) * 10

        const circle = svgEl.querySelector(`#hg-node-${node.id}`)
        const text   = svgEl.querySelector(`#hg-label-${node.id}`)
        const glow   = svgEl.querySelector(`#hg-glow-${node.id}`)

        if (circle) { circle.setAttribute('cx', node.x); circle.setAttribute('cy', node.y) }
        if (text)   { text.setAttribute('x', node.x); text.setAttribute('y', node.y + 4) }
        if (glow)   { glow.setAttribute('cx', node.x); glow.setAttribute('cy', node.y) }
      })

      // Update edges
      EDGES.forEach(({ from, to, directed }) => {
        const fn = nodes.find(n => n.id === from)
        const tn = nodes.find(n => n.id === to)
        if (!fn || !tn) return

        const line = svgEl.querySelector(`#hg-edge-${from}-${to}`)
        if (line) {
          if (directed) {
            const { sx, sy, ex, ey } = arrowPoints(fn, tn, tn.r)
            line.setAttribute('x1', sx); line.setAttribute('y1', sy)
            line.setAttribute('x2', ex); line.setAttribute('y2', ey)
            const arrow = svgEl.querySelector(`#hg-arrow-${from}-${to}`)
            if (arrow) {
              const { ex: aex, ey: aey, p1x, p1y, p2x, p2y } = arrowPoints(fn, tn, tn.r)
              arrow.setAttribute('points', `${aex},${aey} ${p1x},${p1y} ${p2x},${p2y}`)
            }
          } else {
            line.setAttribute('x1', fn.x); line.setAttribute('y1', fn.y)
            line.setAttribute('x2', tn.x); line.setAttribute('y2', tn.y)
          }
        }
      })

      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="hero-graph-wrap">
      <svg
        id="hero-graph-svg"
        viewBox="0 0 560 440"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Animated graph visualization"
        className="hero-graph-svg"
      >
        <defs>
          {NODES.map(n => (
            <radialGradient key={n.id} id={`grd-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={n.color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        {EDGES.map(({ from, to, directed }) => {
          const fn = getNode(from)
          const tn = getNode(to)
          const { sx, sy, ex, ey, p1x, p1y, p2x, p2y } = arrowPoints(fn, tn, tn.r)
          const color = fn.color
          return (
            <g key={`${from}-${to}`}>
              <line
                id={`hg-edge-${from}-${to}`}
                x1={directed ? sx : fn.x} y1={directed ? sy : fn.y}
                x2={directed ? ex : tn.x} y2={directed ? ey : tn.y}
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />
              {directed && (
                <polygon
                  id={`hg-arrow-${from}-${to}`}
                  points={`${ex},${ey} ${p1x},${p1y} ${p2x},${p2y}`}
                  fill={color}
                  opacity="0.6"
                />
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {NODES.map(n => (
          <g key={n.id}>
            {/* Glow halo */}
            <circle
              id={`hg-glow-${n.id}`}
              cx={n.x} cy={n.y}
              r={n.r + 12}
              fill={`url(#grd-${n.id})`}
            />
            {/* Node circle */}
            <circle
              id={`hg-node-${n.id}`}
              cx={n.x} cy={n.y} r={n.r}
              fill={n.color}
              fillOpacity="0.85"
              stroke={n.color}
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* Label */}
            <text
              id={`hg-label-${n.id}`}
              x={n.x} y={n.y + 4}
              textAnchor="middle"
              fontSize={n.r * 0.9}
              fontFamily="Space Grotesk, Inter, sans-serif"
              fontWeight="700"
              fill="#050b18"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="hero-graph-legend">
        <div className="hero-graph-legend-item">
          <svg width="30" height="12">
            <line x1="0" y1="6" x2="24" y2="6" stroke="#00d4ff" strokeWidth="1.5"/>
            <circle cx="28" cy="6" r="4" fill="#00d4ff" />
          </svg>
          <span>Node & Edge</span>
        </div>
        <div className="hero-graph-legend-item">
          <svg width="30" height="12">
            <line x1="0" y1="6" x2="20" y2="6" stroke="#7c3aed" strokeWidth="1.5"/>
            <polygon points="20,3 28,6 20,9" fill="#7c3aed"/>
          </svg>
          <span>Directed Edge</span>
        </div>
      </div>
    </div>
  )
}
