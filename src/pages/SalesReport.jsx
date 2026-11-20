import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { salesInRange, salesTotals, salesSummary, fillPeriods, rangePreset } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { monthDay } from '../lib/format.js'
import { StatCard } from '../components/StatCard.jsx'
import { pillClass } from '../components/ui.js'
import { SalesReportChart } from '../components/charts/SalesReportChart.jsx'

const PRESETS = [
  ['today', 'Today'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['last-month', 'Last month'],
  ['6-months', 'Last 6 months'],
]
// [URL value, label, salesSummary groupBy]
const GROUPS = [
  ['day', 'Day', 'day'],
  ['month', 'Month', 'month'],
  ['service', 'Service', 'service'],
  ['therapist', 'Therapist', 'employee'],
]

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? '')
const withYear = (date) => `${monthDay(date)}, ${date.slice(0, 4)}`
const rangeLabel = (from, to) =>
  from === to ? withYear(from) : from.slice(0, 4) === to.slice(0, 4) ? `${monthDay(from)} – ${withYear(to)}` : `${withYear(from)} – ${withYear(to)}`
const share = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '0%')
const sumOf = (rows, key) => rows.reduce((t, r) => t + r[key], 0)

const dateInput = 'h-11 rounded-full border bg-surface px-4 text-sm text-ink tabular-nums hover:border-plum-light aria-invalid:border-danger'
const cell = 'px-3 py-2.5 text-right tabular-nums whitespace-nowrap'

