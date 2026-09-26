import { Link } from 'react-router-dom'
import { citationNumber, getStat } from '@/content/stats'
import { cn } from '@/lib/utils'

/** Superscript citation that links to the stat on #/sources. */
export default function SourceRef({ id, className, onDark = false }: { id: string; className?: string; onDark?: boolean }) {
  const stat = getStat(id)
  const n = citationNumber(id)
  if (!stat) return null
  return (
    <sup className={cn('ml-0.5 align-super text-[0.62em] leading-none font-sans font-semibold', className)}>
      <Link
        to={{ pathname: '/sources', hash: `#${id}` }}
        aria-label={`Source ${n}: ${stat.source_name}, ${stat.year}`}
        title={`${stat.source_name} (${stat.year})`}
        className={cn(
          'rounded-sm px-0.5 underline decoration-dotted underline-offset-2 transition-colors',
          onDark ? 'text-gold hover:text-on-deep' : 'text-evergreen hover:text-foreground',
        )}
      >
        {n}
      </Link>
    </sup>
  )
}
