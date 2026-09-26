// AI task split. Turns a caregiver's free-text backlog into small, specific
// 30-60 minute tasks arranged around one rest window.
//
// Right now this is a mock (keyword rules + one hardcoded demo response).
// The safety rules are applied to ANY output, mock or real.

import type { Category, ContactLevel, Day, RestWindow } from '@/data/models'
import { DAYS } from '@/data/models'
import { toHHMM, toMinutes } from './grid'

/** One task as returned by the split. Matches SPLIT_TASKS_JSON_SCHEMA. */
export interface SplitTask {
  title: string
  duration: number // minutes, 30-60
  category: Category
  contact_level: ContactLevel
  volunteer_eligible: boolean
  day: Day
  start: string // "HH:MM"
  end: string // "HH:MM"
  blocks_window: boolean
}

/** JSON schema the real model call should be constrained to. */
export const SPLIT_TASKS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tasks'],
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'title',
          'duration',
          'category',
          'contact_level',
          'volunteer_eligible',
          'day',
          'start',
          'end',
          'blocks_window',
        ],
        properties: {
          title: { type: 'string' },
          duration: { type: 'integer', minimum: 30, maximum: 60 },
          category: {
            enum: ['errand', 'call', 'meal', 'paperwork', 'chore', 'family_only'],
          },
          contact_level: { enum: ['none', 'low', 'high'] },
          volunteer_eligible: { type: 'boolean' },
          day: { enum: [...DAYS] },
          start: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
          end: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
          blocks_window: { type: 'boolean' },
        },
      },
    },
  },
} as const

// Hands-on care or entering the home: family only, always.
const FAMILY_ONLY_PATTERN =
  /\b(bath\w*|shower\w*|toilet\w*|bathroom|commode|diaper\w*|incontinen\w*|medicat\w*|medicine|meds|pills?|dose|dosage|insulin|inject\w*|lift\w*|transfer\w*|reposition\w*|enter\w*|inside the home|in[- ]home|home visit|visit the house|sit(?:ting)? with|stay(?:ing)? with|overnight)\b/i

/** Safety rule: applied to every task, whatever produced it. */
export function applySafetyRules(task: SplitTask): SplitTask {
  if (FAMILY_ONLY_PATTERN.test(task.title) || task.category === 'family_only') {
    return {
      ...task,
      category: 'family_only',
      contact_level: 'high',
      volunteer_eligible: false,
    }
  }
  return task
}

/** Clamp a raw task into the schema: duration 30-60, end = start + duration. */
function normalize(task: SplitTask): SplitTask {
  const duration = Math.min(60, Math.max(30, Math.round(task.duration / 15) * 15))
  const end = toHHMM(toMinutes(task.start) + duration)
  return { ...task, duration, end }
}

