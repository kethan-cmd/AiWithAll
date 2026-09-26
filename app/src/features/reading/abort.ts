// Small helpers for cancellable waits.

export function abortError(): DOMException {
  return new DOMException('Reading was stopped.', 'AbortError')
}

export function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

/** Wait, but stop early (with an AbortError) if the signal fires. */
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(t)
      reject(abortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
