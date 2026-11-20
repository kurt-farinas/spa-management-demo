import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PiPlus, PiCaretLeft, PiCaretRight, PiCaretDown } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { weekDays, appointmentsInRange, validateBookingForm, isActiveBooking, weekdayOf, SPA_OPEN, SPA_CLOSE } from '../data/selectors.js'
import { toDateStr, addDays, addMinutes } from '../data/dates.js'
import { clock, monthDay, nameOf } from '../lib/format.js'
import { demoOnly } from '../components/demoOnly.js'
import { linkClass, pillClass, STATUS_PILL } from '../components/ui.js'

const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const OPEN_MIN = minutes(SPA_OPEN)
const PX_PER_MIN = 48 / 30 // one 30-minute row is 48px
const GRID_HEIGHT = (minutes(SPA_CLOSE) - OPEN_MIN) * PX_PER_MIN
const HOURS = Array.from({ length: (minutes(SPA_CLOSE) - OPEN_MIN) / 60 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`)
const pad = (n) => String(n).padStart(2, '0')
// 10:00 … 19:30 every 15 minutes
const TIMES = Array.from({ length: (minutes(SPA_CLOSE) - OPEN_MIN) / 15 - 1 }, (_, i) => {
  const m = OPEN_MIN + i * 15
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
})
const longDay = (date) => new Date(`${date}T00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
// 'Monday 16 November'
const fullDay = (date) => {
  const d = new Date(`${date}T00:00`)
  return `${d.toLocaleDateString('en-US', { weekday: 'long' })} ${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'long' })}`
}
const works = (employee, date) => employee.schedule?.includes(weekdayOf(date))
const span = (a) => `${clock(a.start.slice(11))} – ${clock(addMinutes(a.start, a.durationMin).slice(11))}`
const iconButton = 'inline-flex size-11 items-center justify-center rounded-full border border-lavender bg-surface text-ink hover:border-plum-light'
const inputClass = 'h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-ink aria-invalid:border-danger'

// side-by-side lanes for blocks that overlap (a booking over a cancelled one); each cluster shares its lane count
function withLanes(items) {
  const out = []
  let cluster = []
  let laneEnds = []
  let clusterEnd = ''
  const flush = () => cluster.forEach((x) => (x.lanes = laneEnds.length))
  for (const a of items) {
    const end = addMinutes(a.start, a.durationMin)
    if (a.start >= clusterEnd) {
      flush()
      cluster = []
      laneEnds = []
    }
    let lane = laneEnds.findIndex((e) => e <= a.start)
    if (lane === -1) lane = laneEnds.push(end) - 1
    else laneEnds[lane] = end
    clusterEnd = end > clusterEnd ? end : clusterEnd
    const placed = { ...a, lane }
    cluster.push(placed)
    out.push(placed)
  }
  flush()
  return out
}

function Modal({ dialog, labelledBy, onClose, children }) {
  const downOnBackdrop = useRef(false) // a drag that starts inside the form and ends on the backdrop must not close it
  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={(e) => (downOnBackdrop.current = e.target === dialog.current)}
      onClick={(e) => e.target === dialog.current && downOnBackdrop.current && dialog.current.close()}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl bg-surface p-0 text-ink backdrop:bg-plum-dark/60"
    >
      {children}
    </dialog>
  )
}

function StatusPill({ status }) {
  const [label, colours] = STATUS_PILL[status] ?? STATUS_PILL.booked
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${colours}`}>{label}</span>
}

// columns: [{ key, label, sub, today, off, items }]; time runs down, 10:00 to 20:00
function TimeGrid({ label, columns, onOpen, highlightId }) {
  return (
    <section aria-label={label} className="overflow-x-auto rounded-2xl border border-tint bg-surface">
      <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-tint" />
        {columns.map((c) => (
          <div key={c.key} className={`border-b border-l border-tint px-2 py-2.5 text-center ${c.today ? 'bg-tint' : ''}`}>
            <div className={`truncate text-[13px] ${c.today ? 'font-semibold text-plum' : 'font-medium'}`}>{c.label}</div>
            {c.sub && <div className="text-xs text-muted tabular-nums">{c.sub}</div>}
          </div>
        ))}
        <div className="relative" style={{ height: GRID_HEIGHT }}>
          {HOURS.map((h, i) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-muted tabular-nums first:translate-y-1" style={{ top: i * 60 * PX_PER_MIN }}>
              {clock(h).replace(':00', '')}
            </span>
          ))}
        </div>
        {columns.map((c) => (
          <div
            key={c.key}
            className={`relative border-l border-tint bg-[repeating-linear-gradient(to_bottom,var(--color-tint)_0_1px,transparent_1px_48px)] ${c.off ? 'bg-page' : ''}`}
            style={{ height: GRID_HEIGHT }}
          >
            {c.off && <span className="absolute inset-x-0 top-4 text-center text-xs text-muted">Off</span>}
            {withLanes(c.items).map((a) => {
              const [status, colours] = STATUS_PILL[a.status] ?? STATUS_PILL.booked
              return (
                <button
                  key={a.id}
                  type="button"
                  data-appt={a.id}
                  data-highlight={a.id === highlightId || undefined}
                  aria-label={`${fullDay(a.start.slice(0, 10))}, ${a.employeeName}, ${clock(a.start.slice(11))}, ${a.clientName}, ${a.serviceName}, ${status}`}
                  onClick={() => onOpen(a)}
                  className={`absolute overflow-hidden rounded-lg px-2 py-1 text-left text-xs leading-snug hover:brightness-95 ${colours} ${
                    a.id === highlightId ? 'z-10 ring-2 ring-plum ring-offset-1 ring-offset-surface' : ''
                  }`}
                  style={{
                    top: (minutes(a.start.slice(11)) - OPEN_MIN) * PX_PER_MIN + 1,
                    height: a.durationMin * PX_PER_MIN - 2,
                    left: `calc(${(a.lane * 100) / a.lanes}% + 2px)`,
                    width: `calc(${100 / a.lanes}% - 4px)`,
                  }}
                >
                  <span className="block font-semibold tabular-nums">{clock(a.start.slice(11))}</span>
                  <span className={`block truncate font-medium text-ink ${a.status === 'cancelled' ? 'line-through' : ''}`}>{a.clientName}</span>
                  <span className="block truncate">{a.serviceName}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

const FIELD_ORDER = ['clientId', 'serviceId', 'employeeId', 'date', 'time']

function BookDialog({ dialog, form, setForm, onBooked }) {
  const { state, bookAppointment } = useDemoStore()
  const [errors, setErrors] = useState({})
  const therapists = state.employees.filter((e) => e.role === 'Therapist')
  const service = state.services.find((s) => s.id === form.serviceId)

  const submit = (e) => {
    e.preventDefault()
    const found = validateBookingForm(state, form)
    let result
    if (Object.keys(found).length === 0) {
      const { clientId, employeeId, serviceId, date, time } = form
      result = bookAppointment({ clientId, employeeId, serviceId, start: `${date}T${time}`, durationMin: service.durationMin })
      if (!result.ok) found.time = result.error
    }
    setErrors(found)
    const firstBad = FIELD_ORDER.find((k) => found[k])
    if (firstBad) return e.currentTarget.elements[firstBad].focus()
    toast.success(`Booked ${nameOf(state.clients, form.clientId)} with ${nameOf(state.employees, form.employeeId)}`)
    dialog.current.close()
    onBooked(result.appointment)
  }

  const control = (name) => ({
    id: `book-${name}`,
    name,
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `book-${name}-error` : name === 'time' && service && form.time ? 'book-time-hint' : undefined,
    className: `${inputClass} ${errors[name] ? '' : 'border-lavender'}`,
  })
  const field = (name, label, input) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`book-${name}`} className="text-[13px] font-medium">
        {label}
      </label>
      {input}
      {errors[name] && (
        <p id={`book-${name}-error`} className="text-xs text-danger">
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <Modal dialog={dialog} labelledBy="book-title" onClose={() => setErrors({})}>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4 p-5 md:p-6">
        <h2 id="book-title" className="font-heading text-[22px] font-medium">
          Book appointment
        </h2>
        {field(
          'clientId',
          'Client',
          <select {...control('clientId')}>
            <option value="">Choose a client</option>
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>,
        )}
        {field(
          'serviceId',
          'Service',
          <select {...control('serviceId')}>
            <option value="">Choose a service</option>
            {state.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.durationMin} min
              </option>
            ))}
          </select>,
        )}
        {field(
          'employeeId',
          'Therapist',
          <select {...control('employeeId')}>
            <option value="">Choose a therapist</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {form.date && !works(t, form.date) ? ' (off)' : ''}
              </option>
            ))}
          </select>,
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('date', 'Date', <input type="date" min={toDateStr(new Date())} {...control('date')} />)}
          {field(
            'time',
            'Time',
            <select {...control('time')}>
              <option value="">Choose a time</option>
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {clock(t)}
                </option>
              ))}
            </select>,
          )}
        </div>
        {service && form.time && !errors.time && (
          <p id="book-time-hint" className="-mt-2 text-xs text-muted">
            Ends {clock(addMinutes(`2000-01-01T${form.time}`, service.durationMin).slice(11))}
          </p>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={() => dialog.current.close()} className="inline-flex h-11 items-center rounded-full px-5 text-sm text-muted hover:text-ink">
            Cancel
          </button>
          <button type="submit" className="inline-flex h-11 items-center rounded-full bg-plum px-5 text-sm font-medium text-gold-on-plum hover:bg-plum-light">
            Book
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DetailsDialog({ dialog, appointment: a }) {
  const fact = (label, value) => (
    <div className="flex justify-between gap-4 border-b border-tint py-2.5 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
  return (
    <Modal dialog={dialog} labelledBy="appt-title">
      {a && (
        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="appt-title" className="font-heading text-[22px] font-medium">
              <Link to={`/clients/${a.clientId}`} className="underline-offset-4 hover:underline">
                {a.clientName}
              </Link>
            </h2>
            <StatusPill status={a.status} />
          </div>
          <dl>
            {fact('Service', a.serviceName)}
            {fact('Therapist', a.employeeName)}
            {fact('When', `${longDay(a.start.slice(0, 10))} · ${span(a)}`)}
          </dl>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <Link to={`/clients/${a.clientId}`} className={linkClass}>
              Client profile
            </Link>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => dialog.current.close()} className="inline-flex h-11 items-center rounded-full px-4 text-sm text-muted hover:text-ink">
                Close
              </button>
              {a.status === 'booked' && (
                <>
                  <button type="button" onClick={demoOnly} className="inline-flex h-11 items-center rounded-full border border-lavender px-4 text-sm hover:border-plum-light">
                    Cancel booking
                  </button>
                  <button type="button" onClick={demoOnly} className="inline-flex h-11 items-center rounded-full bg-plum px-5 text-sm font-medium text-gold-on-plum hover:bg-plum-light">
                    Mark done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function Appointments() {
  const { state } = useDemoStore()
  const [params, setParams] = useSearchParams()
  const today = toDateStr(new Date())
  const [day, setDay] = useState(today)
  const [therapistId, setTherapistId] = useState('')
  const [form, setForm] = useState({ clientId: '', serviceId: '', employeeId: '', date: today, time: '' })
  const [opened, setOpened] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const bookDialog = useRef(null)
  const detailDialog = useRef(null)

  const therapists = state.employees.filter((e) => e.role === 'Therapist')
  const therapist = therapists.find((t) => t.id === therapistId)
  const week = weekDays(day)
  const list = appointmentsInRange(state, week[0], week[6], therapistId || undefined)
  const dayItems = list.filter((a) => a.start.startsWith(day))
  const live = list.filter(isActiveBooking).length

  const openBooking = (clientId = '') => {
    setForm({ clientId, serviceId: '', employeeId: therapistId, date: day, time: '' })
    if (!bookDialog.current.open) bookDialog.current.showModal()
  }
  const openDetails = (a) => {
    setOpened(a)
    detailDialog.current.showModal()
  }
  const booked = (a) => {
    setDay(a.start.slice(0, 10))
    if (therapistId && therapistId !== a.employeeId) setTherapistId('')
    setHighlightId(a.id)
  }
  const shift = (n) => setDay(toDateStr(addDays(new Date(`${day}T00:00`), n)))

  // "Book again" on Clients links here with ?client=<id>
  useEffect(() => {
    const clientId = params.get('client')
    if (!clientId) return
    openBooking(clientId)
    setParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!highlightId) return
    const shown = [...document.querySelectorAll(`[data-appt="${highlightId}"]`)].find((b) => b.offsetParent)
    shown?.scrollIntoView?.({ block: 'nearest' })
  }, [highlightId])

  const columns = therapist
    ? week.map((d) => ({
        key: d,
        label: weekdayOf(d),
        sub: monthDay(d),
        today: d === today,
        off: !works(therapist, d),
        items: list.filter((a) => a.start.startsWith(d)),
      }))
    : therapists
        .filter((t) => works(t, day) || dayItems.some((a) => a.employeeId === t.id))
        .map((t) => ({ key: t.id, label: t.name, items: dayItems.filter((a) => a.employeeId === t.id) }))

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="on-plum-mobile -mx-4 flex flex-wrap items-end justify-between gap-4 bg-plum px-4 pt-1 pb-6 md:mx-0 md:bg-transparent md:p-0">
        <div>
          <div className="text-xs text-lavender md:text-[13px] md:text-muted">
            {live} {live === 1 ? 'appointment' : 'appointments'} {week.includes(today) ? 'this week' : `for ${monthDay(week[0])} – ${monthDay(week[6])}`}
          </div>
          <h1 className="mt-1 font-heading text-[26px] font-medium text-white md:text-[32px] md:text-ink">Appointments</h1>
        </div>
        <button
          type="button"
          onClick={() => openBooking()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-on-plum px-5 text-sm font-medium text-plum hover:bg-white md:bg-plum md:text-gold-on-plum md:hover:bg-plum-light"
        >
          <PiPlus aria-hidden="true" className="size-4" />
          Book appointment
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="Week" className="flex items-center gap-1">
          <button type="button" aria-label="Previous week" onClick={() => shift(-7)} className={iconButton}>
            <PiCaretLeft aria-hidden="true" className="size-4" />
          </button>
          <span aria-live="polite" className="min-w-[8.5rem] text-center text-sm font-medium tabular-nums">
            {week.includes(today) ? 'This week' : `${monthDay(week[0])} – ${monthDay(week[6])}`}
          </span>
          <button type="button" aria-label="Next week" onClick={() => shift(7)} className={iconButton}>
            <PiCaretRight aria-hidden="true" className="size-4" />
          </button>
        </div>
        <button type="button" onClick={() => setDay(today)} className={pillClass(false)}>
          Today
        </button>
        <label className="relative ml-auto inline-flex items-center">
          <span className="sr-only">Therapist</span>
          <select
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            className="h-11 cursor-pointer appearance-none rounded-full border border-lavender bg-surface pr-9 pl-4 text-sm text-ink hover:border-plum-light"
          >
            <option value="">All therapists</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <PiCaretDown aria-hidden="true" className="pointer-events-none absolute right-3.5 size-4 text-muted" />
        </label>
      </div>

      {/* phone and tablet always pick a day; desktop only when all therapists share the grid */}
      <div role="group" aria-label="Day" className={`grid grid-cols-7 gap-1 lg:max-w-xl ${therapist ? 'lg:hidden' : ''}`}>
        {week.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={d === day}
            onClick={() => setDay(d)}
            className={`flex min-h-14 flex-col items-center justify-center rounded-xl text-xs transition-colors ${
              d === day ? 'bg-plum text-white' : 'border border-lavender bg-surface text-ink hover:border-plum-light'
            }`}
          >
            <span className={d === today && d !== day ? 'font-semibold text-plum' : ''}>{d === today ? 'Today' : weekdayOf(d)}</span>
            <span className="text-base font-semibold tabular-nums">{Number(d.slice(8))}</span>
          </button>
        ))}
      </div>

      <div className="hidden lg:block">
        {columns.length === 0 ? (
          <p className="rounded-2xl border border-tint bg-surface px-5 py-12 text-center text-sm text-muted">No therapists work on {longDay(day)}</p>
        ) : (
          <TimeGrid
            label={therapist ? `${therapist.name}, week of ${monthDay(week[0])}` : `All therapists, ${longDay(day)}`}
            columns={columns}
            onOpen={openDetails}
            highlightId={highlightId}
          />
        )}
      </div>

      <section aria-label="Day list" className="rounded-2xl border border-tint bg-surface px-4 py-2 lg:hidden">
        <h2 className="py-2 text-[13px] font-semibold">{day === today ? `Today, ${longDay(day)}` : longDay(day)}</h2>
        {dayItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No appointments</p>
        ) : (
          <ul>
            {dayItems.map((a) => (
              <li key={a.id} className="border-t border-tint">
                <button
                  type="button"
                  data-appt={a.id}
                  data-highlight={a.id === highlightId || undefined}
                  onClick={() => openDetails(a)}
                  className={`flex w-full items-center gap-3 rounded-lg py-3 text-left ${a.id === highlightId ? 'bg-tint px-2' : ''}`}
                >
                  <span className="w-[68px] shrink-0 text-[13px] font-semibold tabular-nums">{clock(a.start.slice(11))}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.clientName}</span>
                    <span className="block truncate text-xs text-muted">
                      {a.serviceName} · {a.employeeName.split(' ')[0]}
                    </span>
                  </span>
                  <StatusPill status={a.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BookDialog dialog={bookDialog} form={form} setForm={setForm} onBooked={booked} />
      <DetailsDialog dialog={detailDialog} appointment={opened} />
    </div>
  )
}

