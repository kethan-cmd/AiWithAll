import { SAMPLE } from '@/content/sampleFamily'
import { formatUSD } from '@/lib/money'
import { DemoFooter, DocSvg, Watermark, type SampleDocProps } from './chrome'
import { MONO_FONT, SAMPLE_LAYOUT, SERIF_FONT, SPOTS } from './sampleLayout'

const { width: W, height: H } = SAMPLE_LAYOUT.tax_return
const INK = '#1b2433'
const BODY = '#39404c'
const MUTED = '#6b7483'
const RULE = '#e3e6eb'

const amt = (c: number) => formatUSD(c).replace('$', '')

function Checkbox({ x, y, checked }: { x: number; y: number; checked: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={12} height={12} rx={1.5} fill="#fff" stroke={INK} />
      {checked ? (
        <path d={`M${x + 2.5} ${y + 6.5} l2.8 2.8 l4.6 -6`} fill="none" stroke={INK} strokeWidth={1.8} />
      ) : null}
    </g>
  )
}

/** A clearly fake summary of page 1 of a Form 1040 style tax return. */
export default function TaxReturn(props: SampleDocProps) {
  const dob = SPOTS.tax_return.dob
  const lines: [string, string, number][] = [
    ['1z', 'Wages, salaries, tips', 0],
    ['2b', 'Taxable interest', 4120],
    ['4b', 'IRA distributions, taxable amount', 0],
    ['6a', 'Social Security benefits', SAMPLE.docs.tax_ss_benefits_cents],
    ['6b', 'Taxable amount', 0],
    ['11', 'Adjusted gross income', 4120],
    ['15', 'Taxable income', 0],
  ]
  return (
    <DocSvg width={W} height={H} label="Sample tax return summary for Helen M Park. Demo document, not real." {...props}>
      <rect width={W} height={H} fill="#ffffff" />

      <rect x={40} y={34} width={72} height={42} fill={INK} />
      <text x={76} y={63} fill="#fff" fontSize={22} fontWeight={700} textAnchor="middle">
        1040
      </text>
      <text x={124} y={52} fill={INK} fontSize={14} fontWeight={700}>
        Individual Income Tax Return
      </text>
      <text x={124} y={70} fill={MUTED} fontSize={11}>
        Summary of page 1
      </text>
      <text x={572} y={50} fill={MUTED} fontSize={10} textAnchor="end">
        Tax year
      </text>
      <text x={572} y={74} fill={INK} fontSize={22} fontWeight={600} fontFamily={SERIF_FONT} textAnchor="end">
        {SAMPLE.docs.tax_year}
      </text>
      <line x1={40} x2={572} y1={92} y2={92} stroke={INK} strokeWidth={2} />

      <text x={40} y={118} fill={MUTED} fontSize={9.5}>
        Your first name and middle initial, last name
      </text>
      <text x={40} y={138} fill={INK} fontSize={13} fontWeight={700}>
        {SAMPLE.docs.person_name}
      </text>
      <line x1={40} x2={572} y1={152} y2={152} stroke={RULE} />

      <text x={40} y={172} fill={MUTED} fontSize={9.5}>
        Date of birth (preparer worksheet)
      </text>
      <text x={dob.x} y={dob.y} fill={INK} fontSize={dob.size} fontFamily={MONO_FONT}>
        {dob.text}
      </text>
      <text x={260} y={172} fill={MUTED} fontSize={9.5}>
        Filing status
      </text>
      <Checkbox x={260} y={186} checked />
      <text x={278} y={197} fill={INK} fontSize={12}>
        Single
      </text>

      <Checkbox x={40} y={224} checked />
      <text x={58} y={234} fill={BODY} fontSize={11}>
        You were born before January 2, 1961
      </text>
      <Checkbox x={320} y={224} checked={false} />
      <text x={338} y={234} fill={BODY} fontSize={11}>
        You are blind
      </text>
      <line x1={40} x2={572} y1={254} y2={254} stroke={INK} />

      <text x={40} y={282} fill={INK} fontSize={12.5} fontWeight={700}>
        Income
      </text>
      {lines.map(([n, label, cents], i) => {
        const y = 310 + i * 28
        return (
          <g key={n}>
            <text x={40} y={y} fill={INK} fontSize={11} fontWeight={700}>
              {n}
            </text>
            <text x={72} y={y} fill={BODY} fontSize={11.5}>
              {label}
            </text>
            <rect x={462} y={y - 15} width={110} height={21} fill="#fafbfc" stroke="#cfd4db" />
            <text x={566} y={y} fill={INK} fontSize={12} fontFamily={MONO_FONT} textAnchor="end">
              {amt(cents)}
            </text>
            <line x1={40} x2={456} y1={y + 8} y2={y + 8} stroke={RULE} />
          </g>
        )
      })}

      <text x={40} y={540} fill={INK} fontSize={12.5} fontWeight={700}>
        Sign here
      </text>
      <line x1={40} x2={330} y1={584} y2={584} stroke={INK} />
      <text x={40} y={598} fill={MUTED} fontSize={9.5}>
        Your signature
      </text>
      <line x1={350} x2={572} y1={584} y2={584} stroke={INK} />
      <text x={350} y={598} fill={MUTED} fontSize={9.5}>
        Date
      </text>

      <Watermark x={W / 2} y={440} size={112} angle={-30} />
      <DemoFooter x={40} y={758} right={572} />
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="#d9dde3" />
    </DocSvg>
  )
}
