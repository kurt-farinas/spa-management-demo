import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { salesInRange, salesTotals, salesSummary, fillPeriods, rangePreset, rangeTooLong } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { monthDay } from '../lib/format.js'
import { StatCard } from '../components/StatCard.jsx'
import { pillClass, CATEGORY_BAND } from '../components/ui.js'
import { SalesReportChart, categoryFill } from '../components/charts/SalesReportChart.jsx'
import { toDateStr } from '../data/dates.js'

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

const dateInput = 'h-11 rounded-md border bg-surface px-3 text-sm text-ink tabular-nums hover:border-rail-active aria-invalid:border-danger'
const cell = 'h-11 px-3 text-right tabular-nums whitespace-nowrap'

// several figures under one label, each with its share of their sum
function SplitCard({ label, parts }) {
  const whole = sumOf(parts.map(([, value]) => ({ value })), 'value')
  return (
    <div className="col-span-2 rounded-lg border border-line bg-surface px-3.5 py-3 md:col-span-3 md:px-5 md:py-4">
      <div className="text-[13px] font-semibold text-muted">{label}</div>
      <dl className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2">
        {parts.map(([name, value]) => (
          <div key={name}>
            <dt className="text-xs text-muted">
              {name} · {share(value, whole)}
            </dt>
            <dd className="text-xl font-semibold text-ink tabular-nums md:text-[22px]">{formatPeso(value)}</dd>
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
  // a null value leaves that key out of the URL
  const update = (next) =>
    setParams(Object.fromEntries(Object.entries({ from, to, group: groupKey, preset: params.get('preset'), ...next }).filter(([, v]) => v != null)), { replace: true })

  // the clicked pill is kept in the URL, as two presets can give the same dates; matching dates is only for links without one
  const named = PRESETS.find(([name]) => name === params.get('preset'))?.[0]
  const preset =
    named ??
    PRESETS.find(([name]) => {
      const r = rangePreset(name, today)
      return r.from === from && r.to === to
    })?.[0]
  const error = from > to ? 'Start date must be before end date' : rangeTooLong(from, to) ? 'Pick a range of 2 years or less' : null
  const invalid = error !== null
  const custom = customOpen || !preset || invalid
  const sales = invalid ? [] : salesInRange(state.sales, from, to)
  const totals = salesTotals(sales)
  const byService = groupBy === 'service'
  const periods = fillPeriods(salesSummary(sales, { groupBy }, state), { from, to, groupBy })
  // retail has no service, so it gets its own row and the rows still add up to the total sales
  const retailQty = sumOf(sales.flatMap((s) => s.lines.filter((l) => l.type === 'product')), 'qty')
  const rows = byService && totals.products ? [...periods, { key: 'retail', label: 'Retail products', total: totals.products, count: retailQty }].sort((a, b) => b.total - a.total) : periods
  const grand = sumOf(rows, 'total')
  const countLabel = byService ? 'Sold' : 'Sales'
  // by service: each service row carries its category, for the colour of its bar and swatch (retail has none)
  const categoryOf = (key) => state.services.find((s) => s.id === key)?.category
  const shown = byService ? rows.map((r) => ({ ...r, category: CATEGORY_BAND[categoryOf(r.key)] ? categoryOf(r.key) : null })) : rows
  const todayKey = toDateStr(today)
  const currentKey = groupBy === 'month' ? todayKey.slice(0, 7) : groupBy === 'day' ? todayKey : null
  const currentShown = rows.some((r) => r.key === currentKey)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header>
        <h1 className="text-[22px] leading-7 font-bold md:text-2xl md:leading-8">Sales report</h1>
        <p className="text-sm text-muted tabular-nums">{invalid ? 'Pick a date range' : rangeLabel(from, to)}</p>
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
                update({ ...rangePreset(name, today), preset: name })
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
              <label key={key} className="flex flex-col gap-1 text-[13px] font-semibold text-muted">
                {label}
                <input
                  type="date"
                  value={value}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? 'range-error' : undefined}
                  onChange={(e) => e.target.value && update({ [key]: e.target.value, preset: null })}
                  className={`${dateInput} ${invalid ? '' : 'border-line'}`}
                />
              </label>
            ))}
            {invalid && (
              <p id="range-error" role="alert" className="flex min-h-11 items-center text-sm text-danger">
                {error}
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

          <section aria-labelledby="report-title" className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3.5 py-2 md:px-5">
              <h2 id="report-title" className="text-[15px] font-semibold">
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
                <div className="px-3.5 md:px-5">
                  {byService && (
                    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      {[...new Set(shown.map((r) => r.category ?? 'Retail'))].map((c) => (
                        <li key={c} className="inline-flex items-center gap-1">
                          <span aria-hidden="true" className="size-2 rounded-sm" style={{ background: categoryFill(c === 'Retail' ? null : c) }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <SalesReportChart rows={shown} ranked={groupBy === 'service' || groupBy === 'employee'} unit={byService ? ['sold', 'sold'] : undefined} currentKey={currentKey} />
                  {currentShown && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
                      <span aria-hidden="true" className="size-2 rounded-sm bg-highlight" />
                      {groupBy === 'month' ? 'This month' : 'Today'}
                    </p>
                  )}
                </div>
                <div tabIndex={0} role="region" aria-label={`Sales by ${groupLabel.toLowerCase()} table`} className="mt-3 overflow-x-auto border-t border-line">
                  <table className="w-full min-w-[420px] border-collapse text-sm">
                    <caption className="sr-only">
                      Sales by {groupLabel.toLowerCase()}, {rangeLabel(from, to)}
                    </caption>
                    <thead>
                      <tr className="text-left text-xs font-semibold text-muted">
                        <th scope="col" className="py-2 pr-3 pl-3.5 md:pl-5">{groupLabel}</th>
                        <th scope="col" className="px-3 py-2 text-right">{countLabel}</th>
                        <th scope="col" className="px-3 py-2 text-right">Total</th>
                        <th scope="col" className="py-2 pr-3.5 pl-3 text-right md:pr-5">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.key} className="border-t border-line">
                          <th scope="row" className="h-11 pr-3 pl-3.5 text-left font-normal md:pl-5">
                            {byService && (
                              <span
                                aria-hidden="true"
                                className={`mr-2 inline-block size-2.5 rounded-sm ${r.category ? CATEGORY_BAND[r.category] : ''}`}
                                style={r.category ? undefined : { background: categoryFill(null) }}
                              />
                            )}
                            {r.label}
                          </th>
                          <td className={`${cell} text-muted`}>{r.count}</td>
                          <td className={`${cell} font-semibold`}>{formatPeso(r.total)}</td>
                          <td className={`${cell} pr-3.5 text-muted md:pr-5`}>{share(r.total, grand)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-ink font-semibold">
                        <th scope="row" className="h-11 pr-3 pl-3.5 text-left md:pl-5">Total</th>
                        <td className={cell}>{sumOf(rows, 'count')}</td>
                        <td className={cell}>{formatPeso(grand)}</td>
                        <td className={`${cell} pr-3.5 md:pr-5`}>100%</td>
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
