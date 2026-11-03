import { Collapse, Stage, type Act } from '../../kit'
import { Check, ChevronDown, Ellipsis, FileCode2, FlaskConical, ListFilter, Maximize2, Minus, Plus, RefreshCw, Search, X } from 'lucide-react'
import { Composer, ProjectLine, Topbar } from '../qure-shared/parts'
import './coverage.css'

// Qure: the Tests workspace switches to the Coverage map (CoverageMapView.tsx,
// coverage-map-graph.ts). Project, feature and test nodes; covered nodes in
// slate, features without mapped tests in red; hover highlights neighbours and
// dims the rest; a click selects (mint ring) and opens the node details.

type NodeId = string
type S = {
  menu: boolean
  menuHover: 'tests' | 'map' | null
  view: 'tests' | 'map'
  grown: boolean
  hover: NodeId | null
  selected: NodeId | null
}

const initial: S = { menu: false, menuHover: null, view: 'tests', grown: false, hover: null, selected: null }
const poster: S = { menu: false, menuHover: null, view: 'map', grown: true, hover: null, selected: 'reports' }

async function script(a: Act<S>) {
  await a.wait(300)
  a.mark('menu')
  await a.move({ at: 'view-title', x: 0.45, y: 0.55 })
  await a.click()
  await a.set({ menu: true })
  await a.wait(300)
  await a.move({ at: 'menu-map', x: 0.3, y: 0.5 })
  a.put({ menuHover: 'map' })
  await a.wait(200)
  await a.click()
  a.put({ menu: false, menuHover: null, view: 'map' })
  await a.wait(150)
  a.mark('map')
  a.put({ grown: true })
  void a.move({ x: 470, y: 380 })
  await a.wait(1700)
  a.mark('hover')
  await a.move({ at: 'node-contacts', x: 0.5, y: 0.5 })
  a.put({ hover: 'contacts' })
  await a.wait(700)
  await a.click()
  a.put({ selected: 'contacts' })
  await a.wait(1300)
  a.mark('reports')
  a.put({ hover: null })
  await a.move({ at: 'node-reports', x: 0.5, y: 0.5 })
  a.put({ hover: 'reports' })
  await a.wait(600)
  await a.click()
  a.put({ selected: 'reports' })
  await a.wait(500)
  a.put({ hover: null })
  await a.move({ x: 470, y: 400 })
  await a.wait(2500)
}

// ---- The graph, laid out the way branchGraphPositions does: project in the
// middle, features on a ring, each feature's tests fanned outward ----
type GNode = { id: string; label: string; kind: 'project' | 'feature' | 'test'; x: number; y: number; tests: number; uncovered?: boolean; parent?: string }

const C = { x: 170, y: 126 }
const FEATURES = [
  { id: 'contacts', label: 'Contacts', angle: -95, tests: 6 },
  { id: 'deals', label: 'Deals', angle: -25, tests: 4 },
  { id: 'email', label: 'Email', angle: 45, tests: 2 },
  { id: 'reports', label: 'Reports', angle: 200, tests: 0, uncovered: true },
  { id: 'import', label: 'Import', angle: 160, tests: 0, uncovered: true },
]
const RF = 84
const RT = 34
const rad = (d: number) => (d * Math.PI) / 180

const NODES: GNode[] = [{ id: 'project', label: 'crm-app', kind: 'project', x: C.x, y: C.y, tests: 12 }]
for (const f of FEATURES) {
  const fx = C.x + Math.cos(rad(f.angle)) * RF
  const fy = C.y + Math.sin(rad(f.angle)) * RF
  NODES.push({ id: f.id, label: f.label, kind: 'feature', x: fx, y: fy, tests: f.tests, uncovered: f.uncovered, parent: 'project' })
  const spread = Math.min(130, Math.max(32, f.tests * 22))
  for (let i = 0; i < f.tests; i++) {
    const off = f.tests === 1 ? 0 : (i / (f.tests - 1) - 0.5) * spread
    NODES.push({ id: `${f.id}-t${i}`, label: '', kind: 'test', x: fx + Math.cos(rad(f.angle + off)) * RT, y: fy + Math.sin(rad(f.angle + off)) * RT, tests: 1, parent: f.id })
  }
}
const BY_ID = new Map(NODES.map((n) => [n.id, n]))
const EDGES = NODES.filter((n) => n.parent).map((n) => ({ id: `${n.parent}-${n.id}`, source: n.parent!, target: n.id }))

