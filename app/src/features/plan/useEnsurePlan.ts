import { useEffect } from 'react'
import type { DocKind, Household, ProgramMatch } from '@/contracts'
import { advanceProgram } from '@/data/actions'
import { ensureTasksOnce } from '@/data/tasks'

/**
 * Caregiver side only: once facts are confirmed, make sure every task and
 * every drafted program exists. Idempotent, so it is safe to run on each
 * change; existing claims and statuses are never touched.
 */
export function useEnsurePlan(household: Household | null, matches: ProgramMatch[], missingDocs: DocKind[], enabled: boolean) {
  const key = household
    ? `${household.id}|${matches.map((m) => `${m.program}:${m.kind}`).join(',')}|${missingDocs.join(',')}`
    : ''

  useEffect(() => {
    if (!enabled || !household || matches.length === 0) return
    let cancelled = false
    ;(async () => {
      for (const m of matches) {
        if (cancelled) return
        // Forward only: a no-op when the program is already further along.
        if (m.kind === 'draft') await advanceProgram(household.id, m.program, 'drafted')
      }
      if (!cancelled) await ensureTasksOnce(household.id, matches, household, missingDocs)
    })()
    return () => {
      cancelled = true
    }
    // key captures everything that matters in household, matches and missingDocs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])
}
