import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck, Info } from 'lucide-react'
import RulesDateStamp from '@/components/layout/RulesDateStamp'
import { SectionHead } from '@/components/landing/Section'
import { STATS } from '@/content/stats'
import { formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { EXTRA_HELP_LIMITS, MSP_LIMITS, RULES_AS_OF, RULESET_LABEL, RULESET_NOTE, VALUES } from '@/rules/rules2026'
import type { RuleValue } from '@/rules/rules2026'

/** "$1,483/mo", "$18,090", "$202.90/mo", "$5,700/yr". */
function formatRule(r: RuleValue): string {
  const money = formatUSD(r.value, { whole: r.value % 100 === 0 })
  if (r.unit === 'cents_per_month') return `${money}/mo`
  if (r.unit === 'cents_per_year') return `${money}/yr`
  return money
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('relative inline-flex items-start gap-1 rounded-sm text-evergreen underline-offset-4 hover:underline', className)}
    >
      <span>{children}</span>
      <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function SourceCell({ r }: { r: RuleValue }) {
  return (
    <div className="text-sm">
      <ExternalLink href={r.source_url}>{r.source_name}</ExternalLink>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        <span>Applies from {r.as_of}</span>
        {r.verified ? (
          <span className="inline-flex items-center gap-1 text-good">
            <BadgeCheck className="size-3.5" aria-hidden="true" /> Checked on the source page
          </span>
        ) : null}
      </p>
    </div>
  )
}

interface PairRow {
  label: string
  single: RuleValue | null
  couple: RuleValue | null
  emptyText?: string
}

function PairTable({ caption, rows }: { caption: string; rows: PairRow[] }) {
  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[36rem] text-left">
        <caption className="border-b border-border px-5 py-4 text-left font-heading text-lg font-medium">{caption}</caption>
        <thead>
          <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="px-5 py-3 font-semibold">Rule</th>
            <th scope="col" className="px-5 py-3 font-semibold">Single</th>
            <th scope="col" className="px-5 py-3 font-semibold">Couple</th>
            <th scope="col" className="px-5 py-3 font-semibold">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.label} className="align-top">
              <th scope="row" className="px-5 py-4 text-sm font-medium">{r.label}</th>
              <td className="numeral px-5 py-4 text-lg whitespace-nowrap">{r.single ? formatRule(r.single) : <span className="font-sans text-sm text-muted-foreground">{r.emptyText}</span>}</td>
              <td className="numeral px-5 py-4 text-lg whitespace-nowrap">{r.couple ? formatRule(r.couple) : <span className="font-sans text-sm text-muted-foreground">{r.emptyText}</span>}</td>
              <td className="px-5 py-4">{r.single ? <SourceCell r={r.single} /> : r.couple ? <SourceCell r={r.couple} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const VALUE_ROWS: { label: string; r: RuleValue }[] = [
  { label: 'Standard Part B premium (what an MSP pays)', r: VALUES.part_b_premium_monthly },
  { label: 'Extra Help, estimated yearly value', r: VALUES.extra_help_annual },
  { label: 'GUIDE respite, yearly maximum', r: VALUES.guide_respite_annual_max },
]

export default function Sources() {
  const { hash } = useLocation()
  const target = hash ? decodeURIComponent(hash.slice(1)) : ''

  useEffect(() => {
    document.title = 'Sources and rules | Money on the Table'
  }, [])

  return (
    <div className="pb-8">
      <header className="mesh-hero grain relative border-b border-border">
        <div className="container-page relative z-10 py-14 sm:py-20">
          <p className="eyebrow text-evergreen">Sources</p>
          <h1 className="mt-4 max-w-3xl text-[2.4rem] leading-[1.05] font-medium tracking-[-0.03em] sm:text-6xl">
            Every number, and where it comes from.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Families deserve to check our work. Each figure on this site links to the page it came from, and every
            eligibility rule shows the date it applies from.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <RulesDateStamp asOf={RULES_AS_OF} />
            <nav aria-label="On this page" className="flex flex-wrap gap-2 text-sm">
              {[
                ['#figures', 'The numbers'],
                ['#rules', 'Rules we use'],
                ['#method', 'Method and limits'],
              ].map(([h, l]) => (
                <Link key={h} to={{ pathname: '/sources', hash: h }} className="rounded-full border border-border bg-card/70 px-3 py-1 font-medium text-foreground/80 hover:border-foreground/30 hover:text-foreground">
                  {l}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <section id="figures" aria-labelledby="figures-title" className="container-page scroll-mt-20 py-16 sm:py-20">
        <SectionHead id="figures-title" eyebrow="The numbers" title="Figures on this site" />
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {STATS.map((s, i) => (
            <li
              key={s.id}
              id={s.id}
              className={cn(
                'scroll-mt-24 rounded-2xl border bg-card p-6 shadow-card transition-[box-shadow,border-color] duration-500',
                target === s.id ? 'border-gold ring-4 ring-gold/25' : 'border-border',
              )}
            >
              <div className="flex items-start gap-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-evergreen-soft text-xs font-semibold text-evergreen tabular-nums" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="numeral text-3xl font-medium">{s.value}</p>
                  <p className="mt-1 font-medium">{s.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                  <p className="mt-4 text-sm">
                    <ExternalLink href={s.source_url}>
                      {s.source_name} ({s.year})
                    </ExternalLink>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{hostOf(s.source_url)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="rules" aria-labelledby="rules-title" className="scroll-mt-20 border-y border-border bg-card/50 py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead
              id="rules-title"
              eyebrow="Rules we use"
              title={`The rules table: ${RULESET_LABEL}`}
              lede="The AI reads and fills in. It does not decide who qualifies. A fixed table does, and here it is. Income is gross monthly income."
            />
            <RulesDateStamp asOf={RULES_AS_OF} className="self-start lg:self-auto" />
          </div>
          <p className="mt-6 flex max-w-3xl gap-2 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-evergreen" aria-hidden="true" />
            {RULESET_NOTE}
          </p>

          <div className="mt-10 space-y-8">
            <PairTable
              caption="Medicare Savings Program: monthly income limits"
              rows={[
                { label: 'QMB (pays Part A and B premiums and cost sharing)', single: MSP_LIMITS.QMB.income_individual, couple: MSP_LIMITS.QMB.income_couple },
                { label: 'SLMB (pays the Part B premium)', single: MSP_LIMITS.SLMB.income_individual, couple: MSP_LIMITS.SLMB.income_couple },
                { label: 'QI (pays the Part B premium, while funds last)', single: MSP_LIMITS.QI.income_individual, couple: MSP_LIMITS.QI.income_couple },
                { label: 'Savings limit', single: MSP_LIMITS.resources_individual, couple: MSP_LIMITS.resources_couple, emptyText: 'None in Washington' },
              ]}
            />
            <PairTable
              caption="Extra Help with drug costs: national limits"
              rows={[
                { label: 'Monthly income', single: EXTRA_HELP_LIMITS.income_individual, couple: EXTRA_HELP_LIMITS.income_couple },
                { label: 'Savings and other resources', single: EXTRA_HELP_LIMITS.resources_individual, couple: EXTRA_HELP_LIMITS.resources_couple },
              ]}
            />

            <div className="relative overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
              <table className="w-full min-w-[36rem] text-left">
                <caption className="border-b border-border px-5 py-4 text-left font-heading text-lg font-medium">
                  Dollar values behind the counter
                </caption>
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-5 py-3 font-semibold">Value</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Amount</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {VALUE_ROWS.map(({ label, r }) => (
                    <tr key={label} className="align-top">
                      <th scope="row" className="px-5 py-4 text-sm font-medium">
                        {label}
                        {r.note ? <p className="mt-1 max-w-xs text-xs font-normal leading-relaxed text-muted-foreground">{r.note}</p> : null}
                      </th>
                      <td className="numeral px-5 py-4 text-lg whitespace-nowrap">{formatRule(r)}</td>
                      <td className="px-5 py-4"><SourceCell r={r} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="method" aria-labelledby="method-title" className="container-page scroll-mt-20 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHead id="method-title" eyebrow="Method and limits" title="What these numbers can and cannot tell you." />
          <ul className="space-y-5 text-[1.02rem] leading-relaxed text-muted-foreground">
            {[
              ['Estimates, not promises.', `The yearly total adds the 2026 Part B premium an MSP would pay (${formatUSD(VALUES.part_b_premium_monthly.value)} a month, or ${formatUSD(VALUES.part_b_premium_monthly.value * 12)} a year) and Social Security's estimate for Extra Help (about ${formatUSD(VALUES.extra_help_annual.value, { whole: true })} a year). Real value depends on the person's drugs, plan and situation.`],
              ['One state.', 'Medicare Savings Program limits and forms differ by state. We use Washington\'s standards. Extra Help limits are national.'],
              ['"Likely match" means likely.', 'A fixed rules table compares four confirmed facts to the limits above. The agency decides. Some rules (other income, household members, special deductions) are not modeled.'],
              ['Confirm with a free counselor.', 'SHIP counselors (called SHIBA in Washington) review applications for free. We recommend a counselor checks every draft before it is submitted.'],
              ['Dated on screen.', 'Rules and figures change every year. Each one carries the date it applies from, and the whole table shows the day we last checked it.'],
            ].map(([t, b]) => (
              <li key={t} className="border-l-2 border-gold pl-5">
                <span className="font-semibold text-foreground">{t}</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
