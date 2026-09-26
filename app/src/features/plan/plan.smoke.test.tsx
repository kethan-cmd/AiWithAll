// Smoke test: the Plan and Family pages render the sample family end to end,
// and a claim made "in another tab" shows up live with a notice.
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ConfirmedFacts, Fact, Household, ProgramMatch } from '@/contracts'
import { TaskEntity } from '@/data/entities'
import { loadSampleFamilyWithFacts } from '@/data/seed'
import { claimTask } from '@/data/actions'
import { setIdentity } from '@/data/session'
import Plan from '@/pages/Plan'
import Family from '@/pages/Family'

vi.mock('@/rules/engine', () => {
  const m = (program: ProgramMatch['program'], name: string, cents: number, kind: ProgramMatch['kind']): ProgramMatch => ({
    program,
    name,
    likely: true,
    tier: program === 'msp' ? 'SLMB' : undefined,
    reasons: [],
    est_annual_cents: cents,
    estimate_note: 'estimate',
    kind,
    rules_as_of: '2026-09-26',
    source_url: 'https://example.org',
  })
  return {
    factsToConfirmed: (facts: Fact[]): ConfirmedFacts | null =>
      facts.length >= 4 ? { birth_date: '1945-03-14', medicare_parts: ['A', 'B'], monthly_income_cents: 1, bank_balance_cents: 1 } : null,
    matchPrograms: (_f: ConfirmedFacts, _h: Household) => [
      m('msp', 'Medicare Savings Program', 243480, 'draft'),
      m('extra_help', 'Extra Help', 570000, 'draft'),
      m('guide', 'GUIDE', 0, 'task'),
    ],
    totalEstimate: (ms: ProgramMatch[]) => ms.reduce((s, x) => s + x.est_annual_cents, 0),
  }
})

// jsdom lacks matchMedia; MoneyCounter reads it.
window.matchMedia ??= ((q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} })) as never
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const flush = async (ms = 30) => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms))
  })
}

let root: Root
let el: HTMLDivElement
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  el = document.createElement('div')
  document.body.appendChild(el)
  root = createRoot(el)
})
afterEach(() => {
  act(() => root.unmount())
  el.remove()
})

function mount(path: string) {
  act(() =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/plan" element={<Plan />} />
          <Route path="/family" element={<Family />} />
        </Routes>
      </MemoryRouter>,
    ),
  )
}

describe('Plan page', () => {
  it('shows an empty state without an identity', async () => {
    mount('/plan')
    await flush()
    expect(el.textContent).toContain('Your plan will live here')
  })

  it('builds tasks for the sample family and shows live claims', async () => {
    await loadSampleFamilyWithFacts()
    mount('/plan')
    await flush(80)
    expect(el.textContent).toContain("Here's the plan, Grace.")
    const tasks = await TaskEntity.list()
    expect(tasks.map((t) => t.kind).sort()).toEqual(['find_guide', 'ship_review_submit', 'sign', 'sign'])
    expect(el.textContent).toContain('Book a free SHIP counselor to review and submit')
    expect(el.textContent).toContain('From likely to approved')

    const ship = tasks.find((t) => t.kind === 'ship_review_submit')!
    await act(async () => {
      await claimTask(ship.id, 'Daniel')
    })
    await flush(50)
    expect(el.textContent).toContain('Daniel claimed:')
    expect(el.textContent).toContain('Daniel is on it')
  })
})

describe('Family page', () => {
  it('asks who you are, then shows tasks and never fact values', async () => {
    await loadSampleFamilyWithFacts()
    setIdentity(null)
    mount('/family?h=PARK-4821')
    await flush(50)
    expect(el.textContent).toContain("Who's helping today?")
    const daniel = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes("I'm Daniel"))!
    await act(async () => daniel.click())
    await flush(50)
    expect(el.textContent).toContain('Help Grace claim the benefits')
    expect(el.textContent).toContain("You'll never see documents here")
    // Fact values from the sample must never show up.
    expect(el.textContent).not.toContain('1,542')
    expect(el.textContent).not.toContain('3,200')
    expect(el.textContent).not.toContain('1945')
  })
})
