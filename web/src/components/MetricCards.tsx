import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function fmtHours(h: number): string {
  return Number.isInteger(h) ? String(h) : h.toFixed(1)
}

interface Props {
  freeHours: number
  windowHours: number
  hoursReturned: number
  unlocked: boolean
}

/** The two headline metrics. */
export function MetricCards({ freeHours, windowHours, hoursReturned, unlocked }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className={unlocked ? 'border-good ring-2 ring-good/40' : ''}>
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Consecutive free hours
          </p>
          <p className="text-5xl font-extrabold tabular-nums">
            {fmtHours(freeHours)}
            <span className="ml-2 text-xl font-semibold text-muted-foreground">
              of {fmtHours(windowHours)} hrs in a row
            </span>
          </p>
          <Progress
            value={windowHours === 0 ? 0 : (freeHours / windowHours) * 100}
            aria-label="Consecutive free hours in the rest window"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Hours returned this week
          </p>
          <p className="text-5xl font-extrabold tabular-nums">
            {fmtHours(hoursReturned)}
            <span className="ml-2 text-xl font-semibold text-muted-foreground">hrs</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Every task someone has taken, anywhere in the week.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
