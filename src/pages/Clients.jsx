import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PiPlus, PiCaretUp, PiCaretDown, PiArrowRight } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { clientSummaries, clientHistory, isNewClient } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { validateClient } from '../lib/validateClient.js'
import { visitDate } from '../lib/format.js'
import { Avatar } from '../components/Avatar.jsx'
import { ClientFacts, ClientHeading, TagLabel } from '../components/ClientParts.jsx'
import { linkClass, pillClass, primaryButton, secondaryButton, textButton } from '../components/ui.js'

const TAGS = ['All', 'VIP', 'Regular', 'New']
// first click on a column: names A–Z, the rest biggest / newest first
const SORTS = {
  name: { label: 'Client', first: 'asc', value: (c) => c.name.toLowerCase() },
  lastVisit: { label: 'Last visit', first: 'desc', value: (c) => c.lastVisit ?? '' },
  totalSpent: { label: 'Total spent', first: 'desc', value: (c) => c.totalSpent },
}

function matches(client, q) {
  const text = q.trim().toLowerCase()
  const digits = text.replace(/ /g, '')
  return !text || client.name.toLowerCase().includes(text) || (/^\d+$/.test(digits) && client.phone.replace(/ /g, '').includes(digits))
}

function sortRows(rows, sort) {
  if (!sort) return rows
  const { value } = SORTS[sort.key]
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => (value(a) < value(b) ? -dir : value(a) > value(b) ? dir : 0))
}

function SortHeader({ column, sort, setSort, className }) {
  const { label, first } = SORTS[column]
  const active = sort?.key === column
  const flip = active ? (sort.dir === 'asc' ? 'desc' : 'asc') : first
  const Icon = active && sort.dir === 'asc' ? PiCaretUp : PiCaretDown
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => setSort({ key: column, dir: flip })}
        className={`inline-flex min-h-11 items-center gap-1 rounded whitespace-nowrap hover:text-ink ${active ? 'text-ink' : ''}`}
      >
        {label}
        <Icon aria-hidden="true" className={`size-3 ${active ? '' : 'opacity-40'}`} />
      </button>
    </th>
  )
}

const EMPTY_FORM = { name: '', phone: '', email: '', birthday: '', notes: '' }
const FIELDS = [
  { key: 'name', label: 'Name', autoComplete: 'name' },
  { key: 'phone', label: 'Mobile number', type: 'tel', autoComplete: 'tel', placeholder: '0917 123 4567', inputMode: 'tel' },
  { key: 'email', label: 'Email', optional: true, type: 'email', autoComplete: 'email' },
  { key: 'birthday', label: 'Birthday', optional: true, type: 'date' },
  { key: 'notes', label: 'Notes', optional: true, multiline: true, placeholder: 'Pressure, allergies, preferences' },
]
const inputClass = 'w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-muted aria-invalid:border-danger'

function AddClientDialog({ dialog, onAdded }) {
  const { addClient } = useDemoStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const downOnBackdrop = useRef(false) // a drag that starts inside the form and ends on the backdrop must not close it

  const reset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
  }
  const submit = (e) => {
    e.preventDefault()
    const found = validateClient(form)
    setErrors(found)
    const firstBad = FIELDS.find((f) => found[f.key])
    if (firstBad) return e.currentTarget.elements[firstBad.key].focus()
    const client = addClient({
      name: form.name.trim(),
      phone: form.phone.replace(/ /g, '').replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3'),
      email: form.email.trim(),
      birthday: form.birthday,
      notes: form.notes.trim(),
    })
    toast.success('Client added')
    dialog.current.close()
    onAdded(client)
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="add-client-title"
      onClose={reset}
      onMouseDown={(e) => (downOnBackdrop.current = e.target === dialog.current)}
      onClick={(e) => e.target === dialog.current && downOnBackdrop.current && dialog.current.close()}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4 p-5">
        <h2 id="add-client-title" className="-mx-5 -mt-1 border-b border-line px-5 pb-4 text-[15px] font-semibold">
          Add client
        </h2>
        {FIELDS.map(({ key, label, optional, multiline, ...input }) => {
          const Field = multiline ? 'textarea' : 'input'
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`client-${key}`} className="text-[13px] font-semibold text-muted">
                {label} {optional && <span className="font-normal text-muted">(optional)</span>}
              </label>
              <Field
                id={`client-${key}`}
                name={key}
                rows={multiline ? 3 : undefined}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                aria-invalid={errors[key] ? true : undefined}
                aria-describedby={errors[key] ? `client-${key}-error` : undefined}
                className={`${inputClass} ${multiline ? 'py-2.5' : 'h-11'} ${errors[key] ? '' : 'border-line'}`}
                {...input}
              />
              {errors[key] && (
                <p id={`client-${key}-error`} className="text-xs text-danger">
                  {errors[key]}
                </p>
              )}
            </div>
          )
        })}
        <div className="mt-1 flex gap-2">
          <button type="submit" className={primaryButton}>
            Save client
          </button>
          <button type="button" onClick={() => dialog.current.close()} className={secondaryButton}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  )
}

