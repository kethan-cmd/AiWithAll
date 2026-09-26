// Tasks: the things only a person can do. Pure generation (easy to test)
// plus one idempotent helper that writes only the tasks that are missing.

import type { DocKind, Fact, Household, ProgramId, ProgramMatch, Task, TaskKind } from '@/contracts'
import { DOC_LABELS } from '@/contracts'
import { serial } from '@/data/actions'
import { TaskEntity } from '@/data/entities'
import type { NewRecord } from '@/data/entities'
import { formatUSD } from '@/lib/money'
import { VALUES } from '@/rules/rules2026'

/** Short, friendly program names for task titles. */
export const PROGRAM_SHORT: Record<ProgramId, string> = {
  msp: 'Medicare Savings Program',
  extra_help: 'Extra Help',
  guide: 'GUIDE',
}

/** The documents that back each fact on an application, in the order a
 *  counselor would ask for them. A tax return is optional, so it is never
 *  flagged as missing. */
const PROOF_DOCS: { doc: DocKind; facts: Fact['key'][]; why: string }[] = [
  { doc: 'medicare_card', facts: ['medicare_parts'], why: 'the application asks for a copy of the Medicare card' },
  { doc: 'ssa_letter', facts: ['monthly_income'], why: 'it is the usual proof of monthly income' },
  { doc: 'bank_statement', facts: ['bank_balance'], why: 'a counselor may ask to see the latest balance' },
]

/**
 * Which proof documents are missing, judged from the stored facts: a fact the
 * caregiver typed by hand (or never confirmed) means the paper behind it still
 * has to be found. Uses facts, not per-tab photo slots, so every tab agrees.
 */
export function missingDocsFromFacts(facts: Fact[]): DocKind[] {
  const confirmed = facts.filter((f) => f.confirmed)
  return PROOF_DOCS.filter(({ doc, facts: keys }) =>
    keys.some((k) => {
      const f = confirmed.find((c) => c.key === k)
      return !f || f.source !== doc
    }),
  ).map((p) => p.doc)
}

/** How to reach a SHIP counselor. Washington's SHIP is called SHIBA. */
function shipHowTo(state: string): string {
  if (state?.toUpperCase() === 'WA') {
    return 'In Washington the SHIP is called SHIBA: call 1-800-562-6900 (check insurance.wa.gov/shiba) or search shiphelp.org.'
  }
  return 'Search shiphelp.org for the State Health Insurance Assistance Program near you, or call 1-800-MEDICARE (1-800-633-4227) and ask for it.'
}

/** Task kinds this module generates. Custom tasks are never pruned. */
const GENERATED_KINDS: TaskKind[] = ['sign', 'ship_review_submit', 'find_guide', 'missing_doc']

/** A stable identity for a task, so reruns never duplicate it. */
export function taskKey(t: Pick<Task, 'kind' | 'program' | 'title'>): string {
  // missing_doc tasks share kind and program, so their title tells them apart.
  return t.kind === 'missing_doc' || t.kind === 'custom'
    ? `${t.kind}:${t.program ?? '-'}:${t.title}`
    : `${t.kind}:${t.program ?? '-'}`
}

function base(householdId: string, kind: TaskKind, program: ProgramId | null, title: string, detail: string): NewRecord<Task> {
  return { household_id: householdId, kind, program, title, detail, status: 'open', claimed_by: null, done_at: null }
}

/**
 * Turn likely program matches into the human tasks the AI cannot do.
 * Pure: same input, same output. Order is the order a family works through it.
 */
