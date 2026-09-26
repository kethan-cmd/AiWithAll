import { createEntity, wipeAllStorage } from './entities'
import type { BaseRecord } from '@/contracts'

interface Thing extends BaseRecord { name: string }

describe('entities', () => {
  beforeEach(() => localStorage.clear())

  it('creates, lists, updates and deletes', async () => {
    const E = createEntity<Thing>('Thing')
    const a = await E.create({ name: 'a' })
    expect(a.id).toBeTruthy()
    expect(await E.list()).toHaveLength(1)
    const b = await E.update(a.id, { name: 'b' })
    expect(b.name).toBe('b')
    expect(await E.get(a.id)).toMatchObject({ name: 'b' })
    await E.delete(a.id)
    expect(await E.list()).toHaveLength(0)
  })

  it('filters with a predicate', async () => {
    const E = createEntity<Thing>('Thing')
    await E.create({ name: 'x' })
    await E.create({ name: 'y' })
    expect(await E.list((t) => t.name === 'y')).toHaveLength(1)
  })

  it('notifies subscribers', async () => {
    const E = createEntity<Thing>('Thing')
    const cb = vi.fn()
    const off = E.subscribe(cb)
    await E.create({ name: 'z' })
    expect(cb).toHaveBeenCalled()
    off()
  })

  it('wipes only app keys', async () => {
    localStorage.setItem('other', '1')
    const E = createEntity<Thing>('Thing')
    await E.create({ name: 'q' })
    wipeAllStorage()
    expect(localStorage.getItem('motd:Thing')).toBeNull()
    expect(localStorage.getItem('other')).toBe('1')
  })
})
