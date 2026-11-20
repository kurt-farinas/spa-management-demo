import { useState } from 'react'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'
import { duration } from '../lib/format.js'
import { demoOnly } from '../components/demoOnly.js'
import { pillClass, primaryButton, textButton } from '../components/ui.js'

// top 3 service ids by qty sold this month; services nobody booked get no badge
function mostBooked(sales, month) {
  const qty = new Map()
  for (const s of sales) {
    if (!s.date.startsWith(month)) continue
    for (const l of s.lines) if (l.type === 'service') qty.set(l.id, (qty.get(l.id) ?? 0) + l.qty)
  }
  return new Set([...qty].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id))
}

export function Services() {
  const { state } = useDemoStore()
  const { role } = useRole()
  const [category, setCategory] = useState('All')
  const categories = [...new Set(state.services.map((s) => s.category))]
  const top = mostBooked(state.sales, toDateStr(new Date()).slice(0, 7))
  const showRate = canSee(role, 'commission')
  const shown = categories.filter((c) => category === 'All' || c === category)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] text-muted">
            {state.services.length} services · {categories.length} categories
          </div>
          <h1 className="mt-1 font-heading text-[32px] font-medium">Services</h1>
        </div>
        <button type="button" className={primaryButton} onClick={demoOnly}>
          + Add service
        </button>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {['All', ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={category === c} className={pillClass(category === c)} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {shown.map((c) => (
          <section key={c} aria-label={c} className="rounded-2xl border border-tint bg-surface px-5 pt-5 pb-2 md:px-7 md:pt-6">
            <h2 className="border-b border-lavender pb-3 font-heading text-[22px] font-medium">{c}</h2>
            <ul>
              {state.services
                .filter((s) => s.category === c)
                .map((s) => (
                  <li key={s.id} className="border-b border-tint py-3.5 last:border-b-0">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-heading text-[17px] font-medium">{s.name}</h3>
                      <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-4px] border-b border-dotted border-lavender" />
                      <span className="shrink-0 font-heading text-[17px] text-ink tabular-nums">{formatPeso(s.price)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="tabular-nums">{duration(s.durationMin)}</span>
                      {showRate && <span className="tabular-nums">Commission {Math.round(s.commissionRate * 100)}%</span>}
                      {top.has(s.id) && <span className="rounded-full bg-warn-bg px-2.5 py-0.5 font-medium text-gold-text">Most booked this month</span>}
                      <button
                        type="button"
                        aria-label={`Edit ${s.name}`}
                        className={`${textButton} ml-auto`}
                        onClick={demoOnly}
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
