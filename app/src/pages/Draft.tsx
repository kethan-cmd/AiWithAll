import '@/styles/print.css'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, FileSignature, ListChecks, UserRoundCheck } from 'lucide-react'
import RulesDateStamp from '@/components/layout/RulesDateStamp'
import StepNav from '@/components/layout/StepNav'
import EmptyState from '@/features/plan/EmptyState'
import DraftForm from '@/features/programs/DraftForm'
import LikelyBadge from '@/features/programs/LikelyBadge'
import StillNeeded from '@/features/programs/StillNeeded'
import { buildDraft } from '@/features/programs/drafts'
import { useMatches } from '@/features/programs/useMatches'
import { cn } from '@/lib/utils'
import { PROGRAM_SOURCES, RULES_AS_OF } from '@/rules/rules2026'

type DraftProgram = 'msp' | 'extra_help'

const TABS: { id: DraftProgram; label: string }[] = [
  { id: 'msp', label: 'Medicare Savings Program' },
  { id: 'extra_help', label: 'Extra Help' },
]

function isDraftProgram(p: string | undefined): p is DraftProgram {
  return p === 'msp' || p === 'extra_help'
}

export default function Draft() {
  const { programId } = useParams()
  const { loading, signedIn, isCaregiver, household, facts, confirmed, matches } = useMatches()

  let body
  if (!isDraftProgram(programId)) {
    body = (
      <EmptyState
        title="There is no draft by that name"
        body="We prepare two applications: the Medicare Savings Program and Extra Help. Pick one from your matches."
        primary={{ to: '/matches', label: 'See your matches' }}
      />
    )
  } else if (!signedIn) {
    body = (
      <EmptyState
        title="Your application drafts will show up here"
        body="Snap the paperwork you already have and check four facts. We fill in the applications from them."
        secondary={{ to: '/start', label: 'Use my own paperwork' }}
      />
    )
  } else if (loading) {
    body = <div className="h-[70vh] animate-pulse rounded-3xl bg-muted" aria-busy="true" aria-label="Preparing the draft" />
  } else if (!household || !isCaregiver) {
    body = (
      <EmptyState
        title="Drafts stay with the caregiver"
        body="Application drafts hold private details, so they open only in the caregiver's tab."
        primary={household ? { to: `/family?h=${encodeURIComponent(household.invite_code)}`, label: 'Open the family view' } : undefined}
      />
    )
  } else if (!confirmed) {
    body = (
      <EmptyState
        title="Check the four facts first"
        body="The draft is filled in from the facts you confirm. It takes about a minute."
        primary={{ to: '/read', label: 'Check the facts' }}
        secondary={{ to: '/start?sample=1', label: 'Load sample family' }}
      />
    )
  } else {
    const draft = buildDraft(programId, confirmed, facts, household)
    const match = matches.find((m) => m.program === programId)
    const who = household.caregiver_alias
    const steps = [
      {
        icon: ListChecks,
        title: 'You check every field',
        text: 'Each value shows the paper it came from. Fix anything that looks off before you copy it over.',
      },
      {
        icon: FileSignature,
        title: `${who} signs as authorized representative`,
        text: `Write the Social Security and Medicare numbers by hand, then sign. The app never signs for ${household.care_recipient_alias}.`,
      },
      {
        icon: UserRoundCheck,
        title: 'A free SHIP counselor reviews and submits',
        text: 'They confirm the match, check the form with you and help send it in. There is no charge.',
      },
    ]

    body = (
      <>
        <div data-print-hide className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="animate-rise">
            <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm font-medium text-evergreen hover:underline">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to matches
            </Link>
            <h1 className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl">Ready to check and sign</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              We filled in what the paperwork shows. The gold boxes came from {household.care_recipient_alias}'s documents;
              the dashed ones are yours to write by hand.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {match?.likely ? <LikelyBadge /> : null}
              <RulesDateStamp asOf={RULES_AS_OF} />
            </div>
          </div>
          <nav aria-label="Application drafts" className="inline-flex shrink-0 rounded-full border border-border bg-card p-1 shadow-card">
            {TABS.map((t) => (
              <Link
                key={t.id}
                to={`/draft/${t.id}`}
                aria-current={t.id === programId ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  t.id === programId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>

        {match && !match.likely ? (
          <p data-print-hide role="note" className="mt-6 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-4 text-sm text-foreground">
            On these facts, {household.care_recipient_alias} is not a likely match for this program. You can still apply; a
            counselor can tell you if it is worth it.
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <DraftForm key={draft.program} draft={draft} household={household} className="animate-rise delay-var [--delay:100ms]" />

          <aside data-print-hide aria-label="What happens next" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section aria-labelledby="next-title" className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 id="next-title" className="text-xl font-medium">
                What happens next
              </h2>
              <ol className="mt-5 space-y-5">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3.5">
                    <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-evergreen-soft text-evergreen">
                      <s.icon className="size-4" aria-hidden="true" />
                      <span className="sr-only">Step {i + 1}</span>
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href={PROGRAM_SOURCES.ship_locator}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-evergreen hover:underline"
              >
                Find a free SHIP counselor
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </section>

            <StillNeeded items={draft.still_needed} />

            <Link
              to="/plan"
              className="group flex items-center justify-between gap-3 rounded-3xl bg-evergreen-deep px-6 py-5 text-on-deep shadow-card transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span>
                <span className="block text-xs font-semibold tracking-[0.12em] text-on-deep-muted uppercase">Next</span>
                <span className="mt-1 block font-heading text-lg">Hand the rest to family</span>
              </span>
              <ArrowLeft className="size-5 rotate-180 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </>
    )
  }

  return (
    <div className="container-page pt-6 pb-20 sm:pt-8">
      <StepNav className="mb-10 sm:mb-12" />
      {body}
    </div>
  )
}
