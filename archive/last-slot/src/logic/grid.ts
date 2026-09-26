// Core rest-window logic. Pure functions, no storage access.

import type { Day, RestWindow, Task, TaskStatus } from '@/data/models'

export const CELL_MINUTES = 30
export const CELLS_PER_DAY = (24 * 60) / CELL_MINUTES // 48

const COVERED: TaskStatus[] = ['claimed', 'done', 'verified']

/** Covered = someone has taken it. */
export function isCovered(task: Pick<Task, 'status'>): boolean {
  return COVERED.includes(task.status)
}

/** Drafts are not posted yet, so they do not affect the grid. */
export function isPosted(task: Pick<Task, 'status'>): boolean {
  return task.status !== 'draft'
}

/** Posted but nobody has taken it: it keeps its time slot busy. */
export function isUncovered(task: Pick<Task, 'status'>): boolean {
  return isPosted(task) && !isCovered(task)
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "13:00" -> "1pm", "13:30" -> "1:30pm" */
export function formatTime(hhmm: string): string {
  const mins = toMinutes(hhmm)
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const suffix = h24 >= 12 ? 'pm' : 'am'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

/** "1-4pm" (or "11am-1pm" when am/pm differ). */
export function formatRange(start: string, end: string): string {
  const s = formatTime(start)
  const e = formatTime(end)
  const sSuffix = s.slice(-2)
  const eSuffix = e.slice(-2)
  return sSuffix === eSuffix ? `${s.slice(0, -2)}-${e}` : `${s}-${e}`
}

const FULL_DAYS: Record<Day, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
}

export function fullDayName(day: Day): string {
  return FULL_DAYS[day]
}

/** "Saturday 1-4pm" */
export function describeWindow(w: RestWindow): string {
  return `${fullDayName(w.day)} ${formatRange(w.start, w.end)}`
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart
}

/**
 * Split the day into 30-minute cells. A cell is busy if any uncovered posted
 * task on that day overlaps it.
 */
export function busyCells(tasks: Task[], day: Day): boolean[] {
  const cells = new Array<boolean>(CELLS_PER_DAY).fill(false)
  for (const t of tasks) {
    if (t.day !== day || !isUncovered(t)) continue
    const s = toMinutes(t.start)
    const e = toMinutes(t.end)
    for (let i = 0; i < CELLS_PER_DAY; i++) {
      const cs = i * CELL_MINUTES
      if (overlaps(s, e, cs, cs + CELL_MINUTES)) cells[i] = true
    }
  }
  return cells
}

/** [first, last) indexes of the cells that lie fully inside the window. */
function windowCellRange(w: RestWindow): [number, number] {
  const first = Math.ceil(toMinutes(w.start) / CELL_MINUTES)
  const last = Math.floor(toMinutes(w.end) / CELL_MINUTES)
  return [first, Math.max(first, last)]
}

/** Longest run of free cells inside the rest window, in hours. */
export function consecutiveFreeHours(tasks: Task[], w: RestWindow): number {
  const busy = busyCells(tasks, w.day)
  const [first, last] = windowCellRange(w)
  let best = 0
  let run = 0
  for (let i = first; i < last; i++) {
    run = busy[i] ? 0 : run + 1
    best = Math.max(best, run)
  }
  return (best * CELL_MINUTES) / 60
}

/** Uncovered posted tasks that overlap the window. */
export function blockers(tasks: Task[], w: RestWindow): Task[] {
  const ws = toMinutes(w.start)
  const we = toMinutes(w.end)
  return tasks.filter(
    (t) =>
      t.day === w.day &&
      isUncovered(t) &&
      overlaps(toMinutes(t.start), toMinutes(t.end), ws, we),
  )
}

export type WindowStatus = 'blocked' | 'last_slot' | 'unlocked'

/** 0 blockers = unlocked, exactly 1 = the Last Slot, otherwise blocked. */
export function windowStatus(tasks: Task[], w: RestWindow): WindowStatus {
  const n = blockers(tasks, w).length
  if (n === 0) return 'unlocked'
  return n === 1 ? 'last_slot' : 'blocked'
}

/** The single blocking task when the window is one task from unlocking. */
export function lastSlotTask(tasks: Task[], w: RestWindow): Task | null {
  const b = blockers(tasks, w)
  return b.length === 1 ? b[0] : null
}

/** Metric: hours returned this week (all claimed/done/verified tasks). */
export function hoursReturned(tasks: Task[]): number {
  const minutes = tasks.filter(isCovered).reduce((sum, t) => sum + t.duration, 0)
  return minutes / 60
}

/** Length of the rest window in hours. */
export function windowHours(w: RestWindow): number {
  return (toMinutes(w.end) - toMinutes(w.start)) / 60
}
