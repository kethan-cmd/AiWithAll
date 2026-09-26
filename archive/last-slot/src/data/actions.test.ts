import { beforeEach, describe, expect, it } from 'vitest'
import { blockers, consecutiveFreeHours, windowStatus } from '@/logic/grid'
import { claimTask, verifyTask } from './actions'
import { CareCircleEntity, TaskEntity } from './entities'
import { HERO_CIRCLE_ID, seedDemo } from './seed'

beforeEach(async () => {
  localStorage.clear()
  await seedDemo()
})

async function heroState() {
  const circle = (await CareCircleEntity.get(HERO_CIRCLE_ID))!
  const tasks = await TaskEntity.list((t) => t.circle_id === HERO_CIRCLE_ID)
  return { circle, tasks }
}

describe('seed + demo climax', () => {
  it('seeds 4 circles with the hero circle at exactly one blocker', async () => {
    expect(await CareCircleEntity.list()).toHaveLength(4)
    const { circle, tasks } = await heroState()
    expect(blockers(tasks, circle.rest_window)).toHaveLength(1)
    expect(windowStatus(tasks, circle.rest_window)).toBe('last_slot')
    // the last slot splits the window into two 1-hour runs
    expect(consecutiveFreeHours(tasks, circle.rest_window)).toBe(1)
  })

  it('a student claiming the last slot unlocks the window', async () => {
    const { circle, tasks } = await heroState()
    const last = blockers(tasks, circle.rest_window)[0]
    await claimTask(last.id, { alias: 'Student 01', role: 'student', team_id: 'team-falcons' })
    const after = await heroState()
    expect(windowStatus(after.tasks, after.circle.rest_window)).toBe('unlocked')
    expect(consecutiveFreeHours(after.tasks, after.circle.rest_window)).toBe(3)
  })
})

describe('claim rules', () => {
  it('rejects claiming a task that is already taken', async () => {
    const { circle, tasks } = await heroState()
    const last = blockers(tasks, circle.rest_window)[0]
    await claimTask(last.id, { alias: 'A', role: 'family' })
    await expect(claimTask(last.id, { alias: 'B', role: 'family' })).rejects.toThrow(
      'already taken',
    )
  })

  it('students cannot claim family_only tasks; family can', async () => {
    const [famOnly] = await TaskEntity.list(
      (t) => t.category === 'family_only' && t.status === 'open',
    )
    await expect(claimTask(famOnly.id, { alias: 'S', role: 'student' })).rejects.toThrow()
    const claimed = await claimTask(famOnly.id, { alias: 'F', role: 'family' })
    expect(claimed.status).toBe('claimed')
  })

  it('chaperone verify moves claimed to verified and rejects open tasks', async () => {
    const [open] = await TaskEntity.list((t) => t.status === 'open')
    await expect(verifyTask(open.id)).rejects.toThrow()
    await claimTask(open.id, { alias: 'F', role: 'family' })
    expect((await verifyTask(open.id)).status).toBe('verified')
  })
})
