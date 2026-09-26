import type { Task } from '@/contracts'
import { cn } from '@/lib/utils'
import ClaimButton from './ClaimButton'
import MemberAvatar from './MemberAvatar'
import { PROGRAM_CHIP, TASK_KIND } from './labels'

function doneTime(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** One thing only a person can do, with who is on it and the next action. */
export default function TaskCard({
  task,
  me,
  highlight = false,
  compact = false,
}: {
  task: Task
  me: string | null
  highlight?: boolean
  compact?: boolean
}) {
  const kind = TASK_KIND[task.kind]
  const Icon = kind.icon
  const done = task.status === 'done'
  const when = done ? doneTime(task.done_at) : null
  const mine = !!me && task.claimed_by === me && !done

  return (
    <article
      aria-labelledby={`task-${task.id}`}
      data-status={task.status}
      className={cn(
        'group relative rounded-2xl border bg-card p-4 transition-[box-shadow,border-color,background-color] duration-500 sm:p-5',
        done ? 'border-border/70 bg-card/60' : 'border-border shadow-card',
        mine && 'border-evergreen/40 ring-1 ring-evergreen/20',
        highlight && 'border-gold ring-4 ring-gold/35',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex min-w-0 flex-1 gap-3.5 sm:gap-4">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl sm:size-11',
              done ? 'bg-good-soft text-good' : 'bg-evergreen-soft text-evergreen',
            )}
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-semibold tracking-wide text-muted-foreground uppercase">{kind.label}</span>
              {task.program ? (
                <span className="inline-flex items-center rounded-full bg-gold-soft px-2 py-0.5 font-medium text-gold-foreground">
                  {PROGRAM_CHIP[task.program]}
                </span>
              ) : null}
              {mine ? (
                <span className="inline-flex items-center rounded-full bg-evergreen-soft px-2 py-0.5 font-medium text-evergreen">
                  Yours
                </span>
              ) : null}
            </div>
            <h3
              id={`task-${task.id}`}
              className={cn(
                'mt-1.5 font-sans text-[1.05rem] leading-snug font-semibold tracking-normal',
                done && 'text-muted-foreground',
              )}
            >
              {task.title}
            </h3>
            {!compact || !done ? (
              <p className={cn('mt-1.5 text-sm leading-relaxed text-muted-foreground', done && 'line-clamp-1')}>
                {task.detail}
              </p>
            ) : null}
            {done && when ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {task.claimed_by ? <MemberAvatar name={task.claimed_by} size="sm" /> : null}
                <span>
                  {task.claimed_by ? `${task.claimed_by === me ? 'You' : task.claimed_by} finished this` : 'Finished'}{' '}
                  <time dateTime={task.done_at ?? undefined}>{when}</time>
                </span>
              </p>
            ) : null}
          </div>
        </div>
        {done && when ? null : <ClaimButton task={task} me={me} className="shrink-0 sm:pt-1" />}
      </div>
    </article>
  )
}
