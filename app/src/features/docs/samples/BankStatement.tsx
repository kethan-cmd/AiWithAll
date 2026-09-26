import { SAMPLE } from '@/content/sampleFamily'
import { formatUSD } from '@/lib/money'
import { DemoFooter, DocSvg, Watermark, type SampleDocProps } from './chrome'
import { MONO_FONT, SAMPLE_LAYOUT, SERIF_FONT, SPOTS } from './sampleLayout'

const { width: W, height: H } = SAMPLE_LAYOUT.bank_statement
const INK = '#17231e'
const BODY = '#3a4540'
const MUTED = '#6a7570'
const BRAND = '#134e3a'
const RULE = '#e2e8e5'

/** Monthly transactions in cents (negative = money out). The Social Security
 *  deposit is the benefit after the Part B premium, matching the letter. */
const ACTIVITY: { date: string; text: string; cents: number }[] = [
  { date: '08/03', text: 'SSA TREAS 310 SOC SEC deposit', cents: 133910 },
  { date: '08/05', text: 'Corner Market groceries', cents: -14218 },
  { date: '08/10', text: 'City Light utility', cents: -9640 },
  { date: '08/15', text: 'Alder Street Apartments rent', cents: -82500 },
  { date: '08/22', text: 'Main Street Pharmacy', cents: -8796 },
]

const money = (c: number) => formatUSD(Math.abs(c)).replace('$', '')

/** A clearly fake credit union statement. The ending balance is the fact we read. */
export default function BankStatement(props: SampleDocProps) {
  const ending = SAMPLE.facts.bank_balance_cents
  const deposits = ACTIVITY.filter((a) => a.cents > 0).reduce((s, a) => s + a.cents, 0)
  const withdrawals = -ACTIVITY.filter((a) => a.cents < 0).reduce((s, a) => s + a.cents, 0)
  const beginning = ending - deposits + withdrawals
  const balances: number[] = []
  ACTIVITY.reduce((bal, a) => {
    balances.push(bal + a.cents)
    return bal + a.cents
  }, beginning)
  const spot = SPOTS.bank_statement.balance

  return (
    <DocSvg width={W} height={H} label="Sample bank statement for Helen M Park. Demo document, not real." {...props}>
      <rect width={W} height={H} fill="#ffffff" />
      <rect width={W} height={96} fill={BRAND} />
      <text x={40} y={46} fill="#fff" fontSize={17} fontWeight={600} fontFamily={SERIF_FONT}>
        {SAMPLE.docs.bank_name}
      </text>
      <text x={40} y={68} fill="#fff" fillOpacity={0.85} fontSize={11}>
        Member statement
      </text>
      <text x={572} y={44} fill="#fff" fillOpacity={0.8} fontSize={10} textAnchor="end">
        Statement period
      </text>
      <text x={572} y={62} fill="#fff" fontSize={11.5} textAnchor="end">
        {SAMPLE.docs.statement_period}
      </text>

      <g fontSize={11} fill={BODY}>
        <text x={40} y={130} fontWeight={700} fill={INK} fontSize={12}>
          {SAMPLE.docs.person_name}
        </text>
        <text x={40} y={146}>{SAMPLE.docs.address}</text>
        <text x={40} y={162} fill={MUTED}>
          Checking account ending in 0317
        </text>
      </g>

      <rect x={40} y={192} width={532} height={132} rx={6} fill="#f2f6f4" stroke="#d6e2dc" />
      <text x={56} y={216} fill={BRAND} fontSize={10} fontWeight={700} letterSpacing={1.5}>
        ACCOUNT SUMMARY
      </text>
      <g fontSize={12} fill={BODY}>
        <text x={56} y={240}>Beginning balance</text>
        <text x={556} y={240} textAnchor="end" fontFamily={MONO_FONT}>
          {formatUSD(beginning)}
        </text>
        <text x={56} y={260}>Deposits and credits</text>
        <text x={556} y={260} textAnchor="end" fontFamily={MONO_FONT}>
          +{formatUSD(deposits)}
        </text>
        <text x={56} y={280}>Withdrawals and debits</text>
        <text x={556} y={280} textAnchor="end" fontFamily={MONO_FONT}>
          -{formatUSD(withdrawals)}
        </text>
      </g>
      <line x1={56} x2={556} y1={287} y2={287} stroke="#c9d8d0" />
      <text x={56} y={spot.y} fill={INK} fontSize={13} fontWeight={700}>
        Ending balance
      </text>
      <text x={spot.x} y={spot.y} fill={INK} fontSize={spot.size} fontWeight={700} fontFamily={MONO_FONT} textAnchor="end">
        {spot.text}
      </text>

      <text x={40} y={364} fill={INK} fontSize={12.5} fontWeight={700}>
        Activity
      </text>
      <g fontSize={9.5} fill={MUTED} letterSpacing={1}>
        <text x={40} y={388}>DATE</text>
        <text x={92} y={388}>DESCRIPTION</text>
        <text x={470} y={388} textAnchor="end">AMOUNT</text>
        <text x={572} y={388} textAnchor="end">BALANCE</text>
      </g>
      <line x1={40} x2={572} y1={396} y2={396} stroke={INK} />
      {ACTIVITY.map((a, i) => {
        const y = 418 + i * 28
        return (
          <g key={a.date + a.text} fontSize={11} fill={BODY}>
            <text x={40} y={y} fontFamily={MONO_FONT}>
              {a.date}
            </text>
            <text x={92} y={y}>{a.text}</text>
            <text x={470} y={y} textAnchor="end" fontFamily={MONO_FONT} fill={a.cents > 0 ? '#1d6b4a' : BODY}>
              {a.cents > 0 ? '+' : '-'}
              {money(a.cents)}
            </text>
            <text x={572} y={y} textAnchor="end" fontFamily={MONO_FONT}>
              {money(balances[i])}
            </text>
            <line x1={40} x2={572} y1={y + 10} y2={y + 10} stroke={RULE} />
          </g>
        )
      })}

      <g fontSize={11} fill={BODY}>
        <text x={40} y={600}>Questions about your account? Visit any branch or call the number on your card.</text>
        <text x={40} y={618} fill={MUTED}>
          Federally insured credit union. Equal housing lender.
        </text>
      </g>

      <Watermark x={W / 2} y={470} size={112} angle={-30} />
      <DemoFooter x={40} y={758} right={572} />
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="#d9dde3" />
    </DocSvg>
  )
}
