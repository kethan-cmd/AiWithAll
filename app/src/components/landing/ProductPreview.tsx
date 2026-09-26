import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Check, EyeOff, FileCheck2 } from 'lucide-react'
import MoneyCounter from '@/components/brand/MoneyCounter'
import { SAMPLE } from '@/content/sampleFamily'
import { HEADLINE_ESTIMATE } from '@/content/stats'
import { formatAbout, formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

/** Placeholder text line on a mock document. */
function Bar({ w, className }: { w: string; className?: string }) {
  return <span aria-hidden="true" className={cn('block h-[7px] rounded-full bg-foreground/10', className)} style={{ width: w }} />
}

/** A highlight box that draws itself around a found value. */
function Mark({ children, ms, className }: { children: ReactNode; ms: number; className?: string }) {
  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <span
        aria-hidden="true"
        style={delay(ms)}
        className="absolute -inset-x-1.5 -inset-y-1 animate-mark rounded-md border-2 border-gold bg-gold/15 delay-var"
      />
      <span className="relative">{children}</span>
    </span>
  )
}

const birth = new Date(SAMPLE.facts.birth_date + 'T12:00:00').toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * The hero product visual, built in HTML and CSS: a stack of sample
 * documents, a scan line, highlight boxes on each found value and a floating
 * counter chip. Every value is from the fictional sample family.
 */
export default function ProductPreview({ className }: { className?: string }) {
  // Start the count-up when the counter chip has risen into view.
  const [cents, setCents] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => setCents(Math.round(HEADLINE_ESTIMATE.total_cents / 10000) * 10000), reduce ? 0 : 2900)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <figure
      className={cn('relative mx-auto w-full max-w-[26rem] select-none lg:max-w-[30rem]', className)}
      aria-label={`Preview: the app reading a sample benefit letter, finding four facts and estimating ${formatAbout(HEADLINE_ESTIMATE.total_cents)} a year`}
    >
      {/* Back card: sample bank statement */}
      <div
        aria-hidden="true"
        className="absolute top-2 -right-1 w-[78%] rotate-[5deg] rounded-2xl border border-border bg-card p-4 shadow-card sm:-right-6"
      >
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Bank statement</p>
        <p className="mt-1 text-xs font-medium text-foreground/80">{SAMPLE.docs.bank_name}</p>
        <div className="mt-3 space-y-2">
          <Bar w="70%" />
          <Bar w="55%" />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Ending balance</span>
          <span className="font-semibold tabular-nums">{formatUSD(SAMPLE.facts.bank_balance_cents)}</span>
        </div>
      </div>

      {/* Back card: sample Medicare card */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-0 w-[62%] -rotate-[7deg] rounded-2xl border border-evergreen/20 bg-evergreen-soft p-4 shadow-card sm:-left-8"
      >
        <p className="text-[10px] font-semibold tracking-wide text-evergreen uppercase">Medicare card</p>
        <p className="mt-1 text-xs font-semibold tracking-wide text-foreground/80">{SAMPLE.docs.person_name}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-foreground/70">
          <span>Hospital (Part A)</span>
          <span>Medical (Part B)</span>
        </div>
      </div>

      {/* Front card: sample benefit letter being read */}
      <div className="relative mt-16 ml-auto w-[92%] overflow-hidden sm:mt-24 rounded-2xl border border-border bg-card p-5 shadow-lift ruled sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-card to-transparent" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Benefit letter</p>
            <p className="mt-1 font-heading text-base font-semibold">{SAMPLE.docs.person_name}</p>
            <p className="text-xs text-muted-foreground">{SAMPLE.docs.ssa_letter_date}</p>
          </div>
          <span className="rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-bold tracking-widest text-warn uppercase">
            Sample
          </span>
        </div>

        <div className="relative mt-5 space-y-2.5" aria-hidden="true">
          <Bar w="92%" />
          <Bar w="84%" />
          <Bar w="64%" />
        </div>

        <dl className="relative mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Monthly benefit</dt>
            <dd className="font-semibold tabular-nums">
              <Mark ms={900}>{formatUSD(SAMPLE.facts.monthly_income_cents)}</Mark>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Date of birth</dt>
            <dd className="font-semibold tabular-nums">
              <Mark ms={1500}>{birth}</Mark>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Social Security no.</dt>
            <dd className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <EyeOff className="size-3.5" aria-hidden="true" />
              Not read
            </dd>
          </div>
        </dl>

        <div className="relative mt-5 space-y-2.5" aria-hidden="true">
          <Bar w="88%" />
          <Bar w="42%" />
        </div>

        {/* Scan line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-10 animate-scan motion-reduce:hidden"
          style={{
            background:
              'linear-gradient(to bottom, transparent, color-mix(in oklch, var(--gold) 22%, transparent) 70%, color-mix(in oklch, var(--gold) 85%, transparent) 96%, transparent)',
          }}
        />
      </div>

      {/* Floating chip: facts found */}
      <div
        style={delay(1900)}
        className="absolute top-0 right-2 animate-rise rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lift backdrop-blur delay-var sm:-right-4"
      >
        <p className="flex items-center gap-2 text-xs font-semibold">
          <span className="grid size-5 place-items-center rounded-full bg-good text-primary-foreground">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          </span>
          4 facts found
        </p>
        <p className="mt-0.5 pl-7 text-[11px] text-muted-foreground">You confirm each one</p>
      </div>

      {/* Floating chip: draft ready */}
      <div
        style={delay(2400)}
        className="absolute -bottom-7 -left-1 animate-rise rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-lift backdrop-blur delay-var sm:-left-10"
      >
        <p className="flex items-center gap-2 text-xs font-semibold">
          <FileCheck2 className="size-4 text-evergreen" aria-hidden="true" />
          2 drafts ready to check and sign
        </p>
        <p className="mt-0.5 pl-6 text-[11px] text-muted-foreground">Medicare Savings, Extra Help</p>
      </div>

      {/* Floating chip: the counter */}
      <div
        style={delay(2800)}
        className="absolute -right-1 -bottom-16 animate-rise rounded-2xl border border-gold/50 bg-card px-4 py-3 shadow-lift delay-var sm:-right-8"
      >
        <p className="eyebrow text-[10px] text-gold-foreground">In progress</p>
        <div className="mt-1 animate-float">
          <MoneyCounter cents={cents} prefix="about" suffix="/yr" size="md" />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Estimate for the sample family</p>
      </div>
    </figure>
  )
}
