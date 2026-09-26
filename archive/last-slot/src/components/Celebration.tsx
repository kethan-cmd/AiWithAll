import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

const COLORS = ['#f5b301', '#0f766e', '#d97706', '#7c3aed', '#16a34a', '#e11d48']

/** Full-screen "your window unlocked" moment with CSS confetti. */
export function Celebration({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: string
  onClose: () => void
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 13) % 20) / 10,
        duration: 2.4 + ((i * 7) % 15) / 10,
        color: COLORS[i % COLORS.length],
        size: 8 + (i % 4) * 3,
      })),
    [],
  )

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none fixed top-0 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
      <div
        className="animate-pop-in relative max-w-xl rounded-3xl border-4 border-gold bg-card p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-5xl font-extrabold text-good sm:text-6xl">{title}</p>
        {subtitle && <p className="mt-3 text-xl text-muted-foreground">{subtitle}</p>}
        <Button size="lg" className="mt-6 text-lg" onClick={onClose}>
          See the grid
        </Button>
      </div>
    </div>
  )
}
