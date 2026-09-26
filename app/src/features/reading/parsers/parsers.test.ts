import { describe, expect, it } from 'vitest'
import type { OcrWord, ReadHit } from '@/contracts'
import { parse, redact, toSnippet, findMoney, findDates, MASK } from './index'
import { MEDICARE_CLEAN, MEDICARE_NOISY, MEDICARE_WORDS_ONLY } from '../fixtures/medicareCard'
import { SSA_CLEAN, SSA_NOISY, SSA_PAID_ONLY, SSA_SPLIT } from '../fixtures/ssaLetter'
import { BANK_AVAILABLE, BANK_CLEAN, BANK_NOISY, BANK_TWO_ACCOUNTS } from '../fixtures/bankStatement'
import { DOB_FORMATS, TAX_CHECKBOX_ONLY, TAX_CLEAN, TAX_NOISY } from '../fixtures/taxReturn'
import { bestFacts } from '../merge'

const byKey = (hits: ReadHit[], key: ReadHit['key']) => hits.find((h) => h.key === key)

const SSN_RE = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/
const MBI_RE = /\b[1-9][A-Z][A-Z0-9]\d[-\s]?[A-Z][A-Z0-9]\d[-\s]?[A-Z]{2}\d{2}\b/i
const ACCOUNT_RE = /\d(?:[\s-]?\d){7,}/

function assertNoSecrets(hits: ReadHit[]) {
  for (const h of hits) {
    const s = h.snippet ?? ''
    expect(s).not.toMatch(SSN_RE)
    expect(s).not.toMatch(MBI_RE)
    expect(accountLike(s)).toEqual([])
  }
}

/** Long digit runs that are not dates. */
function accountLike(s: string): string[] {
  return (s.match(new RegExp(ACCOUNT_RE.source, 'g')) ?? []).filter(
    (m) => !/^(\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{2}-\d{2})$/.test(m),
  )
}

describe('money', () => {
  it('reads clean and noisy amounts', () => {
    expect(findMoney('Total $1,420.00').map((m) => m.cents)).toEqual([142000])
    expect(findMoney('Total $ 1,420.00').map((m) => m.cents)).toEqual([142000])
    expect(findMoney('Total $1, 420 . 00').map((m) => m.cents)).toEqual([142000])
    expect(findMoney('Total $1,4ZO.OO')[0]).toMatchObject({ cents: 142000, fuzzy: true })
    expect(findMoney('Total 1,420,00')[0].cents).toBe(142000)
    expect(findMoney('Social Security')).toEqual([])
  })
})

describe('dates', () => {
  it.each(DOB_FORMATS)('parses %s', (line, iso) => {
    expect(findDates(line)[0]?.iso).toBe(iso)
  })
  it('rejects impossible dates', () => {
    expect(findDates('02/31/1945')).toEqual([])
  })
})

describe('medicare card', () => {
  it('reads parts A and B from a clean card', () => {
    const hits = parse('medicare_card', MEDICARE_CLEAN)
    expect(byKey(hits, 'medicare_parts')).toMatchObject({
      value: { key: 'medicare_parts', parts: ['A', 'B'] },
      confidence: 'high',
    })
    expect(byKey(hits, 'birth_date')).toBeUndefined()
    assertNoSecrets(hits)
  })
  it('reads parts from a noisy card (PART 8 is Part B)', () => {
    const hits = parse('medicare_card', MEDICARE_NOISY)
    expect(byKey(hits, 'medicare_parts')?.value).toEqual({ key: 'medicare_parts', parts: ['A', 'B'] })
    assertNoSecrets(hits)
  })
  it('falls back to HOSPITAL and MEDICAL with medium confidence', () => {
    const hit = byKey(parse('medicare_card', MEDICARE_WORDS_ONLY), 'medicare_parts')
    expect(hit).toMatchObject({ value: { parts: ['A', 'B'] }, confidence: 'medium' })
  })
})

