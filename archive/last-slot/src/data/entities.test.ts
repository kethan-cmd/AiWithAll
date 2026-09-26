import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskEntity, createEntity } from './entities'
import type { CareCircle } from './models'

beforeEach(() => {
  localStorage.clear()
})

describe('entity API', () => {
  const Circles = createEntity<CareCircle>('TestCircle')
  const data = {
    alias: 'Test',
    rest_window: { day: 'Sat' as const, start: '13:00', end: '16:00' },
    backlog: '',
  }

  it('creates, gets, lists, updates and deletes', async () => {
    const a = await Circles.create(data)
    expect(a.id).toBeTruthy()
    expect((await Circles.get(a.id))?.alias).toBe('Test')
    expect(await Circles.list()).toHaveLength(1)

    const updated = await Circles.update(a.id, { alias: 'Renamed' })
    expect(updated.alias).toBe('Renamed')
    expect((await Circles.get(a.id))?.alias).toBe('Renamed')

    await Circles.delete(a.id)
    expect(await Circles.get(a.id)).toBeNull()
  })

  it('list accepts a filter and persists in localStorage', async () => {
    await Circles.create({ ...data, alias: 'A' })
    await Circles.create({ ...data, alias: 'B' })
    expect(await Circles.list((c) => c.alias === 'B')).toHaveLength(1)
    expect(localStorage.getItem('lastslot:TestCircle')).toContain('"A"')
  })

  it('update on a missing id throws', async () => {
    await expect(Circles.update('nope', { alias: 'x' })).rejects.toThrow()
  })

  it('subscribe fires on changes and stops after unsubscribe', async () => {
    const cb = vi.fn()
    const off = Circles.subscribe(cb)
    const rec = await Circles.create(data)
    await Circles.update(rec.id, { alias: 'x' })
    expect(cb).toHaveBeenCalledTimes(2)
    off()
    await Circles.delete(rec.id)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('subscribers of one entity are not notified about another', async () => {
    const cb = vi.fn()
    Circles.subscribe(cb)
    await TaskEntity.clear()
    expect(cb).not.toHaveBeenCalled()
  })
})
