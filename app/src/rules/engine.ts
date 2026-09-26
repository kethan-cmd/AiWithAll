// The rules engine: confirmed facts in, likely programs out. Pure functions
// only. Every limit, dollar value, date and link comes from rules2026.ts, so
// updating the rules table updates every reason and every total on screen.

import type {
  ConfirmedFacts,
  Fact,
  FactKey,
  Household,
  MatchFn,
  MedicarePart,
  MspTier,
  ProgramMatch,
  TotalFn,
} from '@/contracts'
import { formatUSD } from '@/lib/money'
import type { RuleValue } from '@/rules/rules2026'
import {
  EXTRA_HELP_LIMITS,
  MSP_DEEMS_EXTRA_HELP,
  MSP_HAS_RESOURCE_TEST,
  MSP_LIMITS,
  PROGRAM_SOURCES,
  RULES_AS_OF,
  RULESET_LABEL,
  VALUES,
} from '@/rules/rules2026'

/** Tiers from the strictest band to the widest. */
export const MSP_TIERS: readonly MspTier[] = ['QMB', 'SLMB', 'QI'] as const

/** Plain names for each Medicare Savings Program level. */
export const TIER_NAMES: Record<MspTier, string> = {
  QMB: 'Qualified Medicare Beneficiary',
  SLMB: 'Specified Low-Income Medicare Beneficiary',
  QI: 'Qualifying Individual',
}

/** Whole dollars when the amount is whole, cents otherwise (never rounds a
 *  value across a limit on screen). */
export function money(cents: number): string {
  return formatUSD(cents, { whole: cents % 100 === 0 })
}

/** Full years between a birth date and another date (both YYYY-MM-DD). */
export function ageOn(birthIso: string, onIso: string): number {
  const [by, bm, bd] = birthIso.slice(0, 10).split('-').map(Number)
  const [oy, om, od] = onIso.slice(0, 10).split('-').map(Number)
  let age = oy - by
  if (om < bm || (om === bm && od < bd)) age -= 1
  return age
}

