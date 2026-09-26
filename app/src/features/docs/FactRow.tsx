import { useId, useRef, useState, type CSSProperties } from 'react'
import { CalendarDays, Check, Eye, EyeOff, FileSearch, HeartPulse, Pencil, PiggyBank, Wallet } from 'lucide-react'
import type { FactKey, FactValue } from '@/contracts'
import { DOC_LABELS, FACT_LABELS } from '@/contracts'
import { useSession } from '@/data/session'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FactCandidate } from '@/features/reading/merge'
import { CONFIDENCE_COPY, factDetail, formatFactValue, sourceLabel } from './format'
import ManualEntry from './ManualEntry'
import ReadingOverlay from './ReadingOverlay'

const FACT_ICONS = {
  birth_date: CalendarDays,
  medicare_parts: HeartPulse,
  monthly_income: Wallet,
  bank_balance: PiggyBank,
} satisfies Record<FactKey, unknown>

export interface FactRowProps {
  factKey: FactKey
  /** What we read (or what was typed). Null when nothing was found. */
  candidate: FactCandidate | null
  confirmed: boolean
  onToggleConfirm: () => void
  /** A value typed in the inline editor. Saving it also confirms it. */
  onSaveValue: (value: FactValue) => void
  /** Called when the editor opens, so the parent can un-confirm the row. */
  onEdit?: () => void
}

/** A zoomed crop of the document around one highlighted fact, so the value
 *  sits next to its evidence. Only while the photo or sample is in memory. */
