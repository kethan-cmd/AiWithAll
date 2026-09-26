import type { RestWindow, Task } from '@/data/models'
import { describeWindow, type WindowStatus } from '@/logic/grid'

interface Props {
  status: WindowStatus
  window: RestWindow
  blockerCount: number
  last: Task | null
  /** Family/student screens use their own wording for the same state. */
  audience?: 'caregiver' | 'helper'
}

export function WindowStatusBanner({ status, window: w, blockerCount, last, audience = 'caregiver' }: Props) {
  const when = describeWindow(w)

  if (status === 'unlocked') {
    return (
      <div className="animate-pop-in rounded-2xl border-2 border-good bg-good-soft p-6 text-good">
        <p className="text-3xl font-extrabold sm:text-4xl">
          {audience === 'caregiver' ? `${when} is yours` : `${when} is unlocked`}
        </p>
        <p className="mt-1 text-lg">
          {audience === 'caregiver'
            ? 'Every task in that window is covered. Rest.'
            : 'Every task in that window is covered. Nice work.'}
        </p>
      </div>
    )
  }

  if (status === 'last_slot') {
    return (
      <div className="rounded-2xl border-2 border-gold bg-gold/25 p-6 text-gold-foreground">
        <span className="rounded bg-gold-foreground px-2 py-0.5 text-sm font-extrabold tracking-wide text-gold">
          LAST SLOT
        </span>
        <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
          One task from rest: {when}
        </p>
        {last && <p className="mt-1 text-lg">Still needed: {last.title}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-busy/40 bg-busy-soft p-6 text-busy">
      <p className="text-3xl font-extrabold sm:text-4xl">
        {blockerCount} tasks stand between {audience === 'caregiver' ? 'you' : 'this caregiver'} and {when}
      </p>
    </div>
  )
}
