import { getStat } from '@/content/stats'
import type { Stat } from '@/content/stats'
import SourceRef from './SourceRef'
import { SectionHead } from './Section'

const SUPPORTING = ['msp-participation', 'snap-participation', 'caregiver-costs', 'dementia-caregivers']

function Figure({ stat }: { stat: Stat }) {
  return (
    <div className="border-t border-on-deep/15 pt-5">
      <p className="numeral text-5xl font-medium text-on-deep sm:text-[3.4rem]">
        {stat.value}
        <SourceRef id={stat.id} onDark />
      </p>
      <p className="mt-3 text-base font-medium text-on-deep">{stat.label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-on-deep-muted">{stat.detail}</p>
    </div>
  )
}

/** The problem in numbers. Every figure links to its source. */
export default function StatsBand() {
  const gap = getStat('benefits-gap')
  const rest = SUPPORTING.map(getStat).filter((s): s is Stat => Boolean(s))
  if (!gap) return null
  return (
    <section aria-labelledby="stats-title" className="grain relative overflow-hidden bg-evergreen-deep text-on-deep">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 65%)' }}
      />
      <div className="container-page relative z-10 py-20 sm:py-28">
        <SectionHead
          id="stats-title"
          onDark
          eyebrow="The benefits gap"
          title="The help exists. The paperwork is where it stops."
          lede="Programs that pay Medicare premiums and drug costs are already law. About half of the people who qualify for a Medicare Savings Program are not enrolled, and the person doing the paperwork is usually a tired family caregiver."
        />
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div className="lg:border-r lg:border-on-deep/15 lg:pr-12">
            <p className="numeral text-[5.5rem] leading-none font-medium text-gold sm:text-[8rem]">
              {gap.value}
              <SourceRef id={gap.id} onDark className="text-[0.22em]" />
            </p>
            <p className="mt-5 max-w-sm font-heading text-2xl leading-snug text-on-deep">{gap.label}.</p>
            <p className="mt-3 max-w-sm text-on-deep-muted">{gap.detail}</p>
          </div>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {rest.map((s) => (
              <Figure key={s.id} stat={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
