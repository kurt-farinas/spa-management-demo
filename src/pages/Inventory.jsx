import { useState } from 'react'
import { useDemoStore } from '../data/DemoStore.jsx'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'
import { inventorySummary, stockStatus } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { demoOnly } from '../components/demoOnly.js'
import { StatCard } from '../components/StatCard.jsx'
import { pillClass, primaryButton, textButton } from '../components/ui.js'

// Out badge: white on danger is 7.07:1 (needs 4.5:1)
const BADGES = {
  ok: ['OK', 'bg-success-bg text-success'],
  low: ['Low', 'bg-warn-bg text-warn-ink'],
  out: ['Out', 'bg-danger text-white'],
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
  const cell = 'px-3 py-3 text-right tabular-nums'

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] text-muted">
            {summary.products} products · {summary.lowStock} at or below reorder point
          </div>
          <h1 className="mt-1 font-heading text-[26px] font-medium md:text-[32px]">Inventory</h1>
        </div>
        <button type="button" className={primaryButton} onClick={demoOnly}>
          + Add product
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <StatCard label="Products" value={summary.products} note="In the catalog" />
        <StatCard label="Low stock" value={summary.lowStock} note="Out of stock counted" />
        {showCost && <StatCard dark label="Stock value at cost" value={formatPeso(summary.stockValueAtCost)} note="Owner only" />}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label htmlFor="inventory-search" className="sr-only">
          Search products
        </label>
        <input
          id="inventory-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or category"
          className="h-11 min-w-0 flex-[1_1_260px] rounded-full border border-lavender bg-surface px-4 text-sm text-ink placeholder:text-muted"
        />
        <button type="button" aria-pressed={lowOnly} onClick={() => setLowOnly(!lowOnly)} className={pillClass(lowOnly)}>
          Low stock only
        </button>
      </div>

      <section aria-label="Products" className="relative min-w-0 overflow-x-auto rounded-2xl border border-tint bg-surface">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">{q ? `No products match "${query.trim()}"` : 'Nothing is low on stock'}</p>
        ) : (
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="px-5 py-3 font-medium">Product</th>
                <th scope="col" className="px-3 py-3 font-medium">Category</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Price</th>
                {showCost && <th scope="col" className="px-3 py-3 text-right font-medium">Cost</th>}
                <th scope="col" className="px-3 py-3 text-right font-medium">Stock</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Reorder at</th>
                <th scope="col" className="px-3 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const [label, badge] = BADGES[stockStatus(p)]
                return (
                  <tr key={p.id} className="border-t border-tint">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted">{p.category}</td>
                    <td className={cell}>{formatPeso(p.price)}</td>
                    {showCost && <td className={cell}>{formatPeso(p.cost)}</td>}
                    <td className={`${cell} font-medium`}>{p.stock}</td>
                    <td className={`${cell} text-muted`}>{p.reorderAt}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>{label}</span>
                    </td>
                    <td className="px-5 py-1.5 text-right whitespace-nowrap">
                      <button type="button" aria-label={`Restock ${p.name}`} className={textButton} onClick={demoOnly}>
                        Restock
                      </button>
                      <button type="button" aria-label={`Edit ${p.name}`} className={textButton} onClick={demoOnly}>
                        Edit
                      </button>
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
