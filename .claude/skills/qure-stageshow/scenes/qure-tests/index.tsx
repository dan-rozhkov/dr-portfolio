import { Collapse, Stage, type Act } from '../../kit'
import {
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  FileCode2,
  FlaskConical,
  Folder,
  Globe,
  ListFilter,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShoppingCart,
  SkipBack,
  SkipForward,
  Video,
} from 'lucide-react'
import { AgentCursor, Composer, ICON, ProjectLine, Topbar, pt } from '../qure-shared/parts'
import './tests.css'

// Qure Tests workspace: open a folder, open a test on a full page, and watch
// its last run replay with the agent's mint cursor while the steps tick off.

const STEPS = ['Open cart', 'Apply coupon', 'Pay with saved card', 'See confirmation']

type Agent = 'off' | 'center' | 'cart' | 'coupon' | 'pay' | 'rest'
type S = {
  folder: boolean
  hoverTest: boolean
  detail: boolean
  playing: boolean
  step: number // steps done
  page: 'shop' | 'cart' | 'done'
  code: string
  discount: boolean
  paying: boolean
  agent: Agent
  press: boolean
  ended: boolean
}

const initial: S = { folder: false, hoverTest: false, detail: false, playing: false, step: 0, page: 'shop', code: '', discount: false, paying: false, agent: 'off', press: false, ended: false }
const poster: S = { ...initial, folder: true, detail: true, step: 4, page: 'done', code: 'SPRING', discount: true, agent: 'off', ended: true }

async function press(a: Act<S>) {
  a.put({ press: true })
  await a.wait(160)
  a.put({ press: false })
}

async function script(a: Act<S>) {
  await a.wait(400)
  a.mark('folder')
  await a.move({ at: 'folder', x: 0.4, y: 0.5 })
  await a.click()
  await a.set({ folder: true })
  await a.wait(500)
  a.mark('test')
  await a.move({ at: 'test', x: 0.45, y: 0.5 })
  await a.set({ hoverTest: true })
  await a.wait(150)
  await a.click()
  await a.set({ detail: true, hoverTest: false })
  void a.move({ x: 150, y: 400 })
  await a.wait(500)
  a.mark('replay')
  a.put({ playing: true, agent: 'center' })
  await a.wait(450)
  // Step 1: open the cart
  a.put({ agent: 'cart' })
  await a.wait(650)
  await press(a)
  a.put({ page: 'cart', step: 1 })
  await a.wait(700)
  // Step 2: apply a coupon
  a.put({ agent: 'coupon' })
  await a.wait(650)
  await press(a)
  await a.type('code', 'SPRING', { interval: 55 })
  await a.wait(200)
  a.put({ discount: true, step: 2 })
  await a.wait(700)
  // Step 3: pay with the saved card
  a.put({ agent: 'pay' })
  await a.wait(650)
  await press(a)
  a.put({ paying: true })
  await a.wait(600)
  a.put({ step: 3, page: 'done', paying: false, agent: 'rest' })
  await a.wait(700)
  // Step 4: the confirmation is on screen
  a.mark('done')
  a.put({ step: 4 })
  await a.wait(500)
  a.put({ playing: false, ended: true, agent: 'off' })
  await a.wait(2600)
}

const FOLDERS = [
  { name: 'checkout.spec.ts', n: 3, target: 'folder' },
  { name: 'contacts.spec.ts', n: 2 },
  { name: 'Manual tests', n: 4 },
]

const TESTS = [
  { name: 'applies a coupon' },
  { name: 'pays with a saved card', target: 'test' },
  { name: 'rejects an expired card' },
]

