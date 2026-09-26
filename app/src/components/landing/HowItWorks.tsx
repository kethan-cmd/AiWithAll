import { ArrowRight, Camera, FilePen, ScanText, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './Section'

interface Step {
  n: string
  icon: LucideIcon
  title: string
  body: string
  foot: string
}

const STEPS: Step[] = [
  {
    n: '01',
    icon: Camera,
    title: 'Snap',
    body: "Take photos of four things you probably already have in a drawer: the Medicare card, a Social Security letter, a bank statement and last year's tax return.",
    foot: 'About two minutes',
  },
  {
    n: '02',
    icon: ScanText,
    title: 'Read on your device',
    body: 'Your phone reads just four facts: birth date, Medicare coverage, monthly income and bank balance. You check each one. The photos are cleared right after.',
    foot: 'Nothing is uploaded',
  },
  {
    n: '03',
    icon: FilePen,
    title: 'Fill the forms',
    body: 'A fixed, dated rules table flags likely programs. We pre-fill the Medicare Savings Program and Extra Help applications, each field tagged with the document it came from.',
    foot: 'Ready to check and sign',
  },
  {
    n: '04',
    icon: Users,
    title: 'Share the work',
    body: 'What only a person can do becomes a task: sign, book a free counselor to review and submit, find a GUIDE respite provider. Family members claim them.',
    foot: 'No one does it alone',
  },
]

const FLOW = [
  { k: 'You give', v: 'Photos of the paperwork you already have' },
  { k: 'The AI', v: 'Reads the facts, matches likely programs, fills in the applications' },
  { k: 'You get', v: "Drafts to check and sign, plus a list of what's still missing" },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="how-title"
            eyebrow="How it works"
            title="From a kitchen-table pile to applications, ready to sign."
          />
          <p className="max-w-sm text-muted-foreground lg:pb-2">
            Four steps. The AI handles the reading and the typing. People handle the judgment, the signatures and the
            phone calls.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-evergreen-soft text-evergreen transition-colors group-hover:bg-evergreen group-hover:text-primary-foreground">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="numeral text-3xl text-foreground/15" aria-hidden="true">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-medium">
                <span className="sr-only">Step {Number(s.n)}: </span>
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted-foreground">{s.body}</p>
              <p className="mt-5 border-t border-border pt-4 text-xs font-semibold tracking-wide text-evergreen uppercase">
                {s.foot}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-gold/40 bg-gold-soft/60 p-6 sm:p-8">
          <p className="eyebrow text-gold-foreground">What the AI does, in one sentence</p>
          <ol className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1.3fr_auto_1fr] md:items-stretch">
            {FLOW.map((f, i) => (
              <li key={f.k} className="contents">
                <div className="rounded-xl bg-card/80 p-4 shadow-card">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{f.k}</p>
                  <p className="mt-1.5 font-heading text-lg leading-snug">{f.v}</p>
                </div>
                {i < FLOW.length - 1 ? (
                  <span aria-hidden="true" className="grid place-items-center text-gold-foreground">
                    <ArrowRight className="size-5 rotate-90 md:rotate-0" />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
