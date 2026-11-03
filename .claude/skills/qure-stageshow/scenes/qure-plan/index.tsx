import { Collapse, Count, Stage, Stream, type Act } from '../../kit'
import { ChevronRight, Circle, CircleCheck, CircleHelp, CircleX, FileCode, Hand, ListChecks, Play } from 'lucide-react'
import { Composer, ICON, ProjectLine, Topbar } from '../qure-shared/parts'
import './plan.css'

// Qure: the test plan wizard lives in the chat. Ask for a regression plan,
// pick the scope on the agent's question card, get a plan, run it, read the
// report. The Test plans tab on the right fills in as the run goes.

const ASK = 'Plan a regression run for the 2.4 release'
const A = '11 of 12 passed. Apply a coupon failed: the discount never reaches the order summary.'
const WORDS = A.split(' ').length

const TESTS: { n: string; manual?: boolean; fail?: boolean }[] = [
  { n: 'Sign in with email' },
  { n: 'Reset a password' },
  { n: 'Add an item to the cart' },
  { n: 'Apply a coupon', fail: true },
  { n: 'Pay with a saved card' },
  { n: 'Check the order email', manual: true },
  { n: 'Change the delivery address' },
  { n: 'Cancel an order', manual: true },
  { n: 'Export invoices' },
  { n: 'Refund from the admin', manual: true },
  { n: 'Switch the store currency' },
  { n: 'Delete an account' },
]
const N = TESTS.length

type S = {
  draft: string
  composing: boolean
  sent: boolean
  thinking: boolean
  ask: 'off' | 'open' | 'answered'
  hover: number
  plan: boolean
  rows: number
  runHover: boolean
  run: 'idle' | 'running' | 'done'
  done: number
  words: number
}

const initial: S = { draft: '', composing: false, sent: false, thinking: false, ask: 'off', hover: -1, plan: false, rows: 0, runHover: false, run: 'idle', done: 0, words: 0 }
const poster: S = { ...initial, sent: true, ask: 'answered', plan: true, rows: N, run: 'done', done: N, words: WORDS }

async function script(a: Act<S>) {
  await a.wait(400)
  await a.move({ at: 'composer', x: 0.5, y: 0.3 })
  await a.click()
  a.put({ composing: true })
  await a.type('draft', ASK, { interval: 30 })
  await a.wait(200)
  await a.move({ at: 'send', x: 0.5, y: 0.5 })
  await a.click()
  a.put({ sent: true, draft: '', composing: false })
  await a.wait(300)
  a.mark('think')
  a.put({ thinking: true })
  await a.wait(900)
  a.mark('ask')
  a.put({ thinking: false, ask: 'open' })
  await a.wait(700)
  await a.move({ at: 'opt-2', x: 0.4, y: 0.5 })
  a.put({ hover: 2 })
  await a.wait(250)
  await a.click()
  await a.wait(150)
  a.mark('plan')
  a.put({ ask: 'answered', hover: -1, plan: true })
  for (let i = 1; i <= N; i++) {
    a.put({ rows: i })
    await a.wait(45)
  }
  await a.wait(700)
  await a.move({ at: 'run', x: 0.5, y: 0.5 })
  a.put({ runHover: true })
  await a.wait(150)
  await a.click()
  a.mark('run')
  a.put({ runHover: false, run: 'running' })
  void a.move({ x: 250, y: 420 })
  await a.wait(400)
  for (let i = 1; i <= N; i++) {
    a.put({ done: i })
    await a.wait(i === 4 ? 520 : 300)
  }
  await a.wait(250)
  a.mark('report')
  a.put({ run: 'done' })
  await a.wait(300)
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i })
    await a.wait(40)
  }
  await a.wait(2600)
}

const PLANS = [
  { n: 'Release 2.3 regression', m: '11 tests', st: 'pass' },
  { n: 'Checkout smoke', m: '6 tests', st: 'pass' },
  { n: 'Payments weekly', m: '8 tests', st: 'fail' },
  { n: 'Accounts and sign-in', m: '7 tests', st: 'pass' },
  { n: 'Admin refunds', m: '5 tests', st: 'pass' },
]

const OPTIONS = ['Checkout and payments', 'Accounts and sign-in', 'Everything changed in 2.4']

