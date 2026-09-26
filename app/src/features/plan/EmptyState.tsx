import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Friendly "nothing here yet" panel with one clear next step. */
export default function EmptyState({
  title,
  body,
  primary = { to: '/start?sample=1', label: 'Try it with the sample family' },
  secondary,
  icon,
}: {
  title: string
  body: ReactNode
  primary?: { to: string; label: string }
  secondary?: { to: string; label: string }
  icon?: ReactNode
}) {
  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-card sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-64 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-evergreen-soft text-evergreen">
          {icon ?? <Sparkles className="size-6" aria-hidden="true" />}
        </span>
        <h1 className="mt-6 text-3xl leading-tight font-medium sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={primary.to} className={cn(buttonVariants({ size: 'lg' }), 'h-12 gap-2 px-6 text-base font-semibold')}>
            {primary.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          {secondary ? (
            <Link to={secondary.to} className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'h-12 px-5 text-base')}>
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
