import { useSyncExternalStore } from 'react'

const QUERY = '(pointer: coarse)'

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** True on touch-first devices (phones, tablets), where a camera button helps. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches,
    () => false,
  )
}
