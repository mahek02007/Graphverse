import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import PresentationBar from '../../components/PresentationMode/PresentationBar'
import '../SocialNetwork/SocialNetwork.css'
import './WebGraph.css'

/* ════════════════════════════════════════════════════════════
   INITIAL WEB GRAPH DATA
   ════════════════════════════════════════════════════════════ */

const DEFAULT_PAGES = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    category: 'Portal',
    icon: '🏠',
    color: '#00d4ff',
    x: 140,
    y: 150,
    description: 'Main entry gateway & directory',
  },
  {
    id: 'wiki',
    label: 'Wikipedia',
    path: '/wiki',
    category: 'Encyclopedia',
    icon: '📚',
    color: '#ec4899',
    x: 390,
    y: 120,
    description: 'High-authority global knowledge repository',
  },
  {
    id: 'history',
    label: 'History',
    path: '/wiki/history',
    category: 'Reference',
    icon: '🏛️',
    color: '#a855f7',
    x: 640,
    y: 170,
    description: 'Chronicles of ancient & modern civilizations',
  },
  {
    id: 'culture',
    label: 'Culture',
    path: '/culture',
    category: 'Arts',
    icon: '🎭',
    color: '#f59e0b',
    x: 600,
    y: 380,
    description: 'Arts, folklore, philosophy & music',
  },
  {
    id: 'travel',
    label: 'Travel',
    path: '/travel',
    category: 'Guide',
    icon: '✈️',
    color: '#10b981',
    x: 180,
    y: 380,
    description: 'World destinations & travel guides',
  },
  {
    id: 'edu',
    label: 'Education',
    path: '/education',
    category: 'Academic',
    icon: '🎓',
    color: '#06b6d4',
    x: 390,
    y: 400,
    description: 'Universities, courses & scholarly research',
  },
]

const DEFAULT_HYPERLINKS = [
  { id: 'home-wiki', from: 'home', to: 'wiki' },
  { id: 'home-travel', from: 'home', to: 'travel' },
  { id: 'home-edu', from: 'home', to: 'edu' },
  { id: 'wiki-history', from: 'wiki', to: 'history' },
  { id: 'wiki-culture', from: 'wiki', to: 'culture' },
  { id: 'wiki-edu', from: 'wiki', to: 'edu' },
  { id: 'history-wiki', from: 'history', to: 'wiki' },
  { id: 'history-culture', from: 'history', to: 'culture' },
  { id: 'culture-wiki', from: 'culture', to: 'wiki' },
  { id: 'culture-travel', from: 'culture', to: 'travel' },
  { id: 'travel-home', from: 'travel', to: 'home' },
  { id: 'travel-culture', from: 'travel', to: 'culture' },
  { id: 'edu-wiki', from: 'edu', to: 'wiki' },
  { id: 'edu-history', from: 'edu', to: 'history' },
]

const COLOR_PRESETS = [
  '#00d4ff', '#ec4899', '#a855f7', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#3b82f6',
]

const ICON_PRESETS = ['🌐', '🔬', '📰', '💻', '🎨', '🎵', '🏥', '🛒', '⚡', '📊']

/* ════════════════════════════════════════════════════════════
   CLASSROOM PRESENTATION SLIDES
   ════════════════════════════════════════════════════════════ */

const WEB_GRAPH_SLIDES = [
  {
    id: 'directed-web',
    title: 'Slide 1 — The World Wide Web as a Directed Graph',
    mainConcept: 'Every URL on the Internet is a vertex V, and every HTML anchor tag <a> represents a directed edge u → v pointing from the source page to the target.',
    talkingPoints: [
      'The Web is a massive directed network with over 50 billion indexed pages.',
      'Hyperlinks are one-way pathways: a site citing Wikipedia does not imply Wikipedia links back.',
      'Graph theory provides the mathematical foundation for organizing and indexing this vast ocean of information.',
    ],
    highlightSummary: 'Default 6-page web network: Wikipedia, Education, Home, Travel, History, Culture.',
  },
  {
    id: 'link-counting-flaw',
    title: 'Slide 2 — The Flaw of Simple Link Counting',
    mainConcept: 'Naive search engines ranked pages by in-degree (total link count), which spam farms quickly exploited by auto-generating thousands of junk pages.',
    talkingPoints: [
      'Quality over Quantity: A single endorsement from Wikipedia or BBC carries far more authority than 1,000 links from unknown spam blogs.',
      'Out-Degree Dilution: If a directory page links to 100 websites, each recipient only receives 1/100th of its voting endorsement.',
    ],
    highlightSummary: 'Notice Wikipedia has incoming links from Home, History, Culture, and Education.',
  },
  {
    id: 'random-surfer',
    title: 'Slide 3 — The Random Surfer Model & Damping Factor (d)',
    mainConcept: 'PageRank simulates an idealized web surfer who clicks random links with probability d = 0.85, or gets bored and teleports to a random URL with probability 1 − d = 0.15.',
    talkingPoints: [
      'The damping factor d guarantees mathematical convergence via the Perron-Frobenius theorem.',
      'Without damping (d = 1.0), surfers would get permanently trapped in isolated cycles or dead-end pages.',
    ],
    highlightSummary: 'Damping factor d=0.85 represents an 85% click probability and 15% teleport probability.',
  },
  {
    id: 'dangling-nodes',
    title: 'Slide 4 — Handling Dangling Nodes (Dead Ends)',
    mainConcept: 'Pages with zero outgoing links (PDFs, standalone photos, or terminal articles) are dangling nodes that would absorb all rank like black holes.',
    talkingPoints: [
      'PageRank resolves this by redistributing the accumulated rank of dangling nodes equally across all N pages in the graph.',
      'This guarantees that the total probability mass strictly sums to 1.0 (100%) across every iteration.',
    ],
    highlightSummary: 'Conserves probability mass = 100% at every step.',
  },
  {
    id: 'power-iteration',
    title: 'Slide 5 — Power Iteration & Eigenvector Convergence',
    mainConcept: 'Starting from a uniform distribution (PR₀ = 1/N), repeated matrix-vector multiplications converge to the stationary principal eigenvector.',
    talkingPoints: [
      'Run the iteration player: watch node circles dynamically expand as rank accumulates on authoritative hubs.',
      'After 15–20 iterations, rank changes drop below 10⁻⁵, achieving stable convergence.',
    ],
    highlightSummary: 'Leaderboard ranks pages dynamically by eigenvector centrality.',
  },
]

/* ════════════════════════════════════════════════════════════
   PAGERANK ALGORITHM IMPLEMENTATION
   ════════════════════════════════════════════════════════════ */

/**
 * Computes the complete sequence of PageRank iterations.
 * Handles dangling nodes (nodes with 0 out-links) by evenly redistributing their rank.
 * Conserves total probability mass = 1.0 at every single step.
 */
