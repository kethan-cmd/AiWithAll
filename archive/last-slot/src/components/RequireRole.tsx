import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '@/data/session'
import type { Role } from '@/data/models'

/** Sends people without a role (or with the wrong one) back to the Home screen. */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const user = getCurrentUser()
  if (!user || user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}