describe('social security letter', () => {
  it('prefers the benefit before deductions', () => {
    const hits = parse('ssa_letter', SSA_CLEAN)
    expect(byKey(hits, 'monthly_income')).toMatchObject({
      value: { key: 'monthly_income', cents: 154200 },
      confidence: 'high',
    })
    assertNoSecrets(hits)
  })
  it('handles OCR noise in the amount', () => {
    const hits = parse('ssa_letter', SSA_NOISY)
    expect(byKey(hits, 'monthly_income')).toMatchObject({
      value: { cents: 154200 },
      confidence: 'medium',
    })
    assertNoSecrets(hits)
  })
  it('finds an amount on the line after its label', () => {
    expect(byKey(parse('ssa_letter', SSA_SPLIT), 'monthly_income')?.value).toEqual({
      key: 'monthly_income',
      cents: 154200,
    })
  })
  it('uses the paid amount when that is all there is, with less confidence', () => {
    const hit = byKey(parse('ssa_letter', SSA_PAID_ONLY), 'monthly_income')
    expect(hit?.value).toEqual({ key: 'monthly_income', cents: 133910 })
    expect(hit?.confidence).not.toBe('high')
  })
})

describe('bank statement', () => {
  it('reads the ending balance, not the beginning one', () => {
    const hits = parse('bank_statement', BANK_CLEAN)
    expect(byKey(hits, 'bank_balance')).toMatchObject({
      value: { key: 'bank_balance', cents: 320000 },
      confidence: 'high',
    })
    expect(byKey(hits, 'birth_date')).toBeUndefined()
    assertNoSecrets(hits)
  })
  it('reads a noisy ending balance', () => {
    const hit = byKey(parse('bank_statement', BANK_NOISY), 'bank_balance')
    expect(hit).toMatchObject({ value: { cents: 320000 }, confidence: 'medium' })
  })
  it('adds checking and savings', () => {
    const hit = byKey(parse('bank_statement', BANK_TWO_ACCOUNTS), 'bank_balance')
    expect(hit).toMatchObject({ value: { cents: 320000 }, confidence: 'medium' })
  })
  it('reads an available balance on the next line', () => {
    expect(byKey(parse('bank_statement', BANK_AVAILABLE), 'bank_balance')?.value).toEqual({
      key: 'bank_balance',
      cents: 320000,
    })
  })
})

describe('tax return', () => {
  it('reads the date of birth and skips the 1961 cutoff', () => {
    const hits = parse('tax_return', TAX_CLEAN)
    expect(byKey(hits, 'birth_date')).toMatchObject({
      value: { key: 'birth_date', iso: '1945-03-14' },
      confidence: 'high',
    })
    assertNoSecrets(hits)
  })
  it('turns yearly Social Security into a low-confidence monthly guess', () => {
    const hit = byKey(parse('tax_return', TAX_CLEAN), 'monthly_income')
    expect(hit).toMatchObject({ value: { cents: 150000 }, confidence: 'low' })
  })
  it('reads a noisy date of birth with medium confidence', () => {
    const hits = parse('tax_return', TAX_NOISY)
    expect(byKey(hits, 'birth_date')).toMatchObject({ value: { iso: '1945-03-14' }, confidence: 'medium' })
    expect(byKey(hits, 'monthly_income')?.value).toEqual({ key: 'monthly_income', cents: 150000 })
  })
  it('reads 6a when 6a and 6b share one OCR line', () => {
    const hit = byKey(
      parse('tax_return', '6a Social security benefits 6a 18,000 b Taxable amount 6b 0'),
      'monthly_income',
    )
    expect(hit?.value).toEqual({ key: 'monthly_income', cents: 150000 })
  })
  it('never treats "born before January 2, 1961" as a birthday', () => {
    expect(byKey(parse('tax_return', TAX_CHECKBOX_ONLY), 'birth_date')).toBeUndefined()
  })
})

