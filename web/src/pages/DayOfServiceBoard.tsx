import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtHours } from '@/components/MetricCards'
import { CareCircleEntity, TaskEntity, TeamEntity } from '@/data/entities'
import { useEntityList } from '@/hooks/useEntityList'
import {
  blockers,
  consecutiveFreeHours,
  describeWindow,
  hoursReturned,
  isCovered,
  isPosted,
  windowHours,
  windowStatus,
  type WindowStatus,
} from '@/logic/grid'

const STATUS_STYLE: Record<WindowStatus, { label: string; card: string; pill: string }> = {
  blocked: {
    label: 'BLOCKED',
    card: 'border-busy/60 bg-white/5',
    pill: 'bg-busy text-white',
  },
  last_slot: {
    label: 'LAST SLOT',
    card: 'border-gold bg-gold/15 animate-glow',
    pill: 'bg-gold text-gold-foreground',
  },
  unlocked: {
    label: 'UNLOCKED',
    card: 'border-good bg-good/25',
    pill: 'bg-good text-white',
  },
}

/** Projector screen: big type, high contrast, live across tabs. */
export default function DayOfServiceBoard() {
  const circles = useEntityList(CareCircleEntity)
  const tasksState = useEntityList(TaskEntity)
  const teams = useEntityList(TeamEntity)

  const rows = useMemo(() => {
    const posted = tasksState.items.filter(isPosted)
    return circles.items.map((c) => {
      const tasks = posted.filter((t) => t.circle_id === c.id)
      const w = c.rest_window
      return {
        circle: c,
        status: windowStatus(tasks, w),
        blockerCount: blockers(tasks, w).length,
        free: consecutiveFreeHours(tasks, w),
        windowHrs: windowHours(w),
        returned: hoursReturned(tasks),
      }
    })
  }, [circles.items, tasksState.items])

  const unlocked = rows.filter((r) => r.status === 'unlocked').length
  const totalReturned = rows.reduce((s, r) => s + r.returned, 0)

  const leaderboard = useMemo(() => {
    const posted = tasksState.items.filter((t) => isPosted(t) && isCovered(t) && t.team_id)
    return teams.items
      .map((team) => {
        const mine = posted.filter((t) => t.team_id === team.id)
        return {
          team,
          hours: hoursReturned(mine),
          tasks: mine.length,
          verified: mine.filter((t) => t.status === 'verified').length,
        }
      })
      .sort((a, b) => b.hours - a.hours)
  }, [tasksState.items, teams.items])
  const maxHours = Math.max(1, ...leaderboard.map((l) => l.hours))

  // Announce a window the moment it unlocks.
  const seen = useRef<Set<string> | null>(null)
  const [announce, setAnnounce] = useState('')
  const loading = circles.loading || tasksState.loading
  useEffect(() => {
    if (loading) return
    const now = new Set(rows.filter((r) => r.status === 'unlocked').map((r) => r.circle.id))
    if (seen.current) {
      const fresh = rows.find((r) => now.has(r.circle.id) && !seen.current!.has(r.circle.id))
      if (fresh) {
        setAnnounce(`${fresh.circle.alias}: ${describeWindow(fresh.circle.rest_window)} is unlocked`)
        const t = setTimeout(() => setAnnounce(''), 8000)
        seen.current = now
        return () => clearTimeout(t)
      }
    }
    seen.current = now
  }, [rows, loading])

  return (
    <div className="min-h-screen bg-[oklch(0.24_0.05_195)] p-6 text-white sm:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Last Slot <span className="text-gold">Day of Service</span>
            </h1>
            <p className="mt-2 text-xl text-white/80">
              One rest window per caregiver. Every claimed task moves it closer.
            </p>
          </div>
          <Link to="/" className="text-lg text-white/70 underline">Home</Link>
        </header>

        {announce && (
          <div role="status" className="animate-pop-in rounded-2xl bg-good p-5 text-3xl font-extrabold sm:text-4xl">
            {announce}
          </div>
        )}

        <section className="grid gap-6 sm:grid-cols-2">
          <Counter label="Windows unlocked" value={`${unlocked}`} suffix={`of ${rows.length}`} />
          <Counter label="Hours returned" value={fmtHours(totalReturned)} suffix="hrs" />
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {rows.map((r) => {
            const s = STATUS_STYLE[r.status]
            return (
              <div key={r.circle.id} className={`space-y-3 rounded-3xl border-2 p-6 ${s.card}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-extrabold">{r.circle.alias}</h2>
                  <span className={`rounded-full px-4 py-1 text-lg font-extrabold tracking-wide ${s.pill}`}>
                    {s.label}
                  </span>
                </div>
                <p className="text-xl text-white/85">{describeWindow(r.circle.rest_window)}</p>
                <p className="text-2xl font-bold">
                  {fmtHours(r.free)} of {fmtHours(r.windowHrs)} hrs free in a row
                  {r.blockerCount > 0 && (
                    <span className="ml-3 text-lg font-semibold text-white/80">
                      {r.blockerCount} {r.blockerCount === 1 ? 'task' : 'tasks'} left
                    </span>
                  )}
                </p>
              </div>
            )
          })}
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-extrabold">Team leaderboard</h2>
          <ol className="space-y-3">
            {leaderboard.map((l, i) => (
              <li key={l.team.id} className="flex items-center gap-4 text-2xl">
                <span className="w-8 text-right font-extrabold text-white/70">{i + 1}</span>
                <span className="w-32 font-bold sm:w-44">{l.team.name}</span>
                <div className="h-8 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(l.hours / maxHours) * 100}%`, background: l.team.color }}
                  />
                </div>
                <span className="w-40 text-right font-extrabold tabular-nums">
                  {fmtHours(l.hours)} hrs
                  <span className="block text-base font-normal text-white/70">
                    {l.tasks} tasks · {l.verified} verified
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function Counter({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <p className="text-lg font-semibold uppercase tracking-wide text-white/80">{label}</p>
      <p className="text-7xl font-extrabold tabular-nums sm:text-8xl">
        {value}
        <span className="ml-3 text-3xl font-semibold text-white/70">{suffix}</span>
      </p>
    </div>
  )
}
