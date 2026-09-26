import { describe, expect, it } from 'vitest'
import type { RestWindow, Task, TaskStatus } from '@/data/models'
import {
  blockers,
  busyCells,
  consecutiveFreeHours,
  describeWindow,
  formatRange,
  hoursReturned,
  lastSlotTask,
  windowStatus,
} from './grid'

const WINDOW: RestWindow = { day: 'Sat', start: '13:00', end: '16:00' }

function task(
  start: string,
  end: string,
  status: TaskStatus = 'open',
  over: Partial<Task> = {},
): Task {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return {
    id: `${start}-${end}-${status}`,
    created_at: '',
    updated_at: '',
    circle_id: 'c',
    title: 't',
    duration: eh * 60 + em - (sh * 60 + sm),
    category: 'errand',
    contact_level: 'low',
    volunteer_eligible: true,
    day: 'Sat',
    start,
    end,
    blocks_window: false,
    status,
    claimed_by: null,
    claimed_role: null,
    team_id: null,
    ...over,
  }
}

describe('busyCells', () => {
  it('has 48 cells and marks cells overlapped by open tasks', () => {
    const cells = busyCells([task('13:00', '14:00')], 'Sat')
    expect(cells).toHaveLength(48)
    expect(cells.filter(Boolean)).toHaveLength(2)
    expect(cells[26]).toBe(true) // 13:00
    expect(cells[27]).toBe(true) // 13:30
    expect(cells[28]).toBe(false) // 14:00
  })

  it('marks a cell busy on partial overlap', () => {
    const cells = busyCells([task('13:15', '13:45')], 'Sat')
    expect(cells[26]).toBe(true)
    expect(cells[27]).toBe(true)
  })

  it('ignores claimed, done and verified tasks', () => {
    for (const s of ['claimed', 'done', 'verified'] as const) {
      expect(busyCells([task('13:00', '14:00', s)], 'Sat').some(Boolean)).toBe(false)
    }
  })

  it('ignores drafts and other days', () => {
    expect(busyCells([task('13:00', '14:00', 'draft')], 'Sat').some(Boolean)).toBe(false)
    expect(
      busyCells([task('13:00', '14:00', 'open', { day: 'Sun' })], 'Sat').some(Boolean),
    ).toBe(false)
  })
})

describe('consecutiveFreeHours', () => {
  it('is 0 when the window is fully covered by open tasks', () => {
    const tasks = [task('13:00', '14:00'), task('14:00', '15:00'), task('15:00', '16:00')]
    expect(consecutiveFreeHours(tasks, WINDOW)).toBe(0)
  })

  it('is the full window when nothing is open', () => {
    expect(consecutiveFreeHours([], WINDOW)).toBe(3)
  })

  it('takes the longest run, not the total', () => {
    // busy 14:00-14:30 splits the window into 1h and 1.5h
    expect(consecutiveFreeHours([task('14:00', '14:30')], WINDOW)).toBe(1.5)
  })

  it('ignores busy cells outside the window', () => {
    expect(
      consecutiveFreeHours([task('09:00', '12:00'), task('16:00', '17:00')], WINDOW),
    ).toBe(3)
  })

  it('counts a task overlapping only part of the window', () => {
    expect(consecutiveFreeHours([task('12:30', '13:30')], WINDOW)).toBe(2.5)
  })

  it('treats claimed tasks as free time', () => {
    expect(consecutiveFreeHours([task('13:00', '16:00', 'claimed')], WINDOW)).toBe(3)
  })
})

describe('blockers and window status', () => {
  const claimed = (s: string, e: string) => task(s, e, 'claimed')

  it('lists uncovered tasks that overlap the window', () => {
    const tasks = [task('13:00', '14:00'), claimed('14:00', '15:00'), task('09:00', '10:00')]
    expect(blockers(tasks, WINDOW)).toHaveLength(1)
  })

  it('a task ending exactly at the window start does not block', () => {
    expect(blockers([task('12:00', '13:00')], WINDOW)).toHaveLength(0)
  })

  it('2+ blockers = blocked', () => {
    const tasks = [task('13:00', '14:00'), task('14:00', '15:00')]
    expect(windowStatus(tasks, WINDOW)).toBe('blocked')
    expect(lastSlotTask(tasks, WINDOW)).toBeNull()
  })

  it('exactly 1 blocker = the Last Slot', () => {
    const last = task('14:00', '15:00')
    const tasks = [claimed('13:00', '14:00'), last, claimed('15:00', '16:00')]
    expect(windowStatus(tasks, WINDOW)).toBe('last_slot')
    expect(lastSlotTask(tasks, WINDOW)?.id).toBe(last.id)
  })

  it('0 blockers = unlocked, with the full window free', () => {
    const tasks = [claimed('13:00', '14:00'), claimed('14:00', '16:00')]
    expect(windowStatus(tasks, WINDOW)).toBe('unlocked')
    expect(consecutiveFreeHours(tasks, WINDOW)).toBe(3)
  })

  it('draft tasks do not block', () => {
    expect(windowStatus([task('13:00', '14:00', 'draft')], WINDOW)).toBe('unlocked')
  })
})

describe('hoursReturned', () => {
  it('sums claimed, done and verified tasks anywhere in the week', () => {
    const tasks = [
      task('13:00', '14:00', 'claimed'), // 1h
      task('09:00', '09:30', 'done', { day: 'Mon' }), // 0.5h
      task('10:00', '11:00', 'verified', { day: 'Thu' }), // 1h
      task('10:00', '11:00', 'open'), // not counted
      task('10:00', '11:00', 'draft'), // not counted
    ]
    expect(hoursReturned(tasks)).toBe(2.5)
  })
})

describe('formatting', () => {
  it('formats ranges', () => {
    expect(formatRange('13:00', '16:00')).toBe('1-4pm')
    expect(formatRange('10:00', '13:00')).toBe('10am-1pm')
    expect(describeWindow(WINDOW)).toBe('Saturday 1-4pm')
  })
})
