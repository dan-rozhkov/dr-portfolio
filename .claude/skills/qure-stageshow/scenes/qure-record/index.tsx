import { Collapse, Stage, Stream, type Act } from '../../kit'
import { ChevronRight, CircleCheck, FlaskConical, Globe, Plus, Sparkles, Video } from 'lucide-react'
import { AgentCursor, BrowserBar, Composer, ICON, ProjectLine, Topbar, pt } from '../qure-shared/parts'
import './record.css'

// Qure: record a flow in the built-in browser, the agent turns it into a test
// in the repo and replays it with its own mint cursor until it passes.

const ASK = 'Turn this into a test'
const A = 'The test passes. It reuses your ContactsPage object, so it reads like the rest of the suite.'
const WORDS = A.split(' ').length

type Phase = 'idle' | 'thinking' | 'writing' | 'running' | 'passed'
type S = {
  rec: 'idle' | 'on' | 'done'
  form: boolean
  name: string
  saved: boolean
  focus: boolean
  draft: string
  composing: boolean
  sent: boolean
  phase: Phase
  reload: boolean
  agent: 'off' | 'center' | 'new' | 'name' | 'save'
  press: boolean
  words: number
  gone: boolean
}

const initial: S = { rec: 'idle', form: false, name: '', saved: false, focus: false, draft: '', composing: false, sent: false, phase: 'idle', reload: false, agent: 'off', press: false, words: 0, gone: false }
const poster: S = { ...initial, rec: 'done', saved: true, sent: true, phase: 'passed', agent: 'off', words: WORDS }

async function click(a: Act<S>) {
  a.put({ press: true })
  await a.wait(160)
  a.put({ press: false })
}

async function script(a: Act<S>) {
  await a.wait(400)
  a.mark('record')
  await a.move({ at: 'record', x: 0.5, y: 0.5 })
  await a.click()
  await a.set({ rec: 'on' })
  await a.wait(350)
  // The person walks the flow in the built-in browser
  await a.move({ at: 'crm-new', x: 0.5, y: 0.55 })
  await a.click()
  await a.set({ form: true })
  await a.wait(300)
  await a.move({ at: 'crm-name', x: 0.3, y: 0.5 })
  await a.click()
  await a.set({ focus: true })
  await a.type('name', 'Ada Park', { interval: 70 })
  await a.wait(200)
  await a.move({ at: 'crm-save', x: 0.5, y: 0.55 })
  await a.click()
  await a.set({ form: false, focus: false, saved: true })
  await a.wait(500)
  a.mark('stop')
  await a.move({ at: 'record', x: 0.5, y: 0.5 })
  await a.click()
  await a.set({ rec: 'done' })
  await a.wait(250)
  await a.move({ at: 'composer', x: 0.55, y: 0.45 })
  await a.click()
  a.put({ composing: true })
  await a.type('draft', ASK, { interval: 32 })
  await a.wait(250)
  await a.move({ at: 'send', x: 0.5, y: 0.5 })
  await a.click()
  a.put({ sent: true, draft: '', composing: false })
  await a.wait(400)
  a.mark('agent')
  a.put({ phase: 'thinking' })
  void a.move({ x: 250, y: 420 })
  await a.wait(1100)
  a.put({ phase: 'writing' })
  await a.wait(900)
  // A clean run: the page reloads, the agent replays the flow
  a.mark('run')
  a.put({ phase: 'running', reload: true, saved: false, name: '' })
  await a.wait(500)
  a.put({ reload: false, agent: 'center' })
  await a.wait(350)
  a.put({ agent: 'new' })
  await a.wait(750)
  await click(a)
  a.put({ form: true })
  await a.wait(350)
  a.put({ agent: 'name' })
  await a.wait(650)
  await click(a)
  a.put({ name: 'Ada Park' })
  await a.wait(350)
  a.put({ agent: 'save' })
  await a.wait(650)
  await click(a)
  a.put({ form: false, saved: true })
  await a.wait(500)
  a.mark('passed')
  a.put({ phase: 'passed' })
  await a.wait(300)
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i })
    if (i === 6) a.put({ gone: true })
    await a.wait(40)
  }
  await a.wait(2600)
}

const ROWS = [
  { n: 'Lena Ortiz', c: 'Halden', e: 62 },
  { n: 'Marco Diaz', c: 'Brightway', e: 48 },
  { n: 'Sana Iqbal', c: 'Corvo', e: 70 },
  { n: 'Tom Becker', c: 'Ostra', e: 54 },
]