export function generateTasks(
  householdId: string,
  matches: ProgramMatch[],
  h: Household,
  missingDocs: string[],
): NewRecord<Task>[] {
  const out: NewRecord<Task>[] = []
  const drafts = matches.filter((m) => m.likely && m.kind === 'draft')
  const recipient = h.care_recipient_alias

  for (const m of drafts) {
    const name = PROGRAM_SHORT[m.program] ?? m.name
    out.push(
      base(
        householdId,
        'sign',
        m.program,
        `Sign the ${name} application as authorized representative`,
        `The draft is filled in from ${recipient}'s paperwork. Read it, write the Social Security and Medicare numbers by hand, then sign. The AI never signs for you.`,
      ),
    )
  }

  if (drafts.length > 0) {
    const names = drafts.map((m) => PROGRAM_SHORT[m.program] ?? m.name).join(' and ')
    out.push(
      base(
        householdId,
        'ship_review_submit',
        null,
        'Book a free SHIP counselor to review and submit',
        `SHIP counselors are free, unbiased Medicare helpers. Ask them to check the ${names} ${drafts.length > 1 ? 'applications' : 'application'} and send ${drafts.length > 1 ? 'them' : 'it'} in. ${shipHowTo(h.state)}`,
      ),
    )
  }

  const guide = matches.find((m) => m.program === 'guide' && m.likely && m.kind === 'task')
  if (guide) {
    const cap = formatUSD(VALUES.guide_respite_annual_max.value, { whole: true })
    out.push(
      base(
        householdId,
        'find_guide',
        'guide',
        `Find a GUIDE provider near ${recipient}`,
        `GUIDE is a Medicare dementia care program with respite of up to ${cap}/yr, so the main caregiver gets a break. There is no form to file: you join through a participating provider. Search the CMS list and call one to ask about an intake visit.`,
      ),
    )
  }

  for (const d of missingDocs) {
    const label = (DOC_LABELS as Record<string, string>)[d] ?? d
    const why = PROOF_DOCS.find((p) => p.doc === d)?.why
    out.push(
      base(
        householdId,
        'missing_doc',
        null,
        `Find ${recipient}'s ${label === DOC_LABELS.medicare_card ? label : label.toLowerCase()}`,
        why
          ? `This fact was typed in by hand, so the paper behind it still needs finding: ${why}. Snap a photo or bring it to the counselor visit.`
          : 'Snap a photo or bring the paper to the counselor visit.',
      ),
    )
  }

  return out
}

/**
 * Create only the tasks that do not exist yet for this household (matched by
 * kind and program, plus title for document tasks). Tasks that are no longer
 * needed (a fact changed) are removed only while still open and unclaimed, so
 * claims and done marks always survive a rerun. Returns the tasks created.
 */
export async function ensureTasks(
  householdId: string,
  matches: ProgramMatch[],
  h: Household,
  missingDocs: string[],
): Promise<Task[]> {
  const existing = await TaskEntity.list((t) => t.household_id === householdId)
  const wanted = generateTasks(householdId, matches, h, missingDocs)
  const wantedKeys = new Set(wanted.map(taskKey))
  for (const t of existing) {
    const stale = GENERATED_KINDS.includes(t.kind) && !wantedKeys.has(taskKey(t))
    if (stale && t.status === 'open' && !t.claimed_by) await TaskEntity.delete(t.id)
  }
  const have = new Set(existing.map(taskKey))
  const created: Task[] = []
  for (const t of wanted) {
    const k = taskKey(t)
    if (have.has(k)) continue
    have.add(k)
    created.push(await TaskEntity.create(t))
  }
  return created
}

// Only one ensureTasks run per household at a time (React strict mode and
// several subscribers can ask at once).
const inflight = new Map<string, Promise<Task[]>>()

/** ensureTasks, but concurrent calls for one household share a single run. */
export function ensureTasksOnce(
  householdId: string,
  matches: ProgramMatch[],
  h: Household,
  missingDocs: string[],
): Promise<Task[]> {
  const running = inflight.get(householdId)
  if (running) return running
  const p = serial(() => ensureTasks(householdId, matches, h, missingDocs)).finally(() => inflight.delete(householdId))
  inflight.set(householdId, p)
  return p
}
