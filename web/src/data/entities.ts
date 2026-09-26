// A tiny stand-in for a hosted database. One entity API per model, backed by
// localStorage, with BroadcastChannel so other open tabs see changes live.
// All data access goes through this module so it can be swapped for a real
// backend later: keep the EntityApi shape and replace the internals.

import type { BaseRecord, CareCircle, Task, Team, User } from './models'

export type NewRecord<T extends BaseRecord> = Omit<T, keyof BaseRecord> &
  Partial<Pick<T, 'id'>>

export interface EntityApi<T extends BaseRecord> {
  list(filter?: (item: T) => boolean): Promise<T[]>
  get(id: string): Promise<T | null>
  create(data: NewRecord<T>): Promise<T>
  update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<T>
  delete(id: string): Promise<void>
  /** Called after any change, from this tab or another. Returns unsubscribe. */
  subscribe(callback: () => void): () => void
  /** Remove every record (used by Reset demo). */
  clear(): Promise<void>
}

const STORAGE_PREFIX = 'lastslot:'
const CHANNEL_NAME = 'lastslot-data'

type Listener = () => void
const listeners = new Map<string, Set<Listener>>()
let channel: BroadcastChannel | null = null

function notifyLocal(entity: string) {
  listeners.get(entity)?.forEach((cb) => cb())
}

function getChannel(): BroadcastChannel | null {
  if (channel) return channel
  if (typeof BroadcastChannel === 'undefined') return null
  channel = new BroadcastChannel(CHANNEL_NAME)
  channel.onmessage = (e: MessageEvent<{ entity: string }>) => {
    notifyLocal(e.data.entity)
    // Browsers can deliver the message before the localStorage write is
    // visible in this tab, so notify again shortly after.
    setTimeout(() => notifyLocal(e.data.entity), 150)
  }
  // The storage event fires in other tabs only once the new value is readable.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(STORAGE_PREFIX)) {
        notifyLocal(e.key.slice(STORAGE_PREFIX.length))
      }
    })
  }
  return channel
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createEntity<T extends BaseRecord>(name: string): EntityApi<T> {
  const key = STORAGE_PREFIX + name

  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  const write = (items: T[]) => {
    localStorage.setItem(key, JSON.stringify(items))
    notifyLocal(name)
    getChannel()?.postMessage({ entity: name })
  }

  return {
    async list(filter) {
      const items = read()
      return filter ? items.filter(filter) : items
    },
    async get(id) {
      return read().find((i) => i.id === id) ?? null
    },
    async create(data) {
      const now = new Date().toISOString()
      const record = {
        ...data,
        id: data.id ?? newId(),
        created_at: now,
        updated_at: now,
      } as T
      write([...read(), record])
      return record
    },
    async update(id, patch) {
      const items = read()
      const idx = items.findIndex((i) => i.id === id)
      if (idx === -1) throw new Error(`${name} ${id} not found`)
      const updated = {
        ...items[idx],
        ...patch,
        id,
        updated_at: new Date().toISOString(),
      } as T
      items[idx] = updated
      write(items)
      return updated
    },
    async delete(id) {
      write(read().filter((i) => i.id !== id))
    },
    subscribe(callback) {
      getChannel() // make sure we are listening for other tabs
      let set = listeners.get(name)
      if (!set) listeners.set(name, (set = new Set()))
      set.add(callback)
      return () => {
        set.delete(callback)
      }
    },
    async clear() {
      write([])
    },
  }
}

export const CareCircleEntity = createEntity<CareCircle>('CareCircle')
export const TaskEntity = createEntity<Task>('Task')
export const TeamEntity = createEntity<Team>('Team')
export const UserEntity = createEntity<User>('User')
