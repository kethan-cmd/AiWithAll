import { describe, expect, it } from 'vitest'
import type { Fact, FactValue, Household } from '@/contracts'
import { SAMPLE } from '@/content/sampleFamily'
import { buildDraft } from '@/features/programs/drafts'

const h: Household = {
  id: 'h1',
  created_at: '2026-09-26T00:00:00.000Z',
  updated_at: '2026-09-26T00:00:00.000Z',
  ...SAMPLE.household,
  is_sample: true,
}

const fact = (value: FactValue, source: Fact['source']): Fact => ({
  id: value.key,
  created_at: '2026-09-26T00:00:00.000Z',
  updated_at: '2026-09-26T00:00:00.000Z',
  household_id: 'h1',
  key: value.key,
  value,
  source,
  mode: 'sample',
  confidence: 'high',
  confirmed: true,
})

const facts: Fact[] = [
  fact({ key: 'birth_date', iso: SAMPLE.facts.birth_date }, 'medicare_card'),
  fact({ key: 'medicare_parts', parts: [...SAMPLE.facts.medicare_parts] }, 'medicare_card'),
  fact({ key: 'monthly_income', cents: SAMPLE.facts.monthly_income_cents }, 'ssa_letter'),
  fact({ key: 'bank_balance', cents: SAMPLE.facts.bank_balance_cents }, 'manual'),
]
const f = { ...SAMPLE.facts, medicare_parts: [...SAMPLE.facts.medicare_parts] }

describe.each(['msp', 'extra_help'] as const)('buildDraft(%s)', (program) => {
  const d = buildDraft(program, f, facts, h)

  it('always leaves SSN and Medicare number blank, to fill by hand', () => {
    for (const id of ['ssn', 'medicare_number']) {
      const field = d.fields.find((x) => x.id === id)
      expect(field).toBeDefined()
      expect(field!.value).toBeNull()
      expect(field!.fill_by_hand).toBe(true)
    }
  })

  it('tags every filled value with a source', () => {
    for (const field of d.fields) {
      if (field.value !== null) {
        expect(field.source).not.toBeNull()
        expect(field.fill_by_hand).toBe(false)
      }
    }
  })

  it('has 6 to 12 fields, a signature by hand and a still-needed list', () => {
    expect(d.fields.length).toBeGreaterThanOrEqual(6)
    expect(d.fields.length).toBeLessThanOrEqual(12)
    expect(d.fields.find((x) => x.id === 'signature')?.fill_by_hand).toBe(true)
    expect(d.still_needed.length).toBeGreaterThan(0)
    expect(d.form_url).toMatch(/^https:\/\//)
  })

  it('uses the facts and the source document they came from', () => {
    const income = d.fields.find((x) => x.id === 'income')!
    expect(income.value).toBe('$1,542 per month')
    expect(income.source).toBe('ssa_letter')
    expect(d.fields.find((x) => x.id === 'dob')?.value).toBe('March 14, 1945')
  })

  it('asks for the bank statement when the balance was typed by hand', () => {
    expect(d.still_needed.join(' ')).toMatch(/bank account/)
  })

  it('never contains a digit string that looks like an SSN', () => {
    expect(JSON.stringify(d)).not.toMatch(/\d{3}-\d{2}-\d{4}/)
  })
})
