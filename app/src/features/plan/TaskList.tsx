import type { Task } from '@/contracts'
import TaskCard from './TaskCard'

/** Tasks in three calm groups: up for grabs, in progress, done. */
export default function TaskList({
  tasks,
  me,
  highlight,
  emptyText = 'Nothing to do yet. Tasks appear once the facts are confirmed.',
}: {
  tasks: Task[]
  me: string | null
  highlight?: Set<string>
  emptyText?: string
}) {
  if (tasks.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  const groups: { key: Task['status']; label: string; items: Task[] }[] = [
    { key: 'open', label: 'Up for grabs', items: tasks.filter((t) => t.status === 'open') },
    { key: 'claimed', label: 'In progress', items: tasks.filter((t) => t.status === 'claimed') },
    { key: 'done', label: 'Done', items: tasks.filter((t) => t.status === 'done') },
  ]
  return (
    <div className="space-y-8">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.key} aria-label={`${g.label}, ${g.items.length}`}>
            <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {g.label}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] tracking-normal tabular-nums">{g.items.length}</span>
            </h3>
            <ul className="space-y-3">
              {g.items.map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} me={me} highlight={highlight?.has(t.id)} compact />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}
