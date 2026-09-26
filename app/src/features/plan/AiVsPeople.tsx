import { Check, PenLine, Sparkles, UserRound } from 'lucide-react'

/** The line that explains the product: AI fills, a human signs. */
export default function AiVsPeople({ draftCount }: { draftCount: number }) {
  const ai = [
    'Read four facts from paperwork you already had',
    'Checked them against a dated rules table',
    `Filled in ${draftCount === 1 ? 'one application draft' : `${draftCount} application drafts`}, each field tagged with its source`,
    'Left Social Security and Medicare numbers blank on purpose',
    'Deleted the photos once you confirmed',
  ]
  const people = [
    'Sign as authorized representative',
    'Have a free SHIP counselor review and submit',
    'Find a GUIDE provider for respite',
    'Track down any missing paper',
  ]
  return (
    <section aria-labelledby="split-title" className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <p className="eyebrow text-evergreen">How the work is split</p>
      <h2 id="split-title" className="mt-3 text-2xl leading-tight font-medium">
        AI fills, <span className="marker">a human signs.</span>
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-6">
        <div>
          <h3 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal">
            <span className="grid size-7 place-items-center rounded-lg bg-gold-soft text-gold-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            What the AI did
          </h3>
          <ul className="mt-3 space-y-2.5">
            {ai.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-snug text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-good" strokeWidth={2.5} aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:border-l sm:border-border sm:pl-6">
          <h3 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal">
            <span className="grid size-7 place-items-center rounded-lg bg-evergreen-soft text-evergreen">
              <UserRound className="size-4" aria-hidden="true" />
            </span>
            What people do
          </h3>
          <ul className="mt-3 space-y-2.5">
            {people.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-snug text-muted-foreground">
                <PenLine className="mt-0.5 size-4 shrink-0 text-evergreen" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        The AI never signs and never submits. Every match is a likely match: a free counselor confirms it before anything is sent.
      </p>
    </section>
  )
}
