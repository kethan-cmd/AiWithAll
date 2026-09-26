import { DAYS } from '@/data/models'
import type { RestWindow, Task } from '@/data/models'
import {
  formatTime,
  isCovered,
  isPosted,
  lastSlotTask,
  toHHMM,
  toMinutes,
  windowStatus,
} from '@/logic/grid'

const ROW_PX = 26 // height of one 30-minute cell

interface Props {
  tasks: Task[]
  window: RestWindow
}

/** Week grid: 7 day columns, 30-minute cells. The rest window is outlined and
 *  the one task still blocking it wears a gold LAST SLOT badge. */
export function RestGrid({ tasks, window: w }: Props) {
  const posted = tasks.filter(isPosted)
  const startHour = Math.min(7, ...posted.map((t) => Math.floor(toMinutes(t.start) / 60)))
  const endHour = Math.max(21, ...posted.map((t) => Math.ceil(toMinutes(t.end) / 60)))
  const rows = (endHour - startHour) * 2
  const gridStart = startHour * 60
  const status = windowStatus(tasks, w)
  const last = lastSlotTask(tasks, w)

  const yOf = (minutes: number) => ((minutes - gridStart) / 30) * ROW_PX

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-[680px]">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b bg-muted text-sm font-semibold">
          <div />
          {DAYS.map((d) => (
            <div
              key={d}
              className={`px-2 py-2 text-center ${d === w.day ? 'text-primary' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          {/* hour labels */}
          <div className="relative" style={{ height: rows * ROW_PX }}>
            {Array.from({ length: endHour - startHour }, (_, i) => (
              <div
                key={i}
                className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
                style={{ top: i * 2 * ROW_PX }}
              >
                {i === 0 ? '' : formatTime(toHHMM((startHour + i) * 60))}
              </div>
            ))}
          </div>

          {DAYS.map((day) => (
            <div
              key={day}
              className="relative border-l"
              style={{
                height: rows * ROW_PX,
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0, transparent ' +
                  (ROW_PX * 2 - 1) +
                  'px, var(--border) ' +
                  (ROW_PX * 2 - 1) +
                  'px, var(--border) ' +
                  ROW_PX * 2 +
                  'px)',
              }}
            >
              {/* rest window outline */}
              {day === w.day && (
                <div
                  aria-label="Rest window"
                  className={`absolute inset-x-0 z-10 rounded-md border-[3px] border-dashed ${
                    status === 'unlocked'
                      ? 'border-good bg-good-soft/70'
                      : 'border-primary bg-primary/5'
                  }`}
                  style={{
                    top: yOf(toMinutes(w.start)),
                    height: yOf(toMinutes(w.end)) - yOf(toMinutes(w.start)),
                  }}
                >
                  <span className="absolute -top-0.5 left-1 rounded-b bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                    {status === 'unlocked' ? 'YOURS' : 'REST'}
                  </span>
                </div>
              )}

              {/* tasks */}
              {posted
                .filter((t) => t.day === day)
                .map((t) => {
                  const covered = isCovered(t)
                  const isLast = last?.id === t.id
                  return (
                    <div
                      key={t.id}
                      title={`${t.title} (${formatTime(t.start)}-${formatTime(t.end)})${
                        t.claimed_by ? ` claimed by ${t.claimed_by}` : ''
                      }`}
                      className={`absolute inset-x-1 z-20 overflow-hidden rounded-md border px-1.5 py-0.5 text-[11px] leading-tight ${
                        covered
                          ? 'border-good/40 bg-good-soft text-good'
                          : isLast
                            ? 'animate-glow border-gold bg-gold text-gold-foreground'
                            : 'border-busy/40 bg-busy-soft text-busy'
                      }`}
                      style={{
                        top: yOf(toMinutes(t.start)) + 1,
                        height: (t.duration / 30) * ROW_PX - 2,
                      }}
                    >
                      {isLast && (
                        <span className="mb-0.5 block w-fit rounded bg-gold-foreground px-1 text-[10px] font-extrabold tracking-wide text-gold">
                          LAST SLOT
                        </span>
                      )}
                      <span className="font-semibold">{t.title}</span>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-t bg-muted px-4 py-2 text-sm">
        <Legend className="bg-busy-soft border-busy/40" label="Needs someone" />
        <Legend className="bg-gold border-gold" label="Last slot" />
        <Legend className="bg-good-soft border-good/40" label="Covered" />
        <Legend className="border-primary border-dashed border-2" label="Rest window" />
      </div>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded border ${className}`} />
      {label}
    </span>
  )
}
