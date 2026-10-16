import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import './SocialNetwork.css'
import './SocialNetworkSim.css'

/* ════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ════════════════════════════════════════════════════════════ */

const NODE_R = 26        // node radius
const ARROW_SIZE = 10    // arrowhead size

const USER_COLORS = {
  aisha:  '#00d4ff',
  rahul:  '#7c3aed',
  priya:  '#10b981',
  arjun:  '#f59e0b',
  neha:   '#ec4899',
  karan:  '#a78bfa',
}
const EXTRA_COLORS = ['#06b6d4','#84cc16','#f97316','#e879f9','#38bdf8','#fb7185']

const INITIAL_NODES = [
  { id: 'aisha', label: 'Aisha', initials: 'AI', x: 350, y: 130, color: USER_COLORS.aisha },
  { id: 'rahul', label: 'Rahul', initials: 'RA', x: 560, y: 210, color: USER_COLORS.rahul },
  { id: 'priya', label: 'Priya', initials: 'PR', x: 480, y: 370, color: USER_COLORS.priya },
  { id: 'arjun', label: 'Arjun', initials: 'AR', x: 220, y: 370, color: USER_COLORS.arjun },
  { id: 'neha',  label: 'Neha',  initials: 'NE', x: 140, y: 210, color: USER_COLORS.neha  },
  { id: 'karan', label: 'Karan', initials: 'KA', x: 350, y: 280, color: USER_COLORS.karan },
]

// Aisha follows Rahul (not mutual — core teaching moment)
const INITIAL_EDGES = [
  { from: 'aisha', to: 'rahul' },
  { from: 'aisha', to: 'karan' },
  { from: 'rahul', to: 'priya' },
  { from: 'priya', to: 'karan' },
  { from: 'neha',  to: 'aisha' },
  { from: 'arjun', to: 'neha'  },
  { from: 'karan', to: 'arjun' },
]

/* Arrow geometry: returns start point, end point, arrowhead polygon */
function arrowGeom(fx, fy, tx, ty, r = NODE_R) {
  const dx = tx - fx, dy = ty - fy
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / dist, ny = dy / dist
  const ex = tx - nx * (r + 5), ey = ty - ny * (r + 5)
  const sx = fx + nx * (r + 3), sy = fy + ny * (r + 3)
  const ang = Math.atan2(dy, dx)
  const s = ARROW_SIZE
  return {
    sx, sy, ex, ey,
    pts: `${ex},${ey} ${ex - s * Math.cos(ang - Math.PI / 6)},${ey - s * Math.sin(ang - Math.PI / 6)} ${ex - s * Math.cos(ang + Math.PI / 6)},${ey - s * Math.sin(ang + Math.PI / 6)}`,
    midX: (sx + ex) / 2, midY: (sy + ey) / 2,
  }
}

/* Compute in/out-degrees from edges */
function computeDegrees(nodes, edges) {
  const outDeg = {}, inDeg = {}
  nodes.forEach(n => { outDeg[n.id] = 0; inDeg[n.id] = 0 })
  edges.forEach(({ from, to }) => {
    outDeg[from] = (outDeg[from] || 0) + 1
    inDeg[to]    = (inDeg[to]    || 0) + 1
  })
  return { outDeg, inDeg }
}

/* ════════════════════════════════════════════════════════════
   LEARNING-MODE STEPS
   ════════════════════════════════════════════════════════════ */

const LEARN_STEPS = [
  {
    id: 'node',
    title: 'Step 1 — What is a Node?',
    body: 'Each circle in the graph is called a <strong>node</strong> (or vertex). Here, every node represents a <strong>social media user</strong>. The label shows their name and the circle colour is unique to them.',
    highlight: { nodes: ['aisha'], edges: [] },
    tip: 'Aisha is selected below. Her node glows to show she is highlighted.',
  },
  {
    id: 'edge',
    title: 'Step 2 — What is a Directed Edge?',
    body: 'A line with an <strong>arrowhead</strong> connecting two nodes is a <strong>directed edge</strong>. The arrow points <em>from follower → to the account they follow</em>. The direction matters!',
    highlight: { nodes: ['aisha', 'rahul'], edges: [{ from: 'aisha', to: 'rahul' }] },
    tip: 'The arrow from Aisha → Rahul means Aisha follows Rahul.',
  },
  {
    id: 'not-mutual',
    title: 'Step 3 — Following is NOT Mutual',
    body: 'Because edges have direction, <strong>Aisha follows Rahul</strong> does NOT automatically mean <strong>Rahul follows Aisha</strong>. This is the key difference between a directed and undirected graph.',
    highlight: { nodes: ['aisha', 'rahul'], edges: [{ from: 'aisha', to: 'rahul' }] },
    tip: 'Notice there is no arrow from Rahul back to Aisha — the relationship is one-way.',
  },
  {
    id: 'out-degree',
    title: 'Step 4 — Out-Degree (Following Count)',
    body: 'The <strong>out-degree</strong> of a node is the number of <em>outgoing</em> edges — i.e., how many accounts this user follows. Aisha has out-degree = 2 (she follows Rahul and Karan).',
    highlight: { nodes: ['aisha', 'rahul', 'karan'], edges: [{ from: 'aisha', to: 'rahul' }, { from: 'aisha', to: 'karan' }] },
    tip: 'Aisha\'s two outgoing arrows are highlighted. Out-degree = 2.',
  },
  {
    id: 'in-degree',
    title: 'Step 5 — In-Degree (Follower Count)',
    body: 'The <strong>in-degree</strong> of a node is the number of <em>incoming</em> edges — i.e., how many users follow this account. Karan is followed by Aisha and Priya, so his in-degree = 2.',
    highlight: { nodes: ['aisha', 'priya', 'karan'], edges: [{ from: 'aisha', to: 'karan' }, { from: 'priya', to: 'karan' }] },
    tip: 'Two arrows pointing INTO Karan. In-degree = 2. High in-degree → popular account.',
  },
  {
    id: 'full',
    title: 'Step 6 — The Complete Network',
    body: 'The full graph shows all follow relationships. You can now <strong>interact freely</strong>: select users, follow/unfollow, add users, and simulate follows. Use the controls on the left panel.',
    highlight: { nodes: [], edges: [] },
    tip: 'Click "Exit Learning Mode" to start experimenting with the simulator!',
  },
]

