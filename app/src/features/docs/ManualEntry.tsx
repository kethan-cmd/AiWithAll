import { useId, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import type { FactKey, FactValue, MedicarePart } from '@/contracts'
import { FACT_LABELS } from '@/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseUSD } from '@/lib/money'
import { cn } from '@/lib/utils'
import { FACT_HINTS } from './copy'
import { PART_NAMES } from './format'

export interface ManualEntryProps {
  factKey: FactKey
  /** Value to start from (when editing what we read). */
  initial?: FactValue | null
  onSave: (value: FactValue) => void
  onCancel?: () => void
  autoFocus?: boolean
  saveLabel?: string
  className?: string
}

const PARTS: MedicarePart[] = ['A', 'B', 'D']

function initialText(v: FactValue | null | undefined): string {
  if (!v) return ''
  if (v.key === 'birth_date') return v.iso
  if (v.key === 'monthly_income' || v.key === 'bank_balance') return (v.cents / 100).toFixed(2)
  return ''
}

const today = () => new Date().toISOString().slice(0, 10)

/** Type one fact by hand. Used for missing facts and for "Edit". */
export default function ManualEntry({
  factKey,
  initial,
  onSave,
  onCancel,
  autoFocus,
  saveLabel = 'Save',
  className,
}: ManualEntryProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  const [text, setText] = useState(() => initialText(initial))
  const [parts, setParts] = useState<MedicarePart[]>(() =>
    initial?.key === 'medicare_parts' ? initial.parts : [],
  )
  const [error, setError] = useState<string | null>(null)
  const label = FACT_LABELS[factKey]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (factKey === 'medicare_parts') {
      if (!parts.length) return setError('Check at least one part. Most people have Part A and Part B.')
      return onSave({ key: 'medicare_parts', parts: PARTS.filter((p) => parts.includes(p)) })
    }
    if (factKey === 'birth_date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return setError('Enter the full date of birth.')
      const year = Number(text.slice(0, 4))
      if (year < 1900 || text > today()) return setError('That date does not look right. Check the year.')
      return onSave({ key: 'birth_date', iso: text })
    }
    const cents = parseUSD(text)
    if (cents === null || cents < 0) return setError('Enter an amount in dollars, like 1,542.00.')
    if (factKey === 'monthly_income' && cents > 5_000_000) {
      return setError('That is more than $50,000 a month. Enter the monthly amount, not the yearly one.')
    }
    onSave({ key: factKey, cents })
  }

  const describedBy = error ? `${hintId} ${errId}` : hintId

  return (
    <form onSubmit={submit} className={cn('space-y-3', className)} noValidate aria-label={`Type the ${label.toLowerCase()}`}>
      {factKey === 'medicare_parts' ? (
        <fieldset aria-describedby={describedBy} className="space-y-2">
          <legend className="text-sm font-semibold">{label}</legend>
          <div className="flex flex-wrap gap-2">
            {PARTS.map((p, i) => {
              const on = parts.includes(p)
              return (
                <label
                  key={p}
                  className={cn(
                    'relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors select-none',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                    on ? 'border-primary bg-evergreen-soft text-foreground' : 'border-input bg-card hover:bg-muted',
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    autoFocus={autoFocus && i === 0}
                    onChange={() => {
                      setError(null)
                      setParts((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-5 place-items-center rounded-md border',
                      on ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                    )}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                  Part {p} <span className="text-muted-foreground">({PART_NAMES[p]})</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-input`} className="text-sm font-semibold">
            {label}
            {factKey === 'monthly_income' ? <span className="font-normal text-muted-foreground"> (per month)</span> : null}
          </label>
          <div className="relative max-w-xs">
            {factKey !== 'birth_date' ? (
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base text-muted-foreground" aria-hidden="true">
                $
              </span>
            ) : null}
            <Input
              id={`${id}-input`}
              type={factKey === 'birth_date' ? 'date' : 'text'}
              inputMode={factKey === 'birth_date' ? undefined : 'decimal'}
              autoComplete="off"
              min={factKey === 'birth_date' ? '1900-01-01' : undefined}
              max={factKey === 'birth_date' ? today() : undefined}
              placeholder={factKey === 'birth_date' ? undefined : factKey === 'monthly_income' ? '1,542.00' : '3,200.00'}
              value={text}
              autoFocus={autoFocus}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onChange={(e) => {
                setError(null)
                setText(e.currentTarget.value)
              }}
              className={cn('h-12 rounded-xl text-base tabular-nums md:text-base', factKey !== 'birth_date' && 'pl-7')}
            />
          </div>
        </div>
      )}

      <p id={hintId} className="text-sm text-muted-foreground">
        {FACT_HINTS[factKey]}
      </p>
      {error ? (
        <p id={errId} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-11 rounded-xl px-5 text-sm font-semibold">
          <Check aria-hidden="true" />
          {saveLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" className="h-11 rounded-xl px-4 text-sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
