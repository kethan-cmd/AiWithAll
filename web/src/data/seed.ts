// Demo data: aliased circles only (no real names, no health details).
// Sunflower is pre-staged with exactly one blocker left, so the demo climax
// (a student claims the Last Slot, the window unlocks) works on the first click.

import { CareCircleEntity, TaskEntity, TeamEntity, UserEntity } from './entities'
import type { Category, ContactLevel, Day, RestWindow, Task } from './models'
import { toHHMM, toMinutes } from '@/logic/grid'

export const TEAM_IDS = {
  falcons: 'team-falcons',
  herons: 'team-herons',
  owls: 'team-owls',
} as const

export const CIRCLE_IDS = {
  sunflower: 'circle-sunflower',
  lantern: 'circle-lantern',
  cedar: 'circle-cedar',
  harbor: 'circle-harbor',
} as const

/** The circle that is one task from unlocking. */
export const HERO_CIRCLE_ID = CIRCLE_IDS.sunflower

type Claim =
  | { by: string; role: 'family' }
  | { by: string; role: 'student'; team: string }

interface SeedTask {
  circle: string
  title: string
  category: Category
  contact: ContactLevel
  day: Day
  start: string
  duration: number
  status?: 'open' | 'claimed' | 'verified'
  claim?: Claim
}

const W = {
  sunflower: { day: 'Sat', start: '13:00', end: '16:00' } as RestWindow,
  lantern: { day: 'Sun', start: '10:00', end: '13:00' } as RestWindow,
  cedar: { day: 'Fri', start: '14:00', end: '17:00' } as RestWindow,
  harbor: { day: 'Sat', start: '09:00', end: '12:00' } as RestWindow,
}

const SEED_TASKS: SeedTask[] = [
  // Sunflower: Sat 1-4pm. Groceries is the Last Slot.
  { circle: CIRCLE_IDS.sunflower, title: "Pick up Dad's prescription refill", category: 'errand', contact: 'low', day: 'Sat', start: '13:00', duration: 60, status: 'claimed', claim: { by: 'Sunflower sibling', role: 'family' } },
  { circle: CIRCLE_IDS.sunflower, title: 'Buy groceries for the week', category: 'errand', contact: 'low', day: 'Sat', start: '14:00', duration: 60 },
  { circle: CIRCLE_IDS.sunflower, title: "Call insurance about last month's bill", category: 'call', contact: 'none', day: 'Sat', start: '15:00', duration: 30, status: 'claimed', claim: { by: 'Sunflower cousin', role: 'family' } },
  { circle: CIRCLE_IDS.sunflower, title: 'Cook a batch of freezer dinners', category: 'meal', contact: 'low', day: 'Sat', start: '15:30', duration: 30, status: 'claimed', claim: { by: 'Sunflower sibling', role: 'family' } },
  { circle: CIRCLE_IDS.sunflower, title: 'Help Dad take his morning pills', category: 'family_only', contact: 'high', day: 'Mon', start: '08:00', duration: 30 },
  { circle: CIRCLE_IDS.sunflower, title: 'Help Dad with his bath', category: 'family_only', contact: 'high', day: 'Tue', start: '09:00', duration: 45 },
  { circle: CIRCLE_IDS.sunflower, title: 'Fill out the home health forms', category: 'paperwork', contact: 'none', day: 'Wed', start: '10:00', duration: 45 },
  { circle: CIRCLE_IDS.sunflower, title: 'Mow the front lawn', category: 'chore', contact: 'low', day: 'Thu', start: '16:00', duration: 60, status: 'claimed', claim: { by: 'Student 14', role: 'student', team: TEAM_IDS.owls } },
  { circle: CIRCLE_IDS.sunflower, title: "Call Dad's doctor to book a check-up", category: 'call', contact: 'none', day: 'Fri', start: '11:00', duration: 30 },

  // Lantern: Sun 10am-1pm. Three blockers.
  { circle: CIRCLE_IDS.lantern, title: 'Refill pharmacy order', category: 'errand', contact: 'low', day: 'Sun', start: '10:00', duration: 60 },
  { circle: CIRCLE_IDS.lantern, title: 'Call the transport service to book rides', category: 'call', contact: 'none', day: 'Sun', start: '11:00', duration: 30 },
  { circle: CIRCLE_IDS.lantern, title: 'Cook and portion three dinners', category: 'meal', contact: 'low', day: 'Sun', start: '11:30', duration: 60 },
  { circle: CIRCLE_IDS.lantern, title: 'Sort this month’s medical bills', category: 'paperwork', contact: 'none', day: 'Tue', start: '18:00', duration: 45, status: 'claimed', claim: { by: 'Student 07', role: 'student', team: TEAM_IDS.herons } },
  { circle: CIRCLE_IDS.lantern, title: 'Help with the evening bath', category: 'family_only', contact: 'high', day: 'Wed', start: '19:00', duration: 45 },

  // Cedar: Fri 2-5pm. Already unlocked.
  { circle: CIRCLE_IDS.cedar, title: 'Grocery run', category: 'errand', contact: 'low', day: 'Fri', start: '14:00', duration: 60, status: 'verified', claim: { by: 'Student 21', role: 'student', team: TEAM_IDS.falcons } },
  { circle: CIRCLE_IDS.cedar, title: 'Call about the utility bill', category: 'call', contact: 'none', day: 'Fri', start: '15:00', duration: 30, status: 'claimed', claim: { by: 'Cedar niece', role: 'family' } },
  { circle: CIRCLE_IDS.cedar, title: 'Fill out the benefits renewal form', category: 'paperwork', contact: 'none', day: 'Fri', start: '15:30', duration: 60, status: 'verified', claim: { by: 'Student 03', role: 'student', team: TEAM_IDS.falcons } },
  { circle: CIRCLE_IDS.cedar, title: 'Rake the back yard', category: 'chore', contact: 'low', day: 'Sun', start: '11:00', duration: 60, status: 'claimed', claim: { by: 'Student 09', role: 'student', team: TEAM_IDS.owls } },

  // Harbor: Sat 9am-12pm. Two blockers.
  { circle: CIRCLE_IDS.harbor, title: 'Pick up a prescription', category: 'errand', contact: 'low', day: 'Sat', start: '09:00', duration: 60 },
  { circle: CIRCLE_IDS.harbor, title: 'Call the clinic to reschedule', category: 'call', contact: 'none', day: 'Sat', start: '10:00', duration: 30, status: 'claimed', claim: { by: 'Harbor brother', role: 'family' } },
  { circle: CIRCLE_IDS.harbor, title: 'Cook a batch of soup', category: 'meal', contact: 'low', day: 'Sat', start: '10:30', duration: 60 },
  { circle: CIRCLE_IDS.harbor, title: 'Help with lifting and transfers', category: 'family_only', contact: 'high', day: 'Mon', start: '07:30', duration: 30 },
]

