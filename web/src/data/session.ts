// The "current user" record. sessionStorage is per tab, so different tabs can
// be different roles at the same time (caregiver / family / student demo).

import { UserEntity } from './entities'
import type { Role, User } from './models'

const KEY = 'lastslot:currentUser'

export function getCurrentUser(): User | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export async function setCurrentUser(input: {
  alias: string
  role: Role
  circle_id?: string | null
  team_id?: string | null
}): Promise<User> {
  const user = await UserEntity.create({
    alias: input.alias,
    role: input.role,
    circle_id: input.circle_id ?? null,
    team_id: input.team_id ?? null,
  })
  sessionStorage.setItem(KEY, JSON.stringify(user))
  return user
}

export function clearCurrentUser() {
  sessionStorage.removeItem(KEY)
}
