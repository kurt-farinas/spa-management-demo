import { useState } from 'react'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { inventorySummary, stockStatus } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { demoOnly } from '../components/demoOnly.js'
import { StatCard } from '../components/StatCard.jsx'
import { PiMagnifyingGlass, PiPlus, PiWarningBold } from 'react-icons/pi'
import { pillClass, primaryButton, textButton } from '../components/ui.js'

// low and out carry a warning mark as well as the word; out is a stamp, danger on surface 7.07:1
const BADGES = {
  ok: ['OK', 'bg-success-bg text-success'],
  low: ['Low', 'bg-warn-bg text-warn-ink'],
  out: ['Out', 'border border-danger bg-surface text-danger'],
}

function StockBadge({ status }) {
  const [label, badge] = BADGES[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
      {status !== 'ok' && <PiWarningBold aria-hidden="true" className="size-3" />}
      {label}
    </span>
  )
}

export function Inventory() {
  const { state } = useDemoStore()
  const { role } = useRole()
  const [query, setQuery] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const showCost = canSee(role, 'profit')
  const summary = inventorySummary(state)
  const q = query.trim().toLowerCase()
  const rows = state.products.filter(
    (p) => (!lowOnly || stockStatus(p) !== 'ok') && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
  )
  const cell = 'px-2 py-3 text-right tabular-nums md:px-3'

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {summary.products} products · {summary.lowStock} at or below reorder point
          </p>
        </div>
        <button type="button" className={primaryButton} onClick={demoOnly}>
          <PiPlus aria-hidden="true" className="size-4" />
          Add product
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        <StatCard label="Products" value={summary.products} note="In the catalog" />
        <StatCard label="Low stock" value={summary.lowStock} note="Out of stock counted" />
        {showCost && <StatCard label="Stock value at cost" value={formatPeso(summary.stockValueAtCost)} note="Owner only" />}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-[1_1_260px] sm:max-w-sm">
          <label htmlFor="inventory-search" className="sr-only">
            Search products
          </label>
          <PiMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            id="inventory-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or category"
            className="h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-muted"
          />
        </div>
        <button type="button" aria-pressed={lowOnly} onClick={() => setLowOnly(!lowOnly)} className={pillClass(lowOnly)}>
          Low stock only
        </button>
      </div>

      <section aria-label="Products" className="relative min-w-0 overflow-x-auto rounded-lg border border-line bg-surface">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">{q ? `No products match "${query.trim()}"` : 'Nothing is low on stock'}</p>
        ) : (
          <table className="w-full border-collapse text-sm md:min-w-[680px]">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th scope="col" className="py-3 pr-3 pl-3.5 font-semibold md:px-5">
                  Product
                </th>
                <th scope="col" className="hidden px-3 py-3 font-semibold md:table-cell">
                  Category
                </th>
                <th scope="col" className="px-2 py-3 text-right font-semibold md:px-3">
                  Price
                </th>
                {showCost && (
                  <th scope="col" className="px-2 py-3 text-right font-semibold md:px-3">
                    Cost
                  </th>
                )}
                <th scope="col" className="px-2 py-3 text-right font-semibold md:px-3">
                  Stock
                </th>
                <th scope="col" className="hidden px-3 py-3 text-right font-semibold md:table-cell">
                  Reorder at
                </th>
                <th scope="col" className="hidden px-3 py-3 font-semibold md:table-cell">
                  Status
                </th>
                <th scope="col" className="py-3 pr-1.5 md:px-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const status = stockStatus(p)
                return (
                  <tr key={p.id} className="border-t border-line first:border-t-0">
                    <td className="py-3 pr-3 pl-3.5 font-medium md:px-5">
                      {p.name}
                      {/* below md the Category, Reorder at and Status columns are hidden, so they show under the name */}
                      <div className="mt-0.5 text-xs font-normal text-muted md:hidden">
                        {p.category} · reorder at {p.reorderAt}
                      </div>
                      {status !== 'ok' && (
                        <div className="mt-1 md:hidden">
                          <StockBadge status={status} />
                        </div>
                      )}
                    </td>
                    <td className="hidden px-3 py-3 whitespace-nowrap text-muted md:table-cell">{p.category}</td>
                    <td className={cell}>{formatPeso(p.price)}</td>
                    {showCost && <td className={cell}>{formatPeso(p.cost)}</td>}
                    <td className={`${cell} font-medium`}>{p.stock}</td>
                    <td className={`${cell} hidden text-muted md:table-cell`}>{p.reorderAt}</td>
                    <td className="hidden px-3 py-3 md:table-cell">
                      <StockBadge status={status} />
                    </td>
                    <td className="py-1.5 pr-1.5 md:px-5">
                      <div className="flex flex-col items-end md:flex-row md:justify-end">
                        <button type="button" aria-label={`Restock ${p.name}`} className={textButton} onClick={demoOnly}>
                          Restock
                        </button>
                        <button type="button" aria-label={`Edit ${p.name}`} className={textButton} onClick={demoOnly}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
