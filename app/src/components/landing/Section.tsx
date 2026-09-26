import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadProps {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  id?: string
  align?: 'left' | 'center'
  onDark?: boolean
  className?: string
}

/** Shared editorial heading block: eyebrow, display title, lede. */
export function SectionHead({ eyebrow, title, lede, id, align = 'left', onDark = false, className }: SectionHeadProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className={cn('eyebrow flex items-center gap-2', align === 'center' && 'justify-center', onDark ? 'text-gold' : 'text-evergreen')}>
        <span aria-hidden="true" className={cn('h-px w-6', onDark ? 'bg-gold/70' : 'bg-evergreen/60')} />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          'mt-4 text-[2rem] leading-[1.08] font-medium sm:text-[2.6rem]',
          onDark ? 'text-on-deep' : 'text-foreground',
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className={cn('mt-4 text-lg leading-relaxed', onDark ? 'text-on-deep-muted' : 'text-muted-foreground')}>{lede}</p>
      ) : null}
    </div>
  )
}