// several figures under one label, each with its share of their sum
function SplitCard({ label, parts }) {
  const whole = sumOf(parts.map(([, value]) => ({ value })), 'value')
  return (
    <div className="col-span-2 rounded-xl border border-tint bg-surface p-3.5 md:col-span-3 md:rounded-2xl md:px-5 md:py-[18px]">
      <div className="text-xs text-muted md:text-[13px]">{label}</div>
      <dl className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2">
        {parts.map(([name, value]) => (
          <div key={name}>
            <dt className="text-xs text-muted">
              {name} · {share(value, whole)}
            </dt>
            <dd className="font-heading text-[19px] text-ink tabular-nums md:text-[22px]">{formatPeso(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function SalesReport() {
  const { state } = useDemoStore()
  const [params, setParams] = useSearchParams()
  const [customOpen, setCustomOpen] = useState(false)
  const today = new Date()
  const fallback = rangePreset('month', today)
  const from = isDate(params.get('from')) ? params.get('from') : fallback.from
  const to = isDate(params.get('to')) ? params.get('to') : fallback.to
  const [groupKey, groupLabel, groupBy] = GROUPS.find((g) => g[0] === params.get('group')) ?? GROUPS[0]
  const update = (next) => setParams({ from, to, group: groupKey, ...next }, { replace: true })

  const preset = PRESETS.find(([name]) => {
    const r = rangePreset(name, today)
    return r.from === from && r.to === to
  })?.[0]
  const custom = customOpen || !preset
  const invalid = from > to
  const sales = invalid ? [] : salesInRange(state.sales, from, to)
  const totals = salesTotals(sales)
  const rows = fillPeriods(salesSummary(sales, { groupBy }, state), { from, to, groupBy })
  const grand = sumOf(rows, 'total')
  const countLabel = groupBy === 'service' ? 'Booked' : 'Sales'

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="on-plum-mobile -mx-4 bg-plum px-4 pt-1 pb-6 md:mx-0 md:bg-transparent md:p-0">
        <div className="text-xs text-lavender tabular-nums md:text-[13px] md:text-muted">{invalid ? 'Pick a date range' : rangeLabel(from, to)}</div>
        <h1 className="mt-1 font-heading text-[26px] font-medium text-white md:text-[32px] md:text-ink">Sales report</h1>
      </header>

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Date range" className="flex flex-wrap gap-2">
          {PRESETS.map(([name, label]) => (
            <button
              key={name}
              type="button"
              aria-pressed={!custom && preset === name}
              className={pillClass(!custom && preset === name)}
              onClick={() => {
                setCustomOpen(false)
                update(rangePreset(name, today))
              }}
            >
              {label}
            </button>
          ))}
          <button type="button" aria-pressed={custom} className={pillClass(custom)} onClick={() => setCustomOpen(true)}>
            Custom
          </button>
        </div>
        {custom && (
          <div className="flex flex-wrap items-end gap-3">
            {[
              ['from', 'Start date', from],
              ['to', 'End date', to],
            ].map(([key, label, value]) => (
              <label key={key} className="flex flex-col gap-1 text-xs text-muted">
                {label}
                <input
                  type="date"
                  value={value}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? 'range-error' : undefined}
                  onChange={(e) => e.target.value && update({ [key]: e.target.value })}
                  className={`${dateInput} ${invalid ? '' : 'border-lavender'}`}
                />
              </label>
            ))}
            {invalid && (
              <p id="range-error" role="alert" className="flex min-h-11 items-center text-sm text-danger">
                Start date must be before end date
              </p>
            )}
          </div>
        )}
      </div>

      {!invalid && (
        <>
          <section aria-label="Totals for this period" className="grid grid-cols-2 gap-2.5 md:grid-cols-6 md:gap-4">
            <div className="col-span-2 [&>div]:h-full">
              <StatCard label="Total sales" value={formatPeso(totals.total)} />
            </div>
            <div className="md:col-span-2 [&>div]:h-full">
              <StatCard label="Transactions" value={totals.count} note={totals.count === 1 ? 'sale' : 'sales'} />
            </div>
            <div className="md:col-span-2 [&>div]:h-full">
              <StatCard label="Average sale" value={formatPeso(totals.average)} />
            </div>
            <SplitCard label="Services and products" parts={[['Services', totals.services], ['Products', totals.products]]} />
            <SplitCard label="Payment mix" parts={[['Cash', totals.byPayment.cash], ['Card', totals.byPayment.card], ['GCash', totals.byPayment.gcash]]} />
          </section>

          <section aria-labelledby="report-title" className="min-w-0 rounded-2xl border border-tint bg-surface px-5 py-4 md:px-[22px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="report-title" className="font-heading text-[19px] font-medium">
                Sales by {groupLabel.toLowerCase()}
              </h2>
              <div role="group" aria-label="Group by" className="flex flex-wrap gap-2">
                {GROUPS.map(([key, label]) => (
                  <button key={key} type="button" aria-pressed={groupKey === key} className={pillClass(groupKey === key)} onClick={() => update({ group: key })}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {sales.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">No sales in this period</p>
            ) : (
              <>
                <SalesReportChart rows={rows} ranked={groupBy === 'service' || groupBy === 'employee'} unit={groupBy === 'service' ? ['booked', 'booked'] : undefined} />
                <div className="-mx-5 mt-4 overflow-x-auto md:-mx-[22px]">
                  <table className="w-full min-w-[420px] border-collapse text-sm">
                    <caption className="sr-only">
                      Sales by {groupLabel.toLowerCase()}, {rangeLabel(from, to)}
                    </caption>
                    <thead>
                      <tr className="text-left text-xs text-muted">
                        <th scope="col" className="px-5 py-3 font-medium md:pl-[22px]">{groupLabel}</th>
                        <th scope="col" className="px-3 py-3 text-right font-medium">{countLabel}</th>
                        <th scope="col" className="px-3 py-3 text-right font-medium">Total</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium md:pr-[22px]">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.key} className="border-t border-tint">
                          <th scope="row" className="px-5 py-2.5 text-left font-normal md:pl-[22px]">{r.label}</th>
                          <td className={`${cell} text-muted`}>{r.count}</td>
                          <td className={`${cell} font-medium`}>{formatPeso(r.total)}</td>
                          <td className={`${cell} pr-5 text-muted md:pr-[22px]`}>{share(r.total, grand)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-lavender font-semibold">
                        <th scope="row" className="px-5 py-3 text-left md:pl-[22px]">Total</th>
                        <td className={cell}>{sumOf(rows, 'count')}</td>
                        <td className={cell}>{formatPeso(grand)}</td>
                        <td className={`${cell} pr-5 md:pr-[22px]`}>100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}
