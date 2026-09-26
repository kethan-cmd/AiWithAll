import { Check } from 'lucide-react'
import { Coin } from '@/components/brand/Wordmark'
import SourceRef from './SourceRef'
import { SectionHead } from './Section'

const ROWS = [
  {
    label: 'Starts from',
    them: 'A questionnaire you answer from memory',
    us: 'The paperwork you already have',
  },
  {
    label: 'Covers',
    them: '2,000+ programs, nationwide',
    us: 'Medicare Savings Program, Extra Help and GUIDE respite, in one state for now',
  },
  {
    label: 'Ends with',
    them: 'A report with Apply Online links and blank forms',
    us: 'Pre-filled drafts, every field tagged with its source, ready to sign',
  },
  {
    label: 'The rest of the work',
    them: 'Up to you',
    us: 'Shared across your family, one claimed task at a time',
  },
  {
    label: 'Cost',
    them: 'Free',
    us: 'Free',
  },
]

/** An honest side-by-side with NCOA BenefitsCheckUp. */
export default function VsScreener() {
  return (
    <section aria-labelledby="vs-title" className="border-y border-border bg-card/50 py-20 sm:py-28">
      <div className="container-page">
        <SectionHead
          id="vs-title"
          eyebrow="Where we fit"
          title={
            <>
              NCOA tells you what you might get.{' '}
              <span className="italic text-evergreen">
                We take the paperwork you already have and hand you the applications, ready to sign.
              </span>
            </>
          }
          lede={
            <>
              NCOA BenefitsCheckUp is free, excellent and covers more than 2,000 programs<SourceRef id="benefitscheckup" />.
              Yet $58 billion a year still goes unclaimed<SourceRef id="benefits-gap" />. Finding programs is not the
              bottleneck. The forms are.
            </>
          }
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="hidden border-b border-border md:grid md:grid-cols-[13rem_1fr_1fr]" aria-hidden="true">
            <div />
            <div className="p-4 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Benefits screener</p>
              <p className="mt-1 font-heading text-lg">NCOA BenefitsCheckUp</p>
            </div>
            <div className="border-l border-evergreen/25 bg-evergreen-soft/70 p-4 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-evergreen uppercase">Paperwork helper</p>
              <p className="mt-1 flex items-center gap-2 font-heading text-lg">
                <Coin className="size-5" />
                Money on the Table
              </p>
            </div>
          </div>
          <dl>
            {ROWS.map((r) => (
              <div key={r.label} className="grid grid-cols-1 border-b border-border pb-4 last:border-b-0 md:grid-cols-[13rem_1fr_1fr] md:pb-0">
                <dt className="px-4 pt-5 font-heading text-lg text-foreground sm:px-6 md:py-5 md:font-sans md:text-sm md:font-semibold">
                  {r.label}
                </dt>
                <dd className="px-4 pt-2 text-[0.95rem] leading-snug text-muted-foreground sm:px-6 md:py-5">
                  <span className="block text-[0.7rem] font-semibold tracking-wide uppercase md:sr-only">
                    NCOA BenefitsCheckUp<span className="sr-only">: </span>
                  </span>
                  {r.them}
                </dd>
                <dd className="mx-4 mt-3 flex gap-2 rounded-xl bg-evergreen-soft/70 p-3.5 text-[0.95rem] leading-snug font-medium sm:mx-6 md:m-0 md:rounded-none md:border-l md:border-evergreen/25 md:p-4 md:px-6 md:py-5">
                  <Check className="mt-0.5 size-4 shrink-0 text-good" strokeWidth={2.5} aria-hidden="true" />
                  <span>
                    <span className="block text-[0.7rem] font-semibold tracking-wide text-evergreen uppercase md:sr-only">
                      Money on the Table<span className="sr-only">: </span>
                    </span>
                    {r.us}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
          Use both. BenefitsCheckUp is the best place to see everything you might get. We do the forms for the two
          programs that matter most to a Medicare household on a fixed income.
        </p>
      </div>
    </section>
  )
}
