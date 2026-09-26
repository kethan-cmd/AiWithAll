import { SAMPLE } from '@/content/sampleFamily'
import { formatUSD, PART_B_2026_CENTS } from '@/lib/money'
import { DemoFooter, DocSvg, Watermark, type SampleDocProps } from './chrome'
import { MONO_FONT, SAMPLE_LAYOUT, SERIF_FONT, SPOTS } from './sampleLayout'

const { width: W, height: H } = SAMPLE_LAYOUT.ssa_letter
const INK = '#1b2433'
const BODY = '#39404c'
const MUTED = '#6b7483'
const RULE = '#e3e6eb'

/** A clearly fake Social Security benefit letter ("Your new benefit amount"). */
export default function SsaAwardLetter(props: SampleDocProps) {
  const income = SPOTS.ssa_letter.income
  const paid = SAMPLE.facts.monthly_income_cents - PART_B_2026_CENTS
  const cut = SAMPLE.docs.address.indexOf(', ')
  const street = SAMPLE.docs.address.slice(0, cut)
  const rest = SAMPLE.docs.address.slice(cut + 2)
  return (
    <DocSvg width={W} height={H} label="Sample Social Security benefit letter for Helen M Park. Demo document, not real." {...props}>
      <rect width={W} height={H} fill="#ffffff" />
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="#d9dde3" />

      <text x={48} y={62} fill="#1f3a5f" fontSize={13} fontWeight={700} letterSpacing={3}>
        SOCIAL SECURITY
      </text>
      <text x={48} y={80} fill={MUTED} fontSize={11}>
        Benefit notice
      </text>
      <text x={564} y={60} fill={MUTED} fontSize={10} textAnchor="end">
        Notice date
      </text>
      <text x={564} y={78} fill={INK} fontSize={12} textAnchor="end">
        {SAMPLE.docs.ssa_letter_date}
      </text>
      <line x1={48} x2={564} y1={96} y2={96} stroke="#1f3a5f" strokeWidth={1.5} />

      <g fontSize={11.5} fill={BODY}>
        <text x={48} y={132} fontWeight={700} fill={INK}>
          {SAMPLE.docs.person_name}
        </text>
        <text x={48} y={148}>{street}</text>
        <text x={48} y={164}>{rest}</text>
      </g>

      <text x={48} y={232} fill="#14213d" fontSize={24} fontWeight={600} fontFamily={SERIF_FONT}>
        Your new benefit amount
      </text>
      <g fontSize={12} fill={BODY}>
        <text x={48} y={262}>Your Social Security benefit will increase by 2.8 percent in 2026</text>
        <text x={48} y={279}>because of a rise in the cost of living. Here is your new amount.</text>
      </g>

      <text x={48} y={334} fill={INK} fontSize={12.5} fontWeight={700}>
        How much you will get each month
      </text>
      <line x1={48} x2={564} y1={346} y2={346} stroke={INK} />
      <text x={48} y={364} fill={MUTED} fontSize={9.5} letterSpacing={1}>
        ITEM
      </text>
      <text x={564} y={364} fill={MUTED} fontSize={9.5} letterSpacing={1} textAnchor="end">
        AMOUNT
      </text>
      <line x1={48} x2={564} y1={372} y2={372} stroke={RULE} />

      <text x={48} y={income.y} fill={INK} fontSize={12}>
        Monthly Social Security benefit before deductions
      </text>
      <text x={income.x} y={income.y} fill={INK} fontSize={income.size} fontFamily={MONO_FONT} textAnchor="end">
        {income.text}
      </text>
      <line x1={48} x2={564} y1={406} y2={406} stroke={RULE} />

      <text x={48} y={428} fill={INK} fontSize={12}>
        Medicare medical insurance premium
      </text>
      <text x={564} y={428} fill={INK} fontSize={14} fontFamily={MONO_FONT} textAnchor="end">
        -{formatUSD(PART_B_2026_CENTS)}
      </text>
      <line x1={48} x2={564} y1={442} y2={442} stroke={RULE} />

      <text x={48} y={466} fill={INK} fontSize={12.5} fontWeight={700}>
        The amount we will pay
      </text>
      <text x={564} y={466} fill={INK} fontSize={14} fontWeight={700} fontFamily={MONO_FONT} textAnchor="end">
        {formatUSD(paid)}
      </text>
      <line x1={48} x2={564} y1={480} y2={480} stroke={INK} strokeWidth={1.5} />

      <g fontSize={11.5} fill={BODY}>
        <text x={48} y={524}>Your payment is deposited on the second Wednesday of each month.</text>
        <text x={48} y={544}>If you think this amount is wrong, you can ask us to review it within</text>
        <text x={48} y={560}>60 days of getting this letter.</text>
        <text x={48} y={590}>Keep this letter. You may need it to apply for other help.</text>
      </g>

      <Watermark x={W / 2} y={440} size={112} angle={-30} />
      <DemoFooter x={48} y={758} right={564} />
    </DocSvg>
  )
}