// Real radii scaled to the small canvas
const SCALE = 0.72
const radius = (n: GNode) => (n.kind === 'project' ? 18 : Math.min(14, 7 + Math.sqrt(Math.max(1, n.tests)) * 1.5)) * SCALE

function neighbours(id: string | null) {
  if (!id) return null
  const set = new Set([id])
  for (const e of EDGES) {
    if (e.source === id) set.add(e.target)
    if (e.target === id) set.add(e.source)
  }
  return set
}

const DETAILS: Record<string, { title: string; text: string; evidence: string; tests: number; plan?: boolean }> = {
  contacts: { title: 'Contacts', text: 'Create, edit, merge and archive contacts.', evidence: 'Verified', tests: 6 },
  reports: { title: 'Reports', text: 'Build and export pipeline reports.', evidence: 'Unknown', tests: 0, plan: true },
}

function Graph({ s }: { s: S }) {
  const near = neighbours(s.hover)
  const order = (n: GNode) => (n.kind === 'project' ? 0 : n.kind === 'feature' ? 1 + FEATURES.findIndex((f) => f.id === n.id) : 7 + FEATURES.findIndex((f) => f.id === n.parent))
  return (
    <svg className="qm-svg" width={472} height={262} data-grown={s.grown || undefined}>
      {EDGES.map((e) => {
        const a = BY_ID.get(e.source)!
        const b = BY_ID.get(e.target)!
        const lit = near ? near.has(e.source) && near.has(e.target) : false
        const faded = near !== null && !lit
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        return (
          <line
            key={e.id}
            className="qm-edge"
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeWidth={lit ? 2.5 * 0.8 : 1.2 * 0.8}
            style={{ opacity: faded ? 0.08 : 0.42, strokeDasharray: len, ['--len' as string]: len, transitionDelay: s.grown && !near ? `${order(b) * 110 + 80}ms, 0ms, 0ms` : '0ms' }}
          />
        )
      })}
      {NODES.map((n) => {
        const faded = near !== null && !near.has(n.id)
        const selected = s.selected === n.id
        const r = radius(n)
        const color = n.uncovered ? '#ef4444' : '#475569'
        const labelVisible = n.kind !== 'test' || s.hover === n.id
        return (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`} data-target={n.kind === 'feature' ? `node-${n.id}` : undefined} data-cursor="pointer">
            <g className="qm-node" style={{ opacity: faded ? 0.14 : 1, transitionDelay: s.grown && !near ? `${order(n) * 110}ms` : '0ms' }}>
              <circle className="qm-circle" r={selected ? r + 5 * SCALE : r} fill={color} fillOpacity={n.uncovered ? 0.9 : 0.62} stroke={selected ? 'var(--q-brand)' : color} strokeWidth={selected ? 4 * SCALE : 2 * SCALE} />
              {labelVisible && n.label && (
                <text className="qm-label" y={r + 13} textAnchor="middle" fontSize={n.kind === 'project' ? 12 : 10.5} fontWeight={n.kind === 'project' ? 650 : 450}>
                  {n.label}
                </text>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}

const TEST_ROWS = [
  { n: 'Create a contact', f: 'contacts.spec.ts' },
  { n: 'Merge duplicate contacts', f: 'contacts.spec.ts' },
  { n: 'Move a deal to Won', f: 'deals.spec.ts' },
  { n: 'Send a follow-up email', f: 'email.spec.ts' },
]

export default function QureCoverage() {
  return (
    <Stage width={800} height={450} initial={initial} poster={poster} script={script} play="once" theme="dark" accent="#7fd6c8" cursor={{ at: { x: 470, y: 380 } }} className="qr qm">
      {(s) => {
        const d = s.selected ? DETAILS[s.selected] : null
        return (
          <div className="q-app qm-app">
            <Topbar>
              <span className="q-top-sep" />
              <span className="q-tabs">
                <span className="q-tab" data-active>
                  <FlaskConical size={14} strokeWidth={1.75} />
                  Tests
                </span>
              </span>
            </Topbar>

            <aside className="q-chat">
              <div className="q-list">
                <div className="q-user">
                  <div className="q-bubble">Which features have no tests yet?</div>
                </div>
                <div className="q-gap">
                  <div className="q-md qm-quiet">Reports and Import have no mapped tests. Contacts and Deals pass in the last run.</div>
                </div>
              </div>
              <ProjectLine />
              <Composer />
            </aside>

            <main className="qm-work">
              <div className="qm-head">
                <span className="qm-title" data-target="view-title" data-cursor="pointer">
                  {s.view === 'tests' ? 'Tests' : 'Coverage map'}
                  <ChevronDown size={16} strokeWidth={1.75} />
                </span>
                {s.view === 'tests' ? <span className="qm-count">13</span> : (
                  <span className="q-ib qm-small qm-pop">
                    <RefreshCw size={14} strokeWidth={1.75} />
                  </span>
                )}
                <span className="qm-actions">
                  <span className="q-ib">
                    <Search size={16} strokeWidth={1.75} />
                  </span>
                  <span className="q-ib">
                    <ListFilter size={16} strokeWidth={1.75} />
                  </span>
                </span>
              </div>

              {/* Header view menu (TestsWorkspaceViewMenu.tsx) */}
              <div className="qm-menu" data-open={s.menu || undefined}>
                <span className="qm-menu-item" data-hover-on={s.menuHover === 'tests' || undefined}>
                  Tests
                  <Check size={14} strokeWidth={2} />
                </span>
                <span className="qm-menu-item" data-target="menu-map" data-hover-on={s.menuHover === 'map' || undefined}>
                  Map
                </span>
                <span className="qm-menu-item">Runs</span>
                <span className="qm-menu-item">Insights</span>
              </div>

              <div className="qm-body">
                <div className="qm-list" data-hidden={s.view === 'map' || undefined}>
                  {TEST_ROWS.map((t) => (
                    <div key={t.n} className="qm-trow">
                      <FileCode2 size={14} strokeWidth={1.75} />
                      <span className="qm-trow-name">{t.n}</span>
                      <span className="qm-trow-file">{t.f}</span>
                    </div>
                  ))}
                  <div className="qm-trow">
                    <FileCode2 size={14} strokeWidth={1.75} />
                    <span className="qm-fill" style={{ width: 130 }} />
                  </div>
                  <div className="qm-trow">
                    <FileCode2 size={14} strokeWidth={1.75} />
                    <span className="qm-fill" style={{ width: 96 }} />
                  </div>
                </div>

                <div className="qm-canvas" data-show={s.view === 'map' || undefined}>
                  <Graph s={s} />
                  {/* Zoom controls, top right */}
                  <div className="qm-zoom">
                    <span>
                      <Plus size={14} strokeWidth={1.75} />
                    </span>
                    <span>
                      <Minus size={14} strokeWidth={1.75} />
                    </span>
                    <span>
                      <Maximize2 size={13} strokeWidth={1.75} />
                    </span>
                  </div>
                  {/* Legend, bottom left */}
                  <div className="qm-legend">
                    <div className="qm-legend-title">Feature coverage</div>
                    <span>
                      <i style={{ background: '#475569', opacity: 0.62 }} />
                      Mapped feature
                    </span>
                    <span>
                      <i style={{ background: '#ef4444' }} />
                      No mapped tests
                    </span>
                  </div>
                  {/* Node details */}
                  <div className="qm-detail" data-show={d ? true : undefined}>
                    {(d ?? DETAILS.contacts) && (
                      <DetailCard d={d ?? DETAILS.contacts} k={s.selected ?? 'contacts'} />
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        )
      }}
    </Stage>
  )
}

function DetailCard({ d, k }: { d: (typeof DETAILS)[string]; k: string }) {
  return (
    <div className="qm-card" key={k}>
      <div className="qm-card-head">
        <span className="qm-card-title">{d.title}</span>
        <Ellipsis size={15} strokeWidth={1.75} />
        <X size={15} strokeWidth={1.75} />
      </div>
      <div className="qm-card-body">
        <div className="qm-card-text">{d.text}</div>
        <div className="qm-dl">
          <span>
            <i>Evidence</i>
            <b>{d.evidence}</b>
          </span>
          <span>
            <i>Tests</i>
            <b>{d.tests}</b>
          </span>
        </div>
      </div>
      <Collapse open={!!d.plan}>
        <div className="qm-card-foot">
          <span className="qm-plan">Plan test coverage</span>
        </div>
      </Collapse>
    </div>
  )
}
