// Demo data: the fictional Park family from src/content/sampleFamily.ts.
// Loading it is repeatable: old sample records are removed first, and ids are
// fixed so every tab and every run agree.

import type { Fact, FactValue, Household, Identity } from '@/contracts'
import { FactEntity, HouseholdEntity, MemberEntity, ProgramStatusEntity, TaskEntity, wipeAllStorage } from '@/data/entities'
import type { NewRecord } from '@/data/entities'
import { getIdentity, resetSession, setIdentity } from '@/data/session'
import { SAMPLE } from '@/content/sampleFamily'

export const SAMPLE_HOUSEHOLD_ID = 'sample-household'

export function sampleMemberId(alias: string): string {
  return `sample-member-${alias.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

async function removeSampleRecords() {
  const hid = SAMPLE_HOUSEHOLD_ID
  const byHousehold = <T extends { household_id: string }>(x: T) => x.household_id === hid
  for (const t of await TaskEntity.list(byHousehold)) await TaskEntity.delete(t.id)
  for (const s of await ProgramStatusEntity.list(byHousehold)) await ProgramStatusEntity.delete(s.id)
  for (const f of await FactEntity.list(byHousehold)) await FactEntity.delete(f.id)
  for (const m of await MemberEntity.list(byHousehold)) await MemberEntity.delete(m.id)
  // Also any older sample household with a different id but the same code.
  for (const h of await HouseholdEntity.list((x) => x.id === hid || (x.is_sample && x.invite_code === SAMPLE.household.invite_code))) {
    await HouseholdEntity.delete(h.id)
  }
}

/**
 * Start the demo fresh as Grace, the Park family's main caregiver.
 * Creates the household and members only. Facts come from reading the sample
 * documents on #/read. Also clears this tab's in-memory reading state.
 */
export async function loadSampleFamily(): Promise<Identity> {
  await removeSampleRecords()
  resetSession()
  await HouseholdEntity.create({ id: SAMPLE_HOUSEHOLD_ID, ...SAMPLE.household, is_sample: true })
  let caregiverId: string | null = null
  for (const m of SAMPLE.members) {
    const rec = await MemberEntity.create({
      id: sampleMemberId(m.alias),
      household_id: SAMPLE_HOUSEHOLD_ID,
      alias: m.alias,
      relation: m.relation,
      role: m.role,
    })
    if (m.role === 'caregiver' && !caregiverId) caregiverId = rec.id
  }
  const caregiver = SAMPLE.members.find((m) => m.role === 'caregiver')
  const identity: Identity = {
    household_id: SAMPLE_HOUSEHOLD_ID,
    member_id: caregiverId,
    alias: caregiver?.alias ?? SAMPLE.household.caregiver_alias,
    role: 'caregiver',
  }
  setIdentity(identity)
  return identity
}

/**
 * Demo safety net: the Park family with all four facts already confirmed, as
 * if the sample documents had just been read. Lets a presenter jump straight
 * to the plan. Every value comes from SAMPLE.
 */
export async function loadSampleFamilyWithFacts(): Promise<Identity> {
  const identity = await loadSampleFamily()
  const f = SAMPLE.facts
  const rows: { value: FactValue; source: Fact['source']; snippet: string }[] = [
    { value: { key: 'birth_date', iso: f.birth_date }, source: 'medicare_card', snippet: 'Date of birth on the Medicare card' },
    { value: { key: 'medicare_parts', parts: [...f.medicare_parts] }, source: 'medicare_card', snippet: 'Entitled to Part A and Part B' },
    { value: { key: 'monthly_income', cents: f.monthly_income_cents }, source: 'ssa_letter', snippet: 'Monthly benefit on the award letter' },
    { value: { key: 'bank_balance', cents: f.bank_balance_cents }, source: 'bank_statement', snippet: 'Ending balance on the statement' },
  ]
  for (const r of rows) {
    const fact: NewRecord<Fact> = {
      id: `sample-fact-${r.value.key}`,
      household_id: SAMPLE_HOUSEHOLD_ID,
      key: r.value.key,
      value: r.value,
      source: r.source,
      mode: 'sample',
      confidence: 'high',
      confirmed: true,
      snippet: r.snippet,
    }
    await FactEntity.create(fact)
  }
  return identity
}

/** Remove every record and photo from this browser and forget who this tab is. */
export async function resetEverything(): Promise<void> {
  wipeAllStorage()
  resetSession()
  setIdentity(null)
}

/** The household this tab is working on, or null. */
export async function currentHousehold(): Promise<Household | null> {
  const id = getIdentity()
  if (!id) return null
  return HouseholdEntity.get(id.household_id)
}
