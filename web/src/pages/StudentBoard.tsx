import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ClaimCard } from '@/components/ClaimCard'
import { fmtHours } from '@/components/MetricCards'
import { taskWhen } from '@/components/TaskBits'
import { claimTask } from '@/data/actions'
import { CareCircleEntity, TaskEntity, TeamEntity } from '@/data/entities'
import type { Task } from '@/data/models'
import { getCurrentUser, updateCurrentUser } from '@/data/session'
import { useEntityList } from '@/hooks/useEntityList'
import { hoursReturned, isPosted, lastSlotTask } from '@/logic/grid'

/** Student volunteers only ever see open, volunteer-eligible, low-contact tasks. */
export function isStudentTask(t: Task): boolean {
  return t.status === 'open' && t.volunteer_eligible && t.contact_level !== 'high'
}

export default function StudentBoard() {
  const user = getCurrentUser()!
  const circles = useEntityList(CareCircleEntity)
  const allTasks = useEntityList(TaskEntity)
  const teams = useEntityList(TeamEntity)
  const [teamId, setTeamId] = useState(user.team_id ?? '')
  const [celebrate, setCelebrate] = useState('')

  const posted = useMemo(() => allTasks.items.filter(isPosted), [allTasks.items])

  const { board, lastIds } = useMemo(() => {
    const lastIds = new Set<string>()
    for (const c of circles.items) {
      const l = lastSlotTask(
        posted.filter((t) => t.circle_id === c.id),
        c.rest_window,
      )
      if (l) lastIds.add(l.id)
    }
    // Last Slot tasks first, then tasks that block a rest window, then the rest.
    const rank = (t: Task) => (lastIds.has(t.id) ? 0 : t.blocks_window ? 1 : 2)
    const board = posted.filter(isStudentTask).sort((a, b) => rank(a) - rank(b))
    return { board, lastIds }
  }, [posted, circles.items])

  if (circles.loading || allTasks.loading) {
    return <p className="text-lg text-muted-foreground">Loading...</p>
  }

  const alias = (id: string) => circles.items.find((c) => c.id === id)?.alias ?? 'Circle'
  const mine = posted.filter((t) => t.claimed_by === user.alias)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Volunteer board</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Small, safe, low-contact tasks. Nothing hands-on and nothing inside a home. Tasks
          marked LAST SLOT are the final thing standing between a caregiver and their rest.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="team" className="text-lg font-semibold">Your team:</label>
        <select
          id="team"
          value={teamId}
          onChange={async (e) => {
            setTeamId(e.target.value)
            await updateCurrentUser({ team_id: e.target.value || null })
          }}
          className="h-11 rounded-md border border-input bg-card px-3 text-lg"
        >
          <option value="">Pick a team</option>
          {teams.items.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <span className="text-lg text-muted-foreground">
          You: {user.alias} · {fmtHours(hoursReturned(mine))} hrs claimed
        </span>
      </div>

      {celebrate && (
        <div role="status" className="animate-pop-in rounded-2xl border-2 border-good bg-good-soft p-5 text-xl font-bold text-good">
          {celebrate}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Open tasks ({board.length})</h2>
        {board.length === 0 && <p className="text-lg">Nothing open right now. Check back soon.</p>}
        {board.map((t) => (
          <ClaimCard
            key={t.id}
            task={t}
            circleAlias={alias(t.circle_id)}
            isLastSlot={lastIds.has(t.id)}
            onClaim={async (task) => {
              await claimTask(task.id, {
                alias: user.alias,
                role: 'student',
                team_id: teamId || null,
              })
              setCelebrate(
                lastIds.has(task.id)
                  ? `You claimed the Last Slot. ${alias(task.circle_id)}'s rest window just unlocked.`
                  : `Claimed: ${task.title}. Thank you.`,
              )
              setTimeout(() => setCelebrate(''), 8000)
            }}
          />
        ))}
      </section>

      {mine.length > 0 && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-xl font-bold">Your claimed tasks ({mine.length})</h2>
            {mine.map((t) => (
              <p key={t.id} className="text-lg">
                <strong>{t.title}</strong>{' '}
                <span className="text-muted-foreground">
                  {alias(t.circle_id)} · {taskWhen(t)}
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
