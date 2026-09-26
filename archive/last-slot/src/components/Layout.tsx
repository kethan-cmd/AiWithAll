import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { seedDemo } from '@/data/seed'
import { clearCurrentUser, getCurrentUser } from '@/data/session'
import type { Role } from '@/data/models'

const ROLE_HOME: Record<Role, string> = {
  caregiver: '/caregiver',
  family: '/family',
  student: '/student',
  chaperone: '/chaperone',
}

const ROLE_LABEL: Record<Role, string> = {
  caregiver: 'Caregiver',
  family: 'Family',
  student: 'Student',
  chaperone: 'Chaperone',
}

export function ResetDemoButton() {
  const [busy, setBusy] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await seedDemo()
        setBusy(false)
      }}
    >
      {busy ? 'Resetting...' : 'Reset demo'}
    </Button>
  )
}

export function Layout() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-primary">
            Last Slot
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-base font-medium">
            {user && (
              <NavItem to={ROLE_HOME[user.role]}>{ROLE_LABEL[user.role]} home</NavItem>
            )}
            {user?.role === 'caregiver' && user.circle_id && (
              <NavItem to={`/grid/${user.circle_id}`}>Rest Grid</NavItem>
            )}
            <NavItem to="/board">Day of Service board</NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user && <Badge variant="secondary">{ROLE_LABEL[user.role]}: {user.alias}</Badge>}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCurrentUser()
                  navigate('/')
                }}
              >
                Switch role
              </Button>
            )}
            <ResetDemoButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 hover:bg-muted ${isActive ? 'bg-muted text-primary' : ''}`
      }
    >
      {children}
    </NavLink>
  )
}
