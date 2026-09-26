import { useState } from 'react'
import { Check, Hand, Loader2, Undo2 } from 'lucide-react'
import type { Task } from '@/contracts'
import { Button } from '@/components/ui/button'
import { claimTask, completeTask, unclaimTask } from '@/data/actions'
import { cn } from '@/lib/utils'
import MemberAvatar from './MemberAvatar'

type Busy = null | 'claim' | 'done' | 'unclaim'

/**
 * The action area of a task: a big Claim button when it is open, Mark done
 * when it is yours, and who is on it otherwise. Shows a plain message if
 * someone else got there first.
 */
export default function ClaimButton({ task, me, className }: { task: Task; me: string | null; className?: string }) {
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(kind: Exclude<Busy, null>, fn: () => Promise<unknown>) {
    setBusy(kind)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not go through. Try again.')
    } finally {
      setBusy(null)
    }
  }

  const mine = !!me && task.claimed_by === me
  const errorLine = error ? (
    <p role="alert" className="text-xs font-medium text-warn">
      {error}
    </p>
  ) : null

  if (task.status === 'done') {
    return (
      <div className={cn('flex items-center gap-2 text-sm font-medium text-good', className)}>
        <span className="grid size-6 place-items-center rounded-full bg-good text-primary-foreground">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </span>
        Done{task.claimed_by ? ` by ${task.claimed_by === me ? 'you' : task.claimed_by}` : ''}
      </div>
    )
  }

  if (task.status === 'open') {
    return (
      <div className={cn('flex flex-col items-stretch gap-1.5 sm:items-end', className)}>
        <Button
          variant="outline"
          size="lg"
          className="h-11 gap-2 border-evergreen/50 px-5 text-[0.95rem] font-semibold text-evergreen hover:border-evergreen hover:bg-evergreen-soft hover:text-evergreen"
          disabled={!me || busy !== null}
          onClick={() => me && run('claim', () => claimTask(task.id, me))}
          aria-label={`Claim: ${task.title}`}
        >
          {busy === 'claim' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Hand className="size-4" aria-hidden="true" />}
          {busy === 'claim' ? 'Claiming' : "I'll do this"}
        </Button>
        {errorLine}
      </div>
    )
  }

  if (mine) {
    return (
      <div className={cn('flex flex-col items-stretch gap-1.5 sm:items-end', className)}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="h-11 gap-1.5 px-3 text-muted-foreground"
            disabled={busy !== null}
            onClick={() => run('unclaim', () => unclaimTask(task.id, me ?? undefined))}
            aria-label={`Hand back: ${task.title}`}
          >
            <Undo2 className="size-4" aria-hidden="true" />
            Hand back
          </Button>
          <Button
            size="lg"
            className="h-11 flex-1 gap-2 bg-good px-5 text-[0.95rem] font-semibold text-primary-foreground shadow-card hover:bg-good/85 sm:flex-none"
            disabled={busy !== null}
            onClick={() => run('done', () => completeTask(task.id, me ?? undefined))}
            aria-label={`Mark done: ${task.title}`}
          >
            {busy === 'done' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
            Mark done
          </Button>
        </div>
        {errorLine}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <MemberAvatar name={task.claimed_by ?? '?'} size="sm" />
      <span>
        <span className="font-semibold text-foreground">{task.claimed_by}</span> is on it
      </span>
    </div>
  )
}
