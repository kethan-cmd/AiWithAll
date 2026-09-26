import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, HeartHandshake, UsersRound } from 'lucide-react'
import StepNav from '@/components/layout/StepNav'
import { useSession } from '@/data/session'
import { usePlanData } from '@/features/plan/usePlanData'
import { useEnsurePlan } from '@/features/plan/useEnsurePlan'
import { useTaskToasts } from '@/features/plan/useTaskToasts'
import MoneyPanel from '@/features/plan/MoneyPanel'
import Pipeline from '@/features/plan/Pipeline'
import TaskList from '@/features/plan/TaskList'
import InviteLink from '@/features/plan/InviteLink'
import AiVsPeople from '@/features/plan/AiVsPeople'
import DemoControls from '@/features/plan/DemoControls'
import TaskToasts from '@/features/plan/TaskToasts'
import EmptyState from '@/features/plan/EmptyState'
import MemberAvatar from '@/features/plan/MemberAvatar'

function PlanSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]" aria-busy="true" aria-label="Loading the plan">
      <div className="h-56 animate-pulse rounded-3xl bg-muted" />
      <div className="h-56 animate-pulse rounded-3xl bg-muted" />
    </div>
  )
}

export default function Plan() {
  const { identity } = useSession()
  const data = usePlanData({ householdId: identity?.household_id ?? null })
  const { household, members, tasks, statuses, matches, totalCents, ready, missingDocs, loading } = data
  const isCaregiver = identity?.role === 'caregiver'
  const me = identity?.alias ?? null

  useEnsurePlan(household, matches, missingDocs, isCaregiver && ready)
  const { toasts, dismiss, highlight } = useTaskToasts(tasks, me, loading)

  const drafts = matches.filter((m) => m.kind === 'draft')
  const open = tasks.filter((t) => t.status === 'open').length
  const helpers = new Set(tasks.filter((t) => t.claimed_by && t.claimed_by !== me).map((t) => t.claimed_by as string))

  let body: ReactNode
  if (!identity) {
    body = (
      <EmptyState
        title="Your plan will live here"
        body="Snap four pieces of paperwork, check what we found, and this page turns into a to-do list your whole family can share."
        secondary={{ to: '/start', label: 'Use my own paperwork' }}
      />
    )
  } else if (loading) {
    body = <PlanSkeleton />
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
        title={`Hi ${identity.alias}, your tasks are on the family page`}
        body={`${household.caregiver_alias} keeps the paperwork. You can claim tasks from the family view.`}
        primary={{ to: `/family?h=${encodeURIComponent(household.invite_code)}`, label: 'Open the family view' }}
      />
    )
  } else if (!ready) {
    body = (
      <EmptyState
        title="One step left before the plan"
        body={`Confirm the four facts from ${household.care_recipient_alias}'s paperwork, and we will build the plan and the application drafts from them.`}
        primary={{ to: '/read', label: 'Check the facts' }}
        secondary={{ to: '/start?sample=1', label: 'Use the sample family' }}
      />
    )
  } else {
    body = (
      <>
        {/* Header and money */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-12">
          <header className="animate-rise pt-2 lg:pt-6">
            <p className="eyebrow flex items-center gap-2 text-evergreen">
              <span aria-hidden="true" className="h-px w-6 bg-evergreen/60" />
              Step 3 of 3 · Share the work
            </p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.04] font-medium sm:text-6xl">
              Here's the plan, <span className="marker">{identity.alias}.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The applications for {household.care_recipient_alias} are filled in. What is left needs a person: a signature, a
              counselor visit, a few phone calls. Take one, and hand the rest to family.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="grid size-6 place-items-center rounded-full bg-gold-soft text-xs font-bold text-gold-foreground tabular-nums">
                  {open}
                </span>
                {open === 1 ? 'task up for grabs' : 'tasks up for grabs'}
              </span>
              {helpers.size > 0 ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="flex -space-x-1.5">
                    {[...helpers].map((h) => (
                      <MemberAvatar key={h} name={h} size="sm" className="ring-2 ring-background" />
                    ))}
                  </span>
                  {[...helpers].join(' and ')} {helpers.size === 1 ? 'is' : 'are'} helping
                </span>
              ) : null}
            </div>
          </header>
          <MoneyPanel
            totalCents={totalCents}
            matches={matches}
            statuses={statuses}
            tasks={tasks}
            className="animate-rise delay-var [--delay:120ms]"
          />
        </div>

        {/* On phones the invite comes right after the money, not below every task. */}
        <div className="mt-8 lg:hidden">
          <InviteLink household={household} members={members} />
        </div>

        {/* Pipeline */}
        {drafts.length > 0 ? (
          <section aria-labelledby="pipeline-title" className="mt-16 sm:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow text-evergreen">Where each application stands</p>
                <h2 id="pipeline-title" className="mt-2 text-3xl leading-tight font-medium">
                  From likely to approved
                </h2>
              </div>
              <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm font-medium text-evergreen hover:underline">
                Why these programs
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6">
              <Pipeline householdId={household.id} matches={matches} statuses={statuses} canEdit />
            </div>
          </section>
        ) : null}

        {/* Tasks and family */}
        <div className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <section aria-labelledby="tasks-title">
            <p className="eyebrow text-evergreen">What only a person can do</p>
            <h2 id="tasks-title" className="mt-2 text-3xl leading-tight font-medium">
              What's left
            </h2>
            <p className="mt-2 mb-6 text-muted-foreground">Claim one yourself. Anything open shows up on your family's phones too.</p>
            <TaskList tasks={tasks} me={me} highlight={highlight} />
          </section>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Family and how it works">
            <div className="hidden lg:block">
              <InviteLink household={household} members={members} />
            </div>
            <AiVsPeople draftCount={drafts.length} />
          </aside>
        </div>

        {/* Day of Service note */}
        <section className="mt-16 flex flex-col gap-4 rounded-3xl bg-evergreen-soft p-6 sm:mt-20 sm:flex-row sm:items-center sm:p-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card text-evergreen shadow-card">
            <HeartHandshake className="size-6" aria-hidden="true" />
          </span>
          <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
            Caregiving is a good deed done every day, often alone. Every task someone claims is one less thing{' '}
            {identity.alias} carries alone.
          </p>
        </section>
      </>
    )
  }

  return (
    <div className="container-page pt-6 pb-20 sm:pt-8">
      <StepNav className="mb-10 sm:mb-14" />
      {body}
      <div className="mt-16">
        <DemoControls />
      </div>
      <TaskToasts toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
