import { useState } from 'react'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import type { DocKind, FactKey } from '@/contracts'
import { DOC_LABELS } from '@/contracts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FactCandidate } from '@/features/reading/merge'
import FactRow from './FactRow'
import { sameValue } from './format'
import { FACT_ORDER } from './helpers'


interface RowState {
  candidate: FactCandidate | null
  confirmed: boolean
}

export interface FactsConfirmProps {
  /** The best reading of each fact (from bestFacts). */
  initial: Partial<Record<FactKey, FactCandidate>>
  /** Facts that were already confirmed and saved: they start checked. */
  initialConfirmed?: Partial<Record<FactKey, boolean>>
  /** Documents we could not read, to explain why a fact is missing. */
  failedDocs?: DocKind[]
  saving?: boolean
  onSubmit: (facts: FactCandidate[]) => void
  headingId?: string
}

/** The four facts, each with a checkmark. The caregiver confirms every one
 *  before anything is saved. */
export default function FactsConfirm({
  initial,
  initialConfirmed = {},
  failedDocs = [],
  saving,
  onSubmit,
  headingId,
}: FactsConfirmProps) {
  const [rows, setRows] = useState<Record<FactKey, RowState>>(() => {
    const out = {} as Record<FactKey, RowState>
    for (const k of FACT_ORDER) {
      const candidate = initial[k] ?? null
      out[k] = { candidate, confirmed: !!candidate && !!initialConfirmed[k] }
    }
    return out
  })

  const done = FACT_ORDER.filter((k) => rows[k].confirmed && rows[k].candidate).length
  const allDone = done === FACT_ORDER.length

  const toggle = (k: FactKey) => setRows((r) => ({ ...r, [k]: { ...r[k], confirmed: !r[k].confirmed } }))

  const save = (k: FactKey, value: FactCandidate['value']) =>
    setRows((r) => {
      const prev = r[k].candidate
      // Same value as we read: keep the source. Changed: the person typed it.
      const candidate: FactCandidate =
        prev && sameValue(prev.value, value)
          ? { ...prev, confidence: 'high' }
          : { key: k, value, source: 'manual', mode: 'manual', confidence: 'high' }
      return { ...r, [k]: { candidate, confirmed: true } }
    })

  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl space-y-2">
          <p className="eyebrow text-evergreen">Step 2 of 3</p>
          <h2 id={headingId} tabIndex={-1} className="text-3xl leading-tight font-semibold sm:text-4xl">
            Check what we found
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Tap the check next to each fact once it matches the paper. Change anything that looks wrong. Nothing is
            used until you confirm it.
          </p>
        </div>
        <div className="min-w-44" role="status" aria-live="polite">
          <p className="text-sm font-semibold">
            <span className="numeral text-2xl">{done}</span>
            <span className="text-muted-foreground"> of 4 confirmed</span>
          </p>
          <div className="mt-2 flex gap-1.5" aria-hidden="true">
            {FACT_ORDER.map((k) => (
              <span
                key={k}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  rows[k].confirmed ? 'bg-good' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {failedDocs.length ? (
        <p className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-foreground">
          We couldn't read the {failedDocs.map((d) => DOC_LABELS[d].toLowerCase()).join(' or the ')}. Type those facts
          below, it only takes a moment.
        </p>
      ) : null}

      <ul className="space-y-3.5">
        {FACT_ORDER.map((k) => (
          <FactRow
            key={k}
            factKey={k}
            candidate={rows[k].candidate}
            confirmed={rows[k].confirmed}
            onToggleConfirm={() => toggle(k)}
            onSaveValue={(v) => save(k, v)}
            onEdit={() => setRows((r) => ({ ...r, [k]: { ...r[k], confirmed: false } }))}
          />
        ))}
      </ul>

      <div className="sticky bottom-0 z-20 -mx-4 border-t bg-background/90 px-4 py-4 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:shadow-lift">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-good" aria-hidden="true" />
            {allDone
              ? 'All four confirmed. When you continue, your photos are deleted from memory.'
              : `Confirm all four facts to continue. ${4 - done} to go.`}
          </p>
          <Button
            type="button"
            disabled={!allDone || saving}
            onClick={() => onSubmit(FACT_ORDER.map((k) => rows[k].candidate!))}
            className="h-12 shrink-0 rounded-xl px-6 text-base font-semibold shadow-card"
          >
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {saving ? 'Saving' : 'Save and find programs'}
            {!saving ? <ArrowRight aria-hidden="true" /> : null}
          </Button>
        </div>
      </div>
    </section>
  )
}