function computePageRankHistory(nodes, edges, damping = 0.85, maxIterations = 25, tolerance = 1e-5) {
  const n = nodes.length
  if (n === 0) {
    return { steps: [], converged: true, convergedAt: 0 }
  }

  const ids = nodes.map(node => node.id)

  // Map incoming and outgoing connections
  const outNeighbors = {}
  const inNeighbors = {}
  ids.forEach(id => {
    outNeighbors[id] = []
    inNeighbors[id] = []
  })

  edges.forEach(({ from, to }) => {
    if (outNeighbors[from] && inNeighbors[to]) {
      if (!outNeighbors[from].includes(to)) outNeighbors[from].push(to)
      if (!inNeighbors[to].includes(from)) inNeighbors[to].push(from)
    }
  })

  // Step 0: Equal rank distribution (1 / N)
  let currentRank = {}
  ids.forEach(id => {
    currentRank[id] = 1 / n
  })

  const steps = [{ ...currentRank }]
  let converged = false
  let convergedAt = maxIterations

  for (let iter = 1; iter <= maxIterations; iter++) {
    // 1. Calculate the sum of ranks from dangling nodes (out-degree == 0)
    let danglingSum = 0
    ids.forEach(id => {
      if (outNeighbors[id].length === 0) {
        danglingSum += currentRank[id]
      }
    })

    // 2. Compute new rank for every page
    const nextRank = {}
    let diff = 0

    ids.forEach(u => {
      // Incoming link contribution: sum of PR(v) / L(v)
      let inSum = 0
      inNeighbors[u].forEach(v => {
        const outDeg = outNeighbors[v].length
        if (outDeg > 0) {
          inSum += currentRank[v] / outDeg
        }
      })

      // Standard PageRank formula with random teleportation & dangling redistribution:
      // PR(u) = (1 - d) / N + d * (sum(PR(v)/L(v)) + danglingSum / N)
      const val = ((1 - damping) / n) + damping * (inSum + (danglingSum / n))
      nextRank[u] = val
      diff += Math.abs(val - currentRank[u])
    })

    currentRank = nextRank
    steps.push({ ...currentRank })

    if (diff < tolerance && !converged) {
      converged = true
      convergedAt = iter
    }
  }

  return { steps, converged, convergedAt }
}

/* ════════════════════════════════════════════════════════════
   GEOMETRY & ARROWHEAD HELPERS
   ════════════════════════════════════════════════════════════ */

