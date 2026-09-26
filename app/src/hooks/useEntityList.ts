import { useEffect, useState } from 'react'
import type { EntityApi } from '@/data/entities'
import type { BaseRecord } from '@/contracts'

/** All records of an entity, kept live: reloads on every change, including
 *  changes made in other browser tabs. */
export function useEntityList<T extends BaseRecord>(entity: EntityApi<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const load = () =>
      entity.list().then((all) => {
        if (!alive) return
        setItems(all)
        setLoading(false)
      })
    load()
    const off = entity.subscribe(load)
    return () => {
      alive = false
      off()
    }
  }, [entity])

  return { items, loading }
}
