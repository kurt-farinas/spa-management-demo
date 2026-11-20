import { useState } from 'react'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'
import { duration } from '../lib/format.js'
import { demoOnly } from '../components/demoOnly.js'
import { PiPlus } from 'react-icons/pi'
import { categoryBand, pillClass, primaryButton, textButton } from '../components/ui.js'

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
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {state.services.length} services · {categories.length} categories
          </p>
        </div>
        <button type="button" className={primaryButton} onClick={demoOnly}>
          <PiPlus aria-hidden="true" className="size-4" />
          Add service
        </button>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {['All', ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={category === c} className={pillClass(category === c)} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
        {shown.map((c) => (
          <section key={c} aria-label={c} className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex min-h-11 items-center gap-2 border-b border-line px-3.5 md:min-h-14 md:px-5">
              <span aria-hidden="true" className={`size-2.5 rounded-sm ${categoryBand(c)}`} />
              <h2 className="text-[15px] font-semibold">{c}</h2>
            </div>
            <ul>
              {state.services
                .filter((s) => s.category === c)
                .map((s) => (
                  <li key={s.id} className="flex gap-3 border-b border-line pr-1.5 last:border-b-0 md:gap-4 md:pr-3">
                    <span aria-hidden="true" className={`w-1 shrink-0 ${categoryBand(c)}`} />
                    <div className="min-w-0 flex-1 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[15px] font-semibold">{s.name}</h3>
                        <span className="shrink-0 text-[15px] font-semibold tabular-nums">{formatPeso(s.price)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                        <span className="tabular-nums">{duration(s.durationMin)}</span>
                        {showRate && <span className="tabular-nums">Commission {Math.round(s.commissionRate * 100)}%</span>}
                        {top.has(s.id) && (
                          <span className="rounded-full bg-highlight/45 px-2.5 py-0.5 text-xs font-semibold text-ink">Most booked this month</span>
                        )}
                      </div>
                    </div>
                    <button type="button" aria-label={`Edit ${s.name}`} className={`${textButton} self-center`} onClick={demoOnly}>
                      Edit
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
