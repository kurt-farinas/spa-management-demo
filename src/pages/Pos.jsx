import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiCheck, PiMagnifyingGlass, PiMinus, PiPlus, PiX } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { cartTotal } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { clock, duration, monthDay, nameOf } from '../lib/format.js'
import { CATEGORY_BAND, categoryBand, pillClass } from '../components/ui.js'

const TABS = ['Services', 'Packages', 'Products']
const PAYMENTS = [
  ['cash', 'Cash'],
  ['card', 'Card'],
  ['gcash', 'GCash'],
]
const LOW_HINT = 3 // warn once the sale comes within this many of the shelf count
const selectClass = 'h-11 w-full min-w-0 rounded-md border bg-surface px-3 text-sm font-medium text-ink aria-invalid:border-danger'
const fieldClass = 'grid grid-cols-[76px_minmax(0,1fr)] items-center gap-y-1 text-[13px] font-medium text-muted'
const stepButton = 'inline-flex size-11 shrink-0 items-center justify-center text-ink hover:bg-soft disabled:text-muted disabled:hover:bg-transparent'
// one colour job per finished sale: amber with ink text, never white on amber
const completeButton = 'h-[52px] rounded-md bg-accent text-base font-bold text-ink tabular-nums hover:brightness-95'

function Tile({ item, meta, out, inSale, onAdd }) {
  return (
    <button
      type="button"
      disabled={out}
      onClick={onAdd}
      className={`relative flex min-h-[118px] flex-col items-start gap-0.5 overflow-hidden rounded-lg border px-4 pt-4 pb-3.5 text-left text-ink disabled:cursor-not-allowed disabled:bg-page ${
        inSale ? 'border-highlight bg-highlight/10' : 'border-line bg-surface hover:border-rail-active'
      }`}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${categoryBand(item.category)}`} />
      <span className="pr-10 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{item.category}</span>
      <span className="mt-0.5 text-[15px] leading-5 font-semibold">{item.name}</span>
      <span className="text-[13px] text-muted">{out ? 'Out of stock' : meta}</span>
      <span className={`mt-auto pt-2 text-base font-semibold tabular-nums ${out ? 'text-muted' : ''}`}>{formatPeso(item.price)}</span>
      {inSale > 0 && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-highlight py-px pr-2 pl-1.5 text-xs font-bold text-ink tabular-nums">
          <PiCheck aria-hidden="true" className="size-3" />
          {inSale}
          <span className="sr-only"> in sale</span>
        </span>
      )}
    </button>
  )
}

function Receipt({ sale, state, onNew }) {
  const heading = useRef(null)
  useEffect(() => heading.current?.focus(), [])
  const payment = PAYMENTS.find(([key]) => key === sale.payment)[1]
  return (
    <section aria-label="Receipt" className="flex flex-col gap-4 p-6">
      <h2 ref={heading} tabIndex={-1} className="text-lg font-bold">
        Sale complete
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-muted">Receipt</dt>
        <dd className="text-right font-semibold tabular-nums">{sale.id}</dd>
        <dt className="text-muted">Date</dt>
        <dd className="text-right tabular-nums">
          {monthDay(sale.date)}, {clock(sale.date.slice(11))}
        </dd>
        <dt className="text-muted">Client</dt>
        <dd className="text-right">{sale.clientId ? nameOf(state.clients, sale.clientId) : 'Walk-in'}</dd>
        {sale.employeeId && (
          <>
            <dt className="text-muted">Therapist</dt>
            <dd className="text-right">{nameOf(state.employees, sale.employeeId)}</dd>
          </>
        )}
      </dl>
      <ul className="border-t border-line pt-1.5">
        {sale.lines.map((l) => (
          <li key={`${l.type}-${l.id}`} className="flex justify-between gap-3 py-1.5 text-sm">
            <span className="min-w-0">
              {l.qty > 1 && <span className="tabular-nums">{l.qty} × </span>}
              {l.name}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatPeso(l.qty * l.unitPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-sm text-muted">Paid by {payment}</span>
        <span className="text-[32px] leading-10 font-bold tabular-nums">{formatPeso(sale.total)}</span>
      </div>
      <button type="button" onClick={onNew} className={completeButton}>
        New sale
      </button>
    </section>
  )
}

export function Pos() {
  const { state, checkout } = useDemoStore()
  const [tab, setTab] = useState('Services')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [lines, setLines] = useState([])
  const [clientId, setClientId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [payment, setPayment] = useState(null)
  const [errors, setErrors] = useState({})
  const [sale, setSale] = useState(null)
  const panel = useRef(null)
  const panelHeading = useRef(null)
  const refocus = useRef(false)

  const q = query.trim().toLowerCase()
  const type = tab === 'Products' ? 'product' : 'service'
  const tabItems = type === 'product' ? state.products : state.services.filter((s) => (s.category === 'Package') === (tab === 'Packages'))
  const categories = [...new Set(tabItems.map((x) => x.category))]
  const items = tabItems.filter(
    (x) => (!category || x.category === category) && (!q || x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q)),
  )
  const clients = [...state.clients].sort((a, b) => a.name.localeCompare(b.name))
  const therapists = state.employees.filter((e) => e.role === 'Therapist')
  const itemOf = (l) => (l.type === 'service' ? state.services : state.products).find((x) => x.id === l.id)
  const lineOf = (t, id) => lines.find((l) => l.type === t && l.id === id)
  const total = cartTotal(state, lines)
  const count = lines.reduce((n, l) => n + l.qty, 0)

  const change = (next) => {
    setLines(next)
    setErrors(({ cart, ...rest }) => rest)
  }
  const setQty = (line, qty) => change(qty < 1 ? lines.filter((l) => l !== line) : lines.map((l) => (l === line ? { ...l, qty } : l)))
  const add = (item) => {
    setSale(null)
    const line = lineOf(type, item.id)
    if (!line) change([...lines, { type, id: item.id, qty: 1 }])
    else if (type === 'product' && line.qty < item.stock) setQty(line, line.qty + 1) // services stay at 1
  }

  const complete = () => {
    if (!lines.length) return setErrors({ cart: 'Add at least one item' })
    const found = {}
    if (lines.some((l) => l.type === 'service') && !employeeId) found.therapist = 'Pick a therapist'
    if (!payment) found.payment = 'Pick a payment method'
    if (Object.keys(found).length) return setErrors(found)
    const result = checkout({ clientId: clientId || null, employeeId: employeeId || null, lines, payment })
    if (!result.ok) return setErrors({ cart: result.error })
    toast.success(`Sale complete · ${formatPeso(result.sale.total)}`)
    setLines([])
    setClientId('')
    setEmployeeId('')
    setPayment(null)
    setErrors({})
    setSale(result.sale)
  }

  // after "New sale" the receipt is gone: put focus on the sale panel heading
  useEffect(() => {
    if (!sale && refocus.current) {
      refocus.current = false
      panelHeading.current?.focus()
    }
  }, [sale])

  const viewSale = () => {
    panel.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    panelHeading.current?.focus({ preventScroll: true })
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 pb-12 md:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
      <section aria-label="Catalog" className="flex min-w-0 flex-col gap-4">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex flex-wrap items-end justify-between gap-x-4 border-b border-line">
          <div role="group" aria-label="Catalog section" className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => {
                  setTab(t)
                  setCategory(null)
                }}
                className={`-mb-px min-h-11 border-b-2 px-3 text-sm font-semibold ${tab === t ? 'border-rail text-ink' : 'border-transparent text-muted hover:text-ink'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative mb-2 w-full sm:w-[280px]">
            <label htmlFor="pos-search" className="sr-only">
              Search {tab.toLowerCase()}
            </label>
            <PiMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              id="pos-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}`}
              className="h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-muted"
            />
          </div>
        </div>
        {categories.length > 1 && (
          <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
            {[null, ...categories].map((c) => (
              <button key={c ?? 'all'} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={`${pillClass(category === c)} gap-1.5 font-semibold`}>
                {CATEGORY_BAND[c] && <span aria-hidden="true" className={`size-2 rounded-[2px] ${CATEGORY_BAND[c]}`} />}
                {c ?? 'All'}
              </button>
            ))}
          </div>
        )}
        {items.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface px-5 py-10 text-center text-sm text-muted">
            {q ? `No ${tab.toLowerCase()} match "${query.trim()}"` : `No ${tab.toLowerCase()} yet`}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-4">
            {items.map((item) => (
              <Tile
                key={item.id}
                item={item}
                meta={type === 'product' ? `${item.stock} in stock` : duration(item.durationMin)}
                out={type === 'product' && item.stock <= 0}
                inSale={lineOf(type, item.id)?.qty}
                onAdd={() => add(item)}
              />
            ))}
          </div>
        )}
      </section>

      <aside ref={panel} aria-label="Current sale" className="flex scroll-mt-4 flex-col rounded-lg border border-line bg-surface lg:sticky lg:top-6">
        {sale ? (
          <Receipt key={sale.id} sale={sale} state={state} onNew={() => {
              refocus.current = true
              setSale(null)
            }} />
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-line px-6 pt-5 pb-4">
              <h2 ref={panelHeading} tabIndex={-1} className="text-lg font-bold">
                Current sale
              </h2>
              <div className={fieldClass}>
                <label htmlFor="pos-client">Client</label>
                <select id="pos-client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={`${selectClass} border-line`}>
                  <option value="">Walk-in</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.tags.includes('VIP') ? ' (VIP)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={fieldClass}>
                <label htmlFor="pos-therapist">Therapist</label>
                <select
                  id="pos-therapist"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value)
                    setErrors(({ therapist, ...rest }) => rest)
                  }}
                  aria-invalid={errors.therapist ? true : undefined}
                  aria-describedby={errors.therapist ? 'pos-therapist-error' : undefined}
                  className={`${selectClass} ${errors.therapist ? '' : 'border-line'}`}
                >
                  <option value="">{lines.some((l) => l.type === 'service') ? 'Choose a therapist' : 'None (products only)'}</option>
                  {therapists.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                {errors.therapist && (
                  <p id="pos-therapist-error" role="alert" className="col-start-2 text-xs font-semibold text-danger">
                    {errors.therapist}
                  </p>
                )}
              </div>
            </div>

            {lines.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted">Tap a service or product to add it.</p>
            ) : (
              <ul>
                {lines.map((l) => {
                  const item = itemOf(l)
                  return (
                    <li key={`${l.type}-${l.id}`} className="grid grid-cols-[minmax(0,1fr)_auto_4.5rem] items-center gap-3 border-b border-line px-6 py-2.5">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-semibold">{item.name}</span>
                        <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                          {l.type === 'product' ? (
                            <>
                              Product ·
                              {item.stock - l.qty <= LOW_HINT ? (
                                <span className="font-semibold text-accent-ink">Only {item.stock} left in stock</span>
                              ) : (
                                <span className="tabular-nums">{item.stock} in stock</span>
                              )}
                            </>
                          ) : (
                            <>
                              <span aria-hidden="true" className={`size-2 rounded-[2px] ${categoryBand(item.category)}`} />
                              {item.category} · {duration(item.durationMin)}
                            </>
                          )}
                        </span>
                      </div>
                      {l.type === 'product' ? (
                        <span className="inline-flex items-center rounded-md border border-line">
                          <button type="button" aria-label={`One less ${item.name}`} onClick={() => setQty(l, l.qty - 1)} className={`${stepButton} rounded-l-md`}>
                            <PiMinus aria-hidden="true" className="size-4" />
                          </button>
                          <span aria-label={`Quantity ${l.qty}`} className="w-8 self-stretch border-x border-line text-center leading-[44px] font-semibold tabular-nums">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`One more ${item.name}`}
                            disabled={l.qty >= item.stock}
                            onClick={() => setQty(l, l.qty + 1)}
                            className={`${stepButton} rounded-r-md`}
                          >
                            <PiPlus aria-hidden="true" className="size-4" />
                          </button>
                        </span>
                      ) : (
                        <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setQty(l, 0)} className={`${stepButton} rounded-md text-muted hover:text-ink`}>
                          <PiX aria-hidden="true" className="size-4" />
                        </button>
                      )}
                      <span className="text-right font-semibold tabular-nums">{formatPeso(l.qty * item.price)}</span>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="flex flex-col gap-3 px-6 pt-4 pb-6">
              <div className="flex justify-between text-muted">
                <span>
                  Subtotal · <span className="tabular-nums">{count}</span> {count === 1 ? 'item' : 'items'}
                </span>
                <span className="font-semibold tabular-nums">{formatPeso(total)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-base font-bold">Total</span>
                <span className="text-[32px] leading-10 font-bold tabular-nums">{formatPeso(total)}</span>
              </div>

              <fieldset aria-describedby={errors.payment ? 'pos-payment-error' : undefined}>
                <legend className="mb-2 text-[13px] font-medium text-muted">Payment method</legend>
                <div className={`grid grid-cols-3 gap-[3px] rounded-lg border bg-page p-[3px] ${errors.payment ? 'border-danger' : 'border-line'}`}>
                  {PAYMENTS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={payment === key}
                      onClick={() => {
                        setPayment(key)
                        setErrors(({ payment, ...rest }) => rest)
                      }}
                      className={`h-11 rounded-md text-sm font-semibold ${payment === key ? 'bg-rail text-rail-ink' : 'text-ink hover:bg-surface'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.payment && (
                  <p id="pos-payment-error" role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                    {errors.payment}
                  </p>
                )}
              </fieldset>

              {errors.cart && (
                <p role="alert" className="rounded-md bg-warn-bg px-3 py-2 text-sm font-semibold text-warn-ink">
                  {errors.cart}
                </p>
              )}
              <button type="button" onClick={complete} className={completeButton}>
                Complete sale · {formatPeso(total)}
              </button>
            </div>
          </>
        )}
      </aside>

      {lines.length > 0 && !sale && (
        <button
          type="button"
          onClick={viewSale}
          className="fixed inset-x-4 bottom-[4.75rem] z-10 h-12 rounded-md bg-rail text-sm font-semibold text-rail-ink tabular-nums shadow-[0_6px_16px_-4px] shadow-rail-active/40 md:hidden"
        >
          View sale ({count}) · {formatPeso(total)}
        </button>
      )}
    </div>
  )
}