export default function QureRecord() {
  return (
    <Stage width={800} height={450} initial={initial} poster={poster} script={script} play="once" theme="dark" accent="#7fd6c8" cursor={{ at: { x: 230, y: 330 } }} className="qr">
      {(s, rect) => {
        const target = s.agent === 'new' ? pt(rect('crm-new'), 0.55, 0.6) : s.agent === 'name' ? pt(rect('crm-name'), 0.3, 0.6) : s.agent === 'save' ? pt(rect('crm-save'), 0.55, 0.6) : { x: 560, y: 300 }
        const ran = s.phase === 'passed'
        return (
          <>
            <div className="q-app">
              <Topbar>
                <span className="q-top-sep" />
                <span className="q-tabs">
                  <span className="q-tab" data-active>
                    <Globe size={14} strokeWidth={1.75} />
                    localhost:3000
                  </span>
                </span>
              </Topbar>

              <aside className="q-chat">
                <div className="q-list">
                  <Collapse open={!s.sent}>
                    <div className="qrr-start">
                      <div className="qrr-hero">Turn a flow into a test</div>
                      <div className="qrr-card">
                        <FlaskConical {...ICON} />
                        <span>
                          <b>Create a test</b>
                          <i>Turn a user flow into a reliable test.</i>
                        </span>
                      </div>
                      <div className="qrr-card">
                        <Sparkles {...ICON} />
                        <span>
                          <b>Fix failing tests</b>
                          <i>Investigate failures and repair the suite.</i>
                        </span>
                      </div>
                    </div>
                  </Collapse>
                  <Collapse open={s.sent} reveal="drop" from="below">
                    <div className="q-user">
                      <div className="q-bubble">
                        {ASK}
                        <div>
                          <span className="q-chip">
                            <Video size={14} strokeWidth={1.75} />
                            Recording <span className="q-chip-meta">3 steps</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Collapse>
                  <Collapse open={s.phase !== 'idle'}>
                    <div className="q-gap">
                      <div className="q-tool">
                        <span data-shimmer={s.phase === 'thinking' || undefined}>{s.phase === 'thinking' ? 'Thinking' : 'Thought for 2s'}</span>
                      </div>
                    </div>
                  </Collapse>
                  <Collapse open={s.phase === 'writing' || s.phase === 'running' || ran}>
                    <div className="q-tool">
                      <b>Created</b>
                      <span className="q-mono">tests/contacts.spec.ts</span>
                      <span className="q-add">+18</span>
                      <ChevronRight size={14} strokeWidth={1.75} />
                    </div>
                  </Collapse>
                  <Collapse open={s.phase === 'running' || ran}>
                    <div className="q-gap" style={{ paddingTop: 6 }}>
                      <div className="q-runcard">
                        <span className="q-ring" data-running={!ran || undefined} />
                        <b>{ran ? 'Ran test' : 'Running test'}</b>
                        <span className="q-target">Create a contact</span>
                        {ran && (
                          <span className="q-pass">
                            <CircleCheck size={14} strokeWidth={2} />1
                          </span>
                        )}
                        <ChevronRight size={14} strokeWidth={1.75} />
                      </div>
                    </div>
                  </Collapse>
                  <Collapse open={ran}>
                    <div className="q-gap">
                      <div className="q-md">
                        <Stream text={A} count={s.words} />
                      </div>
                    </div>
                  </Collapse>
                </div>
                <ProjectLine />
                <Composer
                  draft={s.draft}
                  focused={s.composing}
                  recording={s.rec === 'on'}
                  chips={
                    <Collapse open={s.rec === 'done' && !s.sent}>
                      <div className="q-chips">
                        <span className="q-chip">
                          <Video size={14} strokeWidth={1.75} />
                          Recording <span className="q-chip-meta">3 steps</span>
                        </span>
                      </div>
                    </Collapse>
                  }
                />
              </aside>

              <main className="q-browser">
                <BrowserBar url="localhost:3000" path="/contacts" />
                <div className="q-page qrr-page" data-reload={s.reload || undefined}>
                  <div className="qrr-head">
                    <span className="qrr-title">Contacts</span>
                    <span className="qrr-btn" data-target="crm-new" data-cursor="pointer">
                      <Plus size={14} strokeWidth={2} />
                      New contact
                    </span>
                  </div>
                  <Collapse open={s.form}>
                    <div className="qrr-form">
                      <span className="qrr-field" data-target="crm-name" data-cursor="ibeam" data-focus={s.focus || undefined}>
                        <span className="qrr-label">Name</span>
                        <span className="qrr-value">
                          {s.name}
                          {s.focus && <span className="qrr-caret" />}
                        </span>
                      </span>
                      <span className="qrr-field qrr-field--short">
                        <span className="qrr-label">Company</span>
                        <span className="qrr-value" />
                      </span>
                      <span className="qrr-save" data-target="crm-save" data-cursor="pointer">
                        Save
                      </span>
                    </div>
                  </Collapse>
                  <div className="qrr-table">
                    <div className="qrr-th">
                      <span>Name</span>
                      <span>Company</span>
                      <span>Email</span>
                    </div>
                    <Collapse open={s.saved} reveal="drop">
                      <div className="qrr-tr qrr-tr--new" data-fresh={s.saved || undefined}>
                        <span>Ada Park</span>
                        <span className="qrr-dim">—</span>
                        <span className="qrr-bar" style={{ width: 0 }} />
                      </div>
                    </Collapse>
                    {ROWS.map((r) => (
                      <div key={r.n} className="qrr-tr">
                        <span>{r.n}</span>
                        <span className="qrr-dim">{r.c}</span>
                        <span className="qrr-bar" style={{ width: r.e * 2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
            <AgentCursor at={target} hidden={s.agent === 'off' || s.gone} press={s.press} />
          </>
        )
      }}
    </Stage>
  )
}
