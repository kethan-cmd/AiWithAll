import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ctaGold, ctaOnDark } from './cta'

export default function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="container-page">
      <div className="grain relative overflow-hidden rounded-3xl bg-evergreen-deep px-6 py-14 text-on-deep sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 size-[28rem] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 65%)' }}
        />
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">See it work</p>
            <h2 id="final-title" className="mt-4 text-[2.1rem] leading-[1.06] font-medium text-on-deep sm:text-5xl">
              Meet the Park family. Watch their paperwork become two drafts in about two minutes.
            </h2>
            <p className="mt-5 text-lg text-on-deep-muted">
              A fictional family with fake documents, so you can see every step before you use your own.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link to="/start?sample=1" className={ctaGold}>
              Try the sample family
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link to="/start" className={ctaOnDark}>
              Use my own documents
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
