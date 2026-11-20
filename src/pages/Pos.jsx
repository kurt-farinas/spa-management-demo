import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PiMinus, PiPlus, PiX } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { cartTotal } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { clock, duration, monthDay, nameOf } from '../lib/format.js'
import { pillClass, primaryButton } from '../components/ui.js'

const TABS = ['Services', 'Packages', 'Products']
const PAYMENTS = [
  ['cash', 'Cash'],
  ['card', 'Card'],
  ['gcash', 'GCash'],
]
const LOW_HINT = 3 // warn once the sale comes within this many of the shelf count
const selectClass = 'h-11 w-full rounded-xl border bg-surface px-3 text-sm text-ink aria-invalid:border-danger'
const roundButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-lavender bg-surface text-ink hover:border-plum-light disabled:border-tint disabled:text-muted'

function Tile({ item, meta, out, inSale, onAdd }) {
  return (
    <button
      type="button"
      disabled={out}
      onClick={onAdd}
      className={`flex min-h-[104px] flex-col items-start rounded-[14px] bg-surface text-left text-ink disabled:cursor-not-allowed disabled:bg-page ${
        inSale ? 'border-2 border-gold p-[15px]' : 'border border-tint p-4 hover:border-lavender'
      }`}
    >
      <span className="text-xs text-muted">{out ? 'Out of stock' : meta}</span>
      <span className="mt-1 font-medium">{item.name}</span>
      <span className="mt-auto flex w-full items-baseline justify-between gap-2 pt-2.5">
        <span className={`font-semibold tabular-nums ${out ? 'text-muted' : 'text-gold-text'}`}>{formatPeso(item.price)}</span>
        {inSale && <span className="text-xs text-gold-text">{inSale}</span>}
      </span>
    </button>
  )
}

