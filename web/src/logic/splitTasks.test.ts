import { describe, expect, it } from 'vitest'
import type { RestWindow } from '@/data/models'
import { toMinutes } from './grid'
import {
  DEMO_BACKLOG,
  DEMO_REST_WINDOW,
  applySafetyRules,
  splitTasks,
  type SplitTask,
} from './splitTasks'

const WINDOW: RestWindow = { day: 'Sat', start: '13:00', end: '16:00' }

describe('splitTasks', () => {
  it('returns the hardcoded demo response for the seeded example', async () => {
    const tasks = await splitTasks(DEMO_BACKLOG, DEMO_REST_WINDOW)
    expect(tasks).toHaveLength(9)
    expect(tasks.filter((t) => t.blocks_window)).toHaveLength(4)
  })

  it('output matches the schema', async () => {
    const tasks = await splitTasks(
      'Pick up groceries. Call the bank about a bill. Mow the lawn. Cook dinner.',
      WINDOW,
    )
    expect(tasks.length).toBe(4)
    for (const t of tasks) {
      expect(t.title.length).toBeGreaterThan(0)
      expect(t.duration).toBeGreaterThanOrEqual(30)
      expect(t.duration).toBeLessThanOrEqual(60)
      expect(t.start).toMatch(/^\d{2}:\d{2}$/)
      expect(toMinutes(t.end) - toMinutes(t.start)).toBe(t.duration)
      expect(typeof t.blocks_window).toBe('boolean')
    }
  })

  it('classifies by keyword', async () => {
    const [errand, call, paperwork] = await splitTasks(
      'Pick up the pharmacy order\nCall the insurance company\nFill out the claim forms',
      WINDOW,
    )
    expect(errand.category).toBe('errand')
    expect(call.category).toBe('call')
    expect(paperwork.category).toBe('paperwork')
  })

  it('makes bathing, toileting, medication, lifting and entering the home family only', async () => {
    const backlog = [
      'Help Mom with her bath',
      'Help Dad to the toilet at night',
      'Give Dad his medication',
      'Lift Mom out of the chair',
      'Enter the home to check the stove',
    ].join('\n')
    const tasks = await splitTasks(backlog, WINDOW)
    expect(tasks).toHaveLength(5)
    for (const t of tasks) {
      expect(t.category).toBe('family_only')
      expect(t.volunteer_eligible).toBe(false)
      expect(t.contact_level).toBe('high')
    }
  })

  it('leaves safe tasks volunteer eligible', async () => {
    const tasks = await splitTasks('Buy groceries', WINDOW)
    expect(tasks[0].volunteer_eligible).toBe(true)
  })

  it('applySafetyRules overrides a model that got it wrong', () => {
    const bad: SplitTask = {
      title: 'Give Mom her insulin',
      duration: 30,
      category: 'chore',
      contact_level: 'low',
      volunteer_eligible: true,
      day: 'Mon',
      start: '08:00',
      end: '08:30',
      blocks_window: false,
    }
    const fixed = applySafetyRules(bad)
    expect(fixed.volunteer_eligible).toBe(false)
    expect(fixed.category).toBe('family_only')
  })
})
