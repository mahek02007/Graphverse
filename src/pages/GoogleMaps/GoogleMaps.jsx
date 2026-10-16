import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import PresentationBar from '../../components/PresentationMode/PresentationBar'
import '../SocialNetwork/SocialNetwork.css'
import './GoogleMaps.css'

/* ════════════════════════════════════════════════════════════
   DEFAULT ROAD NETWORK DATA
   ════════════════════════════════════════════════════════════ */

const DEFAULT_LOCATIONS = [
  { id: 'college',     label: 'College',         category: 'Education', icon: '🎓', color: '#00d4ff', x: 130, y: 110 },
  { id: 'bus_stop',    label: 'Bus Stop',        category: 'Transit',   icon: '🚏', color: '#10b981', x: 340, y: 80  },
  { id: 'museum',      label: 'Museum',          category: 'Culture',   icon: '🏛️', color: '#ec4899', x: 590, y: 120 },
  { id: 'city_center', label: 'City Center',     category: 'Hub',       icon: '🏙️', color: '#f59e0b', x: 370, y: 230 },
  { id: 'railway',     label: 'Railway Station', category: 'Transit',   icon: '🚉', color: '#a855f7', x: 150, y: 280 },
  { id: 'library',     label: 'Library',         category: 'Public',    icon: '📚', color: '#06b6d4', x: 600, y: 310 },
  { id: 'airport',     label: 'Airport',         category: 'Transport', icon: '✈️', color: '#3b82f6', x: 380, y: 410 },
]

const DEFAULT_ROADS = [
  { id: 'r1',  from: 'college',     to: 'bus_stop',    w: 3.5 },
  { id: 'r2',  from: 'college',     to: 'railway',     w: 5.0 },
  { id: 'r3',  from: 'bus_stop',    to: 'city_center', w: 4.0 },
  { id: 'r4',  from: 'bus_stop',    to: 'museum',      w: 6.5 },
  { id: 'r5',  from: 'railway',     to: 'city_center', w: 3.0 },
  { id: 'r6',  from: 'railway',     to: 'airport',     w: 7.5 },
  { id: 'r7',  from: 'city_center', to: 'museum',      w: 5.5 },
  { id: 'r8',  from: 'city_center', to: 'library',     w: 4.5 },
  { id: 'r9',  from: 'city_center', to: 'airport',     w: 6.0 },
  { id: 'r10', from: 'museum',      to: 'library',     w: 3.0 },
  { id: 'r11', from: 'library',     to: 'airport',     w: 4.0 },
]

