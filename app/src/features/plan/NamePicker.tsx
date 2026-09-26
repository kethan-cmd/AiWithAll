import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, UserPlus } from 'lucide-react'
import type { Household, Member } from '@/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MemberEntity } from '@/data/entities'
import { getIdentity, setIdentity } from '@/data/session'
import MemberAvatar from './MemberAvatar'

/** "Who are you?" for the family link: pick a name or join with a new one. */
export default function NamePicker({ household, members }: { household: Household; members: Member[] }) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Only family members can be picked here. The caregiver record is never
  // offered, so an invite link can never grant the caregiver role.
  const ordered = members.filter((m) => m.role === 'family')

  function pick(m: Member) {
    const current = getIdentity()
    if (
      current?.role === 'caregiver' &&
      !window.confirm(
        `This tab is signed in as ${current.alias}, the caregiver. Switch it to ${m.alias}? You can reopen your plan from the caregiver link later.`,
      )
    ) {
      return
    }
    setIdentity({ household_id: household.id, member_id: m.id, alias: m.alias, role: 'family' })
  }

  async function join(e: FormEvent) {
    e.preventDefault()
    const alias = name.trim().replace(/\s+/g, ' ')
    if (!alias) {
      setError('Add your first name so the family knows who claimed what.')
      return
    }
    const existing = members.find((m) => m.alias.toLowerCase() === alias.toLowerCase())
    if (existing?.role === 'family') {
      pick(existing)
      return
    }
    if (existing) {
      setError('That name is taken in this family. Add an initial, like "Grace P."')
      return
    }
    setSaving(true)
    try {
      const m = await MemberEntity.create({
        household_id: household.id,
        alias: alias.slice(0, 40),
        relation: relation.trim().slice(0, 60) || 'Family',
        role: 'family',
      })
      pick(m)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="eyebrow text-evergreen">{household.caregiver_alias} invited you</p>
      <h1 className="mt-3 text-[2.1rem] leading-[1.1] font-medium sm:text-5xl">Who's helping today?</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Pick your name so everyone can see who is doing what. You will only see tasks here, never documents.
      </p>

      {ordered.length > 0 ? (
        <ul className="mt-8 space-y-2.5" aria-label="Family members">
          {ordered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => pick(m)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-all hover:-translate-y-px hover:border-evergreen/40 hover:shadow-lift"
              >
                <MemberAvatar name={m.alias} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">I'm {m.alias}</span>
                  <span className="block truncate text-sm text-muted-foreground">{m.relation}</span>
                </span>
                <ArrowRight
                  className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-evergreen"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={join} className="mt-8 rounded-2xl border border-dashed border-border p-5" noValidate>
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
          <UserPlus className="size-4 text-evergreen" aria-hidden="true" />
          Someone else? Join the family
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="join-name">Your first name</Label>
            <Input
              id="join-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              autoComplete="given-name"
              className="h-11 text-base"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'join-error' : undefined}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="join-relation">
              How you're related <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="join-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Grandson, neighbor"
              className="h-11 text-base"
            />
          </div>
        </div>
        {error ? (
          <p id="join-error" role="alert" className="mt-3 text-sm font-medium text-warn">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="mt-5 h-11 w-full gap-2 text-base font-semibold sm:w-auto sm:px-6" disabled={saving}>
          Join and see tasks
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
