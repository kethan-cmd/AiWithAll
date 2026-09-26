import { useMemo } from 'react'
import type { ConfirmedFacts, Fact, Household, ProgramMatch, ProgramStatus } from '@/contracts'
import { FactEntity, HouseholdEntity, ProgramStatusEntity } from '@/data/entities'
import { useSession } from '@/data/session'
import { useEntityList } from '@/hooks/useEntityList'
import { factsToConfirmed, matchPrograms, totalEstimate } from '@/rules/engine'

export interface MatchesData {
  loading: boolean
  /** True when this tab has an identity at all. */
  signedIn: boolean
  isCaregiver: boolean
  household: Household | null
  facts: Fact[]
  confirmed: ConfirmedFacts | null
  /** Every program, likely or not, in rules-engine order. */
  matches: ProgramMatch[]
  likely: ProgramMatch[]
  totalCents: number
  statuses: ProgramStatus[]
}

/** The current tab's household, its confirmed facts and the rules-engine
 *  result, kept live across tabs. */
export function useMatches(): MatchesData {
  const { identity } = useSession()
  const households = useEntityList(HouseholdEntity)
  const facts = useEntityList(FactEntity)
  const statuses = useEntityList(ProgramStatusEntity)
  const loading = households.loading || facts.loading || statuses.loading
  const hid = identity?.household_id ?? null

  return useMemo(() => {
    const household = households.items.find((h) => h.id === hid) ?? null
    const mine = facts.items.filter((f) => f.household_id === hid && f.confirmed)
    const confirmed = household ? factsToConfirmed(mine) : null
    const matches = confirmed && household ? matchPrograms(confirmed, household) : []
    const likely = matches.filter((m) => m.likely)
    return {
      loading,
      signedIn: identity !== null,
      isCaregiver: identity?.role === 'caregiver',
      household,
      facts: mine,
      confirmed,
      matches,
      likely,
      totalCents: totalEstimate(likely),
      statuses: statuses.items.filter((s) => s.household_id === hid),
    }
  }, [loading, identity, hid, households.items, facts.items, statuses.items])
}
