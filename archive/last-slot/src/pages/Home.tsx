import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { setCurrentUser } from '@/data/session'
import type { Role } from '@/data/models'

const ROLES: { role: Role; title: string; blurb: string; to: string }[] = [
  {
    role: 'caregiver',
    title: 'I am a caregiver',
    blurb: 'Describe your week. We split it into small tasks and protect one real rest window.',
    to: '/caregiver',
  },
  {
    role: 'family',
    title: 'I am family',
    blurb: 'Take the tasks only family should do, and the ones that free up rest.',
    to: '/family',
  },
  {
    role: 'student',
    title: 'I am a student volunteer',
    blurb: 'Claim small, safe, low-contact tasks. Last Slot tasks come first.',
    to: '/student',
  },
  {
    role: 'chaperone',
    title: 'I am a chaperone',
    blurb: 'Confirm that claimed tasks were done.',
    to: '/chaperone',
  },
]

const DEFAULT_ALIAS: Record<Role, () => string> = {
  caregiver: () => 'Caregiver',
  family: () => 'Family member',
  student: () => `Student ${String(Math.floor(Math.random() * 90) + 10)}`,
  chaperone: () => 'Chaperone',
}

export default function Home() {
  const navigate = useNavigate()

  async function choose(role: Role, to: string) {
    await setCurrentUser({ alias: DEFAULT_ALIAS[role](), role })
    navigate(to)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          One real rest window, not scattered minutes.
        </h1>
        <p className="max-w-3xl text-xl text-muted-foreground">
          Last Slot splits a caregiver&apos;s week into small tasks, lets family and student
          volunteers claim them, and shows the one task still standing between the caregiver
          and a few hours of rest.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {ROLES.map((r) => (
          <Card key={r.role} className="transition hover:border-primary hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 pt-6">
              <h2 className="text-2xl font-bold">{r.title}</h2>
              <p className="flex-1 text-lg text-muted-foreground">{r.blurb}</p>
              <Button size="lg" className="w-full text-lg" onClick={() => choose(r.role, r.to)}>
                Continue as {r.role}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Button variant="outline" size="lg" className="text-lg" onClick={() => navigate('/board')}>
          Open the Day of Service board
        </Button>
      </section>
    </div>
  )
}
