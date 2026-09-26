import { useId } from 'react'
import { SAMPLE } from '@/content/sampleFamily'
import { DemoFooter, DocSvg, Watermark, type SampleDocProps } from './chrome'
import { MONO_FONT, SAMPLE_LAYOUT, SPOTS } from './sampleLayout'

const { width: W, height: H } = SAMPLE_LAYOUT.medicare_card
const INK = '#1b2433'
const MUTED = '#5b6472'

/** A generic, clearly fake health insurance card in the style of a
 *  Medicare card. No official marks. */
export default function MedicareCard(props: SampleDocProps) {
  const a = SPOTS.medicare_card.partAStart
  const b = SPOTS.medicare_card.partBStart
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clip = `mc-clip-${uid}`
  const band = `mc-band-${uid}`
  return (
    <DocSvg width={W} height={H} label="Sample Medicare card for Helen M Park. Demo document, not real." {...props}>
      <defs>
        <clipPath id={clip}>
          <rect width={W} height={H} rx={30} />
        </clipPath>
        <linearGradient id={band} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1d4f91" />
          <stop offset="1" stopColor="#2c67b3" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width={W} height={H} fill="#fbfcfe" />
        <rect width={W} height={130} fill={`url(#${band})`} />
        <rect y={130} width={W} height={10} fill="#b8322a" />
        {/* Decorative guilloche rings, not an official mark. */}
        <g fill="none" stroke="#ffffff" strokeOpacity={0.14}>
          {[34, 52, 70, 88, 106].map((r) => (
            <circle key={r} cx={770} cy={64} r={r} />
          ))}
        </g>
        <text x={48} y={72} fill="#fff" fontSize={46} fontWeight={700} letterSpacing={5}>
          MEDICARE
        </text>
        <text x={50} y={108} fill="#fff" fillOpacity={0.9} fontSize={20} letterSpacing={6}>
          HEALTH INSURANCE
        </text>

        <text x={48} y={190} fill={MUTED} fontSize={15}>
          Name/Nombre
        </text>
        <text x={48} y={228} fill={INK} fontSize={30} fontWeight={700} letterSpacing={1}>
          {SAMPLE.docs.person_name}
        </text>

        <text x={48} y={274} fill={MUTED} fontSize={15}>
          Medicare Number/Número de Medicare
        </text>
        <text x={48} y={310} fill={INK} fontSize={28} fontFamily={MONO_FONT} letterSpacing={1}>
          1EG4-XX-XXXX
        </text>
        <rect x={270} y={290} width={132} height={26} rx={13} fill="#eef1f6" />
        <text x={336} y={308} fill={MUTED} fontSize={13} textAnchor="middle">
          masked in demo
        </text>

        <text x={48} y={360} fill={MUTED} fontSize={15}>
          Entitled to/Con derecho a
        </text>
        <text x={520} y={360} fill={MUTED} fontSize={15}>
          Coverage starts/Cobertura empieza
        </text>
        <line x1={48} x2={812} y1={374} y2={374} stroke="#dfe4ec" />
        <text x={48} y={a.y} fill={INK} fontSize={26} fontWeight={700}>
          HOSPITAL (PART A)
        </text>
        <text x={a.x} y={a.y} fill={INK} fontSize={a.size} fontFamily={MONO_FONT}>
          {a.text}
        </text>
        <text x={48} y={b.y} fill={INK} fontSize={26} fontWeight={700}>
          MEDICAL (PART B)
        </text>
        <text x={b.x} y={b.y} fill={INK} fontSize={b.size} fontFamily={MONO_FONT}>
          {b.text}
        </text>

        <Watermark x={W / 2} y={300} size={150} angle={-14} />
        <DemoFooter x={48} y={512} right={812} size={15} />
      </g>
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={30} fill="none" stroke="#cfd8e6" />
    </DocSvg>
  )
}
