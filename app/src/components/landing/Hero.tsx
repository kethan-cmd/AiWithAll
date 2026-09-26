import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, EyeOff, HeartHandshake, Smartphone, Upload } from 'lucide-react'
import ProductPreview from './ProductPreview'
import SourceRef from './SourceRef'
import { ctaPrimary, ctaSecondary } from './cta'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mesh-hero grain relative overflow-x-clip border-b border-border">
      <div className="container-page relative z-10 grid items-center gap-10 pt-12 pb-20 sm:pt-16 sm:pb-28 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:pt-24 lg:pb-32">
        <div>
          <p
            style={delay(0)}
            className="inline-flex animate-rise items-center gap-2 rounded-full border border-evergreen/20 bg-card/70 px-3 py-1.5 text-sm font-medium text-evergreen backdrop-blur delay-var"
          >
            <HeartHandshake className="size-4" aria-hidden="true" />
            For families caring for a parent with dementia
          </p>

          <h1
            id="hero-title"
            style={delay(80)}
            className="mt-6 animate-rise text-[2.7rem] leading-[1.02] font-medium tracking-[-0.035em] delay-var sm:text-6xl lg:text-[4.4rem]"
          >
            Your family may be leaving money on the table.{' '}
            <br className="hidden sm:block" />
            <span className="marker italic">We'll do the paperwork.</span>
          </h1>

          <p style={delay(160)} className="mt-6 max-w-xl animate-rise text-lg leading-relaxed text-muted-foreground delay-var sm:text-xl">
            Snap the paperwork you already have. We read it right on your device, find the benefits your parent likely
            qualifies for, and fill in the applications. <span className="text-foreground">You sign. A free counselor helps you submit.</span>
          </p>

          <div style={delay(240)} className="mt-9 flex animate-rise flex-col gap-3 delay-var sm:flex-row">
            <Link to="/start?sample=1" className={ctaPrimary}>
              Try it with the sample family
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link to="/start" className={ctaSecondary}>
              <Upload className="size-4.5" aria-hidden="true" />
              Use my own documents
            </Link>
          </div>

          <ul style={delay(320)} className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground delay-var">
            <li className="inline-flex items-center gap-2">
              <Smartphone className="size-4 text-evergreen" aria-hidden="true" />
              Reads on your device
            </li>
            <li className="inline-flex items-center gap-2">
              <EyeOff className="size-4 text-evergreen" aria-hidden="true" />
              Never reads SSNs or account numbers
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="grid size-4 place-items-center rounded-full bg-evergreen text-[10px] font-bold text-primary-foreground">
                $
              </span>
              Free to use
            </li>
          </ul>
        </div>

        <div style={delay(200)} className="animate-fade px-3 delay-var sm:px-8 lg:px-0">
          <ProductPreview />
        </div>
      </div>

      <div className="container-page relative z-10 pb-10">
        <p className="max-w-3xl border-t border-rule pt-6 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">$58 billion a year</span> in benefits goes unclaimed by
          older adults who qualify<SourceRef id="benefits-gap" />. Finding the programs is not the hard part. Filling in the forms is.
        </p>
      </div>
    </section>
  )
}
