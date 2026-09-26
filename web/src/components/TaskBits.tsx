import { Badge } from '@/components/ui/badge'
import type { Category, Task } from '@/data/models'
import { fullDayName, formatRange } from '@/logic/grid'
import type { SplitTask } from '@/logic/splitTasks'

export const CATEGORY_LABEL: Record<Category, string> = {
  errand: 'Errand',
  call: 'Phone call',
  meal: 'Meal',
  paperwork: 'Paperwork',
  chore: 'Chore',
  family_only: 'Family only',
}

type TaskLike = Pick<
  Task | SplitTask,
  'category' | 'contact_level' | 'volunteer_eligible' | 'blocks_window'
>

export function TaskBadges({ task }: { task: TaskLike }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary">{CATEGORY_LABEL[task.category]}</Badge>
      {task.volunteer_eligible ? (
        <Badge variant="outline">Volunteer OK</Badge>
      ) : (
        <Badge className="bg-busy-soft text-busy border border-busy/30">Family only</Badge>
      )}
      <Badge variant="outline">
        {task.contact_level === 'none'
          ? 'Remote'
          : task.contact_level === 'low'
            ? 'Low contact'
            : 'Hands-on'}
      </Badge>
      {task.blocks_window && (
        <Badge className="bg-gold text-gold-foreground">Blocks your rest</Badge>
      )}
    </div>
  )
}

export function taskWhen(t: Pick<Task, 'day' | 'start' | 'end'>): string {
  return `${fullDayName(t.day)} ${formatRange(t.start, t.end)}`
}
