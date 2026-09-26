import { useId, useState, type CSSProperties } from 'react'
import { Camera, Check, CircleSlash, ImageUp, RotateCcw, Sparkles, X } from 'lucide-react'
import type { DocKind, DocumentSlot } from '@/contracts'
import { DOC_LABELS, FACT_LABELS } from '@/contracts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DOC_COPY } from './copy'
import { tileState, type TileState } from './helpers'
import SampleDoc from './samples/SampleDoc'
import UploadButton from './UploadButton'
import { useCoarsePointer } from './useCoarsePointer'


const STATUS: Record<TileState, { label: string; className: string }> = {
  needed: { label: 'Needed', className: 'bg-card/95 text-muted-foreground ring-1 ring-border' },
  sample: { label: 'Sample ready', className: 'bg-good text-paper' },
  photo: { label: 'Photo ready', className: 'bg-good text-paper' },
  read: { label: 'Read', className: 'bg-good text-paper' },
  skipped: { label: "Skipped, you'll type it", className: 'bg-card/95 text-muted-foreground ring-1 ring-border' },
}

export interface DocTileProps {
  kind: DocKind
  slot: DocumentSlot
  onFile: (file: File) => void
  onUseSample: () => void
  onSkip: () => void
  onClear: () => void
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/** One document: why we need it, a thumbnail, and add / sample / skip. */
export default function DocTile({ kind, slot, onFile, onUseSample, onSkip, onClear, disabled, className, style }: DocTileProps) {
  const copy = DOC_COPY[kind]
  const state = tileState(slot)
  const ready = state === 'sample' || state === 'photo' || state === 'read'
  const coarse = useCoarsePointer()
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  const whyId = useId()
  const errId = useId()
  const Icon = copy.icon
  const status = STATUS[state]
  const label = DOC_LABELS[kind]

  const pick = (file: File) => {
    setError(null)
    onFile(file)
  }

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={whyId}
      style={style}
      className={cn(
        'group/tile relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-[border-color,box-shadow] duration-300',
        ready ? 'border-good/55 ring-1 ring-good/25' : 'border-border',
        state === 'skipped' && 'bg-card/70',
        className,
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          'relative grid aspect-[16/11] place-items-center overflow-hidden border-b',
          ready ? 'bg-good-soft/60' : 'bg-muted/70',
        )}
      >
        {state === 'photo' && slot.preview_url ? (
          <img src={slot.preview_url} alt={`Your photo of the ${label.toLowerCase()}`} className="h-full w-full object-cover" />
        ) : state === 'sample' || (state === 'read' && slot.mode === 'sample') ? (
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -rotate-2 overflow-hidden shadow-lift transition-[rotate,translate] duration-500 ease-out group-hover/tile:rotate-0 motion-reduce:transition-none',
              kind === 'medicare_card' ? 'top-1/2 w-[76%] -translate-y-1/2 rounded-xl' : 'top-[12%] w-[64%] rounded-md group-hover/tile:-translate-y-1',
            )}
          >
            <SampleDoc kind={kind} decorative />
          </div>
        ) : state === 'read' && slot.preview_url ? (
          <img src={slot.preview_url} alt={`Your photo of the ${label.toLowerCase()}`} className="h-full w-full object-cover" />
        ) : (
          <div
            className={cn(
              'flex flex-col items-center gap-2 text-center',
              state === 'skipped' ? 'text-muted-foreground/70' : 'text-muted-foreground',
            )}
          >
            <span className="grid size-14 place-items-center rounded-2xl border-2 border-dashed border-current/35 bg-card/60">
              {state === 'skipped' ? (
                <CircleSlash className="size-6" aria-hidden="true" />
              ) : (
                <Icon className="size-6" aria-hidden="true" />
              )}
            </span>
            <span className="text-xs font-medium">{state === 'skipped' ? 'Skipped' : 'No photo yet'}</span>
          </div>
        )}

        <span
          className={cn(
            'absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-card',
            status.className,
          )}
        >
          {ready ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3 id={titleId} className="text-xl leading-tight font-semibold">
            {label}
          </h3>
          <p id={whyId} className="text-sm font-medium text-foreground/85">
            {copy.why}
            <span className="sr-only">. Status: {status.label}.</span>
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{copy.where}</p>
        </div>

        {state === 'skipped' ? (
          <p className="rounded-xl bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
            You will type the {FACT_LABELS[copy.fact].toLowerCase()} on the next screen.
          </p>
        ) : null}

        {error ? (
          <p id={errId} role="alert" className="rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
            {error}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {state === 'needed' ? (
            <>
              <UploadButton onFile={pick} onError={setError} disabled={disabled} aria-label={`Upload a photo of the ${label.toLowerCase()}`}>
                <ImageUp aria-hidden="true" />
                Upload photo
              </UploadButton>
              {coarse ? (
                <UploadButton
                  onFile={pick}
                  onError={setError}
                  capture
                  variant="outline"
                  disabled={disabled}
                  aria-label={`Take a photo of the ${label.toLowerCase()}`}
                >
                  <Camera aria-hidden="true" />
                  Camera
                </UploadButton>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="h-11 rounded-xl px-4 text-sm font-semibold"
                onClick={onUseSample}
                aria-label={`Use the sample ${label.toLowerCase()}`}
              >
                <Sparkles aria-hidden="true" />
                Use sample
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                className="h-11 rounded-xl px-3 text-sm text-muted-foreground"
                onClick={onSkip}
                aria-label={`Skip the ${label.toLowerCase()} and type the fact instead`}
              >
                Skip
              </Button>
            </>
          ) : state === 'skipped' ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-11 rounded-xl px-4 text-sm font-semibold"
              onClick={onClear}
              aria-label={`Undo skip for the ${label.toLowerCase()}`}
            >
              <RotateCcw aria-hidden="true" />
              Undo skip
            </Button>
          ) : (
            <>
              <UploadButton
                onFile={pick}
                onError={setError}
                variant="outline"
                disabled={disabled}
                aria-label={
                  state === 'photo' ? `Replace the photo of the ${label.toLowerCase()}` : `Use my own photo of the ${label.toLowerCase()}`
                }
              >
                <ImageUp aria-hidden="true" />
                {state === 'photo' ? 'Replace photo' : 'Use my own photo'}
              </UploadButton>
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                className="h-11 rounded-xl px-3 text-sm text-muted-foreground"
                onClick={onClear}
                aria-label={`Remove the ${label.toLowerCase()}`}
              >
                <X aria-hidden="true" />
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
