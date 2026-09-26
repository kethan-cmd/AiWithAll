import { Check } from 'lucide-react'
import { SAMPLE } from '@/content/sampleFamily'
import { formatUSD } from '@/lib/money'
import { VALUES } from '@/rules/rules2026'
import { cn } from '@/lib/utils'

const TASKS = [
  { who: SAMPLE.members[0], task: 'Sign the Medicare Savings Program application as authorized representative', state: 'done' as const },
  { who: SAMPLE.members[1], task: 'Book a free SHIP counselor to review and submit', state: 'claimed' as const },
  { who: SAMPLE.members[2], task: `Find a GUIDE provider near Mom (respite up to ${formatUSD(VALUES.guide_respite_annual_max.value, { whole: true })} a year)`, state: 'open' as const },
]

/** The 9/11 Day of Service framing, with a glimpse of the shared task list. */
export default function DayOfService() {
  return (
    <section aria-labelledby="dos-title" className="py-20 sm:py-28">
      <div className="container-page">
        <div className="grain relative overflow-hidden rounded-3xl border border-border bg-gold-soft/70 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow text-gold-foreground">9/11 Day of Service</p>
              <h2 id="dos-title" className="mt-4 text-[2rem] leading-[1.1] font-medium sm:text-[2.8rem]">
                Caregiving is a good deed done every day, <span className="italic">often alone.</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/80">
                On a day set aside for service, we built something for the people who serve without a day off. Money on
                the Table turns a scattered family into one team: one person signs, one calls the counselor, one finds
                respite care. No one carries the paperwork alone.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-lift sm:p-6">
              <div className="flex items-baseline justify-between">
                <p className="font-heading text-lg">What's left for the Park family</p>
                <p className="text-xs text-muted-foreground">Sample</p>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {TASKS.map((t) => (
                  <li key={t.task} className="flex items-start gap-3 py-3.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border',
                        t.state === 'done' ? 'border-good bg-good text-primary-foreground' : 'border-border',
                      )}
                    >
                      {t.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm leading-snug font-medium', t.state === 'done' && 'text-muted-foreground line-through decoration-foreground/30')}>
                        {t.task}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.state === 'open' ? 'Not claimed yet' : `${t.who.alias}, ${t.who.relation.toLowerCase()}`}
                        {t.state === 'done' ? ' · done' : t.state === 'claimed' ? ' · on it' : ''}
                      </p>
                    </div>
                    {t.state === 'open' ? (
                      <span aria-hidden="true" className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Claim</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