function todayIso(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function has(parts: MedicarePart[], ...want: MedicarePart[]): boolean {
  return want.every((p) => parts.includes(p))
}

function comparison(amount: number, limit: RuleValue, what: string): string {
  if (amount < limit.value) return `is under the ${money(limit.value)} ${what}`
  if (amount === limit.value) return `is right at the ${money(limit.value)} ${what}`
  return `is over the ${money(limit.value)} ${what}`
}

function partsText(parts: MedicarePart[]): string {
  const sorted = [...parts].sort()
  if (sorted.length === 0) return 'no Medicare parts'
  if (sorted.length === 1) return `Medicare Part ${sorted[0]}`
  return `Medicare Parts ${sorted.slice(0, -1).join(', ')} and ${sorted[sorted.length - 1]}`
}

/** Which MSP level a monthly income falls in, or null if over every band. */
export function mspTierFor(incomeCents: number, householdSize: 1 | 2): MspTier | null {
  for (const tier of MSP_TIERS) {
    const limit = householdSize === 2 ? MSP_LIMITS[tier].income_couple : MSP_LIMITS[tier].income_individual
    if (incomeCents <= limit.value) return tier
  }
  return null
}

function matchMsp(f: ConfirmedFacts, h: Household): ProgramMatch {
  const couple = h.household_size === 2
  const who = couple ? 'couple' : 'single person'
  const income = f.monthly_income_cents
  const tier = mspTierFor(income, h.household_size)
  const hasPartA = has(f.medicare_parts, 'A')
  const resourceLimit = couple ? MSP_LIMITS.resources_couple : MSP_LIMITS.resources_individual
  const resourcesOk = resourceLimit === null || f.bank_balance_cents <= resourceLimit.value

  const reasons: string[] = []
  const age = ageOn(f.birth_date, todayIso())
  reasons.push(
    hasPartA
      ? `Age ${age}, with ${partsText(f.medicare_parts)}`
      : `Needs Medicare Part A; the facts show ${partsText(f.medicare_parts)}`,
  )
  if (tier) {
    const limit = couple ? MSP_LIMITS[tier].income_couple : MSP_LIMITS[tier].income_individual
    reasons.push(`Income ${money(income)}/mo ${comparison(income, limit, `${tier} limit`)} for a ${who}`)
  } else {
    const widest = couple ? MSP_LIMITS.QI.income_couple : MSP_LIMITS.QI.income_individual
    reasons.push(`Income ${money(income)}/mo ${comparison(income, widest, 'QI limit, the highest level')}`)
  }
  if (resourceLimit === null || !MSP_HAS_RESOURCE_TEST.value) {
    reasons.push(`No savings limit in ${RULESET_LABEL.split(',')[0]}, so the ${money(f.bank_balance_cents)} in the bank does not count against you`)
  } else {
    reasons.push(`Bank balance ${money(f.bank_balance_cents)} ${comparison(f.bank_balance_cents, resourceLimit, 'savings limit')}`)
  }

  const likely = hasPartA && tier !== null && resourcesOk
  const premium = VALUES.part_b_premium_monthly.value
  const annual = premium * 12
  const paysPartB = has(f.medicare_parts, 'B')
  const estimate_note = likely
    ? !paysPartB
      ? 'Would pay the Part B premium once enrolled in Part B. Not counted in the total yet.'
      : tier === 'QMB'
      ? `Pays the ${money(premium)}/mo Part B premium (${money(annual)}/yr). QMB also covers Part A and B cost sharing, not counted here.`
      : `Pays the ${money(premium)}/mo Part B premium, ${money(annual)}/yr back in the monthly check.`
    : 'Not counted in the total.'

  return {
    program: 'msp',
    name: 'Medicare Savings Program',
    likely,
    tier: likely && tier ? tier : undefined,
    reasons,
    est_annual_cents: likely && paysPartB ? annual : 0,
    estimate_note,
    kind: 'draft',
    rules_as_of: RULES_AS_OF,
    source_url: PROGRAM_SOURCES.msp,
  }
}

function matchExtraHelp(f: ConfirmedFacts, h: Household, mspLikely: boolean): ProgramMatch {
  const couple = h.household_size === 2
  const incomeLimit = couple ? EXTRA_HELP_LIMITS.income_couple : EXTRA_HELP_LIMITS.income_individual
  const resourceLimit = couple ? EXTRA_HELP_LIMITS.resources_couple : EXTRA_HELP_LIMITS.resources_individual
  const income = f.monthly_income_cents
  const bank = f.bank_balance_cents
  const onMedicare = has(f.medicare_parts, 'A') || has(f.medicare_parts, 'B')
  const incomeOk = income <= incomeLimit.value
  const resourcesOk = bank <= resourceLimit.value
  const deemed = mspLikely && MSP_DEEMS_EXTRA_HELP.value

  const reasons: string[] = []
  if (deemed) reasons.push('Comes automatically once the Medicare Savings Program is approved. Applying now is optional and can start it sooner')
  reasons.push(`Income ${money(income)}/mo ${comparison(income, incomeLimit, 'Extra Help limit')}`)
  reasons.push(`Bank balance ${money(bank)} ${comparison(bank, resourceLimit, 'savings limit')}`)
  if (!onMedicare) reasons.push('Needs Medicare Part A or Part B')

  const likely = onMedicare && (deemed || (incomeOk && resourcesOk))
  const value = VALUES.extra_help_annual.value
  return {
    program: 'extra_help',
    name: 'Extra Help with drug costs',
    likely,
    reasons,
    est_annual_cents: likely ? value : 0,
    estimate_note: likely
      ? `Social Security estimates about ${money(value)}/yr in lower drug premiums and copays. The real amount depends on the prescriptions.`
      : 'Not counted in the total.',
    kind: 'draft',
    rules_as_of: RULES_AS_OF,
    source_url: PROGRAM_SOURCES.extra_help,
  }
}

function matchGuide(f: ConfirmedFacts, h: Household): ProgramMatch {
  const ab = has(f.medicare_parts, 'A', 'B')
  const likely = h.dementia_dx && ab
  const reasons: string[] = []
  reasons.push(h.dementia_dx ? 'Has a dementia diagnosis' : 'Needs a dementia diagnosis')
  reasons.push(ab ? 'Has Medicare Part A and Part B' : `Needs Medicare Part A and Part B; the facts show ${partsText(f.medicare_parts)}`)
  reasons.push('No application: you join through a participating GUIDE provider')
  reasons.push('Needs Original Medicare, not a Medicare Advantage plan (a counselor can check)')
  return {
    program: 'guide',
    name: 'GUIDE dementia care and respite',
    likely,
    reasons,
    est_annual_cents: 0,
    estimate_note: `up to ${money(VALUES.guide_respite_annual_max.value)}/yr in respite through a participating provider`,
    kind: 'task',
    rules_as_of: RULES_AS_OF,
    source_url: PROGRAM_SOURCES.guide,
  }
}

/** Check confirmed facts against the rules table. Always returns all three
 *  programs in the same order; `likely` says which ones match. */
export const matchPrograms: MatchFn = (f, h) => {
  const msp = matchMsp(f, h)
  return [msp, matchExtraHelp(f, h, msp.likely), matchGuide(f, h)]
}

/** Estimated yearly value of every likely program, in cents. */
export const totalEstimate: TotalFn = (matches) =>
  matches.reduce((sum, m) => sum + (m.likely ? m.est_annual_cents : 0), 0)

const KEYS: readonly FactKey[] = ['birth_date', 'medicare_parts', 'monthly_income', 'bank_balance'] as const

/** The newest confirmed fact for a key, or undefined. */
export function latestConfirmed(facts: Fact[], key: FactKey): Fact | undefined {
  return facts
    .filter((x) => x.key === key && x.confirmed)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]
}

/** Shape confirmed facts for the engine. Null unless all four are confirmed. */
export function factsToConfirmed(facts: Fact[]): ConfirmedFacts | null {
  const byKey = new Map(KEYS.map((k) => [k, latestConfirmed(facts, k)]))
  const out: Partial<ConfirmedFacts> = {}
  for (const k of KEYS) {
    const v = byKey.get(k)?.value
    if (!v) return null
    if (v.key === 'birth_date') out.birth_date = v.iso
    else if (v.key === 'medicare_parts') out.medicare_parts = [...v.parts]
    else if (v.key === 'monthly_income') out.monthly_income_cents = v.cents
    else out.bank_balance_cents = v.cents
  }
  return out as ConfirmedFacts
}
