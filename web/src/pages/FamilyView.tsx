import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClaimCard } from '@/components/ClaimCard'
import { MetricCards } from '@/components/MetricCards'
import { WindowStatusBanner } from '@/components/WindowStatusBanner'
import { taskWhen } from '@/components/TaskBits'
import { claimTask } from '@/data/actions'
import { CareCircleEntity, TaskEntity } from '@/data/entities'
import { HERO_CIRCLE_ID } from '@/data/seed'
import { getCurrentUser, updateCurrentUser } from '@/data/session'
import { useEntityList } from '@/hooks/useEntityList'
import {
  blockers,
  consecutiveFreeHours,
  describeWindow,
  hoursReturned,
  isPosted,
  lastSlotTask,
  windowHours,
  windowStatus,
} from '@/logic/grid'

export default function FamilyView() {
  const user = getCurrentUser()!
  const circles = useEntityList(CareCircleEntity)
  const allTasks = useEntityList(TaskEntity)
  const [circleId, setCircleId] = useState(user.circle_id ?? HERO_CIRCLE_ID)

  const circle = circles.items.find((c) => c.id === circleId) ?? circles.items[0]
  const tasks = useMemo(
    () => allTasks.items.filter((t) => t.circle_id === circle?.id && isPosted(t)),
    [allTasks.items, circle?.id],
  )

  if (circles.loading || allTasks.loading || !circle) {
    return <p className="text-lg text-muted-foreground">Loading...</p>
  }

  const w = circle.rest_window
  const last = lastSlotTask(tasks, w)
  const open = tasks.filter((t) => t.status === 'open')
  // Family first: hands-on tasks (only family may do them), then the Last Slot, then the rest.
  const sorted = [...open].sort((a, b) => rank(a) - rank(b))
  function rank(t: (typeof open)[number]) {
    if (!t.volunteer_eligible) return 0
    if (last?.id === t.id) return 1
    return t.blocks_window ? 2 : 3
  }
  const mine = tasks.filter((t) => t.claimed_by === user.alias)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary bg-primary/10 p-5">
        <p className="text-2xl font-extrabold text-primary">Family first</p>
        <p className="mt-1 text-lg">
          Volunteers only fill the gaps you leave. Hands-on care (bathing, medication, lifting,
          anything inside the home) is only ever offered to family, so please start there.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="circle" className="text-lg font-semibold">Circle:</label>
        <select
          id="circle"
          value={circle.id}
          onChange={async (e) => {
            setCircleId(e.target.value)
            await updateCurrentUser({ circle_id: e.target.value })
          }}
          className="h-11 rounded-md border border-input bg-card px-3 text-lg"
        >
          {circles.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.alias} ({describeWindow(c.rest_window)})
            </option>
          ))}
        </select>
        <Link to={`/grid/${circle.id}`} className="text-lg font-semibold text-primary underline">
          See the Rest Grid
        </Link>
      </div>

      <WindowStatusBanner
        status={windowStatus(tasks, w)}
        window={w}
        blockerCount={blockers(tasks, w).length}
        last={last}
        audience="helper"
      />

      <MetricCards
        freeHours={consecutiveFreeHours(tasks, w)}
        windowHours={windowHours(w)}
        hoursReturned={hoursReturned(tasks)}
        unlocked={windowStatus(tasks, w) === 'unlocked'}
      />

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Open tasks ({sorted.length})</h2>
        {sorted.length === 0 && <p className="text-lg">Nothing is waiting. Thank you.</p>}
        {sorted.map((t) => (
          <ClaimCard
            key={t.id}
            task={t}
            circleAlias={circle.alias}
            isLastSlot={last?.id === t.id}
            onClaim={async (task) => {
              await claimTask(task.id, { alias: user.alias, role: 'family' })
            }}
          />
        ))}
      </section>

      {mine.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your tasks ({mine.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mine.map((t) => (
              <p key={t.id} className="text-lg">
                <strong>{t.title}</strong>{' '}
                <span className="text-muted-foreground">
                  {taskWhen(t)}
                  {t.status === 'verified' && ' · verified'}
                </span>
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