export async function seedDemo(): Promise<void> {
  await Promise.all([
    CareCircleEntity.clear(),
    TaskEntity.clear(),
    TeamEntity.clear(),
    UserEntity.clear(),
  ])

  const teams: [string, string, string][] = [
    [TEAM_IDS.falcons, 'Falcons', '#d97706'],
    [TEAM_IDS.herons, 'Herons', '#0f766e'],
    [TEAM_IDS.owls, 'Owls', '#7c3aed'],
  ]
  for (const [id, name, color] of teams) {
    await TeamEntity.create({ id, name, color })
  }

  const circles: [string, string, RestWindow][] = [
    [CIRCLE_IDS.sunflower, 'Sunflower', W.sunflower],
    [CIRCLE_IDS.lantern, 'Lantern', W.lantern],
    [CIRCLE_IDS.cedar, 'Cedar', W.cedar],
    [CIRCLE_IDS.harbor, 'Harbor', W.harbor],
  ]
  for (const [id, alias, rest_window] of circles) {
    await CareCircleEntity.create({ id, alias, rest_window, backlog: '' })
  }

  for (const s of SEED_TASKS) {
    const status = s.status ?? 'open'
    const task: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      circle_id: s.circle,
      title: s.title,
      duration: s.duration,
      category: s.category,
      contact_level: s.contact,
      volunteer_eligible: s.category !== 'family_only',
      day: s.day,
      start: s.start,
      end: toHHMM(toMinutes(s.start) + s.duration),
      blocks_window: false,
      status,
      claimed_by: s.claim?.by ?? null,
      claimed_role: s.claim?.role ?? null,
      team_id: s.claim?.role === 'student' ? s.claim.team : null,
    }
    const circle = circles.find((c) => c[0] === s.circle)![2]
    task.blocks_window =
      task.day === circle.day &&
      toMinutes(task.start) < toMinutes(circle.end) &&
      toMinutes(task.end) > toMinutes(circle.start)
    await TaskEntity.create(task)
  }
}

/** Seed on first load only. */
export async function ensureSeeded(): Promise<void> {
  const existing = await CareCircleEntity.list()
  if (existing.length === 0) await seedDemo()
}
