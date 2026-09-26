import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { taskWhen } from '@/components/TaskBits'
import { verifyTask } from '@/data/actions'
import { CareCircleEntity, TaskEntity, TeamEntity } from '@/data/entities'
import { useEntityList } from '@/hooks/useEntityList'

export default function ChaperoneView() {
  const circles = useEntityList(CareCircleEntity)
  const tasks = useEntityList(TaskEntity)
  const teams = useEntityList(TeamEntity)
  const [busyId, setBusyId] = useState('')

  if (circles.loading || tasks.loading) {
    return <p className="text-lg text-muted-foreground">Loading...</p>
  }

  const toVerify = tasks.items.filter((t) => t.status === 'claimed' || t.status === 'done')
  const verified = tasks.items.filter((t) => t.status === 'verified')
  const circleName = (id: string) => circles.items.find((c) => c.id === id)?.alias ?? 'Circle'
  const teamName = (id: string | null) => teams.items.find((t) => t.id === id)?.name

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Chaperone check</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Confirm each claimed task was completed. {verified.length} verified so far.
        </p>
      </div>

      {toVerify.length === 0 && <p className="text-xl">Nothing waiting for you. All claimed tasks are verified.</p>}

      <ul className="space-y-3">
        {toVerify.map((t) => (
          <li key={t.id}>
            <Card>
              <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-xl font-bold">{t.title}</p>
                  <p className="text-base text-muted-foreground">
                    {circleName(t.circle_id)} circle · {taskWhen(t)} · {t.duration} min
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-base">
                    Claimed by <strong>{t.claimed_by}</strong>
                    <Badge variant="secondary">{t.claimed_role}</Badge>
                    {teamName(t.team_id) && <Badge variant="outline">{teamName(t.team_id)}</Badge>}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg"
                  disabled={busyId === t.id}
                  onClick={async () => {
                    setBusyId(t.id)
                    try {
                      await verifyTask(t.id)
                    } finally {
                      setBusyId('')
                    }
                  }}
                >
                  {busyId === t.id ? 'Verifying...' : 'Verify'}
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
