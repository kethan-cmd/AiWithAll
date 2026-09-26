import { useState, type CSSProperties } from 'react'
import type { DocKind, ReadHit } from '@/contracts'
import { DOC_LABELS } from '@/contracts'
import { cn } from '@/lib/utils'
import SampleDoc from './samples/SampleDoc'
import { SAMPLE_LAYOUT } from './samples/sampleLayout'
import { chipText } from './format'
import '@/styles/reading.css'

export type OverlayState = 'waiting' | 'reading' | 'done' | 'failed'

export interface ReadingOverlayProps {
  kind: DocKind
  /** The photo preview (object URL). Without one, the sample document is drawn. */
  photoUrl?: string | null
  state: OverlayState
  hits?: ReadHit[]
  size?: 'lg' | 'sm'
  className?: string
}

/**
 * The document, large, with the reading animation on top: a gold scan line
 * while reading, then a highlight box and label chip on each value found.
 */
export default function ReadingOverlay({ kind, photoUrl, state, hits = [], size = 'lg', className }: ReadingOverlayProps) {
  const layout = SAMPLE_LAYOUT[kind]
  const [photoRatio, setPhotoRatio] = useState<number | null>(null)
  const ratio = photoUrl ? (photoRatio ?? 3 / 4) : layout.width / layout.height
  const boxed = state === 'done' ? hits.filter((h) => h.box) : []

  return (
    <div
      className={cn('rd-stage', className)}
      data-state={state}
      data-size={size}
      style={{
        aspectRatio: String(ratio),
        // Large overlays fit the screen height too, so tall letters stay in view.
        width: size === 'lg' ? `min(100%, 46rem, calc(68vh * ${ratio}))` : '100%',
        marginInline: 'auto',
      }}
    >
      {size === 'lg'
        ? (['tl', 'tr', 'bl', 'br'] as const).map((c) => <span key={c} className="rd-corner" data-c={c} aria-hidden="true" />)
        : null}

      <div className="rd-doc h-full w-full">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Your photo of the ${DOC_LABELS[kind].toLowerCase()}`}
            className="block h-full w-full object-fill"
            onLoad={(e) => {
              const img = e.currentTarget
              if (img.naturalWidth && img.naturalHeight) setPhotoRatio(img.naturalWidth / img.naturalHeight)
            }}
          />
        ) : (
          <SampleDoc kind={kind} decorative={size === 'sm'} />
        )}
        {state === 'reading' ? <div className="rd-scan" aria-hidden="true" /> : null}
        <div className="rd-dim" aria-hidden="true" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden={size === 'sm' ? true : undefined}>
        {boxed.map((hit, i) => {
          const b = hit.box!
          const style = {
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            width: `${b.w * 100}%`,
            height: `${b.h * 100}%`,
            '--delay': `${i * 220}ms`,
          } as CSSProperties
          return (
            <div key={hit.key} className="rd-box" style={style}>
              <span
                className="rd-chip"
                data-side={b.y < 0.14 ? 'below' : 'above'}
                data-align={b.x + b.w / 2 > 0.55 ? 'end' : 'start'}
              >
                <span className="rd-chip-dot" aria-hidden="true" />
                {chipText(hit)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
