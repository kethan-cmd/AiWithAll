import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** The "$" coin on its own. Decorative: the wordmark text carries the name. */
export function Coin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
      focusable="false"
    >
      <circle cx="16" cy="16" r="15" className="fill-gold" />
      <circle
        cx="16"
        cy="16"
        r="11.75"
        fill="none"
        className="stroke-evergreen-deep"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <text
        x="16"
        y="21.6"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="16"
        fontWeight="700"
        fill="oklch(0.26 0.05 165)"
      >
        $
      </text>
    </svg>
  )
}

interface WordmarkProps {
  className?: string
  /** Render as a plain element instead of a home link. */
  asText?: boolean
  /** Light text for dark bands (footer). */
  onDark?: boolean
}

/** Coin plus "Money on the Table" set in Fraunces. Links home by default. */
export default function Wordmark({ className, asText = false, onDark = false }: WordmarkProps) {
  const body = (
    <>
      <Coin className="transition-transform duration-500 group-hover/wm:rotate-[18deg]" />
      <span
        className={cn(
          'font-heading text-[1.12rem] leading-none font-semibold whitespace-nowrap tracking-[-0.02em]',
          onDark ? 'text-on-deep' : 'text-foreground',
        )}
      >
        Money <span className={cn('font-normal italic', onDark ? 'text-on-deep-muted' : 'text-muted-foreground')}>on the</span> Table
      </span>
    </>
  )
  if (asText) {
    return <span className={cn('group/wm inline-flex items-center gap-2.5', className)}>{body}</span>
  }
  return (
    <Link
      to="/"
      aria-label="Money on the Table, home"
      className={cn('group/wm inline-flex items-center gap-2.5 rounded-md', className)}
    >
      {body}
    </Link>
  )
}
