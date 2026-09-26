import { Link, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Snap your paperwork', short: 'Snap', to: '/start' },
  { n: 2, label: 'Check what we found', short: 'Check', to: '/read' },
  { n: 3, label: 'Share the work', short: 'Share', to: '/plan' },
] as const

/** Which step a route belongs to. 0 means "not in the app flow". */
function stepForPath(pathname: string): 0 | 1 | 2 | 3 {
  if (pathname.startsWith('/start')) return 1
  if (pathname.startsWith('/read') || pathname.startsWith('/matches') || pathname.startsWith('/draft')) return 2
  if (pathname.startsWith('/plan') || pathname.startsWith('/family')) return 3
  return 0
}

/** Three-step progress indicator for the app flow. Reads the current step
 *  from the route, so it needs no props. */
export default function StepNav({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const current = stepForPath(pathname)

  return (
    <nav aria-label="Progress" data-print-hide className={cn('w-full max-w-2xl', className)}>
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const done = current > s.n
          const active = current === s.n
          return (
            <li key={s.n} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <Link
                to={s.to}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex min-w-0 shrink-0 items-center gap-2 rounded-full py-1 pr-2 text-sm transition-colors sm:shrink',
                  active ? 'text-foreground' : done ? 'text-foreground/80 hover:text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors',
                    active && 'border-primary bg-primary text-primary-foreground shadow-card',
                    done && 'border-good bg-good-soft text-good',
                    !active && !done && 'border-border bg-card text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : s.n}
                </span>
                <span className={cn('truncate', active ? 'font-semibold' : 'font-medium')}>
                  <span className="sr-only">
                    Step {s.n} of 3{done ? ', done' : active ? ', current' : ''}:{' '}
                  </span>
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </Link>
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn('h-px min-w-3 flex-1 rounded-full', done ? 'bg-good/60' : 'bg-border')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