function Receipt({ sale, state, onNew }) {
  const heading = useRef(null)
  useEffect(() => heading.current?.focus(), [])
  const payment = PAYMENTS.find(([key]) => key === sale.payment)[1]
  return (
    <section aria-label="Receipt" className="flex flex-col gap-3.5">
      <h2 ref={heading} tabIndex={-1} className="font-heading text-[22px] font-medium">
        Sale complete
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-muted">Receipt</dt>
        <dd className="text-right tabular-nums">{sale.id}</dd>
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
      <ul className="border-t border-tint pt-1.5">
        {sale.lines.map((l) => (
          <li key={`${l.type}-${l.id}`} className="flex justify-between gap-3 py-1.5 text-sm">
            <span className="min-w-0">
              {l.qty > 1 && <span className="tabular-nums">{l.qty} × </span>}
              {l.name}
            </span>
            <span className="shrink-0 tabular-nums">{formatPeso(l.qty * l.unitPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-tint pt-3.5">
        <span className="text-sm text-muted">Paid by {payment}</span>
        <span className="font-heading text-[30px] tabular-nums">{formatPeso(sale.total)}</span>
      </div>
      <button type="button" onClick={onNew} className={`${primaryButton} justify-center`}>
        New sale
      </button>
    </section>
  )
}

export function Pos() {
  const { state, checkout } = useDemoStore()
  const [tab, setTab] = useState('Services')
  const [query, setQuery] = useState('')
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
  const items = (type === 'product' ? state.products : state.services.filter((s) => (s.category === 'Package') === (tab === 'Packages'))).filter(
    (x) => !q || x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q),
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
    <div className="grid grid-cols-1 items-start gap-6 pb-12 md:pb-0 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <section aria-label="Catalog" className="flex min-w-0 flex-col gap-[18px]">
        <h1 className="font-heading text-[26px] font-medium md:text-[32px]">Point of Sale</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Catalog section" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={pillClass(tab === t)}>
                {t}
              </button>
            ))}
          </div>
          <label htmlFor="pos-search" className="sr-only">
            Search {tab.toLowerCase()}
          </label>
          <input
            id="pos-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab.toLowerCase()}`}
            className="h-11 min-w-0 flex-[1_1_200px] rounded-full border border-lavender bg-surface px-4 text-sm text-ink placeholder:text-muted"
          />
        </div>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-tint bg-surface px-5 py-10 text-center text-sm text-muted">
            {q ? `No ${tab.toLowerCase()} match "${query.trim()}"` : `No ${tab.toLowerCase()} yet`}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {items.map((item) => {
              const line = lineOf(type, item.id)
              return type === 'product' ? (
                <Tile
                  key={item.id}
                  item={item}
                  meta={`${item.category} · ${item.stock} in stock`}
                  out={item.stock <= 0}
                  inSale={line && `${line.qty} in sale`}
                  onAdd={() => add(item)}
                />
              ) : (
                <Tile key={item.id} item={item} meta={`${item.category} · ${duration(item.durationMin)}`} inSale={line && 'In sale'} onAdd={() => add(item)} />
              )
            })}
          </div>
        )}
      </section>

      <aside
        ref={panel}
        aria-label="Current sale"
        className="flex scroll-mt-4 flex-col gap-3.5 rounded-2xl border border-tint bg-surface p-[22px] lg:sticky lg:top-6"
      >
        {sale ? (
          <Receipt key={sale.id} sale={sale} state={state} onNew={() => {
              refocus.current = true
              setSale(null)
            }} />
        ) : (
          <>
            <h2 ref={panelHeading} tabIndex={-1} className="font-heading text-[22px] font-medium">
              Current sale
            </h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pos-client" className="text-xs text-muted">
                Client
              </label>
              <select id="pos-client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={`${selectClass} border-lavender`}>
                <option value="">Walk-in</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.tags.includes('VIP') ? ' (VIP)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pos-therapist" className="text-xs text-muted">
                Therapist
              </label>
              <select
                id="pos-therapist"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value)
                  setErrors(({ therapist, ...rest }) => rest)
                }}
                aria-invalid={errors.therapist ? true : undefined}
                aria-describedby={errors.therapist ? 'pos-therapist-error' : undefined}
                className={`${selectClass} ${errors.therapist ? '' : 'border-lavender'}`}
              >
                <option value="">{lines.some((l) => l.type === 'service') ? 'Choose a therapist' : 'None (products only)'}</option>
                {therapists.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              {errors.therapist && (
                <p id="pos-therapist-error" role="alert" className="text-xs text-danger">
                  {errors.therapist}
                </p>
              )}
            </div>

            <div className="border-t border-tint pt-1.5">
              {lines.length === 0 ? (
                <p className="py-3 text-sm text-muted">Tap a service or product to add it.</p>
              ) : (
                <ul>
                  {lines.map((l) => {
                    const item = itemOf(l)
                    return (
                      <li key={`${l.type}-${l.id}`} className="py-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="min-w-0 flex-1">{item.name}</span>
                          {l.type === 'product' ? (
                            <span className="inline-flex items-center gap-1">
                              <button type="button" aria-label={`One less ${item.name}`} onClick={() => setQty(l, l.qty - 1)} className={roundButton}>
                                <PiMinus aria-hidden="true" className="size-4" />
                              </button>
                              <span aria-label={`Quantity ${l.qty}`} className="w-6 text-center tabular-nums">
                                {l.qty}
                              </span>
                              <button
                                type="button"
                                aria-label={`One more ${item.name}`}
                                disabled={l.qty >= item.stock}
                                onClick={() => setQty(l, l.qty + 1)}
                                className={roundButton}
                              >
                                <PiPlus aria-hidden="true" className="size-4" />
                              </button>
                            </span>
                          ) : (
                            <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setQty(l, 0)} className={`${roundButton} border-transparent`}>
                              <PiX aria-hidden="true" className="size-4" />
                            </button>
                          )}
                          <span className="w-[4.5rem] shrink-0 text-right tabular-nums">{formatPeso(l.qty * item.price)}</span>
                        </div>
                        {l.type === 'product' && item.stock - l.qty <= LOW_HINT && (
                          <p className="text-xs text-gold-text">Only {item.stock} left in stock</p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-baseline justify-between border-t border-tint pt-3.5">
              <span className="text-sm text-muted">Total</span>
              <span className="font-heading text-[30px] tabular-nums">{formatPeso(total)}</span>
            </div>

            <fieldset aria-describedby={errors.payment ? 'pos-payment-error' : undefined}>
              <legend className="mb-2 text-xs text-muted">Payment</legend>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENTS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={payment === key}
                    onClick={() => {
                      setPayment(key)
                      setErrors(({ payment, ...rest }) => rest)
                    }}
                    className={`h-11 rounded-xl text-sm text-ink ${
                      payment === key ? 'border-2 border-plum bg-tint font-medium' : `border bg-surface hover:border-plum-light ${errors.payment ? 'border-danger' : 'border-lavender'}`
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.payment && (
                <p id="pos-payment-error" role="alert" className="mt-1.5 text-xs text-danger">
                  {errors.payment}
                </p>
              )}
            </fieldset>

            {errors.cart && (
              <p role="alert" className="text-sm text-danger">
                {errors.cart}
              </p>
            )}
            <button
              type="button"
              onClick={complete}
              className="h-[52px] rounded-full bg-plum text-base font-semibold text-gold-on-plum tabular-nums hover:bg-plum-light"
            >
              Complete sale · {formatPeso(total)}
            </button>
          </>
        )}
      </aside>

      {lines.length > 0 && !sale && (
        <button
          type="button"
          onClick={viewSale}
          className="fixed inset-x-4 bottom-[4.75rem] z-10 h-12 rounded-full bg-plum text-sm font-semibold text-gold-on-plum tabular-nums shadow-[0_6px_16px_-4px] shadow-plum-dark/40 md:hidden"
        >
          View sale ({count}) · {formatPeso(total)}
        </button>
      )}
    </div>
  )
}
