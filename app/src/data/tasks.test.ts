import type { Fact, Household, ProgramMatch } from '@/contracts'
import { TaskEntity } from '@/data/entities'
import { SAMPLE } from '@/content/sampleFamily'
import { ensureTasks, generateTasks, missingDocsFromFacts, taskKey } from './tasks'

const h: Household = {
  id: 'h1',
  created_at: '',
  updated_at: '',
  ...SAMPLE.household,
  is_sample: true,
}

function match(program: ProgramMatch['program'], kind: ProgramMatch['kind'], likely = true): ProgramMatch {
  return {
    program,
    name: program,
    likely,
    reasons: [],
    est_annual_cents: 0,
    estimate_note: '',
    kind,
    rules_as_of: '2026-09-26',
    source_url: 'https://example.org',
  }
}

const matches = [match('msp', 'draft'), match('extra_help', 'draft'), match('guide', 'task')]

function fact(key: Fact['key'], source: Fact['source'], confirmed = true): Fact {
  return {
    id: key,
    created_at: '',
    updated_at: '',
    household_id: 'h1',
    key,
    value: { key: 'bank_balance', cents: 1 } as Fact['value'],
    source,
    mode: 'sample',
    confidence: 'high',
    confirmed,
  }
}

describe('generateTasks', () => {
  it('makes a sign task per draft, one counselor task and a GUIDE task', () => {
    const tasks = generateTasks('h1', matches, h, [])
    expect(tasks.map((t) => t.kind)).toEqual(['sign', 'sign', 'ship_review_submit', 'find_guide'])
    expect(tasks[0].title).toContain('Medicare Savings Program')
    expect(tasks[0].title).toContain('authorized representative')
    expect(tasks[3].title).toBe(`Find a GUIDE provider near ${SAMPLE.household.care_recipient_alias}`)
    expect(tasks[3].detail).toContain('$2,500/yr')
    expect(tasks.every((t) => t.status === 'open' && t.claimed_by === null && t.household_id === 'h1')).toBe(true)
  })

  it('skips programs that are not likely', () => {
    const tasks = generateTasks('h1', [match('msp', 'draft', false), match('guide', 'task', false)], h, [])
    expect(tasks).toEqual([])
  })

  it('adds missing document tasks', () => {
    const tasks = generateTasks('h1', [], h, ['bank_statement'])
    expect(tasks).toHaveLength(1)
    expect(tasks[0].kind).toBe('missing_doc')
    expect(tasks[0].title).toContain('bank statement')
  })

  it('has no em dashes in any copy', () => {
    const all = generateTasks('h1', matches, h, ['ssa_letter'])
    for (const t of all) expect(`${t.title}${t.detail}`).not.toMatch(/\u2014/)
  })
})

describe('missingDocsFromFacts', () => {
  it('flags proof docs whose facts were typed by hand', () => {
    const facts = [
      fact('birth_date', 'medicare_card'),
      fact('medicare_parts', 'medicare_card'),
      fact('monthly_income', 'manual'),
      fact('bank_balance', 'bank_statement'),
    ]
    expect(missingDocsFromFacts(facts)).toEqual(['ssa_letter'])
  })
  it('is empty when every fact came from its document', () => {
    const facts = [
      fact('birth_date', 'medicare_card'),
      fact('medicare_parts', 'medicare_card'),
      fact('monthly_income', 'ssa_letter'),
      fact('bank_balance', 'bank_statement'),
    ]
    expect(missingDocsFromFacts(facts)).toEqual([])
  })
})

describe('ensureTasks', () => {
  beforeEach(() => localStorage.clear())

  it('creates only missing tasks and keeps claims', async () => {
    const first = await ensureTasks('h1', matches, h, [])
    expect(first).toHaveLength(4)
    await TaskEntity.update(first[0].id, { status: 'claimed', claimed_by: 'Daniel' })
    const again = await ensureTasks('h1', matches, h, ['ssa_letter'])
    expect(again).toHaveLength(1)
    expect(again[0].kind).toBe('missing_doc')
    const all = await TaskEntity.list()
    expect(all).toHaveLength(5)
    expect(all.find((t) => t.id === first[0].id)?.claimed_by).toBe('Daniel')
    expect(new Set(all.map(taskKey)).size).toBe(5)
  })

  it('removes open tasks that are no longer needed but keeps claimed ones', async () => {
    const first = await ensureTasks('h1', matches, h, [])
    const eh = first.find((t) => t.program === 'extra_help')!
    await ensureTasks('h1', [match('msp', 'draft'), match('guide', 'task')], h, [])
    const all = await TaskEntity.list()
    expect(all.some((t) => t.id === eh.id)).toBe(false)
    expect(all.some((t) => t.program === 'msp' && t.kind === 'sign')).toBe(true)

    const second = await ensureTasks('h1', matches, h, [])
    const eh2 = second.find((t) => t.program === 'extra_help')!
    await TaskEntity.update(eh2.id, { status: 'claimed', claimed_by: 'Anna' })
    await ensureTasks('h1', [match('msp', 'draft')], h, [])
    expect((await TaskEntity.get(eh2.id))?.claimed_by).toBe('Anna')
  })
})

describe('sample family facts', () => {
  it('does not flag the Medicare card when only birth date came from another document', () => {
    const facts = [
      fact('birth_date', 'tax_return'),
      fact('medicare_parts', 'medicare_card'),
      fact('monthly_income', 'ssa_letter'),
      fact('bank_balance', 'bank_statement'),
    ]
    expect(missingDocsFromFacts(facts)).toEqual([])
  })

  it('keeps Medicare card capitalized in a missing document title', () => {
    const [t] = generateTasks('h1', [], h, ['medicare_card'])
    expect(t.title).toBe(`Find ${SAMPLE.household.care_recipient_alias}'s Medicare card`)
  })

  it('points Washington households to SHIBA', () => {
    const t = generateTasks('h1', matches, { ...h, state: 'WA' }, []).find((x) => x.kind === 'ship_review_submit')!
    expect(t.detail).toContain('SHIBA')
  })
})
