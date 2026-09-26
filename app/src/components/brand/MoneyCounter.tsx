import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatUSD } from '@/lib/money'

interface MoneyCounterProps {
  cents: number
  label?: string
  /** Shown after the number in a smaller size, e.g. "/yr". */
  suffix?: string
  /** Shown before the number at the suffix size, e.g. "about". */
  prefix?: string
  size?: 'md' | 'lg' | 'xl'
  className?: string
}

const DURATION_MS = 900

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const SIZES = {
  md: { num: 'text-3xl', suffix: 'text-base', label: 'text-sm' },
  lg: { num: 'text-5xl', suffix: 'text-lg', label: 'text-sm' },
  xl: { num: 'text-6xl sm:text-7xl', suffix: 'text-xl sm:text-2xl', label: 'text-base' },
} as const

/**
 * A dollar figure that counts up (or down) to its new value. The animated
 * digits are hidden from screen readers; a polite live region announces only
 * the final value, so assistive tech never hears every frame.
 */
export default function MoneyCounter({ cents, label, prefix, suffix, size = 'lg', className }: MoneyCounterProps) {
  const reduce = prefersReducedMotion()
  const [shown, setShown] = useState<number>(() => (reduce ? cents : 0))
  // Last painted value, so a new target animates from where the digits are.
  const lastRef = useRef(shown)

  useEffect(() => {
    if (reduce) {
      lastRef.current = cents
      return
    }
    const from = lastRef.current
    if (from === cents) return
    let raf = 0
    let start: number | null = null
    const step = (now: number) => {
      if (start === null) start = now
      const t = Math.min(1, (now - start) / DURATION_MS)
      const v = Math.round(from + (cents - from) * easeOutCubic(t))
      lastRef.current = v
      setShown(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [cents, reduce])

  const display = reduce ? cents : shown
  const s = SIZES[size]
  const finalText = `${prefix ? `${prefix} ` : ''}${formatUSD(cents, { whole: true })}${suffix ? ` ${suffix.replace(/^\//, 'per ').replace(/\byr\b/, 'year').replace(/\bmo\b/, 'month')}` : ''}${label ? `, ${label}` : ''}`

  return (
    <div className={cn('inline-flex flex-col', className)} data-slot="money-counter">
      <span aria-hidden="true" className="flex items-baseline gap-1 leading-none">
        {prefix ? <span className={cn('mr-1 font-medium text-muted-foreground', s.suffix)}>{prefix}</span> : null}
        <span className={cn('numeral font-semibold text-foreground', s.num)}>
          {formatUSD(display, { whole: true })}
        </span>
        {suffix ? <span className={cn('font-medium text-muted-foreground', s.suffix)}>{suffix}</span> : null}
      </span>
      {label ? (
        <span aria-hidden="true" className={cn('mt-2 text-muted-foreground', s.label)}>
          {label}
        </span>
      ) : null}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {finalText}
      </span>
    </div>
  )
}
