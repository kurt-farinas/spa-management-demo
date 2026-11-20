import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatAccounting, kilo } from '../../lib/money.js'

// revenue is rail-active deepened toward the surface; validated with accent for CVD and chroma (dataviz)
const REVENUE = 'color-mix(in srgb, var(--color-rail-active) 82%, var(--color-surface))'
const SERIES = [
  ['revenue', 'Revenue', REVENUE],
  ['costs', 'Total costs', 'var(--color-accent)'],
  ['netIncome', 'Net income', 'var(--color-ink)'],
]

// the axis tick for a month: the partial one gets its asterisk, found by label and not by tick position
export const tickLabel = (months, partialMonth, label) => (months.find((m) => m.label === label)?.month === partialMonth ? `${label}*` : label)

function TrendTooltip({ active, payload, partialMonth }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-soft bg-surface px-3 py-2 text-xs shadow-[0_4px_12px_color-mix(in_srgb,var(--brand-rail)_12%,transparent)]">
      <div className="text-muted">
        {d.label} {d.month.slice(0, 4)}
        {d.month === partialMonth && ' (so far)'}
      </div>
      {SERIES.map(([key, name]) => (
        <div key={key} className="mt-0.5 flex justify-between gap-4 text-ink">
          <span>{name}</span>
          <span className="font-medium tabular-nums">{formatAccounting(d[key])}</span>
        </div>
      ))}
    </div>
  )
}

function Swatch({ color, line }) {
  return line ? (
    <span aria-hidden="true" className="relative inline-block h-2 w-4">
      <span className="absolute inset-x-0 top-[3px] h-0.5" style={{ background: color }} />
      <span className="absolute top-0 left-1 size-2 rounded-full" style={{ background: color }} />
    </span>
  ) : (
    <span aria-hidden="true" className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
  )
}

// months: monthlyTrend rows, oldest first; partialMonth is the 'YYYY-MM' still filling up, if shown
export function TrendChart({ months, partialMonth }) {
  return (
    <>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {SERIES.map(([key, name, color]) => (
          <li key={key} className="inline-flex items-center gap-1.5">
            <Swatch color={color} line={key === 'netIncome'} />
            {name}
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={months} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke="var(--color-soft)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-soft)' }}
              tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
              tickFormatter={(label) => tickLabel(months, partialMonth, label)}
            />
            <YAxis width={48} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickFormatter={kilo} />
            <Tooltip cursor={{ fill: 'var(--color-soft)', fillOpacity: 0.6 }} content={<TrendTooltip partialMonth={partialMonth} />} />
            <Bar dataKey="revenue" fill={REVENUE} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="costs" fill="var(--color-accent)" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line
              dataKey="netIncome"
              stroke="var(--color-ink)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-ink)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: 'var(--color-ink)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {months.some((m) => m.month === partialMonth) && <p className="mt-2 text-xs text-muted">* This month so far</p>}
      {/* sr-only on a div: a table ignores the 1px width and widens the page */}
      <div className="sr-only">
      <table>
        <caption>Revenue, total costs and net income per month, last {months.length} months</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            {SERIES.map(([key, name]) => (
              <th key={key} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">
                {m.label} {m.month.slice(0, 4)}
                {m.month === partialMonth && ' (so far)'}
              </th>
              {SERIES.map(([key]) => (
                <td key={key}>{formatAccounting(m[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
