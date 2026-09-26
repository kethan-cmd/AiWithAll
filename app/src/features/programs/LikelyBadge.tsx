import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

/** "Likely match, confirm with a free counselor". Never says "eligible". */
export default function LikelyBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-good/25 bg-good-soft px-2.5 py-1 text-xs font-semibold text-good',
        className,
      )}
    >
      <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
      {compact ? (
        <>
          Likely match<span className="sr-only">, confirm with a free counselor</span>
        </>
      ) : (
        <span>
          Likely match<span className="font-medium">, confirm with a free counselor</span>
        </span>
      )}
    </span>
  )
}
