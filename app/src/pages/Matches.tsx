import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeInfo, ExternalLink, PencilLine, UsersRound } from 'lucide-react'
import MoneyCounter from '@/components/brand/MoneyCounter'
import RulesDateStamp from '@/components/layout/RulesDateStamp'
import StepNav from '@/components/layout/StepNav'
import { buttonVariants } from '@/components/ui/button'
import EmptyState from '@/features/plan/EmptyState'
import ProgramCard from '@/features/programs/ProgramCard'
import { useMatches } from '@/features/programs/useMatches'
import { advanceProgram } from '@/data/actions'
import { formatUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { ageOn, money } from '@/rules/engine'
import { PROGRAM_SOURCES, RULES_AS_OF, RULESET_LABEL, RULESET_NOTE, VALUES } from '@/rules/rules2026'

function todayIso(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function Skeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Checking the rules">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
      ))}
    </div>
  )
}

export default function Matches() {
  const { loading, signedIn, isCaregiver, household, confirmed, matches, likely, totalCents, statuses } = useMatches()

  // Make sure each likely program has a pipeline record: drafts start at
  // "drafted", GUIDE (no application) at "likely". Forward only, so an
  // application that is already signed or submitted is never moved back.
  const key = household ? `${household.id}|${likely.map((m) => m.program).join(',')}` : ''
  useEffect(() => {
    if (!household || !isCaregiver || likely.length === 0) return
    let cancelled = false
    ;(async () => {
      for (const m of likely) {
        if (cancelled) return
        await advanceProgram(household.id, m.program, m.kind === 'draft' ? 'drafted' : 'likely')
      }
    })()
    return () => {
      cancelled = true
    }
    // key captures the household and the set of likely programs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isCaregiver])

  let body
  if (!signedIn) {
    body = (
      <EmptyState
        title="Your matches will show up here"
        body="Snap four pieces of paperwork and check what we found. We compare the facts to the 2026 rules and show what your family could claim."
        secondary={{ to: '/start', label: 'Use my own paperwork' }}
      />
    )
  } else if (loading) {
    body = <Skeleton />
  } else if (!household) {
    body = (
      <EmptyState
        title="We lost track of this family"
        body="The records for this tab were cleared, maybe from another tab. Start again with the sample family, it takes about a minute."
      />
    )
  } else if (!isCaregiver) {
    body = (
      <EmptyState
        icon={<UsersRound className="size-6" aria-hidden="true" />}
        title="The paperwork stays with the caregiver"
        body={`${household.caregiver_alias} keeps ${household.care_recipient_alias}'s facts private. You can see and claim tasks on the family page.`}
        primary={{ to: `/family?h=${encodeURIComponent(household.invite_code)}`, label: 'Open the family view' }}
      />
    )
  } else if (!confirmed) {
    body = (
      <EmptyState
        title="Check the four facts first"
        body={`Confirm ${household.care_recipient_alias}'s birth date, Medicare parts, monthly income and bank balance. Then we can check the rules.`}
        primary={{ to: '/read', label: 'Check the facts' }}
        secondary={{ to: '/start?sample=1', label: 'Load sample family' }}
      />
    )
  } else {
    const name = household.care_recipient_alias.split(' ')[0]
    const drafts = likely.filter((m) => m.kind === 'draft')
    const familyTasks = likely.length - drafts.length
    const roundedCents = Math.round(totalCents / 10000) * 10000
    const heading =
      drafts.length > 0 && familyTasks > 0
        ? `${drafts.length === 1 ? 'One application' : `${drafts.length} applications`} to sign, plus ${familyTasks === 1 ? 'one family task' : `${familyTasks} family tasks`}`
        : drafts.length > 0
          ? drafts.length === 1
            ? 'One application to sign'
            : `${drafts.length} applications to sign`
          : familyTasks === 1
            ? 'One family task'
            : `${familyTasks} family tasks`
    const others = matches.filter((m) => !m.likely)
    const age = ageOn(confirmed.birth_date, todayIso())
    const partsLabel = `Medicare ${[...confirmed.medicare_parts].sort().join(' + ')}`
    const factChips = [
      `Age ${age}`,
      partsLabel,
      `${money(confirmed.monthly_income_cents)}/mo income`,
      `${money(confirmed.bank_balance_cents)} in the bank`,
    ]

    body = (
      <>
        {/* Hero */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
          <header className="animate-rise">
            <p className="eyebrow flex items-center gap-2 text-evergreen">
              <span aria-hidden="true" className="h-px w-6 bg-evergreen/60" />
              Step 2 of 3 · What we found
            </p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.04] font-medium sm:text-6xl">
              There's money on the table for <span className="marker">{name}.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {likely.length === 0
                ? `On these facts, ${name} is not a likely match for the programs we check. A free counselor can look for others.`
                : `We checked ${name}'s facts against the ${RULESET_LABEL} rules. ${
                    drafts.length > 0
                      ? `${drafts.length === 1 ? 'One application is' : `${drafts.length} applications are`} already filled in, ready for you to check and sign.`
                      : ''
                  }`}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Facts you confirmed">
              {factChips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/90 shadow-card"
                >
                  {c}
                </li>
              ))}
              <li>
                <Link
                  to="/read"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-evergreen hover:bg-evergreen-soft"
                >
                  <PencilLine className="size-3.5" aria-hidden="true" />
                  Change a fact
                </Link>
              </li>
            </ul>
          </header>

          <section
            aria-label="Estimated yearly value"
            className="animate-rise delay-var relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-7 shadow-lift [--delay:120ms] sm:p-9"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative">
              <p className="eyebrow text-gold-foreground">On the table each year</p>
              <MoneyCounter
                cents={roundedCents}
                prefix="about"
                size="xl"
                label="a year, estimated"
                className="mt-4"
              />
              {likely.some((m) => m.est_annual_cents > 0) ? (
                <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
                  {likely
                    .filter((m) => m.est_annual_cents > 0)
                    .map((m) => (
                      <div key={m.program} className="flex items-baseline justify-between gap-4">
                        <dt className="text-muted-foreground">{m.name}</dt>
                        <dd className="numeral font-semibold tabular-nums">
                          {m.program === 'extra_help' ? 'about ' : ''}
                          {formatUSD(m.est_annual_cents, { whole: true })}
                        </dd>
                      </div>
                    ))}
                  {likely.some((m) => m.program === 'guide') ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted-foreground">GUIDE respite (not counted)</dt>
                      <dd className="font-medium text-muted-foreground tabular-nums">
                        up to {formatUSD(VALUES.guide_respite_annual_max.value, { whole: true })}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <RulesDateStamp asOf={RULES_AS_OF} />
                <span className="text-xs text-muted-foreground" title={RULESET_NOTE}>
                  {RULESET_LABEL} rules
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Programs */}
        {likely.length > 0 ? (
          <section aria-labelledby="likely-title" className="mt-16 sm:mt-20">
            <p className="eyebrow text-evergreen">Likely matches</p>
            <h2 id="likely-title" className="mt-2 text-3xl leading-tight font-medium sm:text-4xl">
              {heading}
            </h2>
            <ul className={cn('mt-8 grid gap-6', likely.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
              {likely.map((m, i) => (
                <li
                  key={m.program}
                  className="animate-rise delay-var"
                  style={{ ['--delay' as string]: `${160 + i * 90}ms` }}
                >
                  <ProgramCard match={m} status={statuses.find((s) => s.program === m.program)?.status} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Counselor note */}
        <aside className="mt-10 flex flex-col gap-4 rounded-3xl border border-border bg-evergreen-soft/70 p-6 sm:flex-row sm:items-start sm:p-7">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-evergreen shadow-card">
            <BadgeInfo className="size-5" aria-hidden="true" />
          </span>
          <div className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            <p className="font-semibold text-foreground">Likely, not guaranteed: a free SHIP counselor confirms.</p>
            <p className="mt-1">
              These are estimates from a fixed rules table, checked on the date shown. Every state has a free, unbiased
              Medicare counselor (SHIP) who can confirm the match and help send the forms.{' '}
              <a
                href={PROGRAM_SOURCES.ship_locator}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-evergreen underline-offset-4 hover:underline"
              >
                Find your SHIP
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          </div>
        </aside>

        {/* Not a match */}
        {others.length > 0 ? (
          <section aria-labelledby="others-title" className="mt-16">
            <h2 id="others-title" className="text-2xl leading-tight font-medium">
              Not a match on these facts
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              If a fact looks wrong, change it and we will check again. A counselor may still find a way.
            </p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((m) => (
                <li key={m.program}>
                  <ProgramCard match={m} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Next step */}
        <section className="grain relative mt-16 overflow-hidden rounded-[1.75rem] bg-evergreen-deep px-6 py-10 text-on-deep sm:mt-20 sm:px-12 sm:py-14">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-on-deep-muted">Next · Share the work</p>
              <h2 className="mt-3 text-3xl leading-tight font-medium text-on-deep sm:text-4xl">
                The AI filled in the forms. The rest needs people.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-on-deep-muted sm:text-lg">
                Signing, a counselor visit, finding a GUIDE provider: turn them into tasks your family can claim, so{' '}
                {household.caregiver_alias} is not doing it alone.
              </p>
            </div>
            <Link
              to="/plan"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-13 shrink-0 gap-2 bg-gold px-7 text-base font-semibold text-evergreen-deep hover:bg-gold/90',
              )}
            >
              Turn this into a family plan
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <div className="container-page pt-6 pb-20 sm:pt-8">
      <StepNav className="mb-10 sm:mb-14" />
      {body}
    </div>
  )
}
