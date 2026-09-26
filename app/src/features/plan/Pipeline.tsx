import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, FileText, Loader2, RotateCcw } from 'lucide-react'
import type { PipelineStatus, ProgramMatch, ProgramStatus } from '@/contracts'
import { PIPELINE } from '@/contracts'
import { Button } from '@/components/ui/button'
import { advanceProgram, nextStatus, resetProgram } from '@/data/actions'
import { formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { ADVANCE_LABEL, STATUS_LABEL } from './labels'
import { statusFor } from './helpers'

function Stepper({ current, label }: { current: PipelineStatus; label: string }) {
  const at = PIPELINE.indexOf(current)
  return (
    <ol className="grid grid-cols-5" aria-label={`${label} progress: ${STATUS_LABEL[current]}`}>
      {PIPELINE.map((s, i) => {
        const done = i < at
        const active = i === at
        return (
          <li key={s} className="relative flex flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {i > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-700',
                  i <= at ? 'bg-good' : 'bg-border',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 grid size-7 place-items-center rounded-full border-2 text-[0.7rem] font-bold transition-all duration-500',
                done && 'border-good bg-good text-primary-foreground',
                active && (current === 'approved' ? 'border-good bg-good text-primary-foreground' : 'border-gold bg-gold-soft text-gold-foreground animate-pulse-ring'),
                !done && !active && 'border-border bg-card text-muted-foreground',
              )}
            >
              {done || (active && current === 'approved') ? (
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{i + 1}</span>
              )}
            </span>
            <span
              className={cn(
                'mt-2 text-[0.68rem] leading-tight sm:text-xs',
                active ? 'font-semibold text-foreground' : done ? 'text-foreground/80' : 'text-muted-foreground',
              )}
            >
              {STATUS_LABEL[s]}
              <span className="sr-only">{done ? ', done' : active ? ', current step' : ', not yet'}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * One horizontal stepper per drafted program (likely, drafted, signed,
 * submitted, approved). The caregiver can move it forward by hand; finishing
 * a sign or counselor task moves it too.
 */
export default function Pipeline({
  householdId,
  matches,
  statuses,
  canEdit,
}: {
  householdId: string
  matches: ProgramMatch[]
  statuses: ProgramStatus[]
  canEdit: boolean
}) {
  const drafts = matches.filter((m) => m.kind === 'draft')
  const [busy, setBusy] = useState<string | null>(null)

  async function go(program: ProgramMatch['program'], fn: () => Promise<unknown>) {
    setBusy(program)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  if (drafts.length === 0) return null

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {drafts.map((m) => {
        const current = statusFor(m.program, statuses)
        const next = nextStatus(current)
        return (
          <li key={m.program} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl leading-tight font-medium">
                  {m.name}
                  {m.tier ? (
                    <span className="ml-2 inline-flex translate-y-[-2px] items-center rounded-full bg-evergreen-soft px-2 py-0.5 align-middle font-sans text-xs font-semibold tracking-normal text-evergreen">
                      {m.tier}
                    </span>
                  ) : null}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.est_annual_cents > 0 ? (
                    <>
                      <span className="numeral font-semibold text-foreground">{formatUSD(m.est_annual_cents, { whole: true })}</span>
                      /yr estimate
                    </>
                  ) : (
                    m.estimate_note
                  )}
                </p>
              </div>
              <Link
                to={`/draft/${m.program}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-evergreen hover:bg-evergreen-soft"
              >
                <FileText className="size-4" aria-hidden="true" />
                Draft
              </Link>
            </div>

            <div className="mt-6">
              <Stepper current={current} label={m.name} />
            </div>

            {canEdit ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  {current === 'approved' ? 'Approved. Keep the letter with the Medicare card.' : 'Update this when a step happens in real life.'}
                </p>
                {next ? (
                  <Button
                    variant="outline"
                    className="h-9 gap-1.5"
                    disabled={busy !== null}
                    onClick={() => go(m.program, () => advanceProgram(householdId, m.program, next))}
                  >
                    {busy === m.program ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                    {ADVANCE_LABEL[next]}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="h-9 gap-1.5 text-muted-foreground"
                    disabled={busy !== null}
                    onClick={() => go(m.program, () => resetProgram(householdId, m.program))}
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Reset (demo)
                  </Button>
                )}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
