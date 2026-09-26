import { CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

/** "2026-09-26" (or a full ISO timestamp) to "Sep 26, 2026", read as a
 *  calendar date so the day never shifts with the time zone. */
function formatRulesDate(asOf: string): string {
  const m = asOf.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return asOf
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Small chip that dates the eligibility rules on screen. */
export default function RulesDateStamp({ asOf, className }: { asOf: string; className?: string }) {
  const nice = formatRulesDate(asOf)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <CalendarCheck className="size-3.5 text-evergreen" aria-hidden="true" />
      <span>
        Rules checked <time dateTime={asOf.slice(0, 10)}>{nice}</time>
      </span>
    </span>
  )
}
