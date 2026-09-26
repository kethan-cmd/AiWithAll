import { CheckCheck, EyeOff, ImageOff, PenOff, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHead } from './Section'

const PROMISES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Smartphone,
    title: 'Read on your device',
    body: 'Photos are read by your own phone or computer. They are not sent to a server to be read.',
  },
  {
    icon: ImageOff,
    title: 'Photos are never saved',
    body: 'Photos live in memory only while you check the facts, and are cleared the moment you confirm.',
  },
  {
    icon: EyeOff,
    title: 'No SSNs or account numbers',
    body: 'We look for four facts and nothing else. Social Security, Medicare and account numbers are never read or stored.',
  },
  {
    icon: CheckCheck,
    title: 'You confirm every fact',
    body: 'Each value shows the document it came from. Nothing reaches a draft until you tap the checkmark.',
  },
  {
    icon: PenOff,
    title: 'AI never signs or submits',
    body: 'A person signs. A person submits, ideally with a free SHIP counselor. Your family sees tasks, never documents.',
  },
]

export default function PrivacyPromises() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            id="privacy-title"
            eyebrow="Privacy"
            title="Five promises about your family's paperwork."
            lede="Benefit forms are personal. We built the app so the most sensitive parts never leave your hands."
          />
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-warn-soft px-3 py-1.5 text-sm font-medium text-warn">
            The demo uses a fictional family and fake documents only.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <li
              key={p.title}
              className={
                'rounded-2xl border border-border bg-card p-6 shadow-card' + (i === PROMISES.length - 1 ? ' sm:col-span-2' : '')
              }
            >
              <span className="grid size-10 place-items-center rounded-full border border-evergreen/25 text-evergreen">
                <p.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{p.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
