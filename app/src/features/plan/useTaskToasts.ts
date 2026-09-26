import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task } from '@/contracts'

export interface TaskToast {
  id: string
  who: string
  verb: 'claimed' | 'finished'
  title: string
}

const TOAST_MS = 5200
const HIGHLIGHT_MS = 2600

/**
 * Watch the task list and announce what other people just did ("Daniel
 * claimed: Book a SHIP counselor"). Ignores the first load and the viewer's
 * own actions. Also returns task ids to highlight for a moment.
 */
export function useTaskToasts(tasks: Task[], me: string | null, loading: boolean) {
  const prev = useRef<Map<string, Task> | null>(null)
  const [toasts, setToasts] = useState<TaskToast[]>([])
  const [highlight, setHighlight] = useState<Set<string>>(() => new Set())
  const timers = useRef<number[]>([])

  const dismiss = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  useEffect(() => {
    if (loading) return
    const before = prev.current
    prev.current = new Map(tasks.map((t) => [t.id, t]))
    if (!before) return
    const fresh: TaskToast[] = []
    for (const t of tasks) {
      const old = before.get(t.id)
      if (!old || old.status === t.status || !t.claimed_by || t.claimed_by === me) continue
      if (t.status === 'claimed') fresh.push({ id: `${t.id}:c:${t.updated_at}`, who: t.claimed_by, verb: 'claimed', title: t.title })
      if (t.status === 'done') fresh.push({ id: `${t.id}:d:${t.updated_at}`, who: t.claimed_by, verb: 'finished', title: t.title })
    }
    if (fresh.length === 0) return
    const ids = fresh.map((f) => f.id.split(':')[0])
    // Deferred so the state updates happen outside the effect body.
    const t0 = window.setTimeout(() => {
      setToasts((all) => [...all, ...fresh].slice(-3))
      setHighlight((s) => new Set([...s, ...ids]))
    }, 0)
    const t1 = window.setTimeout(() => {
      setHighlight((s) => {
        const next = new Set(s)
        ids.forEach((i) => next.delete(i))
        return next
      })
    }, HIGHLIGHT_MS)
    const t2 = window.setTimeout(() => {
      setToasts((all) => all.filter((x) => !fresh.some((f) => f.id === x.id)))
    }, TOAST_MS)
    timers.current.push(t0, t1, t2)
  }, [tasks, me, loading])

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])

  return { toasts, dismiss, highlight }
}