/* ════════════════════════════════════════════════════════════
   PAGE HEADER ICON
   ════════════════════════════════════════════════════════════ */
const ICON = (
  <svg viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="12" r="6" fill="#00d4ff" />
    <circle cx="10" cy="36" r="5" fill="#00d4ff" opacity=".7" />
    <circle cx="38" cy="36" r="5" fill="#00d4ff" opacity=".7" />
    <line x1="24" y1="18" x2="11" y2="32" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="24" y1="18" x2="37" y2="32" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" />
    <polygon points="11,32 8,37 14,36" fill="#00d4ff" />
    <polygon points="37,32 34,37 40,36" fill="#00d4ff" />
  </svg>
)

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function SocialNetwork() {
  /* ── Graph state ── */
  const [nodes, setNodes]   = useState(INITIAL_NODES)
  const [edges, setEdges]   = useState(INITIAL_EDGES)

  /* ── UI state ── */
  const [selected, setSelected]       = useState(null)   // id of selected node
  const [followTarget, setFollowTarget] = useState(null) // for "follow" action
  const [mode, setMode]               = useState('select') // 'select' | 'follow' | 'unfollow'
  const [showLabels, setShowLabels]   = useState(true)
  const [showArrows, setShowArrows]   = useState(true)
  const [addUserName, setAddUserName] = useState('')
  const [addUserError, setAddUserError] = useState('')

  /* ── Animation state ── */
  const [animEdge, setAnimEdge]       = useState(null)  // { from, to, progress }
  const animFrameRef                  = useRef(null)

  /* ── Dragging ── */
  const [dragging, setDragging]       = useState(null)
  const dragOffset                    = useRef({ dx: 0, dy: 0 })
  const svgRef                        = useRef(null)

  /* ── Event log ── */
  const [log, setLog] = useState([
    { type: 'info', msg: 'Welcome to the Social Network Simulator!' },
    { type: 'info', msg: 'Click a node to select a user, then use the controls.' },
  ])

  /* ── Learning mode ── */
  const [learnMode, setLearnMode]     = useState(false)
  const [learnStep, setLearnStep]     = useState(0)

  /* ────────────────────────────────────────────────
     Derived data — always recomputed from graph state
  ──────────────────────────────────────────────────*/
  const { outDeg, inDeg } = useMemo(() => computeDegrees(nodes, edges), [nodes, edges])

  const selectedNode = useMemo(() => nodes.find(n => n.id === selected), [nodes, selected])

  const following = useMemo(() =>
    selected ? edges.filter(e => e.from === selected).map(e => e.to) : [],
    [selected, edges])

  const followers = useMemo(() =>
    selected ? edges.filter(e => e.to === selected).map(e => e.from) : [],
    [selected, edges])

  /* Edge highlight sets for selected node */
  const outEdgeSet = useMemo(() =>
    new Set(edges.filter(e => e.from === selected).map(e => `${e.from}-${e.to}`)),
    [selected, edges])
  const inEdgeSet = useMemo(() =>
    new Set(edges.filter(e => e.to === selected).map(e => `${e.from}-${e.to}`)),
    [selected, edges])

  /* ─── Learning mode highlight ─── */
  const learnData = learnMode ? LEARN_STEPS[learnStep] : null
  const learnNodeSet  = new Set(learnData?.highlight.nodes || [])
  const learnEdgeSet  = new Set((learnData?.highlight.edges || []).map(e => `${e.from}-${e.to}`))

  /* ────────────────────────────────────────────────
     LOG helper
  ──────────────────────────────────────────────────*/
  const addLog = useCallback((msg, type = 'event') => {
    setLog(prev => [{ type, msg }, ...prev].slice(0, 12))
  }, [])

  /* ────────────────────────────────────────────────
     SVG coordinate helper
  ──────────────────────────────────────────────────*/
  const svgPoint = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (cx - rect.left) * (700 / rect.width),
      y: (cy - rect.top)  * (460 / rect.height),
    }
  }, [])

  /* ────────────────────────────────────────────────
     NODE CLICK
  ──────────────────────────────────────────────────*/
  const onNodeClick = useCallback((e, id) => {
    e.stopPropagation()
    if (learnMode) return

    if (mode === 'follow') {
      if (!selected) { addLog('Select a user first, then click Follow Target.', 'warn'); return }
      if (id === selected) { addLog('A user cannot follow themselves.', 'warn'); return }
      const exists = edges.some(ed => ed.from === selected && ed.to === id)
      if (exists) { addLog(`${selectedNode?.label} already follows ${nodes.find(n=>n.id===id)?.label}.`, 'warn'); return }
      setFollowTarget(id)
      return
    }

    if (mode === 'unfollow') {
      if (!selected) { addLog('Select a user first.', 'warn'); return }
      const exists = edges.some(ed => ed.from === selected && ed.to === id)
      if (!exists) { addLog(`${selectedNode?.label} doesn't follow ${nodes.find(n=>n.id===id)?.label}.`, 'warn'); return }
      const targetLabel = nodes.find(n => n.id === id)?.label
      setEdges(prev => prev.filter(ed => !(ed.from === selected && ed.to === id)))
      addLog(`✂️  ${selectedNode?.label} unfollowed ${targetLabel}.`)
      return
    }

    // select mode
    setSelected(id)
    const n = nodes.find(x => x.id === id)
    addLog(`Selected: ${n?.label} (in: ${inDeg[id] || 0}, out: ${outDeg[id] || 0})`, 'select')
  }, [mode, selected, edges, nodes, selectedNode, inDeg, outDeg, learnMode, addLog])

  /* ────────────────────────────────────────────────
     DRAG
  ──────────────────────────────────────────────────*/
  const onNodeMouseDown = useCallback((e, id) => {
    if (mode !== 'select' || learnMode) return
    e.stopPropagation()
    const pt = svgPoint(e)
    const node = nodes.find(n => n.id === id)
    dragOffset.current = { dx: pt.x - node.x, dy: pt.y - node.y }
    setDragging(id)
    setSelected(id)
  }, [mode, nodes, svgPoint, learnMode])

  const onSvgMouseMove = useCallback((e) => {
    if (!dragging) return
    const pt = svgPoint(e)
    setNodes(prev => prev.map(n =>
      n.id === dragging
        ? { ...n,
            x: Math.max(NODE_R + 5, Math.min(700 - NODE_R - 5, pt.x - dragOffset.current.dx)),
            y: Math.max(NODE_R + 5, Math.min(460 - NODE_R - 5, pt.y - dragOffset.current.dy)),
          }
        : n
    ))
  }, [dragging, svgPoint])

  const onSvgMouseUp = useCallback(() => setDragging(null), [])

  /* ────────────────────────────────────────────────
     CONFIRM FOLLOW (with animation)
  ──────────────────────────────────────────────────*/
  const confirmFollow = useCallback(() => {
    if (!selected || !followTarget) return
    const fromLabel = selectedNode?.label
    const toLabel   = nodes.find(n => n.id === followTarget)?.label

    // Start arrow animation
    setAnimEdge({ from: selected, to: followTarget, progress: 0 })

    let prog = 0
    const animate = () => {
      prog = Math.min(prog + 0.04, 1)
      setAnimEdge({ from: selected, to: followTarget, progress: prog })
      if (prog < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Add edge after animation completes
        setEdges(prev => [...prev, { from: selected, to: followTarget }])
        setAnimEdge(null)
        addLog(`➕ ${fromLabel} now follows ${toLabel}.`)
        addLog(`   (${toLabel} does NOT automatically follow ${fromLabel})`, 'info')
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)
    setFollowTarget(null)
    setMode('select')
  }, [selected, followTarget, selectedNode, nodes, addLog])

  /* Cleanup animation on unmount */
  useEffect(() => () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }, [])

  /* ────────────────────────────────────────────────
     SIMULATE FOLLOW (button)
  ──────────────────────────────────────────────────*/
  const simulateFollow = useCallback(() => {
    // Demo: Aisha follows Rahul (if not already)
    const already = edges.some(e => e.from === 'aisha' && e.to === 'rahul')
    if (already) {
      addLog('Demo: Aisha already follows Rahul. Try the manual controls.', 'warn')
      return
    }
    setSelected('aisha')
    setFollowTarget('rahul')

    addLog('🎬 Simulating: Aisha follows Rahul…')
    addLog('   Watch the animated arrow appear on the graph.')

    setAnimEdge({ from: 'aisha', to: 'rahul', progress: 0 })
    let prog = 0
    const animate = () => {
      prog = Math.min(prog + 0.025, 1)
      setAnimEdge({ from: 'aisha', to: 'rahul', progress: prog })
      if (prog < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        setEdges(prev => {
          if (prev.some(e => e.from === 'aisha' && e.to === 'rahul')) return prev
          return [...prev, { from: 'aisha', to: 'rahul' }]
        })
        setAnimEdge(null)
        setFollowTarget(null)
        addLog('✅ Aisha → Rahul edge added!')
        addLog('ℹ️  Rahul still does NOT follow Aisha. This is a directed graph.')
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)
  }, [edges, addLog])

  /* ────────────────────────────────────────────────
     ADD USER
  ──────────────────────────────────────────────────*/
  const addUser = useCallback(() => {
    const name = addUserName.trim()
    if (!name) { setAddUserError('Enter a name.'); return }
    if (name.length < 2) { setAddUserError('Name too short.'); return }
    if (nodes.some(n => n.label.toLowerCase() === name.toLowerCase())) {
      setAddUserError('User already exists.'); return
    }
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    const color = EXTRA_COLORS[nodes.length % EXTRA_COLORS.length]
    const angle = (nodes.length / (nodes.length + 1)) * 2 * Math.PI
    const cx = 350, cy = 230, rad = 180
    const newNode = {
      id,
      label: name,
      initials: name.slice(0, 2).toUpperCase(),
      x: cx + rad * Math.cos(angle),
      y: cy + rad * Math.sin(angle),
      color,
    }
    setNodes(prev => [...prev, newNode])
    setAddUserName('')
    setAddUserError('')
    addLog(`👤 New user "${name}" added to the network.`)
  }, [addUserName, nodes, addLog])

  /* ────────────────────────────────────────────────
     REMOVE SELECTED USER
  ──────────────────────────────────────────────────*/
  const removeUser = useCallback(() => {
    if (!selected) return
    const label = selectedNode?.label
    setNodes(prev => prev.filter(n => n.id !== selected))
    setEdges(prev => prev.filter(e => e.from !== selected && e.to !== selected))
    setSelected(null)
    addLog(`🗑  Removed user "${label}" and all their edges.`)
  }, [selected, selectedNode, addLog])

  /* ────────────────────────────────────────────────
     RESET
  ──────────────────────────────────────────────────*/
  const resetGraph = useCallback(() => {
    setNodes(INITIAL_NODES)
    setEdges(INITIAL_EDGES)
    setSelected(null)
    setFollowTarget(null)
    setMode('select')
    setAnimEdge(null)
    setLearnMode(false)
    setLearnStep(0)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    addLog('↺ Graph reset to initial state.')
  }, [addLog])

  /* ────────────────────────────────────────────────
     ENTER LEARNING MODE
  ──────────────────────────────────────────────────*/
  const enterLearnMode = useCallback(() => {
    setLearnMode(true)
    setLearnStep(0)
    setSelected('aisha')
    setMode('select')
    addLog('📚 Learning Mode started. Follow the guided steps.', 'info')
  }, [addLog])

  /* ────────────────────────────────────────────────
     EDGE COLOUR LOGIC
  ──────────────────────────────────────────────────*/
  const edgeColor = useCallback((from, to) => {
    const key = `${from}-${to}`
    if (learnMode) {
      return learnEdgeSet.has(key) ? '#00d4ff' : 'rgba(255,255,255,0.06)'
    }
    if (outEdgeSet.has(key)) return '#00d4ff'  // outgoing = electric blue
    if (inEdgeSet.has(key))  return '#ec4899'  // incoming = pink
    return '#334155'
  }, [learnMode, learnEdgeSet, outEdgeSet, inEdgeSet])

  const edgeWidth = useCallback((from, to) => {
    const key = `${from}-${to}`
    if (learnMode) return learnEdgeSet.has(key) ? 2.5 : 1
    if (outEdgeSet.has(key) || inEdgeSet.has(key)) return 2.5
    return 1.4
  }, [learnMode, learnEdgeSet, outEdgeSet, inEdgeSet])

  const edgeOpacity = useCallback((from, to) => {
    const key = `${from}-${to}`
    if (learnMode) return learnEdgeSet.has(key) ? 0.9 : 0.12
    if (outEdgeSet.has(key) || inEdgeSet.has(key)) return 0.95
    return selected ? 0.2 : 0.5
  }, [learnMode, learnEdgeSet, outEdgeSet, inEdgeSet, selected])

  /* ────────────────────────────────────────────────
     NODE VISUAL STATE
  ──────────────────────────────────────────────────*/
  const nodeState = useCallback((id) => {
    if (learnMode) {
      if (learnNodeSet.has(id)) return 'learn-highlight'
      return 'learn-dim'
    }
    if (id === selected)      return 'selected'
    if (id === followTarget)  return 'follow-target'
    if (following.includes(id)) return 'following'
    if (followers.includes(id)) return 'follower'
    return selected ? 'dim' : 'default'
  }, [learnMode, learnNodeSet, selected, followTarget, following, followers])

  /* ────────────────────────────────────────════════
     RENDER
  ──────────────────────────────────────────────────*/
  return (
    <div className="simulation-page">
      <PageHeader
        badge="Directed Graph"
        badgeClass="electric"
        icon={ICON}
        title="Social Media Network"
        subtitle="Model user follow relationships as a directed graph. Each arrow shows who follows whom — and following is NOT automatically mutual."
        concepts={[
          { label: 'Directed Graph',   desc: 'Edges A→B ≠ B→A: direction matters' },
          { label: 'Out-Degree',       desc: 'How many accounts a user follows' },
          { label: 'In-Degree',        desc: 'How many followers a user has' },
          { label: 'Asymmetric Edges', desc: 'A follows B doesn\'t mean B follows A' },
          { label: 'Reachability',     desc: 'Who sees your posts through the follow chain?' },
        ]}
      />

      <section className="simulation-body section-sm">
        <div className="container">

          {/* ══════════════ LEARNING MODE BANNER ══════════════ */}
          {learnMode && learnData && (
            <div className="learn-banner">
              <div className="learn-banner__header">
                <span className="learn-banner__step-badge">Learning Mode</span>
                <span className="learn-banner__counter">{learnStep + 1} / {LEARN_STEPS.length}</span>
              </div>
              <h3 className="learn-banner__title" dangerouslySetInnerHTML={{ __html: learnData.title }} />
              <p className="learn-banner__body" dangerouslySetInnerHTML={{ __html: learnData.body }} />
              <div className="learn-banner__tip">
                <span className="learn-tip-icon">💡</span>
                <span>{learnData.tip}</span>
              </div>
              <div className="learn-banner__nav">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLearnStep(s => Math.max(0, s - 1))}
                  disabled={learnStep === 0}
                >← Previous</button>
                <div className="learn-dots">
                  {LEARN_STEPS.map((_, i) => (
                    <button
                      key={i}
                      className={`learn-dot ${i === learnStep ? 'learn-dot--active' : ''}`}
                      onClick={() => setLearnStep(i)}
                      aria-label={`Step ${i + 1}`}
                    />
                  ))}
                </div>
                {learnStep < LEARN_STEPS.length - 1 ? (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => setLearnStep(s => s + 1)}>
                    Next →
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => { setLearnMode(false); addLog('📚 Learning mode completed!') }}>
                    Exit Learning Mode
                  </button>
                )}
                <button className="btn btn-ghost btn-sm"
                  onClick={() => setLearnStep(0)}>
                  ↺ Replay
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ MAIN LAYOUT ══════════════ */}
          <div className="sn-layout">

            {/* ════ LEFT PANEL ════ */}
            <aside className="sn-panel">

              {/* ── Interaction mode ── */}
              <div className="sn-section">
                <p className="sn-section-title">Interaction Mode</p>
                <div className="sn-mode-grid">
                  {[
                    { id: 'select',   icon: '↖', label: 'Select & Drag' },
                    { id: 'follow',   icon: '➕', label: 'Follow' },
                    { id: 'unfollow', icon: '✂️', label: 'Unfollow' },
                  ].map(m => (
                    <button key={m.id}
                      className={`sn-mode-btn ${mode === m.id && !learnMode ? 'sn-mode-btn--active' : ''}`}
                      onClick={() => { if (!learnMode) { setMode(m.id); setFollowTarget(null) } }}
                      disabled={learnMode}
                      title={m.id === 'follow' ? 'Select a user first, then click the user to follow' : m.id === 'unfollow' ? 'Select a user, then click who to unfollow' : 'Drag nodes around'}
                    >
                      <span className="sn-mode-btn__icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {mode === 'follow' && !learnMode && (
                  <div className="sn-hint">
                    {!selected
                      ? '1. Click a node to select the follower.'
                      : !followTarget
                        ? `2. Now click who <strong>${selectedNode?.label}</strong> should follow.`
                        : `Confirm: ${selectedNode?.label} → ${nodes.find(n => n.id === followTarget)?.label}?`
                    }
                  </div>
                )}
                {mode === 'unfollow' && !learnMode && (
                  <div className="sn-hint">
                    {!selected
                      ? '1. Click a node to select the user.'
                      : `2. Click who <strong>${selectedNode?.label}</strong> should unfollow.`
                    }
                  </div>
                )}

                {/* Confirm follow button */}
                {followTarget && mode === 'follow' && !learnMode && (
                  <button className="btn btn-primary btn-sm sn-confirm-btn" onClick={confirmFollow}>
                    ✓ Confirm Follow
                  </button>
                )}
              </div>

              {/* ── Graph controls ── */}
              <div className="sn-section">
                <p className="sn-section-title">Actions</p>
                <div className="sn-action-col">
                  <button
                    className="btn btn-violet btn-sm"
                    onClick={simulateFollow}
                    disabled={learnMode}
                    title="Animate Aisha following Rahul as a demo"
                  >
                    ▶ Simulate Follow (Demo)
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={enterLearnMode}
                    disabled={learnMode}
                  >
                    📚 Start Learning Mode
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={resetGraph}>
                    ↺ Reset Network
                  </button>
                  <button
                    className="btn btn-ghost btn-sm sn-danger"
                    onClick={removeUser}
                    disabled={!selected || learnMode}
                  >
                    🗑 Remove Selected User
                  </button>
                </div>
              </div>

              {/* ── Add user ── */}
              <div className="sn-section">
                <p className="sn-section-title">Add New User</p>
                <div className="sn-add-row">
                  <input
                    className="sn-input"
                    value={addUserName}
                    onChange={e => { setAddUserName(e.target.value); setAddUserError('') }}
                    placeholder="Enter name…"
                    onKeyDown={e => e.key === 'Enter' && addUser()}
                    disabled={learnMode}
                    maxLength={20}
                  />
                  <button className="btn btn-outline btn-sm" onClick={addUser} disabled={learnMode}>＋</button>
                </div>
                {addUserError && <p className="sn-error">{addUserError}</p>}
              </div>

              {/* ── Toggle options ── */}
              <div className="sn-section">
                <p className="sn-section-title">Display Options</p>
                <label className="sn-toggle">
                  <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />
                  <span className="sn-toggle__track" />
                  <span>Show name labels</span>
                </label>
                <label className="sn-toggle">
                  <input type="checkbox" checked={showArrows} onChange={e => setShowArrows(e.target.checked)} />
                  <span className="sn-toggle__track" />
                  <span>Show arrowheads</span>
                </label>
              </div>

              {/* ── Legend ── */}
              <div className="sn-section">
                <p className="sn-section-title">Legend</p>
                <div className="sn-legend">
                  <div className="sn-legend-row">
                    <svg width="38" height="12">
                      <line x1="0" y1="6" x2="26" y2="6" stroke="#00d4ff" strokeWidth="2"/>
                      <polygon points="26,3 34,6 26,9" fill="#00d4ff"/>
                    </svg>
                    <span>Outgoing (follows)</span>
                  </div>
                  <div className="sn-legend-row">
                    <svg width="38" height="12">
                      <line x1="0" y1="6" x2="26" y2="6" stroke="#ec4899" strokeWidth="2"/>
                      <polygon points="26,3 34,6 26,9" fill="#ec4899"/>
                    </svg>
                    <span>Incoming (followers)</span>
                  </div>
                  <div className="sn-legend-row">
                    <div className="sn-legend-dot" style={{background:'#00d4ff',boxShadow:'0 0 8px #00d4ff'}}/>
                    <span>Selected user</span>
                  </div>
                  <div className="sn-legend-row">
                    <div className="sn-legend-dot" style={{background:'#10b981',boxShadow:'0 0 8px #10b981'}}/>
                    <span>Following (out-neighbour)</span>
                  </div>
                  <div className="sn-legend-row">
                    <div className="sn-legend-dot" style={{background:'#ec4899',boxShadow:'0 0 8px #ec4899'}}/>
                    <span>Follower (in-neighbour)</span>
                  </div>
                  <div className="sn-legend-row">
                    <div className="sn-legend-dot" style={{background:'#f59e0b',boxShadow:'0 0 8px #f59e0b',border:'2px dashed #f59e0b',background:'transparent'}}/>
                    <span>Follow target</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ════ CANVAS ════ */}
            <div className="sn-canvas-col">
              <div className="sim-canvas-wrap">
                <div className="sim-canvas-header">
                  <span className="sim-canvas-title">
                    {learnMode ? `📚 ${learnData?.title}` : 'Social Network Directed Graph'}
                  </span>
                  <span className="sim-canvas-stats">
                    {nodes.length} users · {edges.length} follows
                    {selected && !learnMode ? ` · Selected: ${selectedNode?.label}` : ''}
                  </span>
                </div>

                <svg
                  ref={svgRef}
                  className="sim-svg sn-svg"
                  viewBox="0 0 700 460"
                  onMouseMove={onSvgMouseMove}
                  onMouseUp={onSvgMouseUp}
                  onMouseLeave={onSvgMouseUp}
                  onClick={() => { if (mode === 'select' && !learnMode) setSelected(null) }}
                >
                  <defs>
                    {nodes.map(n => (
                      <radialGradient key={`grd-${n.id}`} id={`sn-grd-${n.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor={n.color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={n.color} stopOpacity="0"   />
                      </radialGradient>
                    ))}
                    <filter id="sn-glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  {/* ── Edges ── */}
                  {edges.map(({ from, to }) => {
                    const fn = nodes.find(n => n.id === from)
                    const tn = nodes.find(n => n.id === to)
                    if (!fn || !tn) return null
                    const g = arrowGeom(fn.x, fn.y, tn.x, tn.y)
                    const col = edgeColor(from, to)
                    const w   = edgeWidth(from, to)
                    const op  = edgeOpacity(from, to)
                    return (
                      <g key={`e-${from}-${to}`}>
                        <line x1={g.sx} y1={g.sy} x2={g.ex} y2={g.ey}
                          stroke={col} strokeWidth={w} strokeOpacity={op} strokeLinecap="round" />
                        {showArrows && (
                          <polygon points={g.pts} fill={col} opacity={op} />
                        )}
                      </g>
                    )
                  })}

                  {/* ── Animated edge ── */}
                  {animEdge && (() => {
                    const fn = nodes.find(n => n.id === animEdge.from)
                    const tn = nodes.find(n => n.id === animEdge.to)
                    if (!fn || !tn) return null
                    const g = arrowGeom(fn.x, fn.y, tn.x, tn.y)
                    const prog = animEdge.progress
                    const cx = g.sx + (g.ex - g.sx) * prog
                    const cy = g.sy + (g.ey - g.sy) * prog
                    return (
                      <g>
                        <line x1={g.sx} y1={g.sy} x2={cx} y2={cy}
                          stroke="#00d4ff" strokeWidth="3" strokeOpacity="0.9" strokeLinecap="round"
                          style={{ filter: 'url(#sn-glow)' }}
                        />
                        <circle cx={cx} cy={cy} r="5" fill="#00d4ff"
                          style={{ filter: 'url(#sn-glow)' }} />
                        {prog >= 1 && <polygon points={g.pts} fill="#00d4ff" opacity="0.95" />}
                      </g>
                    )
                  })()}

                  {/* ── Nodes ── */}
                  {nodes.map(n => {
                    const state = nodeState(n.id)
                    const isSelected     = state === 'selected'
                    const isFollowing    = state === 'following'
                    const isFollower     = state === 'follower'
                    const isFollowTarget = state === 'follow-target'
                    const isDim          = state === 'dim' || state === 'learn-dim'
                    const isLearnHL      = state === 'learn-highlight'

                    let ringColor = n.color
                    if (isFollowing)    ringColor = '#10b981'
                    if (isFollower)     ringColor = '#ec4899'
                    if (isFollowTarget) ringColor = '#f59e0b'

                    return (
                      <g key={n.id}
                        onMouseDown={e => onNodeMouseDown(e, n.id)}
                        onClick={e => onNodeClick(e, n.id)}
                        style={{
                          cursor: learnMode ? 'default' : mode === 'select' ? 'grab' : 'pointer',
                          opacity: isDim ? 0.22 : 1,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        {/* Glow halo */}
                        <circle cx={n.x} cy={n.y} r={NODE_R + 14} fill={`url(#sn-grd-${n.id})`} />

                        {/* Role ring */}
                        {(isSelected || isFollowing || isFollower || isFollowTarget || isLearnHL) && (
                          <circle cx={n.x} cy={n.y} r={NODE_R + 6}
                            fill="none" stroke={ringColor} strokeWidth="2"
                            strokeDasharray={isFollowTarget ? '5,3' : 'none'}
                            opacity="0.85"
                            style={{ filter: 'url(#sn-glow)' }}
                          />
                        )}

                        {/* Node body */}
                        <circle cx={n.x} cy={n.y} r={NODE_R}
                          fill={n.color}
                          fillOpacity={isSelected || isLearnHL ? 1 : 0.78}
                          stroke={n.color} strokeWidth="1.5" strokeOpacity="0.5"
                        />

                        {/* Initials */}
                        <text x={n.x} y={n.y + 5}
                          textAnchor="middle" fontSize="12"
                          fontFamily="Space Grotesk, sans-serif" fontWeight="800"
                          fill="#050b18"
                        >
                          {n.initials || n.label.slice(0, 2).toUpperCase()}
                        </text>

                        {/* Name label */}
                        {showLabels && (
                          <text x={n.x} y={n.y - NODE_R - 8}
                            textAnchor="middle" fontSize="11"
                            fontFamily="Inter, sans-serif" fontWeight="600"
                            fill={n.color} opacity="0.95"
                          >
                            {n.label}
                          </text>
                        )}

                        {/* Degree badge below node */}
                        <text x={n.x} y={n.y + NODE_R + 13}
                          textAnchor="middle" fontSize="9"
                          fontFamily="Inter, sans-serif"
                          fill={n.color} opacity="0.7"
                        >
                          ↑{inDeg[n.id] || 0} ↓{outDeg[n.id] || 0}
                        </text>
                      </g>
                    )
                  })}

                  {/* Convention label on canvas */}
                  <text x="10" y="450" fontSize="9" fontFamily="Inter, sans-serif"
                    fill="rgba(255,255,255,0.18)" fontWeight="500">
                    Arrow convention: Follower → Followed Account
                  </text>
                </svg>
              </div>

              {/* ── Info panel below canvas ── */}
              <div className="sn-info-row">
                {/* Graph stats */}
                <div className="sn-stat-card">
                  <p className="sn-stat-card__title">Network Stats</p>
                  <div className="sn-stats-grid">
                    <div className="sn-stat">
                      <span className="sn-stat__val">{nodes.length}</span>
                      <span className="sn-stat__label">Users</span>
                    </div>
                    <div className="sn-stat">
                      <span className="sn-stat__val">{edges.length}</span>
                      <span className="sn-stat__label">Follows</span>
                    </div>
                    <div className="sn-stat">
                      <span className="sn-stat__val" style={{ color: '#00d4ff' }}>
                        {selected ? outDeg[selected] || 0 : '—'}
                      </span>
                      <span className="sn-stat__label">Following</span>
                    </div>
                    <div className="sn-stat">
                      <span className="sn-stat__val" style={{ color: '#ec4899' }}>
                        {selected ? inDeg[selected] || 0 : '—'}
                      </span>
                      <span className="sn-stat__label">Followers</span>
                    </div>
                  </div>
                </div>

                {/* Selected user detail */}
                {selectedNode && !learnMode && (
                  <div className="sn-user-card">
                    <div className="sn-user-card__header">
                      <div className="sn-user-avatar" style={{ background: selectedNode.color, boxShadow: `0 0 14px ${selectedNode.color}55` }}>
                        {selectedNode.initials || selectedNode.label.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="sn-user-name">{selectedNode.label}</p>
                        <p className="sn-user-sub">
                          <span style={{ color: '#ec4899' }}>{inDeg[selected] || 0} followers</span>
                          {' · '}
                          <span style={{ color: '#00d4ff' }}>{outDeg[selected] || 0} following</span>
                        </p>
                      </div>
                    </div>

                    <div className="sn-user-lists">
                      <div className="sn-user-list">
                        <p className="sn-user-list__title" style={{ color: '#00d4ff' }}>
                          Following ({following.length})
                        </p>
                        {following.length === 0
                          ? <p className="sn-user-list__empty">Not following anyone</p>
                          : following.map(id => {
                            const n = nodes.find(x => x.id === id)
                            return n ? (
                              <div key={id} className="sn-user-list__item">
                                <div className="sn-user-list__dot" style={{ background: n.color }} />
                                <span>{n.label}</span>
                              </div>
                            ) : null
                          })}
                      </div>

                      <div className="sn-user-list">
                        <p className="sn-user-list__title" style={{ color: '#ec4899' }}>
                          Followers ({followers.length})
                        </p>
                        {followers.length === 0
                          ? <p className="sn-user-list__empty">No followers</p>
                          : followers.map(id => {
                            const n = nodes.find(x => x.id === id)
                            return n ? (
                              <div key={id} className="sn-user-list__item">
                                <div className="sn-user-list__dot" style={{ background: n.color }} />
                                <span>{n.label}</span>
                              </div>
                            ) : null
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Event log */}
                <div className="sn-log-card">
                  <p className="sn-stat-card__title">Event Log</p>
                  <div className="sn-log">
                    {log.map((entry, i) => (
                      <div key={i}
                        className={`sn-log-line sn-log-line--${entry.type}`}
                        style={{ opacity: Math.max(0.2, 1 - i * 0.08) }}
                      >
                        {entry.msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════ INFO CARDS ══════════════ */}
          <div className="info-cards" style={{ marginTop: 'var(--space-8)' }}>
            <div className="info-card">
              <h4 className="info-card__title">📌 Directed Graph (Digraph)</h4>
              <p className="info-card__text">
                In a directed graph, each edge carries a <em>direction</em>. The edge A → B is distinct from B → A.
                In social networks, "Aisha follows Rahul" does <strong>not</strong> mean "Rahul follows Aisha".
                The arrow always goes <em>Follower → Followed</em>.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">📊 In-Degree & Out-Degree</h4>
              <p className="info-card__text">
                <strong style={{ color: '#ec4899' }}>In-degree</strong> = number of arrows pointing IN = follower count.
                <br />
                <strong style={{ color: '#00d4ff' }}>Out-degree</strong> = number of arrows pointing OUT = following count.
                <br />
                High in-degree → influential account.
              </p>
            </div>
            <div className="info-card">
              <h4 className="info-card__title">🔄 Asymmetric Relationships</h4>
              <p className="info-card__text">
                Unlike a friendship in undirected graphs, social follows are <em>asymmetric</em>.
                A celebrity may have millions of followers but follow very few people back.
                This is a fundamental property of <strong>directed</strong> graphs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
