import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  ChevronDown,
  Folder,
  GitBranch,
  History,
  Mic,
  PanelLeft,
  Paperclip,
  RotateCw,
  SquareMousePointer,
  SquarePen,
} from 'lucide-react'
import type { Rect } from '../../kit'
import './qure.css'

// Shared Qure desktop chrome for the portfolio scenes. Icons are lucide, as in
// the app. Cursor geometry is AutomationCursorOverlay's CURSOR_ARROW_POINTS.

export const ICON = { size: 16, strokeWidth: 1.75 }

export function Topbar({ children }: { children?: ReactNode }) {
  return (
    <header className="q-top">
      <span className="q-lights">
        <i />
        <i />
        <i />
      </span>
      <span className="q-ib">
        <PanelLeft {...ICON} />
      </span>
      <span className="q-ib">
        <History {...ICON} />
      </span>
      <span className="q-ib">
        <SquarePen {...ICON} />
      </span>
      {children}
    </header>
  )
}

export function ProjectLine({ project = 'crm-app', branch = 'main' }: { project?: string; branch?: string }) {
  return (
    <div className="q-project">
      <span>
        <Folder size={13} strokeWidth={1.75} />
        {project}
      </span>
      <span>
        <GitBranch size={13} strokeWidth={1.75} />
        {branch}
      </span>
    </div>
  )
}

export function Composer({
  draft = '',
  focused = false,
  chips,
  recording = false,
  recordLabel,
}: {
  draft?: string
  focused?: boolean
  chips?: ReactNode
  recording?: boolean
  recordLabel?: ReactNode
}) {
  return (
    <div className="q-composer" data-target="composer" data-cursor="ibeam" data-focused={focused || draft ? true : undefined}>
      {chips}
      <div className="q-input">
        <span className="q-ph" data-hidden={draft ? true : undefined}>
          Ask Qure…
        </span>
        <span>
          {draft}
          {focused && <span className="q-caret" />}
        </span>
      </div>
      <div className="q-bar">
        <span className="q-pill" data-target="record" data-rec={recording || undefined}>
          {recording ? <span className="q-recdot" /> : <SquareMousePointer {...ICON} />}
          {recordLabel ?? (recording ? 'Stop' : 'Record')}
        </span>
        <span className="q-pill">
          <Brain {...ICON} className="q-brandicon" />
          Deep
          <ChevronDown size={13} strokeWidth={1.75} />
        </span>
        <span className="q-bar-right">
          <span className="q-ib">
            <Mic {...ICON} />
          </span>
          <span className="q-ib">
            <Paperclip {...ICON} />
          </span>
          <span className="q-send" data-target="send" data-ready={draft ? true : undefined}>
            <ArrowUp size={16} strokeWidth={2} />
          </span>
        </span>
      </div>
    </div>
  )
}

export function BrowserBar({ url, path }: { url: string; path?: string }) {
  return (
    <div className="q-btool">
      <span className="q-ib">
        <ArrowLeft {...ICON} />
      </span>
      <span className="q-ib">
        <ArrowRight {...ICON} />
      </span>
      <span className="q-ib">
        <RotateCw {...ICON} />
      </span>
      <span className="q-url">
        {url}
        {path && <span className="q-url-dim">{path}</span>}
      </span>
    </div>
  )
}

/**
 * The agent's mint cursor. `at` is a stage-space point (use a measured rect);
 * the tip of the arrow sits on it.
 */
export function AgentCursor({ at, hidden, press, move }: { at: { x: number; y: number }; hidden?: boolean; press?: boolean; move?: number }) {
  return (
    <div
      className="q-agent"
      data-hidden={hidden || undefined}
      data-press={press || undefined}
      style={{ transform: `translate(${at.x - 2.2}px, ${at.y - 1.6}px)`, ['--q-move' as string]: `${move ?? 700}ms` }}
    >
      <span className="q-ripple" />
      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
        <polygon className="q-o" points="2.2,1.6 17.6,8.5 10.8,12.4 6.2,17.7" />
        <polygon className="q-f" points="2.2,1.6 17.6,8.5 10.8,12.4 6.2,17.7" />
      </svg>
    </div>
  )
}

/** A point inside a measured rect, in stage space. */
export function pt(r: Rect | undefined, fx = 0.5, fy = 0.5) {
  if (!r) return { x: 0, y: 0 }
  return { x: r.x + r.width * fx, y: r.y + r.height * fy }
}