describe('highlight boxes', () => {
  it('places a normalized box around a split amount', () => {
    const words: OcrWord[] = [
      { text: 'Ending', bbox: { x0: 10, y0: 100, x1: 60, y1: 120 }, confidence: 90 },
      { text: 'balance', bbox: { x0: 65, y0: 100, x1: 130, y1: 120 }, confidence: 90 },
      { text: '$', bbox: { x0: 300, y0: 100, x1: 310, y1: 120 }, confidence: 90 },
      { text: '3,2OO.00', bbox: { x0: 312, y0: 100, x1: 380, y1: 120 }, confidence: 80 },
    ]
    const [hit] = parse('bank_statement', 'Ending balance $ 3,2OO.00', words, { width: 400, height: 500 })
    expect(hit.box).toBeDefined()
    expect(hit.box!.x).toBeCloseTo(0.744, 2)
    expect(hit.box!.y).toBeCloseTo(0.196, 2)
    expect(hit.box!.x + hit.box!.w).toBeLessThanOrEqual(1)
  })
})

describe('redaction', () => {
  it.each([
    'SSN 123-45-6789',
    'SSN 123 45 6789',
    'SSN 123456789',
    'Medicare number 1EG4-TE5-MK73',
    'Medicare number 1EG4TE5MK73',
    'Account 0012345678901',
    'Card 4111 1111 1111 1111',
    'Routing 021000021',
  ])('masks %s', (text) => {
    const out = redact(text)
    expect(out).toContain(MASK)
    expect(out).not.toMatch(SSN_RE)
    expect(out).not.toMatch(MBI_RE)
    expect(accountLike(out)).toEqual([])
  })
  it.each([
    ['Claim Number: 123-45-6789A', '123'],
    ['SSN: 123456789A', '123456789'],
    ['Your number 123 - 45 - 6789 is on file', '6789'],
    ['Medicare IEG4-TE5-MK73 Part A', 'MK73'],
    ['card lEG4-TE5-MK73', 'TE5'],
    ['BNC 1234567', '1234567'],
    ['Social Security No. 12 34', '12 34'],
  ])('masks the identifier in %s', (text, secret) => {
    const out = redact(text)
    expect(out).toContain(MASK)
    expect(out).not.toContain(secret)
  })
  it('leaves a label with no number alone', () => {
    expect(redact('SSN: not read')).toBe('SSN: not read')
    expect(redact('Your Social Security benefits $1,542.00')).toBe('Your Social Security benefits $1,542.00')
  })
  it('masks short labeled account numbers', () => {
    expect(redact('Account number: 12-3456')).toBe(`Account number ${MASK}`)
  })
  it('keeps dashed dates readable', () => {
    expect(redact('HOSPITAL (PART A) 03-01-2010')).toBe('HOSPITAL (PART A) 03-01-2010')
    expect(redact('Born 1945-03-14')).toBe('Born 1945-03-14')
  })
  it('keeps money and dates readable', () => {
    expect(redact('Ending balance $3,200.00 on 08/31/2026')).toBe('Ending balance $3,200.00 on 08/31/2026')
  })
  it('caps snippet length', () => {
    expect(toSnippet('word '.repeat(80)).length).toBeLessThanOrEqual(110)
  })
  it('no fixture snippet leaks a secret', () => {
    for (const [kind, text] of [
      ['medicare_card', MEDICARE_CLEAN],
      ['ssa_letter', SSA_CLEAN],
      ['bank_statement', BANK_CLEAN],
      ['tax_return', TAX_CLEAN],
    ] as const) {
      assertNoSecrets(parse(kind, text))
    }
  })
})

describe('bestFacts', () => {
  it('prefers the surest reading, then the natural source', () => {
    const facts = bestFacts(
      {
        ssa_letter: [{ key: 'monthly_income', value: { key: 'monthly_income', cents: 154200 }, confidence: 'high' }],
        tax_return: [
          { key: 'monthly_income', value: { key: 'monthly_income', cents: 150000 }, confidence: 'low' },
          { key: 'birth_date', value: { key: 'birth_date', iso: '1945-03-14' }, confidence: 'high' },
        ],
      },
      { ssa_letter: 'sample', tax_return: 'ocr' },
    )
    expect(facts.monthly_income).toMatchObject({ source: 'ssa_letter', mode: 'sample' })
    expect(facts.birth_date).toMatchObject({ source: 'tax_return', mode: 'ocr' })
    expect(facts.bank_balance).toBeUndefined()
  })
})
