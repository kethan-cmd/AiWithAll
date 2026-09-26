// Write operations shared by the screens. Keeps rules (who can claim what)
// in one place, on top of the entity API.

import type { SplitTask } from '@/logic/splitTasks'
import { CareCircleEntity, TaskEntity } from './entities'
import type { CareCircle, RestWindow, Role, Task } from './models'

export interface Claimer {
  alias: string
  role: Role
  team_id?: string | null
}

export async function createCircle(input: {
  alias: string
  rest_window: RestWindow
  backlog: string
}): Promise<CareCircle> {
  return CareCircleEntity.create(input)
}

/** Post the caregiver-approved tasks to the board as open tasks. */
export async function postTasks(
  circleId: string,
  tasks: SplitTask[],
): Promise<Task[]> {
  const created: Task[] = []
  for (const t of tasks) {
    created.push(
      await TaskEntity.create({
        ...t,
        circle_id: circleId,
        status: 'open',
        claimed_by: null,
        claimed_role: null,
        team_id: null,
      }),
    )
  }
  return created
}

/** Claim an open task. Rejects if it was taken (maybe in another tab) or if the
 *  claimer is a student and the task is not volunteer eligible. */
export async function claimTask(taskId: string, claimer: Claimer): Promise<Task> {
  const task = await TaskEntity.get(taskId)
  if (!task) throw new Error('Task not found')
  if (task.status !== 'open') throw new Error('Task already taken')
  if (claimer.role === 'student') {
    if (!task.volunteer_eligible || task.contact_level === 'high') {
      throw new Error('Students can only claim volunteer-eligible, low-contact tasks')
    }
  } else if (claimer.role !== 'family') {
    throw new Error('Only family and students can claim tasks')
  }
  return TaskEntity.update(taskId, {
    status: 'claimed',
    claimed_by: claimer.alias,
    claimed_role: claimer.role,
    team_id: claimer.role === 'student' ? (claimer.team_id ?? null) : null,
  })
}

/** Chaperone check: a claimed (or done) task becomes verified. */
export async function verifyTask(taskId: string): Promise<Task> {
  const task = await TaskEntity.get(taskId)
  if (!task) throw new Error('Task not found')
  if (task.status !== 'claimed' && task.status !== 'done') {
    throw new Error('Only claimed tasks can be verified')
  }
  return TaskEntity.update(taskId, { status: 'verified' })
}
