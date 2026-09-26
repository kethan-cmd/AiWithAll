import { ProgramStatusEntity, TaskEntity } from '@/data/entities'
import type { NewRecord } from '@/data/entities'
import type { Task } from '@/contracts'
import { ActionError, advanceProgram, claimTask, completeTask, nextStatus, resetProgram, unclaimTask } from './actions'

function task(over: Partial<NewRecord<Task>> = {}): NewRecord<Task> {
  return {
    household_id: 'h1',
    kind: 'custom',
    title: 'Call the pharmacy',
    detail: '',
    program: null,
    status: 'open',
    claimed_by: null,
    done_at: null,
    ...over,
  }
}

describe('task actions', () => {
  beforeEach(() => localStorage.clear())

  it('claims an open task', async () => {
    const t = await TaskEntity.create(task())
    const c = await claimTask(t.id, 'Daniel')
    expect(c.status).toBe('claimed')
    expect(c.claimed_by).toBe('Daniel')
  })

  it('rejects the second claim in a race', async () => {
    const t = await TaskEntity.create(task())
    const results = await Promise.allSettled([claimTask(t.id, 'Daniel'), claimTask(t.id, 'Anna')])
    expect(results[0].status).toBe('fulfilled')
    expect(results[1].status).toBe('rejected')
    const err = (results[1] as PromiseRejectedResult).reason
    expect(err).toBeInstanceOf(ActionError)
    expect(err.code).toBe('taken')
    expect(err.message).toContain('Daniel')
    expect((await TaskEntity.get(t.id))?.claimed_by).toBe('Daniel')
  })

  it('unclaims only for the claimer', async () => {
    const t = await TaskEntity.create(task())
    await claimTask(t.id, 'Daniel')
    await expect(unclaimTask(t.id, 'Anna')).rejects.toBeInstanceOf(ActionError)
    const u = await unclaimTask(t.id, 'Daniel')
    expect(u.status).toBe('open')
    expect(u.claimed_by).toBeNull()
  })

  it('complete sets done_at and keeps the claimer', async () => {
    const t = await TaskEntity.create(task())
    await claimTask(t.id, 'Anna')
    const d = await completeTask(t.id, 'Anna')
    expect(d.status).toBe('done')
    expect(d.claimed_by).toBe('Anna')
    expect(d.done_at).toBeTruthy()
    expect(Number.isNaN(Date.parse(d.done_at ?? ''))).toBe(false)
  })

  it('completing an open task claims it for the finisher', async () => {
    const t = await TaskEntity.create(task())
    const d = await completeTask(t.id, 'Grace')
    expect(d.claimed_by).toBe('Grace')
  })

  it('does not let someone else finish a claimed task', async () => {
    const t = await TaskEntity.create(task())
    await claimTask(t.id, 'Daniel')
    await expect(completeTask(t.id, 'Anna')).rejects.toBeInstanceOf(ActionError)
  })

  it('finishing a sign task moves the program to signed', async () => {
    await advanceProgram('h1', 'msp', 'drafted')
    const t = await TaskEntity.create(task({ kind: 'sign', program: 'msp' }))
    await completeTask(t.id, 'Grace')
    const [s] = await ProgramStatusEntity.list((x) => x.program === 'msp')
    expect(s.status).toBe('signed')
  })

  it('finishing the counselor task moves every program to submitted', async () => {
    await advanceProgram('h1', 'msp', 'signed')
    await advanceProgram('h1', 'extra_help', 'drafted')
    const t = await TaskEntity.create(task({ kind: 'ship_review_submit' }))
    await completeTask(t.id, 'Daniel')
    const all = await ProgramStatusEntity.list()
    expect(all.map((s) => s.status)).toEqual(['submitted', 'submitted'])
  })
})

describe('advanceProgram', () => {
  beforeEach(() => localStorage.clear())

  it('creates the record when missing', async () => {
    const s = await advanceProgram('h1', 'extra_help', 'drafted')
    expect(s.status).toBe('drafted')
  })

  it('only moves forward', async () => {
    await advanceProgram('h1', 'msp', 'submitted')
    const back = await advanceProgram('h1', 'msp', 'drafted')
    expect(back.status).toBe('submitted')
    const fwd = await advanceProgram('h1', 'msp', 'approved')
    expect(fwd.status).toBe('approved')
    expect(await ProgramStatusEntity.list()).toHaveLength(1)
  })

  it('moves back only on an explicit reset', async () => {
    await advanceProgram('h1', 'msp', 'approved')
    const r = await resetProgram('h1', 'msp')
    expect(r.status).toBe('drafted')
  })

  it('knows the next step', () => {
    expect(nextStatus('drafted')).toBe('signed')
    expect(nextStatus('approved')).toBeNull()
  })
})
