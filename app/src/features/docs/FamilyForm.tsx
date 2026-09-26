import { useId, useState, type FormEvent } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { Household } from '@/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HouseholdEntity, MemberEntity } from '@/data/entities'
import { setIdentity } from '@/data/session'
import { cn } from '@/lib/utils'
import { makeInviteCode } from './helpers'


const field = 'h-12 rounded-xl text-base md:text-base'

/** "About your family": creates the household and the caregiver, and makes
 *  this tab the caregiver's. */
export default function FamilyForm({ onCreated }: { onCreated: (h: Household) => void }) {
  const id = useId()
  const [parent, setParent] = useState('')
  const [me, setMe] = useState('')
  const [dx, setDx] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<Partial<Record<'parent' | 'me' | 'dx' | 'form', string>>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!parent.trim()) next.parent = 'Add a first name or what you call them, like "Mom".'
    if (!me.trim()) next.me = 'Add your first name, so your family knows who is who.'
    if (dx === null) next.dx = 'Choose yes or no.'
    setErrors(next)
    if (Object.keys(next).length) {
      const first = next.parent ? 'parent' : next.me ? 'me' : 'dx-yes'
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    setSaving(true)
    try {
      const household = await HouseholdEntity.create({
        care_recipient_alias: parent.trim(),
        caregiver_alias: me.trim(),
        state: 'WA',
        dementia_dx: dx === true,
        household_size: 1,
        invite_code: makeInviteCode(),
        is_sample: false,
      })
      const member = await MemberEntity.create({
        household_id: household.id,
        alias: me.trim(),
        relation: 'Main caregiver',
        role: 'caregiver',
      })
      setIdentity({ household_id: household.id, member_id: member.id, alias: member.alias, role: 'caregiver' })
      onCreated(household)
    } catch {
      setErrors({ form: 'We could not save that on this device. Check that the browser allows saving data, then try again.' })
      setSaving(false)
    }
  }

  const err = (k: keyof typeof errors) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="text-sm font-medium text-destructive">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-parent`} className="text-sm font-semibold">
            Who are you helping?
          </label>
          <Input
            id={`${id}-parent`}
            value={parent}
            onChange={(e) => setParent(e.currentTarget.value)}
            placeholder="Mom, or her first name"
            autoComplete="off"
            aria-invalid={errors.parent ? true : undefined}
            aria-describedby={errors.parent ? `${id}-parent-err` : undefined}
            className={field}
          />
          {err('parent')}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-me`} className="text-sm font-semibold">
            Your first name
          </label>
          <Input
            id={`${id}-me`}
            value={me}
            onChange={(e) => setMe(e.currentTarget.value)}
            placeholder="Grace"
            autoComplete="given-name"
            aria-invalid={errors.me ? true : undefined}
            aria-describedby={errors.me ? `${id}-me-err` : undefined}
            className={field}
          />
          {err('me')}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-state`} className="text-sm font-semibold">
            State
          </label>
          <select
            id={`${id}-state`}
            value="WA"
            onChange={() => {}}
            aria-describedby={`${id}-state-note`}
            className="h-12 w-full rounded-xl border border-input bg-card px-3 text-base dark:bg-input/30"
          >
            <option value="WA">Washington</option>
          </select>
          <p id={`${id}-state-note`} className="text-sm text-muted-foreground">
            More states soon. Rules differ by state.
          </p>
        </div>
        <fieldset
          className="space-y-1.5"
          aria-describedby={errors.dx ? `${id}-dx-err` : undefined}
          aria-invalid={errors.dx ? true : undefined}
        >
          <legend className="text-sm font-semibold">Do they have a dementia diagnosis?</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {([
              ['yes', true, 'Yes'],
              ['no', false, 'No, or not yet'],
            ] as const).map(([k, v, text]) => (
              <label
                key={k}
                className={cn(
                  'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors select-none',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                  dx === v ? 'border-primary bg-evergreen-soft' : 'border-input bg-card hover:bg-muted',
                )}
              >
                <input
                  id={`${id}-dx-${k}`}
                  type="radio"
                  name={`${id}-dx`}
                  className="sr-only"
                  checked={dx === v}
                  onChange={() => setDx(v)}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-4 place-items-center rounded-full border',
                    dx === v ? 'border-primary' : 'border-input',
                  )}
                >
                  {dx === v ? <span className="size-2 rounded-full bg-primary" /> : null}
                </span>
                {text}
              </label>
            ))}
          </div>
          {err('dx')}
          <p className="text-sm text-muted-foreground">A diagnosis can open up paid respite care through Medicare.</p>
        </fieldset>
      </div>

      {errors.form ? (
        <p role="alert" className="rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving} className="h-12 rounded-xl px-6 text-base font-semibold">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Save and add documents
          {!saving ? <ArrowRight aria-hidden="true" /> : null}
        </Button>
        <p className="text-sm text-muted-foreground">First names only. No addresses, no ID numbers.</p>
      </div>
    </form>
  )
}
