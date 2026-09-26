import type { ProgramMatch, ProgramStatus, Task } from '@/contracts'
import MoneyCounter from '@/components/brand/MoneyCounter'
import RulesDateStamp from '@/components/layout/RulesDateStamp'
import { formatAbout, formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { STATUS_LABEL } from './labels'
import { statusFor } from './helpers'

/**
 * The headline: estimated dollars a year in progress (from the rules
 * engine), a per-program breakdown and how far the family has got.
 * Shows no personal facts, so it is safe on the family view too.
 */
export default function MoneyPanel({
  totalCents,
  matches,
  statuses,
  tasks,
  showBreakdown = true,
  className,
}: {
  totalCents: number
  matches: ProgramMatch[]
  statuses: ProgramStatus[]
  tasks: Task[]
  showBreakdown?: boolean
  className?: string
}) {
  const done = tasks.filter((t) => t.status === 'done').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const asOf = matches[0]?.rules_as_of

  return (
    <section
      aria-label="Money in progress"
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-gold/20 blur-3xl"
      />
      <div className="relative">
        <p className="eyebrow text-evergreen">In progress</p>
        <MoneyCounter
          cents={Math.round(totalCents / 10000) * 10000}
          prefix="about"
          label="a year on the table, estimated"
          size="xl"
          className="mt-3"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          That is {formatAbout(totalCents)} a year if the applications are approved. An estimate, not a promise.
        </p>

        {showBreakdown && matches.length > 0 ? (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {matches.map((m) => {
              const status = m.kind === 'draft' ? statusFor(m.program, statuses) : null
              return (
                <li key={m.program} className="flex items-baseline justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {m.name}
                      {m.tier ? <span className="ml-1.5 text-xs font-medium text-muted-foreground">{m.tier}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {status ? STATUS_LABEL[status] : 'Find a provider'}
                      {m.estimate_note ? ` · ${m.estimate_note}` : ''}
                    </p>
                  </div>
                  <p className="numeral shrink-0 text-lg font-semibold">
                    {m.est_annual_cents > 0 ? (
                      formatUSD(m.est_annual_cents, { whole: true })
                    ) : (
                      <span className="font-sans text-xs font-medium text-muted-foreground">not counted</span>
                    )}
                  </p>
                </li>
              )
            })}
          </ul>
        ) : null}

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {done} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} done
            </span>
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Tasks done"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div className="h-full rounded-full bg-good transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {asOf ? <RulesDateStamp asOf={asOf} className="mt-5" /> : null}
      </div>
    </section>
  )
}
