import { cn } from '@/lib/utils'

// A few calm tints that read well in light and dark themes.
const TINTS = [
  'bg-evergreen-soft text-evergreen ring-evergreen/25',
  'bg-gold-soft text-gold-foreground ring-gold/40',
  'bg-good-soft text-good ring-good/25',
  'bg-warn-soft text-warn ring-warn/25',
] as const

function tintFor(name: string): string {
  let n = 0
  for (const ch of name) n = (n * 31 + ch.charCodeAt(0)) >>> 0
  return TINTS[n % TINTS.length]
}

/** Round initial for a family member. Decorative unless a label is passed. */
export default function MemberAvatar({
  name,
  size = 'md',
  label,
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-heading font-semibold ring-1 select-none',
        size === 'sm' && 'size-6 text-xs',
        size === 'md' && 'size-8 text-sm',
        size === 'lg' && 'size-11 text-lg',
        tintFor(name),
        className,
      )}
    >
      {initial}
    </span>
  )
}
