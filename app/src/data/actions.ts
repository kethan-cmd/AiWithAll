// Task and pipeline actions. Every action re-reads the record first, so two
// people tapping Claim at the same moment cannot both win.

import type { PipelineStatus, ProgramId, ProgramStatus, Task } from '@/contracts'
import { PIPELINE } from '@/contracts'
import { ProgramStatusEntity, TaskEntity } from '@/data/entities'

/** A friendly, showable reason an action did not go through. */
export class ActionError extends Error {
  readonly code: 'not_found' | 'taken' | 'not_yours' | 'already_done'
  constructor(code: ActionError['code'], message: string) {
    super(message)
    this.name = 'ActionError'
    this.code = code
  }
}

// Actions run one at a time, so a read and the write that follows it can never
// interleave with another action. The Web Locks API makes that hold across
// every tab of this browser; where it is missing we fall back to a queue that
// covers this tab only.
const LOCK_NAME = 'motd-actions'
let queue: Promise<unknown> = Promise.resolve()

interface LockManagerLike {
  request<T>(name: string, cb: () => Promise<T>): Promise<T>
}

function locks(): LockManagerLike | null {
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: LockManagerLike }) : null
  return nav?.locks && typeof nav.locks.request === 'function' ? nav.locks : null
}

/** Run fn while holding the shared actions lock (all tabs, when supported). */
export function serial<T>(fn: () => Promise<T>): Promise<T> {
  const locked = () => {
    const l = locks()
    return l ? l.request(LOCK_NAME, fn) : fn()
  }
  const run = queue.then(locked, locked)
  queue = run.catch(() => undefined)
  return run
}

async function mustGet(taskId: string): Promise<Task> {
  const t = await TaskEntity.get(taskId)
  if (!t) throw new ActionError('not_found', 'That task was removed.')
  return t
}

/** Claim an open task. Rejects if someone already claimed or finished it. */
export function claimTask(taskId: string, alias: string): Promise<Task> {
  return serial(async () => {
    const t = await mustGet(taskId)
    if (t.status === 'done') throw new ActionError('already_done', 'This one is already done.')
    if (t.status !== 'open') {
      throw new ActionError(
        'taken',
        t.claimed_by ? `${t.claimed_by} already claimed this.` : 'Someone already claimed this.',
      )
    }
    await TaskEntity.update(taskId, { status: 'claimed', claimed_by: alias })
    // Read it back: if another tab wrote over us, say so instead of pretending.
    const after = await mustGet(taskId)
    if (after.claimed_by !== alias) {
      throw new ActionError(
        'taken',
        after.claimed_by ? `${after.claimed_by} already claimed this.` : 'Someone already claimed this.',
      )
    }
    return after
  })
}

/** Hand a claimed task back. If alias is given, only that person can. */
export function unclaimTask(taskId: string, alias?: string): Promise<Task> {
  return serial(async () => {
    const t = await mustGet(taskId)
    if (t.status === 'done') throw new ActionError('already_done', 'This one is already done.')
    if (alias && t.claimed_by && t.claimed_by !== alias) {
      throw new ActionError('not_yours', `Only ${t.claimed_by} can hand this back.`)
    }
    return TaskEntity.update(taskId, { status: 'open', claimed_by: null })
  })
}

/**
 * Mark a task done. An open task is claimed by alias on the way. Finishing a
 * 'sign' task moves that program to signed; finishing the counselor task
 * moves every drafted program to submitted.
 */
export function completeTask(taskId: string, alias?: string): Promise<Task> {
  return serial(async () => {
    const t = await mustGet(taskId)
    if (t.status === 'done') return t
    if (alias && t.status === 'claimed' && t.claimed_by && t.claimed_by !== alias) {
      throw new ActionError('not_yours', `${t.claimed_by} is working on this one.`)
    }
    const done = await TaskEntity.update(taskId, {
      status: 'done',
      claimed_by: t.claimed_by ?? alias ?? null,
      done_at: new Date().toISOString(),
    })
    if (t.kind === 'sign' && t.program) {
      await advance(t.household_id, t.program, 'signed')
    } else if (t.kind === 'ship_review_submit') {
      const statuses = await ProgramStatusEntity.list((s) => s.household_id === t.household_id)
      const signTasks = await TaskEntity.list((x) => x.household_id === t.household_id && x.kind === 'sign')
      const programs = new Set<ProgramId>([
        ...statuses.filter((s) => s.program !== 'guide').map((s) => s.program),
        ...signTasks.flatMap((x) => (x.program ? [x.program] : [])),
      ])
      for (const p of programs) await advance(t.household_id, p, 'submitted')
    }
    return done
  })
}

/** Reopen a finished task (demo tools and "undo"). */
export function reopenTask(taskId: string): Promise<Task> {
  return serial(async () => {
    await mustGet(taskId)
    return TaskEntity.update(taskId, {
      status: 'open',
      claimed_by: null,
      done_at: null,
    })
  })
}

export function pipelineIndex(s: PipelineStatus): number {
  return PIPELINE.indexOf(s)
}

/** Next step after s, or null at the end. */
export function nextStatus(s: PipelineStatus): PipelineStatus | null {
  return PIPELINE[pipelineIndex(s) + 1] ?? null
}

/**
 * Move a program along likely, drafted, signed, submitted, approved.
 * Only moves forward: asking for an earlier step is a no-op that returns the
 * current record, unless opts.reset is set. Creates the record if missing.
 */
export function advanceProgram(
  householdId: string,
  program: ProgramId,
  to: PipelineStatus,
  opts: { reset?: boolean } = {},
): Promise<ProgramStatus> {
  return serial(() => advance(householdId, program, to, opts))
}

async function advance(
  householdId: string,
  program: ProgramId,
  to: PipelineStatus,
  opts: { reset?: boolean } = {},
): Promise<ProgramStatus> {
  const [current] = await ProgramStatusEntity.list((s) => s.household_id === householdId && s.program === program)
  if (!current)
    return ProgramStatusEntity.create({
      household_id: householdId,
      program,
      status: to,
    })
  if (!opts.reset && pipelineIndex(to) <= pipelineIndex(current.status)) return current
  return ProgramStatusEntity.update(current.id, { status: to })
}

/** Put a program back to an earlier step on purpose. */
export function resetProgram(householdId: string, program: ProgramId, to: PipelineStatus = 'drafted') {
  return advanceProgram(householdId, program, to, { reset: true })
}
