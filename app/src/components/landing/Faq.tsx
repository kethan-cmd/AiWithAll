import { Plus } from 'lucide-react'
import { FAQ } from '@/content/faq'
import { SectionHead } from './Section'

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-border py-20 sm:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHead
          id="faq-title"
          eyebrow="Questions"
          title="Straight answers."
          lede="If you are unsure about anything, a free SHIP counselor in your state can go through it with you."
        />
        <div className="divide-y divide-border border-y border-border">
          {FAQ.map((f) => (
            <details key={f.id} id={`faq-${f.id}`} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-lg leading-snug font-medium sm:text-xl">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <div className="space-y-3 pr-12 pb-6 leading-relaxed text-muted-foreground">
                {f.a.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
