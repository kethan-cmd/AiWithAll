import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Celebration } from '@/components/Celebration'
import { MetricCards } from '@/components/MetricCards'
import { RestGrid } from '@/components/RestGrid'
import { TaskBadges, taskWhen } from '@/components/TaskBits'
import { WindowStatusBanner } from '@/components/WindowStatusBanner'
import { CareCircleEntity, TaskEntity } from '@/data/entities'
import { useEntityList } from '@/hooks/useEntityList'
import {
  blockers,
  consecutiveFreeHours,
  describeWindow,
  hoursReturned,
  isCovered,
  isPosted,
  lastSlotTask,
  windowHours,
  windowStatus,
  type WindowStatus,
} from '@/logic/grid'

export default function RestGridPage() {
  const { circleId } = useParams()
  const circles = useEntityList(CareCircleEntity)
  const allTasks = useEntityList(TaskEntity)
  const circle = circles.items.find((c) => c.id === circleId)
  const tasks = useMemo(
    () => allTasks.items.filter((t) => t.circle_id === circleId && isPosted(t)),
    [allTasks.items, circleId],
  )

  const ready = !circles.loading && !allTasks.loading && !!circle
  const status: WindowStatus | null = circle ? windowStatus(tasks, circle.rest_window) : null

  // Celebrate when the window flips to unlocked while this screen is open.
  const prev = useRef<WindowStatus | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  useEffect(() => {
    if (!ready || !status) return
    if (prev.current && prev.current !== 'unlocked' && status === 'unlocked') {
      setCelebrate(true)
    }
    prev.current = status
  }, [ready, status])

  if (circles.loading || allTasks.loading) {
    return <p className="text-lg text-muted-foreground">Loading...</p>
  }
  if (!circle || !status) {
    return (
      <div className="space-y-4">
        <p className="text-xl">We could not find that circle.</p>
        <Link to="/caregiver" className="text-lg font-semibold text-primary underline">
          Plan my rest
        </Link>
      </div>
    )
  }

  const w = circle.rest_window
  const last = lastSlotTask(tasks, w)
  const needed = tasks.filter((t) => !isCovered(t))
  const covered = tasks.filter(isCovered)

  return (
    <div className="space-y-6">
      {celebrate && (
        <Celebration
          title={`${describeWindow(w)} is yours`}
          subtitle={`${windowHours(w)} hours in a row, uninterrupted.`}
          onClose={() => setCelebrate(false)}
        />
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-extrabold">{circle.alias} circle: Rest Grid</h1>
        <p className="text-lg text-muted-foreground">Rest window: {describeWindow(w)}</p>
      </div>

      <WindowStatusBanner
        status={status}
        window={w}
        blockerCount={blockers(tasks, w).length}
        last={last}
      />

      <MetricCards
        freeHours={consecutiveFreeHours(tasks, w)}
        windowHours={windowHours(w)}
        hoursReturned={hoursReturned(tasks)}
        unlocked={status === 'unlocked'}
      />

      <RestGrid tasks={tasks} window={w} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Still needed ({needed.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {needed.length === 0 && <p className="text-lg">Everything is covered.</p>}
            {needed.map((t) => (
              <div key={t.id} className="space-y-1">
                <p className="text-lg font-semibold">
                  {t.title}
                  {last?.id === t.id && <Badge className="ml-2 bg-gold text-gold-foreground">LAST SLOT</Badge>}
                </p>
                <p className="text-base text-muted-foreground">{taskWhen(t)}</p>
                <TaskBadges task={t} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Covered ({covered.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {covered.length === 0 && <p className="text-lg">Nothing claimed yet.</p>}
            {covered.map((t) => (
              <div key={t.id} className="space-y-1">
                <p className="text-lg font-semibold">{t.title}</p>
                <p className="text-base text-muted-foreground">
                  {taskWhen(t)} · {t.claimed_by} ({t.claimed_role})
                  {t.status === 'verified' && ' · verified'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
