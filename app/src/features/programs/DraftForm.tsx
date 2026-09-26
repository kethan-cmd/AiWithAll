import { ExternalLink, Printer } from 'lucide-react'
import type { Draft, Household } from '@/contracts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import DraftFieldRow from './DraftFieldRow'
import { FORM_NUMBERS, formatLongDate } from './drafts'

function todayIso(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Fields grouped by the form section they sit in, keeping form order. */
function sections(draft: Draft): { title: string; fields: Draft['fields'] }[] {
  const out: { title: string; fields: Draft['fields'] }[] = []
  for (const f of draft.fields) {
    const last = out[out.length - 1]
    if (last && last.title === f.form_ref) last.fields.push(f)
    else out.push({ title: f.form_ref, fields: [f] })
  }
  return out
}

/** Wide fields take the full row on larger screens. */
const WIDE = new Set(['address', 'income', 'rep', 'helper', 'signature'])

/**
 * The application draft, laid out like a sheet of paper: a form header,
 * numbered sections, gold pre-filled values with their source, and dashed
 * boxes for everything a person writes by hand. Marked as a draft on screen
 * and on paper.
 */
export default function DraftForm({ draft, household, className }: { draft: Draft; household: Household; className?: string }) {
  const meta = FORM_NUMBERS[draft.program]
  const filledCount = draft.fields.filter((f) => f.value !== null).length
  const handCount = draft.fields.length - filledCount
  const titleId = `draft-title-${draft.program}`

  return (
    <article
      aria-labelledby={titleId}
      data-print-root
      className={cn(
        'draft-paper paper-light relative isolate overflow-hidden rounded-[1.1rem] border border-border bg-card text-card-foreground shadow-lift dark:shadow-[0_0_0_1px_oklch(1_0_0/0.08),0_24px_60px_-16px_oklch(0_0_0/0.75)]',
        className,
      )}
    >
      {/* Watermark */}
      <div aria-hidden="true" className="draft-watermark pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <span className="font-heading -rotate-[24deg] text-[clamp(2.6rem,9vw,5.5rem)] font-semibold tracking-tight whitespace-nowrap text-foreground/[0.045] select-none">
          DRAFT, not submitted
        </span>
      </div>

      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-3 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {meta.number} <span aria-hidden="true">·</span> {meta.agency}
        </p>
        <span className="draft-stamp inline-flex items-center rounded-md border-[1.5px] border-warn/60 px-2 py-0.5 text-[0.7rem] font-bold tracking-[0.12em] text-warn uppercase">
          Draft, not submitted
        </span>
      </div>

      <div className="px-5 pt-7 pb-8 sm:px-8 sm:pt-9 sm:pb-10">
        <header className="border-b-2 border-foreground/80 pb-5">
          <h2 id={titleId} className="text-2xl leading-tight font-medium sm:text-[2rem]">
            {draft.form_name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Prepared for <span className="font-semibold text-foreground">{household.care_recipient_alias}</span> on{' '}
            {formatLongDate(todayIso())}. {filledCount} fields filled from the paperwork, {handCount} left for you to write
            by hand.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Legend">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-6 rounded-sm border border-gold/45 bg-gold-soft" />
              Filled from paperwork
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-6 rounded-sm border-[1.5px] border-dashed border-foreground/30" />
              Fill by hand
            </span>
          </div>
        </header>

        <div className="mt-2">
          {sections(draft).map((s, i) => (
            <section key={s.title} aria-label={s.title} className="border-b border-rule py-6 last:border-b-0 last:pb-0">
              <h3 className="flex items-baseline gap-3 font-sans text-sm font-semibold tracking-normal">
                <span className="numeral text-lg text-evergreen">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h3>
              <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {s.fields.map((f) => (
                  <DraftFieldRow key={f.id} field={f} className={WIDE.has(f.id) ? 'sm:col-span-2' : undefined} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-8 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            A draft to copy onto the official form. The app never signs or submits. A free SHIP counselor can check it with
            you before it goes in.
          </p>
          <div className="flex flex-wrap gap-2" data-print-hide>
            <a
              href={draft.form_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted"
            >
              Official form
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <Button type="button" onClick={() => window.print()} className="h-10 gap-2 px-4 text-sm font-semibold">
              <Printer className="size-4" aria-hidden="true" />
              Print draft
            </Button>
          </div>
        </footer>
      </div>
    </article>
  )
}