export default function QurePlan() {
  return (
    <Stage width={800} height={450} initial={initial} poster={poster} script={script} play="once" theme="dark" accent="#7fd6c8" cursor={{ at: { x: 230, y: 330 } }} className="qr">
      {(s) => {
        const passed = TESTS.slice(0, s.done).filter((t) => !t.fail).length
        const failed = TESTS.slice(0, s.done).filter((t) => t.fail).length
        const done = s.run === 'done'
        return (
          <div className="q-app qrp">
            <Topbar>
              <span className="q-top-sep" />
              <span className="q-tabs">
                <span className="q-tab" data-active>
                  <ListChecks size={14} strokeWidth={1.75} />
                  Test plans
                </span>
              </span>
            </Topbar>

            <aside className="q-chat">
              <div className="q-list qrp-list">
                <div className="q-user">
                  <div className="q-bubble">Which tests cover the checkout?</div>
                </div>
                <div className="q-gap">
                  <div className="q-md qrp-old">Eight automated tests and three manual cases cover the checkout.</div>
                </div>
                <Collapse open={s.sent} reveal="drop" from="below">
                  <div className="q-gap">
                    <div className="q-user">
                      <div className="q-bubble">{ASK}</div>
                    </div>
                  </div>
                </Collapse>
                <Collapse open={s.thinking}>
                  <div className="q-gap">
                    <div className="q-tool">
                      <span data-shimmer>Thinking</span>
                    </div>
                  </div>
                </Collapse>
                <Collapse open={s.ask === 'open'} reveal="drop">
                  <div className="q-gap">
                    <div className="qrp-ask">
                      <div className="qrp-q">What should the plan cover?</div>
                      <div className="qrp-opts">
                        {OPTIONS.map((o, i) => (
                          <div key={o} className="qrp-opt" data-target={`opt-${i}`} data-cursor="pointer" data-on={s.hover === i || undefined}>
                            <span className="qrp-key">{'ABC'[i]}</span>
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Collapse>
                <Collapse open={s.ask === 'answered'}>
                  <div className="q-gap">
                    <div className="q-tool">
                      <CircleHelp size={14} strokeWidth={1.75} />
                      <b>Asked</b>
                      <span>{OPTIONS[2]}</span>
                    </div>
                  </div>
                </Collapse>
                <Collapse open={s.plan} reveal="drop">
                  <div className="q-gap" style={{ paddingTop: 6 }}>
                    <div className="qrp-plan">
                      <div className="qrp-plan-head">
                        <ListChecks {...ICON} />
                        <span className="qrp-plan-title">Release 2.4 regression</span>
                      </div>
                      <div className="qrp-plan-meta">
                        <span>{N} tests</span>
                        <span>
                          <FileCode size={13} strokeWidth={1.75} />9 automated
                        </span>
                        <span>
                          <Hand size={13} strokeWidth={1.75} />3 manual
                        </span>
                      </div>
                      <Collapse open={s.run === 'idle'}>
                        <div className="qrp-plan-actions">
                          <span className="qrp-run" data-target="run" data-cursor="pointer" data-on={s.runHover || undefined}>
                            <Play size={13} strokeWidth={2} />
                            Run plan
                          </span>
                        </div>
                      </Collapse>
                      <Collapse open={s.run !== 'idle'}>
                        <div className="qrp-progress">
                          <div className="qrp-track">
                            <i className="qrp-fill" style={{ width: `${(passed / N) * 100}%` }} />
                            <i className="qrp-fill qrp-fill--bad" style={{ left: `${(passed / N) * 100}%`, width: `${(failed / N) * 100}%` }} />
                          </div>
                          <div className="qrp-counts">
                            <span className="qrp-ok">
                              <CircleCheck size={13} strokeWidth={2} />
                              <Count value={passed} />
                            </span>
                            <span className="qrp-bad" data-show={failed > 0 || undefined}>
                              <CircleX size={13} strokeWidth={2} />
                              {failed}
                            </span>
                            <span className="qrp-of">
                              {done ? 'Finished' : 'Running'} · <Count value={s.done} /> of {N}
                            </span>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                </Collapse>
                <Collapse open={done}>
                  <div className="q-gap">
                    <div className="q-md">
                      <Stream text={A} count={s.words} />
                    </div>
                  </div>
                </Collapse>
              </div>
              <ProjectLine project="shop-web" branch="release/2.4" />
              <Composer draft={s.draft} focused={s.composing} />
            </aside>

            <main className="qrp-pane">
              <div className="qrp-layer" data-show={!s.plan || undefined}>
                <div className="qrp-pane-head">
                  <span className="qrp-pane-title">Test plans</span>
                  <span className="qrp-pane-count" data-show>
                    {PLANS.length}
                  </span>
                </div>
                <div className="qrp-rows">
                  {PLANS.map((p) => (
                    <div key={p.n} className="qrp-row qrp-row--plan" data-show>
                      <span className="qrp-st" data-state={p.st}>
                        {p.st === 'pass' ? <CircleCheck size={15} strokeWidth={2} /> : <CircleX size={15} strokeWidth={2} />}
                      </span>
                      <span className="qrp-name">{p.n}</span>
                      <span className="qrp-meta">{p.m}</span>
                      <ChevronRight size={14} strokeWidth={1.75} className="qrp-chev" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="qrp-layer" data-show={s.plan || undefined}>
                <div className="qrp-pane-head">
                  <span className="qrp-pane-title">Release 2.4 regression</span>
                  <span className="qrp-pane-count" data-show>
                    {N}
                  </span>
                </div>
                <div className="qrp-rows">
                  {TESTS.map((t, i) => {
                    const state = s.run === 'idle' || i > s.done ? 'pending' : i < s.done ? (t.fail ? 'fail' : 'pass') : 'running'
                    return (
                      <div key={t.n} className="qrp-row" data-show={i < s.rows || undefined} data-state={state}>
                        <span className="qrp-st" key={state}>
                          {state === 'pass' ? <CircleCheck size={15} strokeWidth={2} /> : state === 'fail' ? <CircleX size={15} strokeWidth={2} /> : state === 'running' ? <span className="q-ring" data-running /> : <Circle size={15} strokeWidth={1.75} />}
                        </span>
                        <span className="qrp-name">{t.n}</span>
                        <span className="qrp-type">{t.manual ? <Hand size={13} strokeWidth={1.75} /> : <FileCode size={13} strokeWidth={1.75} />}</span>
                        <ChevronRight size={14} strokeWidth={1.75} className="qrp-chev" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </main>
          </div>
        )
      }}
    </Stage>
  )
}
