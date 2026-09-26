import { Link } from 'react-router-dom'
import { ArrowRight, Check, ExternalLink, HandHeart, Pill, Receipt, X } from 'lucide-react'
import type { PipelineStatus, ProgramMatch } from '@/contracts'
import { buttonVariants } from '@/components/ui/button'
import { formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { TIER_NAMES } from '@/rules/engine'
import LikelyBadge from './LikelyBadge'

const ICONS = { msp: Receipt, extra_help: Pill, guide: HandHeart } as const

const KICKER: Record<ProgramMatch['program'], string> = {
  msp: 'Pays the Part B premium',
  extra_help: 'Lowers prescription costs',
  guide: 'Dementia care and respite',
}

const STATUS_TEXT: Partial<Record<PipelineStatus, string>> = {
  drafted: 'Draft ready',
  signed: 'Signed',
  submitted: 'Submitted',
  approved: 'Approved',
}

/** One program: why it matched, what it is worth, and the next step. */
export default function ProgramCard({
  match,
  status,
  className,
}: {
  match: ProgramMatch
  status?: PipelineStatus
  className?: string
}) {
  const Icon = ICONS[match.program]
  const titleId = `program-${match.program}`
  const isTask = match.kind === 'task'
  const statusText = status ? STATUS_TEXT[status] : undefined

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group relative flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-7',
        !match.likely && 'opacity-80',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-2xl',
            isTask ? 'bg-evergreen-soft text-evergreen' : 'bg-gold-soft text-gold-foreground',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {statusText ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{statusText}</span>
        ) : null}
      </div>

      <p className="eyebrow mt-5 text-muted-foreground">{KICKER[match.program]}</p>
      <h3 id={titleId} className="mt-1.5 text-2xl leading-tight font-medium">
        {match.name}
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        {match.likely ? (
          <LikelyBadge />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            Not a match on these facts
          </span>
        )}
        {match.tier ? (
          <span className="text-sm text-muted-foreground" title={TIER_NAMES[match.tier]}>
            <span className="font-semibold text-foreground">{match.tier}</span> level
            <span className="sr-only"> ({TIER_NAMES[match.tier]})</span>
          </span>
        ) : null}
      </div>

      <ul className="mt-5 space-y-2.5" aria-label="Why">
        {match.reasons.map((r) => (
          <li key={r} className="flex gap-2.5 text-sm leading-snug text-foreground/90">
            {match.likely ? (
              <Check className="mt-0.5 size-4 shrink-0 text-good" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-muted/60 px-4 py-3.5">
          {isTask ? (
            <p className="numeral text-xl font-semibold text-foreground">
              A family task<span className="sr-only">, not counted in the total</span>
            </p>
          ) : (
            <p className="flex items-baseline gap-1">
              <span className="numeral text-3xl font-semibold text-foreground">
                {formatUSD(match.est_annual_cents, { whole: true })}
              </span>
              <span className="text-sm font-medium text-muted-foreground">/yr, estimated</span>
            </p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {isTask ? `Worth ${match.estimate_note}. Not counted in the total.` : match.estimate_note}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {match.likely && !isTask ? (
            <Link
              to={`/draft/${match.program}`}
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-2 px-5 text-sm font-semibold')}
            >
              Open draft
              <span className="sr-only"> for {match.name}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          ) : match.likely && isTask ? (
            <Link
              to="/plan"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 gap-2 px-5 text-sm font-semibold')}
            >
              Becomes a family task
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <a
              href={match.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-evergreen hover:underline"
            >
              About this program
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