function Evidence({ candidate }: { candidate: FactCandidate }) {
  const { slots, hits } = useSession()
  if (candidate.source === 'manual') return null
  const source = candidate.source
  const hit = (hits[source] ?? []).find((h) => h.key === candidate.key && h.box)
  const slot = slots[source]
  const photoUrl = slot.mode === 'ocr' ? slot.preview_url : null
  if (!hit?.box || (slot.mode === 'ocr' && !photoUrl)) return null
  const b = hit.box
  const zoom = Math.min(3, Math.max(1.2, 0.6 / Math.max(b.w, 0.05)))
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  const style: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${zoom * 100}%`,
    transform: `translate(${-cx * 100}%, ${-cy * 100}%)`,
  }
  return (
    <figure className="mt-3">
      <div className="relative h-28 overflow-hidden rounded-xl border bg-muted/50 sm:h-32">
        <div style={style}>
          <ReadingOverlay kind={source} size="sm" state="done" hits={[hit]} photoUrl={photoUrl} />
        </div>
      </div>
      <figcaption className="mt-1.5 text-xs text-muted-foreground">
        Where we read it on the {DOC_LABELS[source].toLowerCase()}
      </figcaption>
    </figure>
  )
}

/** One fact: the value, where it came from, how sure we are, and a big
 *  checkmark to confirm it. Unsure readings open the editor right away. */
export default function FactRow({ factKey, candidate, confirmed, onToggleConfirm, onSaveValue, onEdit }: FactRowProps) {
  const [editing, setEditing] = useState(() => !candidate || candidate.confidence !== 'high')
  const [showWhere, setShowWhere] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const whereId = useId()
  // After the editor closes, put focus back on this fact's checkmark so
  // keyboard users do not start again from the top of the page.
  const closeEditor = () => {
    setEditing(false)
    requestAnimationFrame(() => confirmRef.current?.focus())
  }
  const labelId = useId()
  const Icon = FACT_ICONS[factKey]
  const label = FACT_LABELS[factKey]
  const missing = !candidate
  const conf = candidate ? CONFIDENCE_COPY[candidate.confidence] : null
  const valueText = candidate ? formatFactValue(candidate.value) : ''
  const detail = candidate ? factDetail(candidate.value) : null

  return (
    <li
      aria-labelledby={labelId}
      className={cn(
        'relative rounded-2xl border bg-card p-4 shadow-card transition-[border-color,background-color] duration-300 sm:p-5',
        confirmed ? 'border-good/55 bg-good-soft/35' : 'border-border',
      )}
    >
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 hidden size-11 shrink-0 place-items-center rounded-xl sm:grid',
            confirmed ? 'bg-good-soft text-good' : 'bg-evergreen-soft text-evergreen',
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 id={labelId} className="eyebrow font-sans text-muted-foreground">
              {label}
            </h3>
            {conf && candidate?.source !== 'manual' ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                  conf.tone === 'good' && 'bg-good-soft text-good',
                  conf.tone === 'warn' && 'bg-warn-soft text-warn',
                  conf.tone === 'low' && 'bg-warn-soft text-warn ring-1 ring-warn/40',
                )}
              >
                {conf.label}
              </span>
            ) : null}
          </div>

          {missing ? (
            <p className="mt-1.5 font-heading text-xl leading-snug font-medium">We didn't find this one. Type it here.</p>
          ) : (
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="numeral text-[1.75rem] leading-tight font-semibold sm:text-3xl">{valueText}</span>
              {detail ? <span className="text-sm text-muted-foreground">{detail}</span> : null}
            </p>
          )}

          {candidate ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 font-medium">
                <FileSearch className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {candidate.source === 'manual' ? 'Typed by you' : `from: ${sourceLabel(candidate.source)}`}
              </span>
              {candidate.mode === 'sample' ? (
                <span className="rounded-full bg-gold-soft px-2.5 py-1 font-medium text-gold-foreground">Sample document</span>
              ) : null}
              {candidate.source !== 'manual' && candidate.box ? (
                <button
                  type="button"
                  aria-expanded={showWhere}
                  aria-controls={whereId}
                  onClick={() => setShowWhere((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-evergreen hover:bg-evergreen-soft"
                >
                  {showWhere ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
                  {showWhere ? 'Hide' : 'Show where'}
                  <span className="sr-only"> on the document</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {candidate && showWhere && !editing ? (
            <div id={whereId}>
              <Evidence candidate={candidate} />
            </div>
          ) : null}

          {candidate?.snippet && !editing ? (
            <blockquote className="mt-2.5 border-l-2 border-gold/70 pl-3 text-sm leading-relaxed text-muted-foreground">
              <span className="sr-only">Text we read: </span>
              {candidate.snippet}
            </blockquote>
          ) : null}

          {editing ? (
            <div className="mt-4 rounded-xl border border-dashed bg-background/60 p-3.5 sm:p-4">
              {candidate && candidate.confidence !== 'high' && candidate.source !== 'manual' ? (
                <p className="mb-3 text-sm">
                  {candidate.confidence === 'low'
                    ? 'This is our best guess. Please check it against the document.'
                    : 'The photo was a little hard to read. Please check this against the document.'}
                </p>
              ) : null}
              <ManualEntry
                factKey={factKey}
                initial={candidate?.value}
                saveLabel={missing ? 'Save and confirm' : 'Looks right, confirm'}
                onSave={(v) => {
                  onSaveValue(v)
                  closeEditor()
                }}
                onCancel={candidate ? closeEditor : undefined}
              />
            </div>
          ) : null}
        </div>

        {!missing && !editing ? (
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <button
              ref={confirmRef}
              type="button"
              aria-pressed={confirmed}
              aria-label={`Confirm ${label}: ${valueText}`}
              onClick={onToggleConfirm}
              className={cn(
                'grid size-14 place-items-center rounded-full border-2 transition-[background-color,border-color,color,transform] duration-200 active:scale-95 sm:size-16',
                confirmed
                  ? 'animate-pulse-ring border-good bg-good text-paper [animation-iteration-count:1]'
                  : 'border-input bg-card text-muted-foreground hover:border-good hover:text-good',
              )}
            >
              <Check className={cn('size-7', confirmed && 'animate-mark')} strokeWidth={confirmed ? 3.25 : 2.5} aria-hidden="true" />
            </button>
            <span className={cn('text-xs font-semibold', confirmed ? 'text-good' : 'text-muted-foreground')} aria-hidden="true">
              {confirmed ? 'Confirmed' : 'Confirm'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-9 rounded-lg px-2.5 text-xs"
              onClick={() => {
                setEditing(true)
                onEdit?.()
              }}
              aria-label={`Edit ${label.toLowerCase()}`}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  )
}
