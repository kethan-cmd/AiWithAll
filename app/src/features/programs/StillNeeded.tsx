import { useId } from 'react'
import { ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Checklist of what a person still has to find, write or do. */
export default function StillNeeded({
  items,
  title = 'Still needed',
  className,
}: {
  items: string[]
  title?: string
  className?: string
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={cn('rounded-2xl border border-warn/25 bg-warn-soft/60 p-5', className)}>
      <h2 id={id} className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-foreground">
        <ClipboardList className="size-4 text-warn" aria-hidden="true" />
        {title}
        <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-snug text-foreground/90">
            <span aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 rounded-[4px] border-[1.5px] border-warn/60 bg-card" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
