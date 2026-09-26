import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Lock, LogOut } from 'lucide-react'
import MoneyCounter from '@/components/brand/MoneyCounter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setIdentity, useSession } from '@/data/session'
import { usePlanData } from '@/features/plan/usePlanData'
import { useTaskToasts } from '@/features/plan/useTaskToasts'
import NamePicker from '@/features/plan/NamePicker'
import TaskCard from '@/features/plan/TaskCard'
import TaskToasts from '@/features/plan/TaskToasts'
import MemberAvatar from '@/features/plan/MemberAvatar'

function CodeForm({ initial }: { initial: string }) {
  const navigate = useNavigate()
  const [code, setCode] = useState(initial)
  function submit(e: FormEvent) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (c) navigate(`/family?h=${encodeURIComponent(c)}`)
  }
  return (
    <div className="mx-auto max-w-md">
      <p className="eyebrow text-evergreen">Family link</p>
      <h1 className="mt-3 text-4xl leading-tight font-medium">
        {initial ? "We couldn't find that family" : 'Join your family'}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {initial
          ? 'The link may be mistyped, or the caregiver started over. Check the code they sent you.'
          : 'Type the family code from the link the caregiver sent you. It looks like PARK-4821.'}
      </p>
      <form onSubmit={submit} className="mt-8 grid gap-2">
        <Label htmlFor="family-code">Family code</Label>
        <div className="flex gap-2">
          <Input
            id="family-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="characters"
            spellCheck={false}
            className="h-12 font-mono text-lg tracking-wider uppercase"
          />
          <Button type="submit" size="lg" className="h-12 gap-2 px-5 font-semibold">
            Go
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        Looking after someone yourself?{' '}
        <a href="#/start?sample=1" className="font-medium text-evergreen underline underline-offset-4">
          See how it works with a sample family
        </a>
        .
      </p>
    </div>
  )
}

export default function Family() {
  const [params] = useSearchParams()
  const code = params.get('h') ?? ''
  const { identity } = useSession()
  const { household, members, tasks, totalCents, ready, loading } = usePlanData({ inviteCode: code })
  const me = identity && household && identity.household_id === household.id ? identity.alias : null
  // The caregiver previewing their own link sees the family view as themselves
  // and is never offered a way to sign out of the caregiver session.
  const isCaregiver = !!me && identity?.role === 'caregiver'
  const { toasts, dismiss, highlight } = useTaskToasts(tasks, me, loading)

  let body
  if (loading) {
    body = <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-3xl bg-muted" aria-busy="true" aria-label="Loading" />
  } else if (!household) {
    body = <CodeForm initial={code} />
  } else if (!me) {
    body = <NamePicker household={household} members={members} />
  } else {
    const mine = tasks.filter((t) => t.status === 'claimed' && t.claimed_by === me)
    const open = tasks.filter((t) => t.status === 'open')
    const others = tasks.filter((t) => t.status === 'claimed' && t.claimed_by !== me)
    const done = tasks.filter((t) => t.status === 'done')
    const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0
    const nameParts = household.care_recipient_alias.trim().split(/\s+/)
    const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Your'

    body = (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MemberAvatar name={me} size="sm" />
            {isCaregiver ? 'Previewing as' : 'Helping as'} <span className="font-semibold text-foreground">{me}</span>
          </p>
          {isCaregiver ? (
            <Link to="/plan" className="text-sm font-medium text-evergreen underline-offset-4 hover:underline">
              Back to your plan
            </Link>
          ) : (
            <Button
              variant="ghost"
              className="h-9 gap-1.5 text-muted-foreground"
              onClick={() => setIdentity(null)}
              aria-label={`Not ${me}? Switch person`}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Not {me}?
            </Button>
          )}
        </div>

        <header className="mt-8 animate-rise">
          <p className="eyebrow text-evergreen">
            {familyName} family plan · <span className="font-mono tracking-wider">{household.invite_code}</span>
          </p>
          <h1 className="mt-3 text-[2.2rem] leading-[1.08] font-medium sm:text-5xl">
            Help {household.caregiver_alias} claim the benefits{' '}
            <span className="marker">{household.care_recipient_alias}</span> likely qualifies for.
          </h1>
        </header>

        <section
          aria-label="Money in progress"
          className="relative mt-8 overflow-hidden rounded-3xl bg-evergreen-deep p-6 text-on-deep shadow-lift grain sm:p-8"
        >
          <div className="relative z-10">
            {ready ? (
              <>
                <p className="eyebrow text-gold">In progress for the family</p>
                <div className="mt-3 rounded-2xl bg-card px-5 py-4 text-card-foreground">
                  <MoneyCounter
                    cents={Math.round(totalCents / 10000) * 10000}
                    prefix="about"
                    label="a year on the table, estimated"
                    size="lg"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow text-gold">Getting ready</p>
                <p className="mt-3 text-lg text-on-deep">
                  {household.caregiver_alias} is still checking the paperwork. Tasks show up here as soon as the plan is
                  ready.
                </p>
              </>
            )}
            <div className="mt-5 flex items-center justify-between text-sm text-on-deep-muted">
              <span>
                {done.length} of {tasks.length} tasks done
              </span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-white/12"
              role="progressbar"
              aria-label="Tasks done"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        {mine.length > 0 ? (
          <section aria-labelledby="mine-title" className="mt-10">
            <h2 id="mine-title" className="text-2xl font-medium">
              Yours
            </h2>
            <ul className="mt-4 space-y-3">
              {mine.map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} me={me} highlight={highlight.has(t.id)} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="open-title" className="mt-10">
          <h2 id="open-title" className="text-2xl font-medium">
            Up for grabs
          </h2>
          {open.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {open.map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} me={me} highlight={highlight.has(t.id)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {tasks.length === 0 ? 'No tasks yet.' : 'Every task has someone on it. Thank you.'}
            </p>
          )}
        </section>

        {others.length + done.length > 0 ? (
          <section aria-labelledby="team-title" className="mt-10">
            <h2 id="team-title" className="text-2xl font-medium">
              The rest of the team
            </h2>
            <ul className="mt-4 space-y-3">
              {[...others, ...done].map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} me={me} highlight={highlight.has(t.id)} compact />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-10 flex items-start gap-3 rounded-2xl bg-muted px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0 text-evergreen" aria-hidden="true" />
          <span>
            You'll never see documents here, only tasks. The paperwork and the numbers on it stay with{' '}
            {household.caregiver_alias}.
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="container-page pt-6 pb-20 sm:pt-8">
      {body}
      <TaskToasts toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
