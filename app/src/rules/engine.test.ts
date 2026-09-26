import { describe, expect, it } from 'vitest'
import type { ConfirmedFacts, Fact, FactValue, Household } from '@/contracts'
import { SAMPLE } from '@/content/sampleFamily'
import { EXTRA_HELP_LIMITS, MSP_LIMITS, RULES_AS_OF, VALUES } from '@/rules/rules2026'
import { ageOn, factsToConfirmed, matchPrograms, mspTierFor, totalEstimate } from '@/rules/engine'

function household(patch: Partial<Household> = {}): Household {
  return {
    id: 'h1',
    created_at: '2026-09-26T00:00:00.000Z',
    updated_at: '2026-09-26T00:00:00.000Z',
    ...SAMPLE.household,
    is_sample: true,
    ...patch,
  }
}

function facts(patch: Partial<ConfirmedFacts> = {}): ConfirmedFacts {
  return { ...SAMPLE.facts, medicare_parts: [...SAMPLE.facts.medicare_parts], ...patch }
}

const byId = (ms: ReturnType<typeof matchPrograms>, id: string) => ms.find((m) => m.program === id)!

describe('ageOn', () => {
  it('counts full years and handles the birthday itself', () => {
    expect(ageOn('1945-03-14', '2026-03-13')).toBe(80)
    expect(ageOn('1945-03-14', '2026-03-14')).toBe(81)
    expect(ageOn('1945-03-14', '2026-09-26')).toBe(81)
  })
})

describe('MSP tier boundaries', () => {
  for (const size of [1, 2] as const) {
    const key = size === 2 ? 'income_couple' : 'income_individual'
    const tiers = ['QMB', 'SLMB', 'QI'] as const
    tiers.forEach((tier, i) => {
      const limit = MSP_LIMITS[tier][key].value
      it(`${tier} (size ${size}): at, 1 cent below, 1 cent above ${limit}`, () => {
        expect(mspTierFor(limit, size)).toBe(tier)
        expect(mspTierFor(limit - 1, size)).toBe(tier)
        expect(mspTierFor(limit + 1, size)).toBe(tiers[i + 1] ?? null)
        const m = byId(matchPrograms(facts({ monthly_income_cents: limit }), household({ household_size: size })), 'msp')
        expect(m.likely).toBe(true)
        expect(m.tier).toBe(tier)
      })
    })
  }

  it('over the QI limit is not a match and counts nothing', () => {
    const over = MSP_LIMITS.QI.income_individual.value + 1
    const m = byId(matchPrograms(facts({ monthly_income_cents: over }), household()), 'msp')
    expect(m.likely).toBe(false)
    expect(m.tier).toBeUndefined()
    expect(m.est_annual_cents).toBe(0)
  })

  it('does not count Part B premium savings when the facts show Part A only', () => {
    const m = byId(matchPrograms(facts({ medicare_parts: ['A'] }), household()), 'msp')
    expect(m.likely).toBe(true)
    expect(m.est_annual_cents).toBe(0)
    expect(m.estimate_note).toContain('once enrolled in Part B')
  })

  it('needs Medicare Part A', () => {
    const m = byId(matchPrograms(facts({ medicare_parts: ['B'] }), household()), 'msp')
    expect(m.likely).toBe(false)
  })

  it('reasons quote the limit from the rules table', () => {
    const m = byId(matchPrograms(facts(), household()), 'msp')
    expect(m.reasons.join(' ')).toContain('$1,542/mo is under the $1,616 SLMB limit')
  })
})

describe('couple vs individual', () => {
  it('an income over the single QI limit still matches QMB for a couple', () => {
    const income = MSP_LIMITS.QI.income_individual.value + 100
    expect(byId(matchPrograms(facts({ monthly_income_cents: income }), household()), 'msp').likely).toBe(false)
    const couple = byId(matchPrograms(facts({ monthly_income_cents: income }), household({ household_size: 2 })), 'msp')
    expect(couple.likely).toBe(true)
    expect(couple.tier).toBe('QMB')
  })
})