const ICON_PRESETS = ['🎓', '🚏', '🏛️', '🏙️', '🚉', '📚', '✈️', '🏥', '🛒', '☕', '🏨', '🌳']
const COLOR_PRESETS = ['#00d4ff', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#3b82f6', '#f43f5e']

/* ════════════════════════════════════════════════════════════
   CLASSROOM PRESENTATION SLIDES
   ════════════════════════════════════════════════════════════ */

const GOOGLE_MAPS_SLIDES = [
  {
    id: 'road-network-model',
    title: 'Slide 1 — Road Networks as Weighted Graphs G = (V, E, W)',
    mainConcept: 'Physical road grids are modeled as weighted graphs where intersections and landmarks are vertices (V), streets are edges (E), and distances are non-negative edge weights (W).',
    talkingPoints: [
      'In pure topological graphs, every edge counts equally as 1 hop.',
      'Physical maps require numerical edge weights to represent distance in kilometers, travel time in minutes, or monetary toll costs.',
      'Weights must satisfy w(e) >= 0 for Dijkstra\'s greedy approach to be mathematically sound.',
    ],
    highlightSummary: 'Default city network: 7 key locations (College, Bus Stop, Museum, City Center, Railway Station, Library, Airport) and 11 weighted roads.',
  },
  {
    id: 'greedy-choice',
    title: 'Slide 2 — Dijkstra\'s Greedy Choice Property',
    mainConcept: 'At every step, Dijkstra extracts the unvisited vertex with the smallest tentative distance from the priority queue and finalizes its permanent shortest distance.',
    talkingPoints: [
      'Optimal Substructure: Any subpath of an optimal shortest path must itself be an optimal shortest path.',
      'Greedy Decision: Because all edge weights are strictly non-negative, no future detour through unvisited nodes can ever produce a shorter distance to the selected vertex.',
      'Once a node is marked visited (green checkmark), its tentative distance becomes immutable and permanent.',
    ],
    highlightSummary: 'Permanent distances are color-coded in green badges as the algorithm proceeds.',
  },
  {
    id: 'edge-relaxation',
    title: 'Slide 3 — Edge Relaxation: dist[v] = min(dist[v], dist[u] + w(u, v))',
    mainConcept: 'Relaxation tests whether passing through newly finalized node u offers a shorter route to neighbor v than any route previously known.',
    talkingPoints: [
      'Initial state: Start location is initialized to dist[start] = 0.0 km; all other vertices are set to dist[v] = infinity.',
      'When inspecting neighbor v, if dist[u] + w(u, v) < dist[v], tentative distance dist[v] is relaxed downwards and prev[v] is updated to u.',
      'Watch edges flash gold during neighbor examination and cyan when relaxation succeeds.',
    ],
    highlightSummary: 'Edge relaxation progressively shrinks the tentative distance bounds toward exact optimality.',
  },
  {
    id: 'fewest-vs-shortest',
    title: 'Slide 4 — The Route Paradox: Fewest Roads ≠ Smallest Distance',
    mainConcept: 'Breadth-First Search (BFS) finds the path with the fewest road segments (hops), but Dijkstra finds the path with the smallest accumulated kilometers.',
    talkingPoints: [
      'Highway vs. Local Bypass: A single direct road segment might measure 20 km, while a two-segment detour might only measure 6 km + 7 km = 13 km.',
      'Comparing optimal vs. alternative routes proves that minimal turns does not equate to minimal fuel or distance.',
      'GPS engines like Google Maps compute Pareto-optimal frontiers balancing distance, speed limits, and traffic congestion.',
    ],
    highlightSummary: 'Toggle "Show Alternative Route" below the map to visualize second-best detours side-by-side.',
  },
  {
    id: 'unreachable-islands',
    title: 'Slide 5 — Handling Graph Disconnections & Islands',
    mainConcept: 'If a location has no connecting roads or all incident roads are removed, its tentative distance remains infinity, signaling an unreachable vertex.',
    talkingPoints: [
      'A graph with isolated components or cut-edges cannot guarantee reachability between arbitrary pairs (u, v).',
      'When Dijkstra encounters an unvisited vertex with dist[u] = infinity, the search safely terminates.',
      'Try removing connecting roads to see the algorithm report "Destination is unreachable" cleanly.',
    ],
    highlightSummary: 'Robust routing systems detect network partitions and inform users before dispatching navigation.',
  },
]

/* ════════════════════════════════════════════════════════════
   DIJKSTRA'S ALGORITHM IMPLEMENTATION WITH STEP RECORDING
   ════════════════════════════════════════════════════════════ */

/**
 * Generates a full chronological recording of Dijkstra's algorithm steps.
 * Each step contains:
 *  - type: 'INIT' | 'SELECT_MIN' | 'EXAMINE_NEIGHBOR' | 'RELAX' | 'DESTINATION_REACHED' | 'FINISHED' | 'UNREACHABLE'
 *  - currentVisiting: string (node id)
 *  - examiningNeighbor: string | null
 *  - examinedEdge: { from, to, w } | null
 *  - dist: { [nodeId]: number }
 *  - prev: { [nodeId]: string | null }
 *  - visited: Set<string>
 *  - desc: string
 */
function recordDijkstraExecution(nodes, edges, startId, endId) {
  const dist = {}
  const prev = {}
  const visited = new Set()

  nodes.forEach(n => {
    dist[n.id] = Infinity
    prev[n.id] = null
  })
  dist[startId] = 0

  // Build undirected adjacency
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(({ id, from, to, w }) => {
    if (adj[from] && adj[to]) {
      adj[from].push({ node: to, w, edgeId: id })
      adj[to].push({ node: from, w, edgeId: id })
    }
  })

  const steps = []

  // Step 0: Initialization
  steps.push({
    type: 'INIT',
    currentVisiting: startId,
    examiningNeighbor: null,
    examinedEdge: null,
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(visited),
    desc: `Initialized: Start location set to 0.0 km; all other locations set to ∞.`,
  })

  while (visited.size < nodes.length) {
    // Select unvisited node with smallest tentative distance
    let u = null
    nodes.forEach(n => {
      if (!visited.has(n.id) && (u === null || dist[n.id] < dist[u])) {
        u = n.id
      }
    })

    // If smallest distance is Infinity, remaining nodes are unreachable
    if (u === null || dist[u] === Infinity) {
      steps.push({
        type: 'UNREACHABLE',
        currentVisiting: null,
        examiningNeighbor: null,
        examinedEdge: null,
        dist: { ...dist },
        prev: { ...prev },
        visited: new Set(visited),
        desc: `No further reachable locations remaining in the graph.`,
      })
      break
    }

    // Mark node as visited
    visited.add(u)
    const uObj = nodes.find(n => n.id === u)

    steps.push({
      type: 'SELECT_MIN',
      currentVisiting: u,
      examiningNeighbor: null,
      examinedEdge: null,
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      desc: `Selected nearest unvisited: "${uObj?.label}" with finalized distance ${dist[u].toFixed(1)} km.`,
    })

    // If destination reached, finalize
    if (u === endId) {
      steps.push({
        type: 'DESTINATION_REACHED',
        currentVisiting: u,
        examiningNeighbor: null,
        examinedEdge: null,
        dist: { ...dist },
        prev: { ...prev },
        visited: new Set(visited),
        desc: `Destination "${uObj?.label}" reached! Finalizing shortest route.`,
      })
      break
    }

    // Examine each neighbor of u
    const neighbors = adj[u] || []
    for (const { node: v, w, edgeId } of neighbors) {
      if (visited.has(v)) continue

      const vObj = nodes.find(n => n.id === v)
      const tentative = dist[u] + w

      steps.push({
        type: 'EXAMINE_NEIGHBOR',
        currentVisiting: u,
        examiningNeighbor: v,
        examinedEdge: { id: edgeId, from: u, to: v, w },
        dist: { ...dist },
        prev: { ...prev },
        visited: new Set(visited),
        desc: `Examining road "${uObj?.label}" ↔ "${vObj?.label}" (${w.toFixed(1)} km). Tentative total: ${tentative.toFixed(1)} km vs current ${dist[v] === Infinity ? '∞' : dist[v].toFixed(1)} km.`,
      })

      if (tentative < dist[v]) {
        dist[v] = tentative
        prev[v] = u

        steps.push({
          type: 'RELAX',
          currentVisiting: u,
          examiningNeighbor: v,
          examinedEdge: { id: edgeId, from: u, to: v, w },
          dist: { ...dist },
          prev: { ...prev },
          visited: new Set(visited),
          desc: `Relaxation: Shorter route found to "${vObj?.label}"! Updated distance to ${tentative.toFixed(1)} km via "${uObj?.label}".`,
        })
      }
    }
  }

  // Reconstruct path
  const path = []
  let curr = endId
  while (curr !== null) {
    path.unshift(curr)
    curr = prev[curr]
  }

  const reachable = path[0] === startId
  const totalCost = reachable ? dist[endId] : Infinity

  return {
    steps,
    path: reachable ? path : [],
    totalCost,
    finalDistances: dist,
  }
}

/**
 * Finds alternative simple paths between start and end.
 */
function findAlternativeRoutes(nodes, edges, startId, endId, optimalPath) {
  if (!optimalPath || optimalPath.length <= 1) return []

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(({ from, to, w }) => {
    if (adj[from] && adj[to]) {
      adj[from].push({ node: to, w })
      adj[to].push({ node: from, w })
    }
  })

  const allPaths = []

  function dfs(curr, target, visited, currentPath, currentCost) {
    if (curr === target) {
      allPaths.push({ path: [...currentPath], totalCost: currentCost })
      return
    }
    if (allPaths.length >= 8) return

    for (const { node: nxt, w } of adj[curr]) {
      if (!visited.has(nxt)) {
        visited.add(nxt)
        currentPath.push(nxt)
        dfs(nxt, target, visited, currentPath, currentCost + w)
        currentPath.pop()
        visited.delete(nxt)
      }
    }
  }

  const visited = new Set([startId])
  dfs(startId, endId, visited, [startId], 0)

  allPaths.sort((a, b) => a.totalCost - b.totalCost)
  const optimalKey = optimalPath.join('-')

  return allPaths.filter(p => p.path.join('-') !== optimalKey).slice(0, 2)
}

/* ════════════════════════════════════════════════════════════
   PAGE HEADER ICON
   ════════════════════════════════════════════════════════════ */

const MAPS_HEADER_ICON = (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5" fill="#f59e0b" opacity="0.9" />
    <circle cx="36" cy="12" r="5" fill="#00d4ff" opacity="0.8" />
    <circle cx="12" cy="36" r="5" fill="#a855f7" opacity="0.8" />
    <circle cx="36" cy="36" r="5" fill="#10b981" />
    <path d="M16 12H32" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 2" />
    <path d="M12 16V32" stroke="#a855f7" strokeWidth="2.5" />
    <path d="M16 36H32" stroke="#10b981" strokeWidth="3" />
    <path d="M16 15L32 33" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
)

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function GoogleMaps() {
  // Road network state
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS)
  const [roads, setRoads] = useState(DEFAULT_ROADS)

  // Presentation Mode State
  const [presMode, setPresMode] = useState(false)
  const [presStep, setPresStep] = useState(0)

  // Start & End selections
  const [startId, setStartId] = useState('college')
  const [endId, setEndId] = useState('airport')

  // Visual options
  const [showWeights, setShowWeights] = useState(true)
  const [showAltRoute, setShowAltRoute] = useState(false)

  // Interaction Modals/Forms
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [showAddRoad, setShowAddRoad] = useState(false)
  const [editingRoadId, setEditingRoadId] = useState(null)
  const [editRoadWeight, setEditRoadWeight] = useState('')

  // Add Location Form State
  const [newLocName, setNewLocName] = useState('')
  const [newLocCategory, setNewLocCategory] = useState('Point of Interest')
  const [newLocIcon, setNewLocIcon] = useState(ICON_PRESETS[0])
  const [newLocColor, setNewLocColor] = useState(COLOR_PRESETS[0])

  // Add Road Form State
  const [newRoadFrom, setNewRoadFrom] = useState('college')
  const [newRoadTo, setNewRoadTo] = useState('city_center')
  const [newRoadDist, setNewRoadDist] = useState('4.5')

  // Dijkstra Step Execution State
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Activity Log
  const [logs, setLogs] = useState(() => [
    { id: 1, time: '12:00:00', text: 'Road network initialized with 7 locations & 11 roads.' },
    { id: 2, time: '12:00:01', text: 'Select start/destination and click "Find Shortest Route".' },
  ])

  // Dragging state for map locations
  const [draggingId, setDraggingId] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const svgRef = useRef(null)

  const logEvent = useCallback((text) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [
      { id: Date.now() + Math.random(), time, text },
      ...prev.slice(0, 25),
    ])
  }, [])

  /* ────────────────────────────────────────────────────────────
     Dijkstra Computation & Playback State
     ──────────────────────────────────────────────────────────── */

  const dijkstraResult = useMemo(() => {
    if (startId === endId) return null
    return recordDijkstraExecution(locations, roads, startId, endId)
  }, [locations, roads, startId, endId])

  const steps = dijkstraResult?.steps || []
  const totalSteps = Math.max(0, steps.length - 1)

  // Clamped step index without cascading effect
  const stepIndex = Math.min(Math.max(0, currentStep), totalSteps)
  const activeStep = steps[stepIndex] || null

  // Alternative Routes
  const alternativeRoutes = useMemo(() => {
    if (!dijkstraResult || !dijkstraResult.path.length) return []
    return findAlternativeRoutes(locations, roads, startId, endId, dijkstraResult.path)
  }, [locations, roads, startId, endId, dijkstraResult])

  // Auto-play interval
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
    }, 450)

    return () => clearInterval(timer)
  }, [isPlaying, totalSteps])

  // Road network aggregate statistics
  const networkStats = useMemo(() => {
    const totalDist = roads.reduce((acc, r) => acc + r.w, 0)
    const avgDist = roads.length > 0 ? totalDist / roads.length : 0
    let minRoad = roads[0] || null
    let maxRoad = roads[0] || null
    roads.forEach(r => {
      if (!minRoad || r.w < minRoad.w) minRoad = r
      if (!maxRoad || r.w > maxRoad.w) maxRoad = r
    })
    return { totalDist, avgDist, minRoad, maxRoad }
  }, [roads])

  /* ────────────────────────────────────────────────────────────
     Action Handlers
     ──────────────────────────────────────────────────────────── */

  const handleFindRoute = () => {
    if (startId === endId) {
      logEvent('Start and Destination locations must be different.')
      return
    }
    setCurrentStep(0)
    setIsPlaying(true)
    const sName = locations.find(l => l.id === startId)?.label || startId
    const eName = locations.find(l => l.id === endId)?.label || endId
    logEvent(`Initiated Dijkstra route calculation from "${sName}" to "${eName}".`)
  }

  const handleJumpToFinal = () => {
    setIsPlaying(false)
    setCurrentStep(totalSteps)
    if (dijkstraResult && dijkstraResult.path.length > 0) {
      logEvent(`Shortest route found: ${dijkstraResult.totalCost.toFixed(1)} km via ${dijkstraResult.path.length - 1} roads.`)
    } else {
      logEvent('Destination is unreachable from selected start location.')
    }
  }

  const handleResetNetwork = () => {
    setLocations(DEFAULT_LOCATIONS)
    setRoads(DEFAULT_ROADS)
    setStartId('college')
    setEndId('airport')
    setCurrentStep(0)
    setIsPlaying(false)
    setShowAltRoute(false)
    logEvent('Road network reset to original 7 locations and default distances.')
  }

  // Add Location
  const handleAddLocationSubmit = (e) => {
    e.preventDefault()
    const name = newLocName.trim()
    if (!name) return

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') || `loc_${Date.now()}`
    if (locations.some(l => l.id === id)) {
      logEvent(`Location "${name}" already exists.`)
      return
    }

    // Place near center with slight offset
    const angle = Math.random() * Math.PI * 2
    const dist = 70 + Math.random() * 90
    const x = Math.round(Math.max(80, Math.min(640, 360 + Math.cos(angle) * dist)))
    const y = Math.round(Math.max(80, Math.min(420, 240 + Math.sin(angle) * dist)))

    const newLoc = {
      id,
      label: name,
      category: newLocCategory.trim() || 'Location',
      icon: newLocIcon,
      color: newLocColor,
      x,
      y,
    }

    setLocations(prev => [...prev, newLoc])
    setNewLocName('')
    setShowAddLocation(false)
    logEvent(`Added new location: "${name}".`)
  }

  // Add Road
  const handleAddRoadSubmit = (e) => {
    e.preventDefault()
    if (newRoadFrom === newRoadTo) {
      logEvent('A road must connect two different locations.')
      return
    }

    const distVal = parseFloat(newRoadDist)
    if (isNaN(distVal) || distVal <= 0) {
      logEvent('Road distance must be a positive number (> 0 km).')
      return
    }

    const exists = roads.some(
      r => (r.from === newRoadFrom && r.to === newRoadTo) || (r.from === newRoadTo && r.to === newRoadFrom)
    )
    if (exists) {
      logEvent('A road already connects these two locations.')
      return
    }

    const newRoad = {
      id: `road_${Date.now()}`,
      from: newRoadFrom,
      to: newRoadTo,
      w: Math.round(distVal * 10) / 10,
    }

    setRoads(prev => [...prev, newRoad])
    setShowAddRoad(false)
    const fn = locations.find(l => l.id === newRoadFrom)?.label || newRoadFrom
    const tn = locations.find(l => l.id === newRoadTo)?.label || newRoadTo
    logEvent(`Added road: "${fn}" ↔ "${tn}" (${newRoad.w} km).`)
  }

  // Edit Road Distance
  const handleSaveRoadDistance = (e) => {
    e.preventDefault()
    const distVal = parseFloat(editRoadWeight)
    if (isNaN(distVal) || distVal <= 0) {
      logEvent('Distance must be a positive number (> 0 km).')
      return
    }

    setRoads(prev => prev.map(r => (r.id === editingRoadId ? { ...r, w: Math.round(distVal * 10) / 10 } : r)))
    const rObj = roads.find(r => r.id === editingRoadId)
    const fn = locations.find(l => l.id === rObj?.from)?.label
    const tn = locations.find(l => l.id === rObj?.to)?.label
    logEvent(`Updated road distance for "${fn}" ↔ "${tn}" to ${distVal} km.`)
    setEditingRoadId(null)
  }

  // Remove Road
  const handleRemoveRoad = (roadId) => {
    const rObj = roads.find(r => r.id === roadId)
    setRoads(prev => prev.filter(r => r.id !== roadId))
    if (rObj) {
      const fn = locations.find(l => l.id === rObj.from)?.label || rObj.from
      const tn = locations.find(l => l.id === rObj.to)?.label || rObj.to
      logEvent(`Removed road between "${fn}" and "${tn}".`)
    }
  }

  /* ────────────────────────────────────────────────────────────
     SVG Canvas Dragging Handlers
     ──────────────────────────────────────────────────────────── */

  const getSvgCoordinates = (e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (720 / rect.width),
      y: (clientY - rect.top) * (480 / rect.height),
    }
  }

  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation()
    const loc = locations.find(l => l.id === id)
    if (!loc) return
    const pt = getSvgCoordinates(e)
    dragOffset.current = { x: pt.x - loc.x, y: pt.y - loc.y }
    setDraggingId(id)
  }

  const handleSvgMouseMove = (e) => {
    if (!draggingId) return
    const pt = getSvgCoordinates(e)
    const nx = Math.max(40, Math.min(680, pt.x - dragOffset.current.x))
    const ny = Math.max(40, Math.min(440, pt.y - dragOffset.current.y))

    setLocations(prev => prev.map(l => (l.id === draggingId ? { ...l, x: nx, y: ny } : l)))
  }

  const handleSvgMouseUp = () => {
    setDraggingId(null)
  }

  /* ────────────────────────────────────────────────────────────
     Road State Determinations
     ──────────────────────────────────────────────────────────── */

  const isEdgeInPath = useCallback((edge, path) => {
    if (!path || path.length < 2) return false
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === edge.from && path[i + 1] === edge.to) ||
        (path[i] === edge.to && path[i + 1] === edge.from)
      ) {
        return true
      }
    }
    return false
  }, [])

  const optimalPath = dijkstraResult?.path || []
  const primaryAltRoute = alternativeRoutes[0] || null

  return (
    <div className={`simulation-page ${presMode ? 'sim-layout--pres' : ''}`}>
      <PageHeader
        badge="Weighted Graph & Route Planning"
        badgeClass="amber"
        icon={MAPS_HEADER_ICON}
        title="Google Maps-Inspired Route Simulator"
        subtitle="Experience how modern route-planners model cities as weighted graphs. Run Dijkstra's algorithm step-by-step to see how shortest paths are finalized, distances are relaxed, and alternatives are evaluated."
        showHome
        presentationMode={presMode}
        onTogglePresentation={() => setPresMode(p => !p)}
        intro="Simulate shortest-path navigation on weighted graphs representing city road networks. Step through Dijkstra's algorithm to understand greedy vertex selection, edge relaxation, and alternative route calculations."
        concepts={[
          { label: 'Weighted Graph', desc: 'Locations are vertices; roads are edges with physical distances in km' },
          { label: 'Dijkstra\'s Algorithm', desc: 'Greedy exploration of nearest unvisited locations' },
          { label: 'Relaxation', desc: 'Overwriting tentative distance when a shorter detour is discovered' },
          { label: 'Fewest Roads ≠ Shortest', desc: 'Fewer hops can still be longer in total kilometers' },
          { label: 'Distance vs. Time', desc: 'Optimizes distance in km; real GPS also factors speed and traffic' },
        ]}
      />

      {presMode && (
        <PresentationBar
          slides={GOOGLE_MAPS_SLIDES}
          currentSlideIndex={presStep}
          onSlideChange={setPresStep}
          onClose={() => setPresMode(false)}
          badgeLabel="Google Maps Classroom Deck"
        />
      )}

      <section className="simulation-body section-sm">
        <div className="container">
          <div className="gm-layout">
            {/* ═══════════════ LEFT CONTROLS SIDEBAR ═══════════════ */}
            <aside className="gm-controls">
              {/* Route Planning Selector Card */}
              <div className="gm-card">
                <div className="gm-card-header">
                  <span className="gm-card-title">📍 Route Planner</span>
                  <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    Weighted Graph
                  </span>
                </div>

                <div className="sim-control-group">
                  <label className="sim-label">Starting Location</label>
                  <select
                    className="gm-select"
                    value={startId}
                    onChange={e => {
                      setStartId(e.target.value)
                      setCurrentStep(0)
                      setIsPlaying(false)
                    }}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.icon} {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sim-control-group" style={{ marginTop: '10px' }}>
                  <label className="sim-label">Destination</label>
                  <select
                    className="gm-select"
                    value={endId}
                    onChange={e => {
                      setEndId(e.target.value)
                      setCurrentStep(0)
                      setIsPlaying(false)
                    }}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.icon} {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Action Buttons */}
                <div className="gm-btn-grid" style={{ marginTop: '14px' }}>
                  <button className="btn btn-amber btn-sm" onClick={handleFindRoute} disabled={isPlaying}>
                    {isPlaying ? '⏳ Exploring…' : '▶ Find Shortest Route'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleJumpToFinal}>
                    ⏩ Final Result
                  </button>
                </div>

                {/* Step Player Controls */}
                <div className="gm-playback-bar">
                  <button
                    className="gm-play-btn"
                    onClick={() => {
                      setIsPlaying(false)
                      setCurrentStep(0)
                    }}
                    title="Replay from Step 0"
                  >
                    ↺
                  </button>
                  <button
                    className="gm-play-btn"
                    onClick={() => {
                      setIsPlaying(false)
                      setCurrentStep(prev => Math.max(0, prev - 1))
                    }}
                    disabled={stepIndex === 0}
                    title="Previous Step"
                  >
                    ⏮
                  </button>
                  <button
                    className={`gm-play-btn ${isPlaying ? 'gm-play-btn--active' : ''}`}
                    onClick={() => setIsPlaying(p => !p)}
                    title={isPlaying ? 'Pause' : 'Play animation'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button
                    className="gm-play-btn"
                    onClick={() => {
                      setIsPlaying(false)
                      setCurrentStep(prev => Math.min(totalSteps, prev + 1))
                    }}
                    disabled={stepIndex >= totalSteps}
                    title="Next Step"
                  >
                    ⏭
                  </button>
                  <div className="gm-step-indicator">
                    Step <strong>{stepIndex}</strong> / {totalSteps}
                  </div>
                </div>

                {/* Step Slider */}
                <div style={{ marginTop: '8px' }}>
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

                {/* Step Description Ticker */}
                <div className="gm-step-desc">
                  {activeStep?.desc || 'Select route and click "Find Shortest Route".'}
                </div>
              </div>

              {/* Road Network Editor Tools */}
              <div className="gm-card">
                <div className="gm-card-header">
                  <span className="gm-card-title">🛠️ Map & Road Editor</span>
                </div>

                <div className="gm-btn-grid">
                  <button
                    className={`mode-btn ${showAddLocation ? 'mode-btn--active' : ''}`}
                    onClick={() => {
                      setShowAddLocation(s => !s)
                      setShowAddRoad(false)
                    }}
                  >
                    {showAddLocation ? '✕ Close' : '📍 Add Location'}
                  </button>
                  <button
                    className={`mode-btn ${showAddRoad ? 'mode-btn--active' : ''}`}
                    onClick={() => {
                      setShowAddRoad(s => !s)
                      setShowAddLocation(false)
                    }}
                  >
                    {showAddRoad ? '✕ Close' : '🛣️ Add Road'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    className={`wg-toggle-btn ${showWeights ? 'wg-toggle-btn--in' : ''}`}
                    onClick={() => setShowWeights(v => !v)}
                    style={{ flex: 1 }}
                  >
                    {showWeights ? '👁 Distances ON' : '👁 Distances OFF'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleResetNetwork}>
                    ↺ Reset Map
                  </button>
                </div>

                {/* Add Location Form */}
                {showAddLocation && (
                  <form onSubmit={handleAddLocationSubmit} className="wg-add-form" style={{ marginTop: '10px' }}>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Location Name</label>
                      <input
                        type="text"
                        className="gm-text-input"
                        placeholder="e.g. Park, Stadium, Cafe"
                        value={newLocName}
                        onChange={e => setNewLocName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Category</label>
                      <input
                        type="text"
                        className="gm-text-input"
                        placeholder="e.g. Recreation, Transit"
                        value={newLocCategory}
                        onChange={e => setNewLocCategory(e.target.value)}
                      />
                    </div>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Icon</label>
                      <div className="wg-color-presets">
                        {ICON_PRESETS.map(ic => (
                          <button
                            key={ic}
                            type="button"
                            className={`btn btn-ghost btn-sm ${newLocIcon === ic ? 'btn-primary' : ''}`}
                            style={{ padding: '2px 5px', fontSize: '0.9rem' }}
                            onClick={() => setNewLocIcon(ic)}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Color Theme</label>
                      <div className="wg-color-presets">
                        {COLOR_PRESETS.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`wg-color-dot ${newLocColor === c ? 'wg-color-dot--active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setNewLocColor(c)}
                          />
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!newLocName.trim()}>
                      ➕ Add Location
                    </button>
                  </form>
                )}

                {/* Add Road Form */}
                {showAddRoad && (
                  <form onSubmit={handleAddRoadSubmit} className="wg-add-form" style={{ marginTop: '10px' }}>
                    <div className="gm-input-row">
                      <label className="gm-input-label">From</label>
                      <select
                        className="gm-select"
                        value={newRoadFrom}
                        onChange={e => setNewRoadFrom(e.target.value)}
                      >
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="gm-input-row">
                      <label className="gm-input-label">To</label>
                      <select
                        className="gm-select"
                        value={newRoadTo}
                        onChange={e => setNewRoadTo(e.target.value)}
                      >
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Distance (km)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        className="gm-text-input"
                        value={newRoadDist}
                        onChange={e => setNewRoadDist(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      ➕ Add Road
                    </button>
                  </form>
                )}

                {/* Edit Road Distance Inline Form */}
                {editingRoadId && (
                  <form onSubmit={handleSaveRoadDistance} className="wg-add-form" style={{ marginTop: '10px' }}>
                    <div className="gm-input-row">
                      <label className="gm-input-label">Edit Road Distance (km)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        className="gm-text-input"
                        value={editRoadWeight}
                        onChange={e => setEditRoadWeight(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        Save Distance
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingRoadId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Manage Roads List */}
                <div style={{ marginTop: '12px' }}>
                  <label className="sim-label" style={{ fontSize: '0.68rem', marginBottom: '4px', display: 'block' }}>
                    Roads & Distances ({roads.length})
                  </label>
                  <div className="gm-manage-list">
                    {roads.map(r => {
                      const fn = locations.find(l => l.id === r.from)?.label || r.from
                      const tn = locations.find(l => l.id === r.to)?.label || r.to
                      return (
                        <div key={r.id} className="gm-manage-row">
                          <span>{fn} ↔ {tn}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: 'var(--color-amber)', fontFamily: 'monospace' }}>
                              {r.w} km
                            </strong>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '1px 5px', fontSize: '0.68rem' }}
                              onClick={() => {
                                setEditingRoadId(r.id)
                                setEditRoadWeight(r.w.toString())
                              }}
                              title="Edit distance"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '1px 5px', fontSize: '0.68rem', color: '#ef4444' }}
                              onClick={() => handleRemoveRoad(r.id)}
                              title="Remove road"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Tentative Distance Table from Start */}
              {activeStep && (
                <div className="gm-card">
                  <div className="gm-card-header">
                    <span className="gm-card-title">
                      📏 Distances from {locations.find(l => l.id === startId)?.label}
                    </span>
                  </div>
                  <div className="gm-dist-table">
                    {locations.map(n => {
                      const d = activeStep.dist[n.id]
                      const isVisited = activeStep.visited.has(n.id)
                      const isOptimal = optimalPath.includes(n.id) && stepIndex === totalSteps
                      return (
                        <div
                          key={n.id}
                          className={`gm-dist-row ${isOptimal ? 'gm-dist-row--path' : ''}`}
                        >
                          <span style={{ color: n.color, fontWeight: 600 }}>
                            {n.icon} {n.label}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: isVisited ? '#10b981' : 'var(--color-text-muted)' }}>
                            {isVisited ? '✓ finalized' : 'unvisited'}
                          </span>
                          <span className="gm-dist-val">
                            {d === Infinity ? '∞' : `${d.toFixed(1)} km`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Live Road Network Stats */}
              <div className="sim-stats-card">
                <div className="sim-stats-header">
                  <span className="sim-stats-icon">📊</span>
                  <span className="sim-stats-title">Live Road Network Stats</span>
                </div>
                <div className="sim-stats-grid">
                  <div className="sim-stat-box">
                    <div className="sim-stat-num">{locations.length}</div>
                    <div className="sim-stat-lbl">Locations (V)</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-amber)' }}>{roads.length}</div>
                    <div className="sim-stat-lbl">Roads (E)</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-emerald)' }}>
                      {dijkstraResult?.totalCost != null ? `${dijkstraResult.totalCost.toFixed(1)} km` : '∞'}
                    </div>
                    <div className="sim-stat-lbl">Shortest Route</div>
                  </div>
                  <div className="sim-stat-box">
                    <div className="sim-stat-num" style={{ color: 'var(--color-cyan)' }}>
                      {networkStats.avgDist.toFixed(1)} km
                    </div>
                    <div className="sim-stat-lbl">Avg Road Dist</div>
                  </div>
                </div>
                <div className="sim-stats-meta" style={{ marginTop: '12px' }}>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Total Road Network:</span>
                    <span className="sim-stat-row-value">{networkStats.totalDist.toFixed(1)} km</span>
                  </div>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Optimal Hop Count:</span>
                    <span className="sim-stat-row-value">{optimalPath.length > 0 ? `${optimalPath.length - 1} roads` : 'N/A'}</span>
                  </div>
                  <div className="sim-stat-row">
                    <span className="sim-stat-row-label">Algorithm Status:</span>
                    <span className="sim-stat-row-value" style={{ color: activeStep?.type === 'FINISHED' || activeStep?.type === 'DESTINATION_REACHED' ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
                      {activeStep?.type || 'READY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Log Card */}
              <div className="gm-card">
                <div className="gm-card-header">
                  <span className="gm-card-title">📋 Simulation Log</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '1px 6px', fontSize: '0.7rem' }}
                    onClick={() => setLogs([])}
                  >
                    Clear
                  </button>
                </div>
                <div className="activity-log">
                  {logs.map(log => (
                    <div key={log.id} className="activity-log-line">
                      <span style={{ color: 'var(--color-text-muted)' }}>[{log.time}] </span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ═══════════════ RIGHT MAP CANVAS & ROUTE COMPARISON ═══════════════ */}
            <div className="gm-canvas-container">
              {/* Interactive City Road Map */}
              <div className="gm-canvas-wrap">
                <div className="gm-canvas-header">
                  <div className="gm-canvas-title">
                    <span>🗺️ City Road Network Map</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      Undirected Weighted Graph
                    </span>
                  </div>
                  <div className="gm-canvas-stats">
                    <span><strong>{locations.length}</strong> locations</span>
                    <span>·</span>
                    <span><strong>{roads.length}</strong> roads</span>
                    <span>·</span>
                    <span>Step <strong>{stepIndex}</strong> of {totalSteps}</span>
                  </div>
                </div>

                <svg
                  ref={svgRef}
                  className="gm-svg"
                  viewBox="0 0 720 480"
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onMouseLeave={handleSvgMouseUp}
                >
                  <defs>
                    {locations.map(n => (
                      <radialGradient key={n.id} id={`gm-glow-${n.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={n.color} stopOpacity="0.4" />
                        <stop offset="70%" stopColor={n.color} stopOpacity="0.08" />
                        <stop offset="100%" stopColor={n.color} stopOpacity="0" />
                      </radialGradient>
                    ))}
                  </defs>

                  {/* Roads / Edges */}
                  {roads.map(road => {
                    const fn = locations.find(l => l.id === road.from)
                    const tn = locations.find(l => l.id === road.to)
                    if (!fn || !tn) return null

                    const isFinalPath = stepIndex === totalSteps && isEdgeInPath(road, optimalPath)
                    const isAltPath = showAltRoute && primaryAltRoute && isEdgeInPath(road, primaryAltRoute.path)

                    const isExamining =
                      activeStep?.type === 'EXAMINE_NEIGHBOR' &&
                      ((activeStep.currentVisiting === road.from && activeStep.examiningNeighbor === road.to) ||
                        (activeStep.currentVisiting === road.to && activeStep.examiningNeighbor === road.from))

                    const isRelaxed =
                      activeStep?.type === 'RELAX' &&
                      ((activeStep.currentVisiting === road.from && activeStep.examiningNeighbor === road.to) ||
                        (activeStep.currentVisiting === road.to && activeStep.examiningNeighbor === road.from))

                    const midX = (fn.x + tn.x) / 2
                    const midY = (fn.y + tn.y) / 2

                    let roadClass = 'gm-road gm-road--default'
                    if (isFinalPath) roadClass = 'gm-road gm-road--path'
                    else if (isRelaxed) roadClass = 'gm-road gm-road--relaxed'
                    else if (isExamining) roadClass = 'gm-road gm-road--examining'
                    else if (isAltPath) roadClass = 'gm-road gm-road--alt-path'

                    return (
                      <g key={road.id}>
                        {/* Outer road casing */}
                        <line
                          x1={fn.x}
                          y1={fn.y}
                          x2={tn.x}
                          y2={tn.y}
                          className="gm-road-casing"
                          strokeWidth={isFinalPath ? 10 : 7}
                        />

                        {/* Inner road surface */}
                        <line
                          x1={fn.x}
                          y1={fn.y}
                          x2={tn.x}
                          y2={tn.y}
                          className={roadClass}
                          onClick={() => {
                            setEditingRoadId(road.id)
                            setEditRoadWeight(road.w.toString())
                          }}
                        />

                        {/* Road Distance Badge */}
                        {showWeights && (
                          <g
                            className={`gm-weight-badge ${isFinalPath ? 'gm-weight-badge--path' : ''}`}
                            transform={`translate(${midX}, ${midY})`}
                            onClick={() => {
                              setEditingRoadId(road.id)
                              setEditRoadWeight(road.w.toString())
                            }}
                          >
                            <rect
                              x="-18"
                              y="-9"
                              width="36"
                              height="18"
                              className="gm-weight-rect"
                            />
                            <text
                              x="0"
                              y="0"
                              className="gm-weight-text"
                            >
                              {road.w} km
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}

                  {/* Location Nodes */}
                  {locations.map(loc => {
                    const isStart = loc.id === startId
                    const isEnd = loc.id === endId
                    const isVisiting = activeStep?.currentVisiting === loc.id
                    const isVisited = activeStep?.visited?.has(loc.id)
                    const inOptimalPath = stepIndex === totalSteps && optimalPath.includes(loc.id)
                    const dist = activeStep?.dist[loc.id]

                    return (
                      <g
                        key={loc.id}
                        className="gm-node-group"
                        transform={`translate(${loc.x}, ${loc.y})`}
                        onMouseDown={e => handleNodeMouseDown(e, loc.id)}
                      >
                        {/* Glow halo */}
                        <circle cx="0" cy="0" r="38" fill={`url(#gm-glow-${loc.id})`} />

                        {/* Visiting animation pulse ring */}
                        {isVisiting && (
                          <circle
                            cx="0"
                            cy="0"
                            r="34"
                            fill="none"
                            stroke="#f59e0b"
                            className="gm-node-pulse"
                          />
                        )}

                        {/* Optimal path ring */}
                        {inOptimalPath && (
                          <circle
                            cx="0"
                            cy="0"
                            r="32"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            opacity="0.9"
                          />
                        )}

                        {/* Start / End Boundary Rings */}
                        {(isStart || isEnd) && (
                          <circle
                            cx="0"
                            cy="0"
                            r="30"
                            fill="none"
                            stroke={isStart ? '#10b981' : '#ef4444'}
                            strokeWidth="3"
                          />
                        )}

                        {/* Node Body */}
                        <circle
                          cx="0"
                          cy="0"
                          r="22"
                          fill={loc.color}
                          fillOpacity={isVisited || inOptimalPath ? 0.95 : 0.75}
                          stroke={isVisited ? '#fff' : loc.color}
                          strokeWidth="2"
                        />

                        {/* Location Icon */}
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fontSize="13"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {loc.icon}
                        </text>

                        {/* Location Label */}
                        <text
                          x="0"
                          y="-30"
                          textAnchor="middle"
                          fontFamily="Inter, sans-serif"
                          fontWeight="700"
                          fontSize="11"
                          fill={loc.color}
                          style={{ pointerEvents: 'none', textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}
                        >
                          {loc.label}
                        </text>

                        {/* Start / End Marker Pill */}
                        {isStart && (
                          <g transform="translate(0, 32)">
                            <rect x="-24" y="-8" width="48" height="16" rx="8" fill="#10b981" />
                            <text x="0" y="3" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#050b18">
                              START
                            </text>
                          </g>
                        )}

                        {isEnd && (
                          <g transform="translate(0, 32)">
                            <rect x="-22" y="-8" width="44" height="16" rx="8" fill="#ef4444" />
                            <text x="0" y="3" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff">
                              END
                            </text>
                          </g>
                        )}

                        {/* Current tentative distance badge */}
                        {!isStart && !isEnd && dist !== undefined && dist !== Infinity && (
                          <g transform="translate(0, 32)">
                            <rect
                              x="-22"
                              y="-7"
                              width="44"
                              height="14"
                              rx="7"
                              fill="rgba(5, 11, 24, 0.9)"
                              stroke={inOptimalPath ? '#10b981' : 'rgba(255,255,255,0.15)'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="700"
                              fill={inOptimalPath ? '#10b981' : '#f59e0b'}
                              fontFamily="monospace"
                            >
                              {dist.toFixed(1)} km
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* ═══════════════ SECTION 4: ROUTE COMPARISON ═══════════════ */}
              <div className="gm-routes-grid">
                {/* Shortest Route Card */}
                <div className="gm-route-card gm-route-card--optimal">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="gm-route-badge gm-route-badge--optimal">
                      🏆 Shortest Route (Dijkstra)
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      {optimalPath.length > 0 ? `${optimalPath.length - 1} roads` : 'No route'}
                    </span>
                  </div>

                  <div className="gm-route-dist" style={{ color: '#10b981' }}>
                    {dijkstraResult?.totalCost === Infinity || !optimalPath.length
                      ? '∞ Unreachable'
                      : `${dijkstraResult.totalCost.toFixed(1)} km`}
                  </div>

                  {optimalPath.length > 0 ? (
                    <div className="gm-route-seq">
                      {optimalPath.map((id, idx) => {
                        const loc = locations.find(l => l.id === id)
                        return (
                          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span className="gm-seq-pill" style={{ color: loc?.color }}>
                              {loc?.icon} {loc?.label}
                            </span>
                            {idx < optimalPath.length - 1 && <span className="gm-seq-arrow">➔</span>}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      No road path connects the selected start and destination.
                    </p>
                  )}
                </div>

                {/* Alternative Route Card */}
                <div className="gm-route-card gm-route-card--alt">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="gm-route-badge gm-route-badge--alt">
                      🔄 Alternative Route
                    </span>
                    {primaryAltRoute && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        onClick={() => setShowAltRoute(v => !v)}
                      >
                        {showAltRoute ? 'Hide on Map' : 'Show on Map'}
                      </button>
                    )}
                  </div>

                  {primaryAltRoute ? (
                    <>
                      <div className="gm-route-dist" style={{ color: '#a78bfa' }}>
                        {primaryAltRoute.totalCost.toFixed(1)} km{' '}
                        <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>
                          (+{(primaryAltRoute.totalCost - dijkstraResult.totalCost).toFixed(1)} km longer)
                        </span>
                      </div>
                      <div className="gm-route-seq">
                        {primaryAltRoute.path.map((id, idx) => {
                          const loc = locations.find(l => l.id === id)
                          return (
                            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span className="gm-seq-pill" style={{ color: loc?.color }}>
                                {loc?.icon} {loc?.label}
                              </span>
                              {idx < primaryAltRoute.path.length - 1 && <span className="gm-seq-arrow">➔</span>}
                            </span>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        No viable alternative detour available in the current road network topology.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ SECTION 5: EDUCATIONAL EXPLANATIONS ═══════════════ */}
          <div className="gm-edu-grid">
            {/* Card 1: Weighted Graphs */}
            <div className="gm-edu-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gm-edu-icon">🗺️</div>
                <h3 className="gm-edu-title">Weighted Graphs in Road Mapping</h3>
              </div>
              <p className="gm-edu-text">
                Road networks are modeled as <strong>weighted graphs</strong> (G = (V, E, W)).
                Each intersection or landmark is a vertex (v in V), each connecting street is an edge (e in E),
                and the physical length is a <strong>numerical weight</strong> in kilometers (w &gt; 0).
              </p>
              <p className="gm-edu-text">
                In unweighted graphs, every step counts as 1 hop. In weighted graphs, paths are evaluated by their
                <strong> total accumulated distance sum</strong>: Σ w(e) along all traversed edges.
              </p>
            </div>

            {/* Card 2: Fewest Roads ≠ Shortest Distance */}
            <div className="gm-edu-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gm-edu-icon">⚖️</div>
                <h3 className="gm-edu-title">Why Fewest Roads ≠ Smallest Distance</h3>
              </div>
              <p className="gm-edu-text">
                A common intuition is that the route with the fewest turns or fewest roads is always the shortest.
                However, a direct 1-segment highway could stretch for <strong>20.0 km</strong>, while a 2-segment local
                bypass might only take <strong>6.0 km + 7.0 km = 13.0 km</strong>.
              </p>
              <p className="gm-edu-text">
                Breadth-First Search (BFS) only minimizes the number of edges (hops), whereas <strong>Dijkstra&apos;s algorithm</strong>
                finds the path that minimizes the actual total kilometers.
              </p>
            </div>

            {/* Card 3: Dijkstra & Relaxation */}
            <div className="gm-edu-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gm-edu-icon">⚡</div>
                <h3 className="gm-edu-title">Greedy Selection & Edge Relaxation</h3>
              </div>
              <p className="gm-edu-text">
                Dijkstra&apos;s algorithm operates with two core mathematical principles:
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
                <li>
                  <strong>Greedy Choice:</strong> It always extracts the unvisited vertex with the smallest tentative distance from the source.
                </li>
                <li>
                  <strong>Edge Relaxation:</strong> For each neighbor v of current node u, if dist[u] + w(u, v) &lt; dist[v], the algorithm updates dist[v] with the shorter detour.
                </li>
              </ul>
              <p className="gm-edu-text">
                Because edge weights are non-negative ($w \ge 0$), once a node is finalized, its shortest distance is guaranteed to never decrease.
              </p>
            </div>

            {/* Card 4: Distance vs Travel Time */}
            <div className="gm-edu-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gm-edu-icon">⏱️</div>
                <h3 className="gm-edu-title">Distance (km) vs. Real-World Travel Time</h3>
              </div>
              <p className="gm-edu-text">
                In this educational simulation, edge weights represent <strong>physical distance in kilometers</strong>.
                Therefore, Dijkstra strictly finds the shortest physical path.
              </p>
              <p className="gm-edu-text">
                In real GPS systems, edge weights are dynamic costs: time = (distance / speed limit) + traffic delay.
                A longer highway route can often be faster than a shorter city street route with stoplights and heavy traffic.
              </p>
            </div>

            {/* Educational Disclaimer Callout */}
            <div className="gm-disclaimer-box">
              <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚠️</div>
              <div>
                <h4 className="gm-disclaimer-title">Educational Route-Planning Simulation Disclaimer</h4>
                <p className="gm-disclaimer-text">
                  This application is a pure algorithmic simulation of Dijkstra&apos;s shortest path algorithm on an idealized weighted graph.
                  It is built strictly for computer science and graph theory education. It does <strong>not</strong> connect to Google Maps APIs, GPS satellites, live traffic feeds, road closures, or commercial navigation servers.
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════ SECTION 6: WHAT DID WE LEARN? ═══════════════ */}
          <div className="learning-summary-section">
            <div className="learning-summary-header">
              <div className="learning-summary-badge">🎓 Core Discrete Math Takeaways</div>
              <h2 className="learning-summary-title">What Did We Learn About Weighted Graphs & Dijkstra?</h2>
              <p className="learning-summary-sub">
                Key conceptual principles connecting weighted graphs, shortest-path optimization, and real-world GPS navigation systems.
              </p>
            </div>

            <div className="learning-takeaways-grid">
              <div className="takeaway-card">
                <div className="takeaway-card-icon">🗺️</div>
                <h3 className="takeaway-card-title">1. Weighted Graphs G = (V, E, W)</h3>
                <p className="takeaway-card-desc">
                  Physical roads cannot be represented by simple unweighted graphs. Adding non-negative numerical weights (W) reflects physical distance in kilometers, enabling algorithms to evaluate accumulated sum of edge weights rather than raw topological hop counts.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">⚡</div>
                <h3 className="takeaway-card-title">2. Greedy Strategy & Non-Negative Weights</h3>
                <p className="takeaway-card-desc">
                  Dijkstra's algorithm greedily finalizes the unvisited node with the smallest tentative distance. Because all weights are non-negative (w ≥ 0), this tentative value is guaranteed to be globally minimal, eliminating the need to ever reconsider visited vertices.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🔄</div>
                <h3 className="takeaway-card-title">3. Edge Relaxation Principle</h3>
                <p className="takeaway-card-desc">
                  The core update rule dist[v] = min(dist[v], dist[u] + w(u, v)) checks if passing through current vertex u provides a shorter detour to neighbor v. If so, the tentative distance is relaxed downwards and predecessor pointers are recorded to reconstruct the optimal path.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">⚖️</div>
                <h3 className="takeaway-card-title">4. Fewest Roads ≠ Shortest Distance</h3>
                <p className="takeaway-card-desc">
                  A common misconception is that the path with fewer turns or segments is always shortest. BFS minimizes hops, but in weighted road networks, a multi-segment detour (e.g., 4 km + 3 km) is frequently shorter than a direct long highway (e.g., 12 km).
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">⏱️</div>
                <h3 className="takeaway-card-title">5. Physical Distance vs. Travel Time</h3>
                <p className="takeaway-card-desc">
                  Our simulator optimizes physical distance in kilometers. Commercial navigation engines replace distance with travel time (w = distance / speed limit + traffic delays), demonstrating that graph algorithms adapt seamlessly across different cost metrics.
                </p>
              </div>

              <div className="takeaway-card">
                <div className="takeaway-card-icon">🏝️</div>
                <h3 className="takeaway-card-title">6. Disconnected Components & Robustness</h3>
                <p className="takeaway-card-desc">
                  When road networks contain isolated islands or broken bridges, unreachable vertices retain an infinite distance (dist[v] = ∞). Reliable navigation systems detect these unreachable states and alert travelers to impossible routes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