function calculateEdgeGeometry(fn, tn, rSource, rTarget, isCurved = false) {
  const dx = tn.x - fn.x
  const dy = tn.y - fn.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / dist
  const ny = dy / dist

  if (!isCurved) {
    const sx = fn.x + nx * rSource
    const sy = fn.y + ny * rSource
    const ex = tn.x - nx * (rTarget + 4)
    const ey = tn.y - ny * (rTarget + 4)

    // Arrowhead
    const arrowLen = 9
    const arrowWidth = 5
    const tipX = ex
    const tipY = ey
    const baseCenterX = ex - nx * arrowLen
    const baseCenterY = ey - ny * arrowLen
    const p1x = baseCenterX - ny * arrowWidth
    const p1y = baseCenterY + nx * arrowWidth
    const p2x = baseCenterX + ny * arrowWidth
    const p2y = baseCenterY - nx * arrowWidth

    return {
      path: `M ${sx} ${sy} L ${ex} ${ey}`,
      arrowPts: `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`,
      midX: (sx + ex) / 2,
      midY: (sy + ey) / 2,
    }
  }

  // Curved quadratic Bezier for bidirectional links
  const perpX = -ny
  const perpY = nx
  const curveOffset = 26

  const cx = (fn.x + tn.x) / 2 + perpX * curveOffset
  const cy = (fn.y + tn.y) / 2 + perpY * curveOffset

  const sx = fn.x + nx * (rSource * 0.9)
  const sy = fn.y + ny * (rSource * 0.9)

  // Tangent at target
  const tox = tn.x - cx
  const toy = tn.y - cy
  const tdist = Math.sqrt(tox * tox + toy * toy) || 1
  const tnx = tox / tdist
  const tny = toy / tdist

  const ex = tn.x - tnx * (rTarget + 4)
  const ey = tn.y - tny * (rTarget + 4)

  const arrowLen = 9
  const arrowWidth = 5
  const baseCenterX = ex - tnx * arrowLen
  const baseCenterY = ey - tny * arrowLen
  const p1x = baseCenterX - tny * arrowWidth
  const p1y = baseCenterY + tnx * arrowWidth
  const p2x = baseCenterX + tny * arrowWidth
  const p2y = baseCenterY - tnx * arrowWidth

  return {
    path: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`,
    arrowPts: `${ex},${ey} ${p1x},${p1y} ${p2x},${p2y}`,
    midX: cx,
    midY: cy,
  }
}

/* ════════════════════════════════════════════════════════════
   PAGE HEADER ICON
   ════════════════════════════════════════════════════════════ */

const WEBGRAPH_ICON = (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="9" fill="rgba(236,72,153,0.2)" stroke="#ec4899" strokeWidth="2.2" />
    <circle cx="24" cy="24" r="3.5" fill="#ec4899" />
    <circle cx="9" cy="14" r="4.5" fill="#00d4ff" />
    <circle cx="39" cy="14" r="4.5" fill="#a855f7" />
    <circle cx="9" cy="34" r="4.5" fill="#10b981" />
    <circle cx="39" cy="34" r="4.5" fill="#f59e0b" />
    <path d="M13 16L19 20" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 16L29 20" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 32L19 28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 32L29 28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function WebGraph() {
  // Graph Data State
  const [pages, setPages] = useState(DEFAULT_PAGES)
  const [edges, setEdges] = useState(DEFAULT_HYPERLINKS)

  // Presentation Mode State
  const [presMode, setPresMode] = useState(false)
  const [presStep, setPresStep] = useState(0)

  // Selection & Highlight State
  const [selectedId, setSelectedId] = useState('wiki')
  const [hoveredId, setHoveredId] = useState(null)
  const [highlightIn, setHighlightIn] = useState(false)
  const [highlightOut, setHighlightOut] = useState(false)

  // Interaction Modes & Modals
  const [linkMode, setLinkMode] = useState(false)
  const [linkSourceId, setLinkSourceId] = useState(null)
  const [showAddPage, setShowAddPage] = useState(false)
  const [recentlyAddedEdgeId, setRecentlyAddedEdgeId] = useState(null)

  // Quick Connect Bar State
  const [connectFrom, setConnectFrom] = useState('home')
  const [connectTo, setConnectTo] = useState('wiki')

  // Add Page Form State
  const [newPageName, setNewPageName] = useState('')
  const [newPagePath, setNewPagePath] = useState('')
  const [newPageCategory, setNewPageCategory] = useState('Topic')
  const [newPageColor, setNewPageColor] = useState(COLOR_PRESETS[0])
  const [newPageIcon, setNewPageIcon] = useState(ICON_PRESETS[0])

  // PageRank Hyperparameters
  const [damping, setDamping] = useState(0.85)
  const [maxIterations, setMaxIterations] = useState(25)

  // Iteration Playback State
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Event Activity Log
  const [logs, setLogs] = useState(() => [
    { id: 1, time: '12:00:00', text: 'Web Graph initialized with 6 interconnected pages.' },
    { id: 2, time: '12:00:01', text: 'PageRank ready: Damping d=0.85, 25 iterations.' },
  ])

  // Dragging State
  const [draggingId, setDraggingId] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const svgRef = useRef(null)

  // Helper to add timestamped event log
  const logEvent = useCallback((text) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [
      { id: Date.now() + Math.random(), time, text },
      ...prev.slice(0, 30),
    ])
  }, [])

  /* ────────────────────────────────────────────────────────────
     Degree Calculations (In-Degree & Out-Degree)
     ──────────────────────────────────────────────────────────── */
  const degrees = useMemo(() => {
    const map = {}
    pages.forEach(p => {
      map[p.id] = { inDegree: 0, outDegree: 0, inLinks: [], outLinks: [] }
    })

    edges.forEach(e => {
      if (map[e.from]) {
        map[e.from].outDegree += 1
        map[e.from].outLinks.push(e)
      }
      if (map[e.to]) {
        map[e.to].inDegree += 1
        map[e.to].inLinks.push(e)
      }
    })
    return map
  }, [pages, edges])

  /* ────────────────────────────────────────────────────────────
     Compute PageRank Iteration Sequence
     ──────────────────────────────────────────────────────────── */
  const pageRankResult = useMemo(() => {
    return computePageRankHistory(pages, edges, damping, maxIterations)
  }, [pages, edges, damping, maxIterations])

  const { steps, converged, convergedAt } = pageRankResult
  const totalSteps = steps.length - 1

  // Derive current step clamped to total steps without cascading effect
  const stepIndex = Math.min(Math.max(0, currentStep), totalSteps)

  // Auto-play interval for iteration steps
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= totalSteps) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 280)

    return () => clearInterval(timer)
  }, [isPlaying, totalSteps])

  // Current ranks snapshot at selected step
  const currentRanks = useMemo(() => {
    if (!steps || steps.length === 0) return {}
    return steps[stepIndex] || {}
  }, [steps, stepIndex])

  // Max and Min ranks for radius scaling
  const { maxRank, minRank } = useMemo(() => {
    const vals = Object.values(currentRanks)
    if (vals.length === 0) return { maxRank: 1, minRank: 0 }
    return {
      maxRank: Math.max(...vals),
      minRank: Math.min(...vals),
    }
  }, [currentRanks])

  // Summary Statistics (Density, Dangling Nodes, Top Authority)
  const { danglingCount, topRankedPage, graphDensity } = useMemo(() => {
    let dangling = 0
    pages.forEach(p => {
      if ((degrees[p.id]?.outDegree || 0) === 0) dangling += 1
    })
    const maxPoss = pages.length > 1 ? pages.length * (pages.length - 1) : 1
    const density = edges.length / maxPoss

    let topPage = null
    let maxSc = -1
    pages.forEach(p => {
      const sc = currentRanks[p.id] ?? 0
      if (sc > maxSc) {
        maxSc = sc
        topPage = p
      }
    })

    return { danglingCount: dangling, topRankedPage: topPage, graphDensity: density }
  }, [pages, edges, degrees, currentRanks])

  // Node radius calculation based on PageRank score
  const getNodeRadius = useCallback((id) => {
    const score = currentRanks[id] || (1 / (pages.length || 1))
    if (maxRank === minRank) return 26
    const norm = (score - minRank) / (maxRank - minRank + 1e-9)
    return 20 + norm * 20 // Range: 20px to 40px
  }, [currentRanks, pages.length, maxRank, minRank])

  // Sorted leaderboard table items
  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => {
      const scoreA = currentRanks[a.id] ?? 0
      const scoreB = currentRanks[b.id] ?? 0
      return scoreB - scoreA
    })
  }, [pages, currentRanks])

  const topPageId = sortedPages[0]?.id

  /* ────────────────────────────────────────────────────────────
     Graph Manipulation Actions
     ──────────────────────────────────────────────────────────── */

  // Run or restart PageRank playback from iteration 0
  const handleRunPageRank = () => {
    setCurrentStep(0)
    setIsPlaying(true)
    logEvent(`Started PageRank computation: d=${damping}, maxIter=${maxIterations}`)
  }

  // Jump to final converged iteration
  const handleJumpToFinal = () => {
    setIsPlaying(false)
    setCurrentStep(totalSteps)
    logEvent(`Jumped to final iteration (${totalSteps}/${totalSteps}) · Converged=${converged}`)
  }

  // Step forward
  const handleStepForward = () => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(totalSteps, prev + 1))
  }

  // Step back
  const handleStepBack = () => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  // Add a hyperlink between two nodes
  const handleAddHyperlink = useCallback((fromId, toId) => {
    if (fromId === toId) {
      logEvent(`Cannot create self-loop link (${fromId} → ${toId})`)
      return
    }

    const exists = edges.some(e => e.from === fromId && e.to === toId)
    if (exists) {
      const fn = pages.find(p => p.id === fromId)?.label || fromId
      const tn = pages.find(p => p.id === toId)?.label || toId
      logEvent(`Hyperlink ${fn} → ${tn} already exists.`)
      return
    }

    const newEdgeId = `link-${fromId}-${toId}-${Date.now()}`
    const newEdge = { id: newEdgeId, from: fromId, to: toId }

    setEdges(prev => [...prev, newEdge])
    setRecentlyAddedEdgeId(newEdgeId)

    const fn = pages.find(p => p.id === fromId)?.label || fromId
    const tn = pages.find(p => p.id === toId)?.label || toId
    logEvent(`Created hyperlink: ${fn} ➔ ${tn}`)

    // Clear pulse animation after 2.5s
    setTimeout(() => {
      setRecentlyAddedEdgeId(curr => (curr === newEdgeId ? null : curr))
    }, 2500)
  }, [edges, pages, logEvent])

  // Remove a hyperlink
  const handleRemoveHyperlink = useCallback((edgeId) => {
    const target = edges.find(e => e.id === edgeId)
    if (!target) return

    setEdges(prev => prev.filter(e => e.id !== edgeId))
    const fn = pages.find(p => p.id === target.from)?.label || target.from
    const tn = pages.find(p => p.id === target.to)?.label || target.to
    logEvent(`Removed hyperlink: ${fn} ➔ ${tn}`)
  }, [edges, pages, logEvent])

  // Add a new webpage
  const handleCreatePage = (e) => {
    e.preventDefault()
    const name = newPageName.trim()
    if (!name) return

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') || `page${Date.now()}`
    const exists = pages.some(p => p.id === id)
    if (exists) {
      logEvent(`Page identifier "${id}" already exists.`)
      return
    }

    // Smart positioning near center with jitter
    const offsetAngle = Math.random() * Math.PI * 2
    const offsetDist = 80 + Math.random() * 120
    const newX = Math.round(Math.max(100, Math.min(660, 390 + Math.cos(offsetAngle) * offsetDist)))
    const newY = Math.round(Math.max(80, Math.min(420, 260 + Math.sin(offsetAngle) * offsetDist)))

    const newPage = {
      id,
      label: name,
      path: newPagePath.trim() || `/${id}`,
      category: newPageCategory.trim() || 'General',
      icon: newPageIcon,
      color: newPageColor,
      x: newX,
      y: newY,
      description: `Custom web page added by user`,
    }

    setPages(prev => [...prev, newPage])
    setSelectedId(id)
    setShowAddPage(false)
    setNewPageName('')
    setNewPagePath('')

    logEvent(`Added new webpage: "${name}" (${newPage.path})`)
  }

  // Delete a webpage and all attached hyperlinks
  const handleDeletePage = useCallback((id) => {
    const p = pages.find(item => item.id === id)
    if (!p) return

    setPages(prev => prev.filter(item => item.id !== id))
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id))
    if (selectedId === id) setSelectedId(null)
    logEvent(`Deleted page "${p.label}" and removed all its hyperlinks.`)
  }, [pages, selectedId, logEvent])

  // Reset graph to default state
  const handleResetGraph = () => {
    setPages(DEFAULT_PAGES)
    setEdges(DEFAULT_HYPERLINKS)
    setSelectedId('wiki')
    setLinkMode(false)
    setLinkSourceId(null)
    setHighlightIn(false)
    setHighlightOut(false)
    setCurrentStep(0)
    setIsPlaying(false)
    logEvent('Graph reset to standard 6 pages and default hyperlink topology.')
  }

  /* ────────────────────────────────────────────────────────────
     Interactive SVG Canvas Handlers
     ──────────────────────────────────────────────────────────── */

  const getSvgCoordinates = (e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (780 / rect.width),
      y: (clientY - rect.top) * (500 / rect.height),
    }
  }

  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation()

    // Handle "Add Link Mode" click sequence
    if (linkMode) {
      if (!linkSourceId) {
        setLinkSourceId(id)
        const fn = pages.find(p => p.id === id)?.label || id
        logEvent(`Link source chosen: "${fn}". Now click destination webpage.`)
      } else {
        handleAddHyperlink(linkSourceId, id)
        setLinkSourceId(null)
        setLinkMode(false)
      }
      return
    }

    // Select node
    setSelectedId(id)
    const pageObj = pages.find(p => p.id === id)
    const deg = degrees[id] || { inDegree: 0, outDegree: 0 }
    logEvent(`Selected webpage: "${pageObj?.label}" (In: ${deg.inDegree}, Out: ${deg.outDegree})`)

    // Start drag
    const pt = getSvgCoordinates(e)
    dragOffset.current = { x: pt.x - pageObj.x, y: pt.y - pageObj.y }
    setDraggingId(id)
  }

  const handleSvgMouseMove = (e) => {
    if (!draggingId) return
    const pt = getSvgCoordinates(e)
    const nx = Math.max(40, Math.min(740, pt.x - dragOffset.current.x))
    const ny = Math.max(40, Math.min(460, pt.y - dragOffset.current.y))

    setPages(prev => prev.map(p => (p.id === draggingId ? { ...p, x: nx, y: ny } : p)))
  }

  const handleSvgMouseUp = () => {
    setDraggingId(null)
  }

  const activeFocusId = hoveredId || selectedId
  const selectedPage = pages.find(p => p.id === selectedId)
  const selectedDegrees = selectedId ? degrees[selectedId] : null

  return (
    <div className={`simulation-page ${presMode ? 'sim-layout--pres' : ''}`}>
      <PageHeader
        badge="Directed Web Graph & PageRank"
        badgeClass="pink"
        icon={WEBGRAPH_ICON}
        title="Web Graph & PageRank Simulator"
        subtitle="Explore how hyperlinks transform the World Wide Web into a directed graph. Simulate Larry Page & Sergey Brin's PageRank algorithm to understand how iterative eigenvector power flows through hyperlinks."
        showHome
        presentationMode={presMode}
        onTogglePresentation={() => setPresMode(p => !p)}
        intro="Model the World Wide Web as a massive directed graph. Analyze in-degrees and out-degrees, observe how dangling nodes dissipate probability mass, and execute power iteration with Larry Page and Sergey Brin's PageRank algorithm."
        concepts={[
          { label: 'Directed Graph', desc: 'Pages are vertices; hyperlinks are one-way directed edges u → v' },
          { label: 'In vs. Out Degree', desc: 'In-links convey authority; out-links distribute voting power' },
          { label: 'Damping Factor (d)', desc: 'Probability (default 0.85) of following links vs. random teleportation' },
          { label: 'Dangling Nodes', desc: 'Dead ends with 0 out-links redistribute energy to all pages' },
          { label: 'Power Iteration', desc: 'Iteratively refines ranks until eigenvector convergence' },
        ]}
      />

      {presMode && (
        <PresentationBar
          slides={WEB_GRAPH_SLIDES}
          currentSlideIndex={presStep}
          onSlideChange={setPresStep}
          onClose={() => setPresMode(false)}
          badgeLabel="Web Graph Classroom Deck"
        />
      )}

      <section className="simulation-body section-sm">
        <div className="container">
          <div className="wg-layout">
            {/* ═══════════════ LEFT CONTROLS SIDEBAR ═══════════════ */}
            <aside className="wg-controls">
              {/* Algorithm Execution Card */}
              <div className="wg-card">
                <div className="wg-card-header">
                  <span className="wg-card-title">⚡ PageRank Execution</span>
                  <span className={`wg-convergence-badge ${converged ? 'wg-convergence-badge--converged' : 'wg-convergence-badge--running'}`}>
                    {converged ? `✓ Converged @ #${convergedAt}` : 'Iterating'}
                  </span>
                </div>

                {/* Damping Factor Slider */}
                <div className="sim-control-group">
                  <div className="wg-slider-row">
                    <label className="sim-label" style={{ flex: 1 }}>Damping Factor (d)</label>
                    <span className="pr-slider-val">{damping.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.99"
                    step="0.01"
                    value={damping}
                    onChange={e => setDamping(parseFloat(e.target.value))}
                    className="pr-slider"
                  />
                  <p className="sim-hint">
                    d = <strong>{(damping * 100).toFixed(0)}%</strong> link following,{' '}
                    <strong>{((1 - damping) * 100).toFixed(0)}%</strong> random teleportation.
                  </p>
                </div>

                {/* Iterations Slider */}
                <div className="sim-control-group" style={{ marginTop: '12px' }}>
                  <div className="wg-slider-row">
                    <label className="sim-label" style={{ flex: 1 }}>Max Iterations</label>
                    <span className="pr-slider-val">{maxIterations}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={maxIterations}
                    onChange={e => setMaxIterations(parseInt(e.target.value, 10))}
                    className="pr-slider"
                  />
                </div>

                {/* Action Buttons */}
                <div className="wg-btn-grid" style={{ marginTop: '14px' }}>
                  <button className="btn btn-pink btn-sm" onClick={handleRunPageRank}>
                    {isPlaying ? '⏸ Pause' : '▶ Run PageRank'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleJumpToFinal}>
                    ⏩ Final Rank
                  </button>
                </div>

                {/* Step Player Controls */}
                <div className="wg-playback-bar">
                  <button
                    className="wg-play-btn"
                    onClick={handleStepBack}
                    disabled={stepIndex === 0}
                    title="Previous Iteration Step"
                  >
                    ⏮
                  </button>
                  <button
                    className={`wg-play-btn ${isPlaying ? 'wg-play-btn--active' : ''}`}
                    onClick={() => setIsPlaying(p => !p)}
                    title={isPlaying ? 'Pause' : 'Play animation'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button
                    className="wg-play-btn"
                    onClick={handleStepForward}
                    disabled={stepIndex >= totalSteps}
                    title="Next Iteration Step"
                  >
                    ⏭
                  </button>
                  <div className="wg-step-indicator">
                    Iteration <strong>{stepIndex}</strong> / {totalSteps}
                  </div>
                </div>

                {/* Scrub Slider */}
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="range"
                    min="0"
                    max={totalSteps}
                    value={stepIndex}
                    onChange={e => {
                      setIsPlaying(false)
                      setCurrentStep(parseInt(e.target.value, 10))
                    }}
                    className="pr-slider"
                  />
                </div>
              </div>

              {/* Graph Actions & Highlighting */}
              <div className="wg-card">
                <div className="wg-card-header">
                  <span className="wg-card-title">🔗 Graph Actions & Filters</span>
                </div>

                <div className="action-buttons">
                  <div className="wg-btn-grid">
                    <button
                      className={`mode-btn ${linkMode ? 'mode-btn--active' : ''}`}
                      onClick={() => {
                        setLinkMode(m => !m)
                        setLinkSourceId(null)
                      }}
                    >
                      {linkMode ? '✕ Cancel Link' : '➕ Link Mode'}
                    </button>
                    <button
                      className={`mode-btn ${showAddPage ? 'mode-btn--active' : ''}`}
                      onClick={() => setShowAddPage(s => !s)}
                    >
                      {showAddPage ? '✕ Close Form' : '📄 Add Page'}
                    </button>
                  </div>

                  {/* Highlight Incoming / Outgoing Links */}
                  <div className="wg-toggle-row">
                    <button
                      className={`wg-toggle-btn ${highlightIn ? 'wg-toggle-btn--in' : ''}`}
                      onClick={() => setHighlightIn(h => !h)}
                      title="Highlight edges pointing into the selected page"
                    >
                      📥 In-Links
                    </button>
                    <button
                      className={`wg-toggle-btn ${highlightOut ? 'wg-toggle-btn--out' : ''}`}
                      onClick={() => setHighlightOut(h => !h)}
                      title="Highlight edges originating from the selected page"
                    >
                      📤 Out-Links
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleResetGraph} title="Reset graph">
                      ↺ Reset
                    </button>
                  </div>
                </div>

                {linkMode && (
                  <p className="sim-hint" style={{ marginTop: '10px' }}>
                    {linkSourceId
                      ? `Source: "${pages.find(p => p.id === linkSourceId)?.label}". Click target webpage.`
                      : 'Click source webpage on canvas first.'}
                  </p>
                )}

                {/* Inline Add Webpage Form */}
                {showAddPage && (
                  <form onSubmit={handleCreatePage} className="wg-add-form">
                    <div className="wg-input-row">
                      <label className="wg-input-label">Page Title</label>
                      <input
                        type="text"
                        className="wg-text-input"
                        placeholder="e.g. Science, News, Blog"
                        value={newPageName}
                        onChange={e => setNewPageName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="wg-input-row">
                      <label className="wg-input-label">URL Slug</label>
                      <input
                        type="text"
                        className="wg-text-input"
                        placeholder="e.g. /science"
                        value={newPagePath}
                        onChange={e => setNewPagePath(e.target.value)}
                      />
                    </div>
                    <div className="wg-input-row">
                      <label className="wg-input-label">Category</label>
                      <input
                        type="text"
                        className="wg-text-input"
                        placeholder="e.g. Research, Portal, News"
                        value={newPageCategory}
                        onChange={e => setNewPageCategory(e.target.value)}
                      />
                    </div>
                    <div className="wg-input-row">
                      <label className="wg-input-label">Color Theme</label>
                      <div className="wg-color-presets">
                        {COLOR_PRESETS.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`wg-color-dot ${newPageColor === c ? 'wg-color-dot--active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setNewPageColor(c)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="wg-input-row">
                      <label className="wg-input-label">Page Icon</label>
                      <div className="wg-color-presets">
                        {ICON_PRESETS.map(ic => (
                          <button
                            key={ic}
                            type="button"
                            className={`btn btn-ghost btn-sm ${newPageIcon === ic ? 'btn-primary' : ''}`}
                            style={{ padding: '2px 6px', fontSize: '1rem' }}
                            onClick={() => setNewPageIcon(ic)}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!newPageName.trim()}>
                      ➕ Add Webpage
                    </button>
                  </form>
                )}

                {/* Quick Connect Dropdown Bar */}
                <div style={{ marginTop: '14px' }}>
                  <label className="sim-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Quick Connect Hyperlink
                  </label>
                  <div className="wg-connect-bar">
                    <select
                      className="wg-select"
                      value={connectFrom}
                      onChange={e => setConnectFrom(e.target.value)}
                    >
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <span style={{ color: 'var(--color-text-muted)' }}>➔</span>
                    <select
                      className="wg-select"
                      value={connectTo}
                      onChange={e => setConnectTo(e.target.value)}
                    >
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddHyperlink(connectFrom, connectTo)}
                      style={{ padding: '6px 10px' }}
                    >
                      Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Page Inspector Card */}
              {selectedPage && selectedDegrees && (
                <div
                  className="wg-inspector"
                  style={{ '--inspect-color': selectedPage.color }}
                >
                  <div className="wg-inspector-header">
                    <div className="wg-inspector-title">
                      <span style={{ fontSize: '1.2rem' }}>{selectedPage.icon}</span>
                      <span>{selectedPage.label}</span>
                    </div>
                    <span className="wg-inspector-badge">{selectedPage.path}</span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {selectedPage.description}
                  </p>

                  <div className="wg-stats-grid">
                    <div className="wg-stat-box">
                      <div className="wg-stat-val" style={{ color: 'var(--color-pink)' }}>
                        {selectedDegrees.inDegree}
                      </div>
                      <div className="wg-stat-label">In-Degree</div>
                    </div>
                    <div className="wg-stat-box">
                      <div className="wg-stat-val" style={{ color: 'var(--color-emerald)' }}>
                        {selectedDegrees.outDegree}
                      </div>
                      <div className="wg-stat-label">Out-Degree</div>
                    </div>
                    <div className="wg-stat-box">
                      <div className="wg-stat-val" style={{ color: 'var(--color-electric)' }}>
                        {(((currentRanks[selectedPage.id] || 0) * 100)).toFixed(1)}%
                      </div>
                      <div className="wg-stat-label">PageRank</div>
                    </div>
                  </div>

                  {/* Incoming Hyperlinks */}
                  <div>
                    <label className="sim-label" style={{ fontSize: '0.68rem', marginBottom: '4px', display: 'block' }}>
                      📥 Inbound Links ({selectedDegrees.inDegree})
                    </label>
                    <div className="wg-links-list">
                      {selectedDegrees.inLinks.length === 0 ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          No incoming links (orphan page).
                        </span>
                      ) : (
                        selectedDegrees.inLinks.map(link => {
                          const srcPage = pages.find(p => p.id === link.from)
                          return (
                            <div key={link.id} className="wg-link-item">
                              <span style={{ color: srcPage?.color }}>
                                {srcPage?.icon} {srcPage?.label}
                              </span>
                              <button
                                className="wg-link-del-btn"
                                onClick={() => handleRemoveHyperlink(link.id)}
                                title="Remove link"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Outgoing Hyperlinks */}
                  <div>
                    <label className="sim-label" style={{ fontSize: '0.68rem', marginBottom: '4px', display: 'block' }}>
                      📤 Outbound Links ({selectedDegrees.outDegree})
                    </label>
                    <div className="wg-links-list">
                      {selectedDegrees.outLinks.length === 0 ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-amber)' }}>
                          ⚠ Dangling page (0 out-links).
                        </span>
                      ) : (
                        selectedDegrees.outLinks.map(link => {
                          const tgtPage = pages.find(p => p.id === link.to)
                          return (
                            <div key={link.id} className="wg-link-item">
                              <span style={{ color: tgtPage?.color }}>
                                {tgtPage?.icon} {tgtPage?.label}
                              </span>
                              <button
                                className="wg-link-del-btn"
                                onClick={() => handleRemoveHyperlink(link.id)}
                                title="Remove link"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Delete Page button */}
                  {pages.length > 2 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', marginTop: '4px' }}
                      onClick={() => handleDeletePage(selectedPage.id)}
                    >
                      🗑️ Delete Webpage
                    </button>
                  )}
                </div>
              )}

              {/* Live Web Graph Stats */}
              <div className="sim-stats-card">
                <div className="sim-stats-header">
                  <span className="sim-stats-icon">📊</span>
                  <span className="sim-stats-title">Live Web Graph Stats</span>
                </div>
                <div className="sim-stats-grid">
                  <div className="sim-stat-box">
                    <div className="sim-stat-num">{pages.length}</div>
                    <div className="sim-stat-lbl">Web Pages (V)</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-pink)' }}>{edges.length}</div>
                    <div className="sim-stat-lbl">Hyperlinks (E)</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-purple)' }}>{danglingCount}</div>
                    <div className="sim-stat-lbl">Dangling Nodes</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-emerald)' }}>
                      {topRankedPage ? topRankedPage.label : 'None'}
                    </div>
                    <div className="sim-stat-lbl">Top Authority</div>
                  </div>
                </div>
                <div className="sim-stats-meta" style={{ marginTop: '12px' }}>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Graph Density:</span>
                    <span className="sim-stat-row-value">{graphDensity.toFixed(3)}</span>
                  </div>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Damping Factor:</span>
                    <span className="sim-stat-row-value">d = {damping.toFixed(2)}</span>
                  </div>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Convergence:</span>
                    <span className="sim-stat-row-value" style={{ color: converged ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
                      {converged ? `Step #${convergedAt}` : 'Iterating'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Log Card */}
              <div className="wg-card">
                <div className="wg-card-header">
                  <span className="wg-card-title">📋 Activity Event Log</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={() => setLogs([])}
                  >
                    Clear
                  </button>
                </div>
                <div className="wg-log-box">
                  {logs.map(log => (
                    <div key={log.id} className="wg-log-line">
                      <span className="wg-log-time">[{log.time}]</span>
                      <span className="wg-log-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ═══════════════ RIGHT CANVAS & LEADERBOARD ═══════════════ */}
            <div className="wg-canvas-container">
              {/* Interactive SVG Canvas */}
              <div className="wg-canvas-wrap">
                <div className="wg-canvas-header">
                  <div className="wg-canvas-title">
                    <span>🌐 World Wide Web Graph</span>
                    {linkMode && (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        🔗 Link Mode Active
                      </span>
                    )}
                  </div>
                  <div className="wg-canvas-badges">
                    <span><strong>{pages.length}</strong> pages</span>
                    <span>·</span>
                    <span><strong>{edges.length}</strong> hyperlinks</span>
                    <span>·</span>
                    <span>Step <strong>{stepIndex}</strong> of {totalSteps}</span>
                  </div>
                </div>

                <svg
                  ref={svgRef}
                  className="wg-svg"
                  viewBox="0 0 780 500"
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onMouseLeave={handleSvgMouseUp}
                >
                  <defs>
                    {/* Gradients for each node */}
                    {pages.map(p => (
                      <radialGradient key={p.id} id={`wg-glow-${p.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={p.color} stopOpacity="0.45" />
                        <stop offset="65%" stopColor={p.color} stopOpacity="0.12" />
                        <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                      </radialGradient>
                    ))}
                  </defs>

                  {/* Hyperlink Edges */}
                  {edges.map(edge => {
                    const fn = pages.find(p => p.id === edge.from)
                    const tn = pages.find(p => p.id === edge.to)
                    if (!fn || !tn) return null

                    const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from)
                    const rSource = getNodeRadius(fn.id)
                    const rTarget = getNodeRadius(tn.id)
                    const geom = calculateEdgeGeometry(fn, tn, rSource, rTarget, hasReverse)

                    const isSelectedEdge = edge.from === selectedId || edge.to === selectedId
                    const isNewEdge = edge.id === recentlyAddedEdgeId

                    // Highlighting incoming vs outgoing links
                    const isInboundToActive = activeFocusId && edge.to === activeFocusId
                    const isOutboundFromActive = activeFocusId && edge.from === activeFocusId

                    let edgeClass = 'wg-edge'
                    let strokeColor = '#334155'
                    let strokeWidth = 1.6
                    let opacity = 0.45

                    if (isNewEdge) {
                      edgeClass += ' wg-edge--new'
                      strokeColor = '#00d4ff'
                      strokeWidth = 3.5
                      opacity = 1
                    } else if (highlightIn && isInboundToActive) {
                      edgeClass += ' wg-edge--inbound'
                      strokeColor = '#ec4899'
                      strokeWidth = 3
                      opacity = 1
                    } else if (highlightOut && isOutboundFromActive) {
                      edgeClass += ' wg-edge--outbound'
                      strokeColor = '#10b981'
                      strokeWidth = 3
                      opacity = 1
                    } else if ((highlightIn || highlightOut) && activeFocusId) {
                      edgeClass += ' wg-edge--dimmed'
                      opacity = 0.12
                    } else if (isSelectedEdge) {
                      strokeColor = fn.color
                      strokeWidth = 2.4
                      opacity = 0.85
                    }

                    return (
                      <g
                        key={edge.id}
                        onClick={e => {
                          e.stopPropagation()
                          handleRemoveHyperlink(edge.id)
                        }}
                        title={`Hyperlink: ${fn.label} → ${tn.label} (Click to remove)`}
                      >
                        <path
                          d={geom.path}
                          className={edgeClass}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeLinecap="round"
                          opacity={opacity}
                        />
                        <polygon
                          points={geom.arrowPts}
                          fill={strokeColor}
                          opacity={opacity}
                        />
                      </g>
                    )
                  })}

                  {/* Webpage Nodes */}
                  {pages.map(page => {
                    const radius = getNodeRadius(page.id)
                    const isSelected = page.id === selectedId
                    const isHovered = page.id === hoveredId
                    const isTopRanked = page.id === topPageId
                    const deg = degrees[page.id] || { inDegree: 0, outDegree: 0 }
                    const score = currentRanks[page.id] ?? 0
                    const percent = (score * 100).toFixed(1)

                    return (
                      <g
                        key={page.id}
                        className="wg-node-group"
                        transform={`translate(${page.x}, ${page.y})`}
                        onMouseDown={e => handleNodeMouseDown(e, page.id)}
                        onMouseEnter={() => setHoveredId(page.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {/* Glow halo */}
                        <circle
                          cx="0"
                          cy="0"
                          r={radius + 18}
                          fill={`url(#wg-glow-${page.id})`}
                        />

                        {/* Top Ranked Gold Halo Ring */}
                        {isTopRanked && (
                          <circle
                            cx="0"
                            cy="0"
                            r={radius + 7}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            opacity="0.85"
                          />
                        )}

                        {/* Selection Ring */}
                        {isSelected && (
                          <circle
                            cx="0"
                            cy="0"
                            r={radius + 9}
                            fill="none"
                            stroke={page.color}
                            strokeWidth="2"
                            className="wg-node-selected-ring"
                            style={{ '--r': `${radius}px` }}
                          />
                        )}

                        {/* Node Body */}
                        <circle
                          cx="0"
                          cy="0"
                          r={radius}
                          fill={page.color}
                          fillOpacity={isSelected || isHovered ? 0.95 : 0.8}
                          stroke={isSelected ? '#fff' : page.color}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          style={{
                            filter: isTopRanked ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'none',
                          }}
                        />

                        {/* Page Icon */}
                        <text
                          x="0"
                          y={-2}
                          textAnchor="middle"
                          fontSize={Math.max(12, radius * 0.55)}
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {page.icon}
                        </text>

                        {/* PageRank Score Percent Badge inside node */}
                        <text
                          x="0"
                          y={radius * 0.48}
                          textAnchor="middle"
                          fontFamily="Space Grotesk, sans-serif"
                          fontWeight="700"
                          fontSize={Math.max(8.5, radius * 0.32)}
                          fill="#050b18"
                          style={{ pointerEvents: 'none' }}
                        >
                          {percent}%
                        </text>

                        {/* Page Label above node */}
                        <text
                          x="0"
                          y={-radius - 8}
                          textAnchor="middle"
                          fontFamily="Inter, sans-serif"
                          fontWeight="700"
                          fontSize="11"
                          fill={page.color}
                          style={{ pointerEvents: 'none', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                        >
                          {page.label}
                        </text>

                        {/* In-Degree & Out-Degree Badges below node */}
                        <g transform={`translate(0, ${radius + 12})`}>
                          <rect
                            x="-28"
                            y="0"
                            width="56"
                            height="16"
                            rx="8"
                            fill="rgba(5, 11, 24, 0.9)"
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="1"
                          />
                          <text
                            x="-14"
                            y="11"
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="700"
                            fill="#ec4899"
                            fontFamily="monospace"
                          >
                            ↓{deg.inDegree}
                          </text>
                          <text
                            x="14"
                            y="11"
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="700"
                            fill="#10b981"
                            fontFamily="monospace"
                          >
                            ↑{deg.outDegree}
                          </text>
                        </g>

                        {/* Top 1 Crown icon */}
                        {isTopRanked && (
                          <text
                            x="0"
                            y={-radius - 22}
                            textAnchor="middle"
                            fontSize="13"
                            style={{ pointerEvents: 'none' }}
                          >
                            👑
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* PageRank Leaderboard Table */}
              <div className="wg-table-card">
                <div className="wg-table-header">
                  <div className="wg-table-title">
                    <span>🏆 PageRank Leaderboard</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      (Iteration {stepIndex} of {totalSteps})
                    </span>
                  </div>
                  <div className="wg-table-stats">
                    Total Probability Mass: <strong>100.0%</strong>
                  </div>
                </div>

                <div className="wg-table-wrapper">
                  <table className="wg-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px' }}>Rank</th>
                        <th>Web Page</th>
                        <th style={{ width: '80px', textAlign: 'center' }}>In-Links</th>
                        <th style={{ width: '80px', textAlign: 'center' }}>Out-Links</th>
                        <th style={{ width: '90px', textAlign: 'right' }}>Score</th>
                        <th>Authority Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPages.map((page, idx) => {
                        const deg = degrees[page.id] || { inDegree: 0, outDegree: 0 }
                        const score = currentRanks[page.id] ?? 0
                        const sharePercent = (score * 100).toFixed(2)
                        const isSelected = page.id === selectedId
                        const badgeMod = idx < 3 ? `wg-rank-badge--${idx + 1}` : ''

                        return (
                          <tr
                            key={page.id}
                            className={isSelected ? 'wg-table-row--selected' : ''}
                            onClick={() => setSelectedId(page.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <span className={`wg-rank-badge ${badgeMod}`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td>
                              <div className="wg-page-cell">
                                <span className="wg-page-icon">{page.icon}</span>
                                <div>
                                  <div style={{ color: page.color }}>{page.label}</div>
                                  <div className="wg-page-sub">{page.path}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: 'var(--color-pink)', fontWeight: 700 }}>
                                {deg.inDegree}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                                {deg.outDegree}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                              {score.toFixed(4)}
                            </td>
                            <td>
                              <div className="wg-bar-container">
                                <div className="wg-score-bar-bg">
                                  <div
                                    className="wg-score-bar-fill"
                                    style={{
                                      width: `${Math.min(100, Math.max(2, score * 100 * (pages.length > 0 ? 1 : 1)))}%`,
                                      background: page.color,
                                    }}
                                  />
                                </div>
                                <span className="wg-score-num">{sharePercent}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ SECTION 4: EDUCATIONAL EXPLANATIONS ═══════════════ */}
          <div className="wg-edu-grid">
            {/* Card 1: Directed Web Graph */}
            <div className="wg-edu-card">
              <div className="wg-edu-card-head">
                <div className="wg-edu-icon">🕸️</div>
                <h3 className="wg-edu-title">What is a Web Graph?</h3>
              </div>
              <p className="wg-edu-text">
                The World Wide Web is naturally structured as a <strong>directed graph</strong> ($G = (V, E)$).
                Every web page or URL represents a vertex (node $v \in V$), and every HTML anchor tag
                <code>&lt;a href="..."&gt;</code> forms a one-way <strong>directed edge</strong> ($u \to v$).
              </p>
              <p className="wg-edu-text">
                Because hyperlinks are directional, Page A linking to Page B does <em>not</em> imply that Page B links back to Page A.
                This asymmetry is fundamental to measuring information flow and authority.
              </p>
            </div>

            {/* Card 2: Quality vs Quantity */}
            <div className="wg-edu-card">
              <div className="wg-edu-card-head">
                <div className="wg-edu-icon">⚖️</div>
                <h3 className="wg-edu-title">Why Quality Trumps Raw Link Count</h3>
              </div>
              <p className="wg-edu-text">
                In a naive graph, one might rank pages solely by their <em>in-degree</em> (total number of incoming links).
                However, this is easily manipulated: anyone could create thousands of spam pages pointing to their site.
              </p>
              <p className="wg-edu-text">
                PageRank solves this by weighting each vote: <strong>a link from a prestigious, high-authority domain</strong>
                (such as Wikipedia or a university) passes far more ranking power than links from obscure or low-trust pages.
                Furthermore, if a page links to 100 different sites, its endorsement is diluted compared to one linking to only two sites.
              </p>
            </div>

            {/* Card 3: Random Surfer & Damping Factor */}
            <div className="wg-edu-card">
              <div className="wg-edu-card-head">
                <div className="wg-edu-icon">🏄</div>
                <h3 className="wg-edu-title">The Random Surfer Model & Damping Factor ($d$)</h3>
              </div>
              <p className="wg-edu-text">
                PageRank models a simulated web user who randomly surfs the internet. At any page $u$:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
                <li>With probability <strong>$d$ (typically 0.85)</strong>, the user clicks one of the page's hyperlinks at random.</li>
                <li>With probability <strong>$1 - d$ (0.15)</strong>, the user gets bored and teleports to a completely random webpage on the internet.</li>
              </ul>
              <p className="wg-edu-text">
                The <strong>damping factor $d$</strong> guarantees mathematical convergence and prevents the random surfer
                from becoming permanently trapped in isolated cycles or dead-end pages.
              </p>
            </div>

            {/* Card 4: Mathematical Formula & Dangling Nodes */}
            <div className="wg-edu-card">
              <div className="wg-edu-card-head">
                <div className="wg-edu-icon">🧮</div>
                <h3 className="wg-edu-title">Mathematical Formulation & Power Iteration</h3>
              </div>
              <p className="wg-edu-text">
                The PageRank score $PR(u)$ for page $u$ is defined recursively:
              </p>
              <div className="wg-edu-formula">
                PR(u) = (1 - d)/N + d × [ Σ_(v ∈ In(u)) (PR(v) / L(v)) + S_dangling / N ]
              </div>
              <p className="wg-edu-text">
                Here, $N$ is the total number of pages, $In(u)$ are pages linking to $u$, and $L(v)$ is the out-degree of $v$.
                Pages with $L(v) = 0$ (<strong>dangling pages</strong>) redistribute their entire probability mass evenly across all $N$ pages.
                By iteratively computing this formula (<em>power iteration</em>), the scores converge to the stationary probability distribution!
              </p>
            </div>

            {/* Disclaimer Callout Box */}
            <div className="wg-disclaimer-card">
              <div className="wg-disclaimer-icon">ℹ️</div>
              <div>
                <h4 className="wg-disclaimer-title">Educational Demonstration Disclaimer</h4>
                <p className="wg-disclaimer-text">
                  This simulator is an accurate mathematical representation of Larry Page and Sergey Brin&apos;s
                  original 1998 academic PageRank algorithm. It is created strictly for <strong>educational demonstration</strong> and does not reflect Google&apos;s modern production ranking system, which incorporates hundreds of multi-modal signals including neural semantic search (BERT/MUM), user intent, query freshness, E-E-A-T content quality, localized relevance, and advanced anti-spam classifiers.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════ SECTION 5: WHAT DID WE LEARN? ═══════════════ */}
          <div className="learning-summary-section">
            <div className="learning-summary-header">
              <div className="learning-summary-badge">🎓 Core Discrete Math Takeaways</div>
              <h2 className="learning-summary-title">What Did We Learn About Web Graphs & PageRank?</h2>
              <p className="learning-summary-sub">
                Key conceptual principles connecting directed graph theory, Markov chains, and modern web information retrieval.
              </p>
            </div>

            <div className="learning-takeaways-grid">
              <div className="takeaway-card">
                <div className="takeaway-card-icon">🕸️</div>
                <h3 className="takeaway-card-title">1. Directed Graph Asymmetry</h3>
                <p className="takeaway-card-desc">
                  Unlike undirected social friendships, hyperlinks are one-way directed edges u → v. Information and authority flow strictly along arrow directions, establishing asymmetric authority rather than mutual connectivity.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">⚖️</div>
                <h3 className="takeaway-card-title">2. In-Degree vs. Weighted Quality</h3>
                <p className="takeaway-card-desc">
                  A raw count of incoming edges (in-degree) is vulnerable to artificial inflation. PageRank replaces simple counting with recursive endorsement: receiving a link from an authority node transfers vastly more weight than many links from leaf nodes.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🏄</div>
                <h3 className="takeaway-card-title">3. Random Surfer & Ergodic Markov Chains</h3>
                <p className="takeaway-card-desc">
                  By introducing a damping factor (d = 0.85), PageRank turns the web transition matrix into a regular, irreducible, and aperiodic Markov chain. The Perron-Frobenius theorem guarantees a unique, strictly positive stationary probability vector.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🛑</div>
                <h3 className="takeaway-card-title">4. Conservation of Probability Mass</h3>
                <p className="takeaway-card-desc">
                  Dangling pages (out-degree = 0) act as probability sinks that would drain mass to zero. PageRank restores conservation by evenly redistributing dangling mass to all N vertices, keeping total probability mass strictly equal to 1.0 at every iteration.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🔁</div>
                <h3 className="takeaway-card-title">5. Power Iteration Convergence</h3>
                <p className="takeaway-card-desc">
                  Starting from uniform state (PR₀ = 1/N), repeated linear transformations rapidly decay sub-dominant eigenvectors. Within 15–25 matrix-vector multiplications, the distribution stabilizes at the dominant stationary eigenvector.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🛡️</div>
                <h3 className="takeaway-card-title">6. Resistance to Web Spam</h3>
                <p className="takeaway-card-desc">
                  Because out-degree dilutes the endorsement each link carries (PR(v) / L(v)), link farms cannot multiply their authority simply by creating more outgoing links. Quality links from high-rank hubs remain the decisive ranking signal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
