import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TaskBadges, taskWhen } from '@/components/TaskBits'
import type { Task } from '@/data/models'

interface Props {
  task: Task
  circleAlias: string
  isLastSlot: boolean
  onClaim: (task: Task) => Promise<void>
}

/** A task with a big Claim button. Handles "someone else got it first". */
export function ClaimCard({ task, circleAlias, isLastSlot, onClaim }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return (
    <Card
      className={
        isLastSlot ? 'border-2 border-gold bg-gold/15 ring-2 ring-gold/40' : ''
      }
    >
      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isLastSlot && (
              <Badge className="bg-gold-foreground text-gold text-sm font-extrabold tracking-wide">
                LAST SLOT
              </Badge>
            )}
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {circleAlias} circle
            </span>
          </div>
          <p className="text-xl font-bold">{task.title}</p>
          <p className="text-base text-muted-foreground">
            {taskWhen(task)} · {task.duration} min
          </p>
          <TaskBadges task={task} />
          {error && (
            <p role="alert" className="text-base font-semibold text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button
          size="lg"
          className="h-14 px-8 text-lg"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError('')
            try {
              await onClaim(task)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not claim this task')
              setBusy(false)
            }
          }}
        >
          {busy ? 'Claiming...' : 'Claim'}
        </Button>
      </CardContent>
    </Card>
  )
}