function Preview({ client, history, today }) {
  return (
    <section aria-label={`${client.name} profile`} className="rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-6">
      <ClientHeading client={client} />
      <div className="mt-[18px]">
        <ClientFacts client={client} />
      </div>
      <h3 className="mt-5 mb-1 text-[13px] font-semibold text-muted">Recent visits</h3>
      {history.length === 0 ? (
        <p className="text-[13px] text-muted">No visits yet</p>
      ) : (
        <ul>
          {history.slice(0, 3).map((h) => (
            <li key={h.id} className="flex justify-between gap-3 border-b border-line py-2 text-[13px] last:border-b-0">
              <span className="min-w-0">
                {visitDate(h.date, today)} · {h.serviceNames || 'Products only'}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPeso(h.total)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4">
        <Link to={`/appointments?client=${client.id}`} className={linkClass}>
          Book again
        </Link>
        <Link to={`/clients/${client.id}`} className={`${linkClass} gap-1.5`}>
          Full profile
          <PiArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}

export function Clients() {
  const { state } = useDemoStore()
  const dialog = useRef(null)
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('All')
  const [sort, setSort] = useState(null) // null keeps list order: newest client first
  const [selectedId, setSelectedId] = useState(null)

  const today = new Date()
  const all = clientSummaries(state, today)
  const rows = sortRows(
    all.filter((c) => (tag === 'All' || c.tags.includes(tag)) && matches(c, query)),
    sort,
  )
  const selected = rows.find((c) => c.id === selectedId) ?? rows[0]
  const newCount = all.filter((c) => isNewClient(c, today)).length

  const added = (client) => {
    setQuery('')
    setTag('All')
    setSort(null)
    setSelectedId(client.id)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {all.length} {all.length === 1 ? 'client' : 'clients'} · {newCount} new in the last 30 days
          </p>
        </div>
        <button type="button" onClick={() => dialog.current.showModal()} className={primaryButton}>
          <PiPlus aria-hidden="true" className="size-4" />
          Add client
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2.5">
        <label htmlFor="client-search" className="sr-only">
          Search clients
        </label>
        <input
          id="client-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone"
          className="h-11 min-w-0 flex-[1_1_260px] rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted"
        />
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
              className={pillClass(tag === t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <section aria-label="Client list" className="min-w-0 overflow-x-auto rounded-lg border border-line bg-surface lg:col-span-2">
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center">
              {query.trim() ? (
                <>
                  <p className="text-sm">No clients match "{query.trim()}"</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className={`${secondaryButton} mt-3`}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted">No {tag} clients yet</p>
              )}
            </div>
          ) : (
            // below md, phone and last visit fold under the name so the table fits a phone
            <table className="w-full border-collapse text-sm md:min-w-[560px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <SortHeader column="name" sort={sort} setSort={setSort} className="px-3.5 md:px-5" />
                  <th scope="col" className="px-3 font-semibold max-md:hidden">Phone</th>
                  <SortHeader column="lastVisit" sort={sort} setSort={setSort} className="px-3 max-md:hidden" />
                  <th scope="col" className="px-3 text-right font-semibold">Visits</th>
                  <SortHeader column="totalSpent" sort={sort} setSort={setSort} className="px-3.5 text-right md:px-5" />
                  <th scope="col" className="hidden px-5 lg:table-cell">
                    <span className="sr-only">Preview</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const current = c.id === selected?.id
                  return (
                    <tr key={c.id} className={`relative border-b border-line last:border-b-0 hover:bg-soft ${current ? 'lg:bg-soft' : ''}`}>
                      <td className="px-3.5 py-3 md:px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} />
                          <span className="min-w-0">
                            {/* the link covers the whole row */}
                            <Link
                              to={`/clients/${c.id}`}
                              className="block font-semibold after:absolute after:inset-0 after:content-['']"
                            >
                              {c.name}
                            </Link>
                            <TagLabel tags={c.tags} />
                            {/* wrap between tokens, never inside a date */}
                            <span className="block text-xs text-muted tabular-nums md:hidden">
                              <span className="block whitespace-nowrap">{c.phone}</span> <span className="block whitespace-nowrap">Last visit {visitDate(c.lastVisit, today)}</span>
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap tabular-nums max-md:hidden">{c.phone}</td>
                      <td className="px-3 py-3 whitespace-nowrap tabular-nums max-md:hidden">{visitDate(c.lastVisit, today)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{c.visits}</td>
                      <td className="px-3.5 py-3 text-right font-semibold whitespace-nowrap tabular-nums md:px-5">{formatPeso(c.totalSpent)}</td>
                      <td className="relative hidden px-5 py-3 text-right lg:table-cell">
                        <button
                          type="button"
                          aria-label={`Preview ${c.name}`}
                          aria-pressed={current}
                          onClick={() => setSelectedId(c.id)}
                          className={textButton}
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        {selected && (
          <div className="hidden lg:block">
            <Preview client={selected} history={clientHistory(state, selected.id)} today={today} />
          </div>
        )}
      </div>

      <AddClientDialog dialog={dialog} onAdded={added} />
    </div>
  )
}
