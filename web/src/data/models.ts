// Data models. Aliases only: no real names, no health details.

export type Role = 'caregiver' | 'family' | 'student' | 'chaperone'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type Day = (typeof DAYS)[number]

export type Category =
  | 'errand'
  | 'call'
  | 'meal'
  | 'paperwork'
  | 'chore'
  | 'family_only'

export type ContactLevel = 'none' | 'low' | 'high'

// draft = proposed by AI, not yet approved/posted by the caregiver
export type TaskStatus = 'draft' | 'open' | 'claimed' | 'done' | 'verified'

export interface BaseRecord {
  id: string
  created_at: string
  updated_at: string
}

export interface RestWindow {
  day: Day
  start: string // "HH:MM" 24h
  end: string // "HH:MM" 24h
}

export interface CareCircle extends BaseRecord {
  alias: string
  rest_window: RestWindow
  backlog: string
}

export interface Task extends BaseRecord {
  circle_id: string
  title: string
  duration: number // minutes, 30-60
  category: Category
  contact_level: ContactLevel
  volunteer_eligible: boolean
  day: Day
  start: string // "HH:MM"
  end: string // "HH:MM"
  blocks_window: boolean
  status: TaskStatus
  claimed_by: string | null // alias of the claimer
  claimed_role: 'family' | 'student' | null
  team_id: string | null
}

export interface Team extends BaseRecord {
  name: string
  color: string // hex, used on the leaderboard
}

export interface User extends BaseRecord {
  alias: string
  role: Role
  circle_id: string | null // caregiver / family: which circle they belong to
  team_id: string | null // student: which team
}