export default function QureTests() {
  return (
    <Stage width={800} height={450} initial={initial} poster={poster} script={script} play="once" theme="dark" accent="#7fd6c8" cursor={{ at: { x: 200, y: 330 } }} className="qr qt">
      {(s, rect) => {
        const at =
          s.agent === 'cart' ? pt(rect('v-cart'), 0.5, 0.55)
          : s.agent === 'coupon' ? pt(rect('v-coupon'), 0.35, 0.55)
          : s.agent === 'pay' ? pt(rect('v-pay'), 0.5, 0.55)
          : s.agent === 'rest' ? pt(rect('v-page'), 0.66, 0.78)
          : pt(rect('v-page'), 0.55, 0.6)
        return (
          <>
            <div className="q-app">
              <Topbar>
                <span className="q-top-sep" />
                <span className="q-tabs">
                  <span className="q-tab">
                    <Globe size={14} strokeWidth={1.75} />
                    localhost:3000
                  </span>
                  <span className="q-tab" data-active>
                    <FlaskConical size={14} strokeWidth={1.75} />
                    Tests
                  </span>
                </span>
              </Topbar>

              <aside className="q-chat">
                <div className="q-list">
                  <div className="q-user">
                    <div className="q-bubble">Run the checkout tests</div>
                  </div>
                  <div className="q-gap">
                    <div className="q-runcard">
                      <span className="q-ring" />
                      <b>Ran tests</b>
                      <span className="q-target">checkout.spec.ts</span>
                      <span className="qt-pass">
                        <CircleCheck size={14} strokeWidth={2} />3
                      </span>
                      <ChevronRight size={14} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="q-gap">
                    <div className="q-md">All three pass. Each run keeps its video.</div>
                  </div>
                </div>
                <ProjectLine />
                <Composer />
              </aside>

              <main className="qt-main">
                {/* Test list: folders, then the tests in the open folder */}
                <section className="qt-view" data-show={!s.detail || undefined}>
                  <div className="qt-head">
                    <span className="qt-title">
                      Tests <span className="qt-count">9</span>
                    </span>
                    <span className="qt-tools">
                      <span className="q-ib">
                        <Search {...ICON} />
                      </span>
                      <span className="q-ib">
                        <ListFilter {...ICON} />
                      </span>
                    </span>
                  </div>
                  <div className="qt-crumbs">
                    <span className="qt-crumb-dim">Tests</span>
                    <span className="qt-crumb-rest" data-show={s.folder || undefined}>
                      <ChevronRight size={13} strokeWidth={1.75} />
                      checkout.spec.ts
                    </span>
                  </div>
                  <div className="qt-cols">
                    <div className="qt-col">
                      {FOLDERS.map((f) => (
                        <div key={f.name} className="qt-folder" data-target={f.target} data-cursor="pointer" data-on={(f.target && s.folder) || undefined}>
                          <Folder {...ICON} />
                          <span>{f.name}</span>
                          <span className="qt-n">{f.n}</span>
                        </div>
                      ))}
                    </div>
                    <div className="qt-col qt-col--tests" data-show={s.folder || undefined}>
                      {TESTS.map((t, i) => (
                        <div
                          key={t.name}
                          className="qt-test"
                          data-target={t.target}
                          data-cursor="pointer"
                          data-hover={(t.target && s.hoverTest) || undefined}
                          style={{ transitionDelay: `${i * 60}ms` }}
                        >
                          <FileCode2 size={16} strokeWidth={1.75} className="qt-file" />
                          <CircleCheck size={16} strokeWidth={2} className="qt-ok" />
                          <span>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Test details on a full page: header, Runs, the replay and its steps */}
                <section className="qt-view qt-detail" data-show={s.detail || undefined}>
                  <div className="qt-dhead">
                    <span className="q-ib">
                      <ArrowLeft {...ICON} />
                    </span>
                    <FileCode2 size={16} strokeWidth={1.75} className="qt-file" />
                    <CircleCheck size={16} strokeWidth={2} className="qt-ok" />
                    <span className="qt-dtitle">pays with a saved card</span>
                  </div>
                  <div className="qt-dtabs">
                    <span>Overview</span>
                    <span data-on>Runs</span>
                    <span className="qt-run-meta">
                      <Video size={14} strokeWidth={1.75} />
                      Last run · Chromium
                    </span>
                  </div>
                  <div className="qt-player">
                    <div className="qt-video" data-target="v-page">
                      <MiniShop s={s} />
                    </div>
                    <div className="qt-chrome">
                      <SkipBack size={14} strokeWidth={1.75} />
                      <span className="qt-play">{s.ended ? <RotateCcw size={12} strokeWidth={2} /> : s.playing ? <Pause size={12} strokeWidth={2} fill="currentColor" /> : <Play size={12} strokeWidth={2} fill="currentColor" />}</span>
                      <SkipForward size={14} strokeWidth={1.75} />
                      <span className="qt-segs">
                        {STEPS.map((st, i) => (
                          <i key={st} data-done={s.step > i || undefined} data-now={(s.playing && s.step === i) || undefined} />
                        ))}
                      </span>
                      <span className="qt-time">0:{String(Math.min(9, 2 + s.step * 2)).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="qt-steps">
                    {STEPS.map((st, i) => (
                      <div key={st} className="qt-step" data-now={(s.playing && s.step === i) || undefined}>
                        <span className="qt-num">{i + 1}</span>
                        <span className="qt-check" data-done={s.step > i || undefined}>
                          <CircleCheck size={16} strokeWidth={2} />
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </main>
            </div>
            <AgentCursor at={at} hidden={s.agent === 'off'} press={s.press} move={600} />
          </>
        )
      }}
    </Stage>
  )
}

/** The recorded page inside the player: a small fictional shop checkout. */
function MiniShop({ s }: { s: S }) {
  return (
    <div className="qm">
      <div className="qm-nav">
        <span className="qm-brand">Fieldwork</span>
        <span className="qm-cart" data-target="v-cart">
          <ShoppingCart size={13} strokeWidth={2} />
          <span className="qm-badge">2</span>
        </span>
      </div>
      <div className="qm-body" data-page={s.page}>
        <div className="qm-pane qm-pane--shop">
          <div className="qm-h">New this week</div>
          <div className="qm-grid">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="qm-pane qm-pane--cart">
          <div className="qm-h">Cart</div>
          <div className="qm-row">
            <span>Field notebook</span>
            <b>$24</b>
          </div>
          <div className="qm-row">
            <span>Pencil set</span>
            <b>$18</b>
          </div>
          <div className="qm-coupon">
            <span className="qm-field" data-target="v-coupon">
              {s.code || <em>Coupon</em>}
            </span>
            <span className="qm-off" data-show={s.discount || undefined}>
              −$5
            </span>
            <span className="qm-pay" data-target="v-pay" data-busy={s.paying || undefined}>
              {s.paying ? 'Paying…' : `Pay ${s.discount ? '$37' : '$42'} · •••• 4242`}
            </span>
          </div>
        </div>
        <div className="qm-pane qm-pane--done">
          <span className="qm-done">
            <CircleCheck size={22} strokeWidth={2} />
          </span>
          <div className="qm-h">Order confirmed</div>
          <div className="qm-sub">Receipt sent to your email</div>
        </div>
      </div>
    </div>
  )
}
