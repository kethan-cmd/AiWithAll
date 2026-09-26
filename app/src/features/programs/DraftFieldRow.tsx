import { FileText, PencilLine } from 'lucide-react'
import type { DraftField } from '@/contracts'
import { cn } from '@/lib/utils'
import { sourceLabel } from './drafts'

/** One labeled box on the paper form: a pre-filled value with its source,
 *  or a dashed "fill by hand" box. */
export default function DraftFieldRow({ field, className }: { field: DraftField; className?: string }) {
  const labelId = `draft-field-${field.id}`
  const handwritten = field.fill_by_hand || field.value === null

  return (
    <div className={cn('group/field flex min-w-0 flex-col', className)} role="group" aria-labelledby={labelId}>
      <span id={labelId} className="text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {field.label}
      </span>
      {handwritten ? (
        <div className="draft-box-hand mt-1.5 flex min-h-11 items-center gap-2 rounded-md border-[1.5px] border-dashed border-foreground/25 px-3 py-2 text-sm text-muted-foreground">
          <PencilLine className="size-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">Fill by hand</span>
        </div>
      ) : (
        <div className="draft-box-filled mt-1.5 flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-gold/45 bg-gold-soft/70 px-3 py-2">
          <span className="min-w-0 text-[0.98rem] font-semibold text-foreground tabular-nums">{field.value}</span>
          {field.source ? (
            <span className="draft-source inline-flex items-center gap-1 rounded-full bg-card/85 px-2 py-0.5 text-[0.7rem] font-medium text-gold-foreground ring-1 ring-gold/35">
              <FileText className="size-3" aria-hidden="true" />
              from: {sourceLabel(field.source)}
            </span>
          ) : null}
        </div>
      )}
      {field.note ? <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{field.note}</p> : null}
    </div>
  )
}
