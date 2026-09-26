// One hook that gathers everything the plan and family views show, kept live
// across tabs. Facts are read only to compute matches and totals; callers
// never get fact values back, so the family view cannot display them.

import { useMemo } from 'react'
import type { DocKind, Household, Member, ProgramMatch, ProgramStatus, Task } from '@/contracts'
import { FactEntity, HouseholdEntity, MemberEntity, ProgramStatusEntity, TaskEntity } from '@/data/entities'
import { useEntityList } from '@/hooks/useEntityList'
import { factsToConfirmed, matchPrograms, totalEstimate } from '@/rules/engine'
import { missingDocsFromFacts } from '@/data/tasks'

export interface PlanData {
  loading: boolean
  household: Household | null
  members: Member[]
  tasks: Task[]
  statuses: ProgramStatus[]
  /** Likely program matches from the rules engine (empty until facts are confirmed). */
  matches: ProgramMatch[]
  /** Estimated yearly value in progress, cents, from the rules engine. */
  totalCents: number
  /** True once all four facts are confirmed. */
  ready: boolean
  /** Proof documents still to find (never the document contents). */
  missingDocs: DocKind[]
}

const TASK_ORDER: Record<Task['kind'], number> = {
  sign: 0,
  ship_review_submit: 1,
  find_guide: 2,
  missing_doc: 3,
  custom: 4,
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => TASK_ORDER[a.kind] - TASK_ORDER[b.kind] || a.created_at.localeCompare(b.created_at),
  )
}

/** Find a household by id or by invite code. */
export function usePlanData(by: { householdId?: string | null; inviteCode?: string | null }): PlanData {
  const households = useEntityList(HouseholdEntity)
  const members = useEntityList(MemberEntity)
  const facts = useEntityList(FactEntity)
  const tasks = useEntityList(TaskEntity)
  const statuses = useEntityList(ProgramStatusEntity)

  const loading = households.loading || members.loading || facts.loading || tasks.loading || statuses.loading

  const household = useMemo(() => {
    const code = by.inviteCode?.trim().toUpperCase()
    return (
      households.items.find((h) =>
        by.householdId ? h.id === by.householdId : code ? h.invite_code.toUpperCase() === code : false,
      ) ?? null
    )
  }, [households.items, by.householdId, by.inviteCode])

  const hid = household?.id ?? null

  return useMemo(() => {
    const mine = <T extends { household_id: string }>(x: T) => x.household_id === hid
    const myFacts = facts.items.filter((f) => mine(f) && f.confirmed)
    const confirmed = household ? factsToConfirmed(myFacts) : null
    const matches = confirmed && household ? matchPrograms(confirmed, household).filter((m) => m.likely) : []
    return {
      loading,
      household,
      members: members.items.filter(mine),
      tasks: sortTasks(tasks.items.filter(mine)),
      statuses: statuses.items.filter(mine),
      matches,
      totalCents: totalEstimate(matches),
      ready: confirmed !== null,
      missingDocs: confirmed ? missingDocsFromFacts(myFacts) : [],
    }
  }, [loading, household, hid, members.items, facts.items, tasks.items, statuses.items])
}
