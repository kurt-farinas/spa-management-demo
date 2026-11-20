import { useSearchParams } from 'react-router-dom'
import { PiCaretDown } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { incomeStatement, statementMonths, compareStatements, monthlyTrend } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { spaConfig } from '../config/spa.config.js'
import { formatPeso, formatAccounting } from '../lib/money.js'
import { StatCard } from '../components/StatCard.jsx'
import { TrendChart } from '../components/charts/TrendChart.jsx'

// 'YYYY-MM' → 'October 2026'
const monthName = (month) => new Date(`${month}-01T00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
const shortMonth = (month) => new Date(`${month}-01T00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
const previousMonth = (month) => shiftMonth(month, -1)
const shortName = (month) => new Date(`${month}-01T00:00`).toLocaleDateString('en-US', { month: 'short' })
// the same 'YYYY-MM' n months on (negative n for earlier)
const shiftMonth = (month, n) => toDateStr(new Date(month.slice(0, 4), month.slice(5, 7) - 1 + n, 1)).slice(0, 7)
// a loss margin goes in parentheses like the amounts
const margin = (s) => {
  if (!s.totalRevenue) return '—'
  const pct = (s.netIncome / s.totalRevenue) * 100
  return pct < 0 ? `(${Math.abs(pct).toFixed(1)}%)` : `${pct.toFixed(1)}%`
}
const clearChange = (line) => ({ ...line, change: null })
const withoutChanges = (lines) => Object.fromEntries(Object.entries(lines).map(([k, v]) => [k, Array.isArray(v) ? v.map(clearChange) : clearChange(v)]))

// up is good for revenue and profit, bad for costs; the arrow carries the direction, colour only says good or bad
function Change({ change, upIsGood = true }) {
  if (change === null) return <span className="text-muted">—</span>
  if (change === 0) return <span className="text-muted">0.0%</span>
  const up = change > 0
  return (
    <span className={up === upIsGood ? 'text-success' : 'text-danger'}>
      <span aria-hidden="true">{up ? '▲' : '▼'} </span>
      <span className="sr-only">{up ? 'up ' : 'down '}</span>
      {Math.abs(change).toFixed(1)}%
    </span>
  )
}

function Row({ label, line, upIsGood, kind = 'item' }) {
  const strong = kind !== 'item'
  const border = kind === 'total' ? 'border-t border-soft' : kind === 'net' ? 'border-t-[3px] border-double border-ink' : ''
  const cell = `px-3 py-2 text-right tabular-nums ${border}`
  return (
    <tr className={strong ? 'font-semibold' : ''}>
      <th scope="row" className={`py-2 pr-3 text-left ${kind === 'item' ? 'pl-4 font-normal' : ''} ${border}`}>
        {label}
      </th>
      <td className={cell}>{formatAccounting(line.current)}</td>
      <td className={`${cell} text-muted`}>{line.previous === null ? '—' : formatAccounting(line.previous)}</td>
      <td className={`${cell} font-normal`}>
        <Change change={line.change} upIsGood={upIsGood} />
      </td>
    </tr>
  )
}

function Heading({ children }) {
  return (
    <tr>
      <th scope="rowgroup" colSpan={4} className="pt-4 pb-1 text-left text-xs font-semibold tracking-wide text-muted uppercase">
        {children}
      </th>
    </tr>
  )
}

export function FinancialStatement() {
  const { state } = useDemoStore()
  const [params, setParams] = useSearchParams()
  const thisMonth = toDateStr(new Date()).slice(0, 7)
  const months = statementMonths(state)
  const latestFull = months.find((m) => m !== thisMonth) ?? months[0] ?? thisMonth
  const month = months.includes(params.get('month')) ? params.get('month') : latestFull
  const partial = month === thisMonth
  const prevKey = previousMonth(month)
  const todayDay = new Date().getDate()
  // the first month of data starts mid-month when the earliest sale is not on the 1st
  const firstSale = state.sales.map((s) => s.date.slice(0, 10)).sort()[0]
  const partialFirst = firstSale && firstSale.slice(8) !== '01' && firstSale.slice(0, 7) === months.at(-1) ? months.at(-1) : null
  const prevPartial = prevKey === partialFirst

  const cur = incomeStatement(state, month)
  // a month so far is compared with days 1..today of the last one, not all of it
  const prev = months.includes(prevKey) ? incomeStatement(state, prevKey, partial ? { throughDay: todayDay } : undefined) : null
  const prevLabel = partial ? `${shortName(prevKey)} 1–${todayDay}` : shortMonth(prevKey)
  const compared = compareStatements(cur, prev)
  const lines = prevPartial ? withoutChanges(compared) : compared
  const empty = cur.totalRevenue === 0
  const biggest = [...cur.expenses].sort((a, b) => b.amount - a.amount)[0]
  // 6 calendar months ending at the selected one; a month without data is drawn at 0
  const trend = monthlyTrend(state, Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5)))
  const title = `${monthName(month)}${partial ? ' (so far)' : ''}`

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-[26px] font-medium md:text-[32px]">Financial statement</h1>
        <label className="relative inline-flex items-center gap-2 text-[13px] text-muted">
          Month
          <select
            value={month}
            onChange={(e) => setParams({ month: e.target.value })}
            className="h-11 cursor-pointer appearance-none rounded-full border border-line bg-surface pr-9 pl-4 text-sm text-ink hover:border-rail-active"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m === thisMonth ? 'This month (so far)' : `${monthName(m)}${m === partialFirst ? ' (partial)' : ''}`}
              </option>
            ))}
          </select>
          <PiCaretDown aria-hidden="true" className="pointer-events-none absolute right-3.5 size-4 text-muted" />
        </label>
      </header>

      <section aria-label={`Key figures, ${title}`} className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        <StatCard dark label="Net income" value={formatAccounting(cur.netIncome)} note={partial ? 'Month so far' : monthName(month)} />
        <StatCard label="Net margin" value={empty ? '—' : margin(cur)} note="Net income ÷ revenue" />
        <StatCard
          label={`Biggest expense${biggest ? ` · ${biggest.category}` : ''}`}
          value={formatPeso(biggest ? biggest.amount : 0)}
          note={biggest ? `${Math.round((biggest.amount / cur.totalExpenses) * 100)}% of operating expenses` : 'No expenses'}
        />
        <StatCard
          label="Revenue change"
          value={empty ? '—' : <Change change={lines.totalRevenue.change} />}
          note={prev ? (prevPartial ? 'Previous month is partial' : `vs ${partial ? prevLabel : monthName(prevKey)}`) : 'No earlier month'}
        />
      </section>

      <section aria-labelledby="statement-title" className="min-w-0 rounded-2xl border border-soft bg-surface px-5 py-4 md:px-[22px]">
        <h2 id="statement-title" className="font-heading text-[19px] font-medium">
          Income statement · {title}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {spaConfig.name}
          {partial && ` · 1 to ${new Date().getDate()} ${monthName(month).split(' ')[0]}, not a full month`}
        </p>
        {empty ? (
          <p className="py-10 text-center text-sm text-muted">No sales this month</p>
        ) : (
          <div tabIndex={0} role="region" aria-label="Income statement table" className="relative -mx-1 mt-3 overflow-x-auto px-1">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-soft text-xs text-muted">
                  <th scope="col" className="py-2 pr-3 text-left font-normal">
                    <span className="sr-only">Line</span>
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-ink">
                    {shortMonth(month)}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-normal">
                    {prevLabel}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-normal">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                <Heading>Revenue</Heading>
                <Row label="Services" line={lines.serviceRevenue} />
                <Row label="Retail products" line={lines.productRevenue} />
                <Row label="Total revenue" line={lines.totalRevenue} kind="total" />
                <Row label="Cost of products sold" line={lines.costOfProducts} upIsGood={false} kind="sub" />
                <Row label="Gross profit" line={lines.grossProfit} kind="total" />
                <Heading>Operating expenses</Heading>
                {lines.expenses.map((e) => (
                  <Row key={e.category} label={e.category} line={e} upIsGood={false} />
                ))}
                <Row label="Total operating expenses" line={lines.totalExpenses} upIsGood={false} kind="total" />
                <Row label="Net income" line={lines.netIncome} kind="net" />
                <tr className="text-muted">
                  <th scope="row" className="py-2 pr-3 pl-4 text-left font-normal">
                    Net margin
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums">{margin(cur)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{prev ? margin(prev) : '—'}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {!empty && prevPartial && <p className="mt-2 text-xs text-muted">Previous month is partial, so there is no change to show.</p>}
      </section>

      <section aria-labelledby="trend-title" className="min-w-0 rounded-2xl border border-soft bg-surface px-5 py-4 md:px-[22px]">
        <h2 id="trend-title" className="font-heading text-[19px] font-medium">
          Last {trend.length} months
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">Revenue against total costs (products sold plus expenses)</p>
        <TrendChart months={trend} partialMonth={thisMonth} />
      </section>
    </div>
  )
}