function overlapsWindow(day: Day, start: string, end: string, w: RestWindow) {
  return (
    day === w.day &&
    toMinutes(start) < toMinutes(w.end) &&
    toMinutes(end) > toMinutes(w.start)
  )
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

export const DEMO_REST_WINDOW: RestWindow = {
  day: 'Sat',
  start: '13:00',
  end: '16:00',
}

export const DEMO_BACKLOG = `Pick up Dad's prescription refill at the pharmacy.
Buy groceries for the week.
Call the insurance company about last month's bill.
Cook a batch of dinners for the freezer.
Help Dad take his morning pills.
Help Dad with his bath.
Fill out the home health forms.
Mow the front lawn.
Call Dad's doctor to book a check-up.`

function demoTask(
  title: string,
  category: Category,
  contact: ContactLevel,
  day: Day,
  start: string,
  duration: number,
  window: RestWindow,
): SplitTask {
  const end = toHHMM(toMinutes(start) + duration)
  return applySafetyRules({
    title,
    duration,
    category,
    contact_level: contact,
    volunteer_eligible: category !== 'family_only',
    day,
    start,
    end,
    blocks_window: overlapsWindow(day, start, end, window),
  })
}

/** Hardcoded response for the seeded example so the demo never varies. */
export function demoResponse(window: RestWindow): SplitTask[] {
  return [
    demoTask("Pick up Dad's prescription refill", 'errand', 'low', 'Sat', '13:00', 60, window),
    demoTask('Buy groceries for the week', 'errand', 'low', 'Sat', '14:00', 60, window),
    demoTask("Call insurance about last month's bill", 'call', 'none', 'Sat', '15:00', 30, window),
    demoTask('Cook a batch of freezer dinners', 'meal', 'low', 'Sat', '15:30', 30, window),
    demoTask('Help Dad take his morning pills', 'family_only', 'high', 'Mon', '08:00', 30, window),
    demoTask('Help Dad with his bath', 'family_only', 'high', 'Tue', '09:00', 45, window),
    demoTask('Fill out the home health forms', 'paperwork', 'none', 'Wed', '10:00', 45, window),
    demoTask('Mow the front lawn', 'chore', 'low', 'Thu', '16:00', 60, window),
    demoTask("Call Dad's doctor to book a check-up", 'call', 'none', 'Fri', '11:00', 30, window),
  ]
}

// ---------------------------------------------------------------------------
// Mock split (keyword rules)
// ---------------------------------------------------------------------------

const RULES: {
  pattern: RegExp
  category: Category
  contact: ContactLevel
  duration: number
}[] = [
  { pattern: /\b(pharmac\w*|prescription|refill|groceries|grocery|shop\w*|errand|pick ?up|drop ?off|mail|post office)\b/i, category: 'errand', contact: 'low', duration: 60 },
  { pattern: /\b(call|phone|ring|schedule|book|appointment|insurance|on hold)\b/i, category: 'call', contact: 'none', duration: 30 },
  { pattern: /\b(cook\w*|meals?|dinners?|lunch\w*|breakfast|bake|meal[- ]prep)\b/i, category: 'meal', contact: 'low', duration: 60 },
  { pattern: /\b(bills?|forms?|paperwork|claims?|taxes|application|budget|invoice)\b/i, category: 'paperwork', contact: 'none', duration: 45 },
  { pattern: /\b(lawn|mow\w*|yard|garden\w*|laundry|clean\w*|vacuum\w*|dishes|trash|sweep\w*)\b/i, category: 'chore', contact: 'low', duration: 45 },
]

function splitBacklog(text: string): string[] {
  return text
    .split(/[\n;]+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^[\s\-*\d.)]+/, '').replace(/[.!?]+$/, '').trim())
    .filter((s) => s.length > 2)
}

function classify(item: string): {
  category: Category
  contact: ContactLevel
  duration: number
} {
  if (FAMILY_ONLY_PATTERN.test(item)) {
    return { category: 'family_only', contact: 'high', duration: 30 }
  }
  const rule = RULES.find((r) => r.pattern.test(item))
  return rule
    ? { category: rule.category, contact: rule.contact, duration: rule.duration }
    : { category: 'chore', contact: 'low', duration: 45 }
}

function sentenceCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function mockSplit(backlog: string, window: RestWindow): SplitTask[] {
  const items = splitBacklog(backlog)
  const windowEnd = toMinutes(window.end)
  const otherDays = DAYS.filter((d) => d !== window.day)

  // About half the items land inside the rest window (they are what stops the
  // caregiver resting). The rest spread across the week.
  const inWindowCount = Math.ceil(items.length / 2)
  let cursor = toMinutes(window.start)
  const perDayCursor: Record<string, number> = {}

  return items.map((item, i) => {
    const c = classify(item)
    let day: Day = window.day
    let start: number
    if (i < inWindowCount && cursor + c.duration <= windowEnd + 60) {
      start = cursor
      cursor += c.duration
    } else {
      day = otherDays[i % otherDays.length]
      start = perDayCursor[day] ?? 9 * 60
      perDayCursor[day] = start + c.duration
    }
    const end = toHHMM(start + c.duration)
    return {
      title: sentenceCase(item),
      duration: c.duration,
      category: c.category,
      contact_level: c.contact,
      volunteer_eligible: c.category !== 'family_only',
      day,
      start: toHHMM(start),
      end,
      blocks_window: overlapsWindow(day, toHHMM(start), end, window),
    }
  })
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

function isDemoBacklog(text: string) {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  return norm(text) === norm(DEMO_BACKLOG)
}

export async function splitTasks(
  backlogText: string,
  restWindow: RestWindow,
): Promise<SplitTask[]> {
  let raw: SplitTask[]

  if (isDemoBacklog(backlogText)) {
    raw = demoResponse(restWindow)
  } else {
    // >>> REAL AI CALL GOES HERE <<<
    // Send `backlogText` and `restWindow` to the model with
    // SPLIT_TASKS_JSON_SCHEMA as the required output format, then set
    // `raw = response.tasks`. No API keys in this prototype: until this is
    // wired up, the keyword-rule mock below stands in for the model.
    raw = mockSplit(backlogText, restWindow)
  }

  // Safety rules run on every result, whatever produced it.
  return raw.map((task) => applySafetyRules(normalize(task)))
}