describe('resource limit', () => {
  it('MSP ignores the bank balance when the state has no resource test', () => {
    expect(MSP_LIMITS.resources_individual).toBeNull()
    const rich = facts({ bank_balance_cents: 50_000_000 })
    expect(byId(matchPrograms(rich, household()), 'msp').likely).toBe(true)
  })

  it('Extra Help alone fails over its resource limit, at, below and above', () => {
    // Income over every MSP band but under Extra Help, so there is no deeming.
    const income = MSP_LIMITS.QI.income_individual.value + 1
    expect(income).toBeLessThanOrEqual(EXTRA_HELP_LIMITS.income_individual.value)
    const lim = EXTRA_HELP_LIMITS.resources_individual.value
    const eh = (bank: number) =>
      byId(matchPrograms(facts({ monthly_income_cents: income, bank_balance_cents: bank }), household()), 'extra_help')
    expect(eh(lim).likely).toBe(true)
    expect(eh(lim - 1).likely).toBe(true)
    expect(eh(lim + 1).likely).toBe(false)
    expect(eh(lim + 1).est_annual_cents).toBe(0)
  })

  it('an MSP match makes Extra Help likely even over its resource limit', () => {
    const m = byId(
      matchPrograms(facts({ bank_balance_cents: EXTRA_HELP_LIMITS.resources_individual.value + 1 }), household()),
      'extra_help',
    )
    expect(m.likely).toBe(true)
    expect(m.reasons[0]).toMatch(/automatically/)
  })

  it('Extra Help income boundary', () => {
    const lim = EXTRA_HELP_LIMITS.income_individual.value
    const eh = (income: number) =>
      byId(matchPrograms(facts({ monthly_income_cents: income }), household()), 'extra_help')
    expect(eh(lim).likely).toBe(true)
    expect(eh(lim + 1).likely).toBe(false)
  })
})

describe('GUIDE', () => {
  it('is a task only with a dementia diagnosis and Medicare A and B', () => {
    const g = byId(matchPrograms(facts(), household()), 'guide')
    expect(g.likely).toBe(true)
    expect(g.kind).toBe('task')
    expect(g.est_annual_cents).toBe(0)
    expect(g.estimate_note).toBe('up to $2,500/yr in respite through a participating provider')
    expect(byId(matchPrograms(facts(), household({ dementia_dx: false })), 'guide').likely).toBe(false)
    expect(byId(matchPrograms(facts({ medicare_parts: ['A'] }), household()), 'guide').likely).toBe(false)
  })
})

describe('golden: the sample Park family', () => {
  const ms = matchPrograms(facts(), household())

  it('matches MSP at SLMB, Extra Help, and a GUIDE task', () => {
    expect(byId(ms, 'msp')).toMatchObject({ likely: true, tier: 'SLMB', kind: 'draft', rules_as_of: RULES_AS_OF })
    expect(byId(ms, 'extra_help')).toMatchObject({ likely: true, kind: 'draft' })
    expect(byId(ms, 'guide')).toMatchObject({ likely: true, kind: 'task' })
  })

  it('totals Part B x 12 plus Extra Help, about $8,100', () => {
    expect(byId(ms, 'msp').est_annual_cents).toBe(243480)
    expect(totalEstimate(ms)).toBe(243480 + VALUES.extra_help_annual.value)
    expect(Math.round(totalEstimate(ms) / 10000) * 100).toBe(8100)
  })

  it('does not count programs that are not likely', () => {
    const fake = ms.map((m) => ({ ...m, likely: false }))
    expect(totalEstimate(fake)).toBe(0)
  })
})

describe('factsToConfirmed', () => {
  let n = 0
  const fact = (value: FactValue, confirmed = true, updated = '2026-09-26T10:00:00.000Z'): Fact => ({
    id: `f${n++}`,
    created_at: updated,
    updated_at: updated,
    household_id: 'h1',
    key: value.key,
    value,
    source: 'manual',
    mode: 'manual',
    confidence: 'high',
    confirmed,
  })
  const all = () => [
    fact({ key: 'birth_date', iso: '1945-03-14' }),
    fact({ key: 'medicare_parts', parts: ['A', 'B'] }),
    fact({ key: 'monthly_income', cents: 154200 }),
    fact({ key: 'bank_balance', cents: 320000 }),
  ]

  it('builds the engine input when all four are confirmed', () => {
    expect(factsToConfirmed(all())).toEqual(SAMPLE.facts)
  })

  it('is null when one is missing or unconfirmed', () => {
    expect(factsToConfirmed(all().slice(1))).toBeNull()
    const f = all()
    f[2] = { ...f[2], confirmed: false }
    expect(factsToConfirmed(f)).toBeNull()
  })

  it('uses the newest confirmed value', () => {
    const f = [...all(), fact({ key: 'monthly_income', cents: 99900 }, true, '2026-09-26T11:00:00.000Z')]
    expect(factsToConfirmed(f)?.monthly_income_cents).toBe(99900)
  })
})
