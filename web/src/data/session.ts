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

/** Change fields on this tab's user (for example the chosen circle or team). */
export async function updateCurrentUser(
  patch: Partial<Pick<User, 'alias' | 'circle_id' | 'team_id'>>,
): Promise<User | null> {
  const current = getCurrentUser()
  if (!current) return null
  const next = { ...current, ...patch }
  sessionStorage.setItem(KEY, JSON.stringify(next))
  // The shared record may have been wiped by Reset demo: ignore that case.
  try {
    await UserEntity.update(current.id, patch)
  } catch {
    /* record gone: the tab copy is still valid */
  }
  return next
}

export function clearCurrentUser() {
  sessionStorage.removeItem(KEY)
}
