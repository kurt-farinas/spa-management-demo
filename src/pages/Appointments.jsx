import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PiPlus, PiCaretLeft, PiCaretRight, PiCaretDown, PiCheckBold, PiXBold, PiProhibitBold } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { weekDays, appointmentsInRange, validateBookingForm, isActiveBooking, weekdayOf, SPA_OPEN, SPA_CLOSE } from '../data/selectors.js'
import { toDateStr, addDays, addMinutes } from '../data/dates.js'
import { clock, monthDay, nameOf } from '../lib/format.js'
import { demoOnly } from '../components/demoOnly.js'
import { linkClass, primaryButton, secondaryButton, textButton, STATUS_PILL, CATEGORY_BAND, categoryBand } from '../components/ui.js'

const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const OPEN_MIN = minutes(SPA_OPEN)
const CLOSE_MIN = minutes(SPA_CLOSE)
const PX_PER_MIN = 72 / 60 // one hour row is 72px, so a 50-minute block still fits three lines
const GRID_HEIGHT = (CLOSE_MIN - OPEN_MIN) * PX_PER_MIN
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
// '10:00–11:00 AM', the meridiem once at the end
const shortSpan = (a) => `${clock(a.start.slice(11)).replace(/ [AP]M$/, '')}–${clock(addMinutes(a.start, a.durationMin).slice(11))}`
const struck = (a) => a.status === 'cancelled' || a.status === 'no-show'
const iconButton = 'inline-flex size-11 items-center justify-center rounded-md border border-line bg-surface text-ink hover:bg-soft'
const inputClass = 'h-11 w-full rounded-md border bg-surface px-3 text-sm text-ink aria-invalid:border-danger'

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

// side: a full-height panel on the right from lg up, so the calendar stays in view
function Modal({ dialog, labelledBy, onClose, side = false, children }) {
  const downOnBackdrop = useRef(false) // a drag that starts inside the form and ends on the backdrop must not close it
  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={(e) => (downOnBackdrop.current = e.target === dialog.current)}
      onClick={(e) => e.target === dialog.current && downOnBackdrop.current && dialog.current.close()}
      className={`m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-ink/40 ${
        side ? 'lg:mr-0 lg:h-dvh lg:max-h-dvh lg:w-[400px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:backdrop:bg-ink/15' : ''
      }`}
    >
      {children}
    </dialog>
  )
}

// done and booked are round pills; cancelled and no-show are small square stamps
// always-visible status cue for calendar blocks too narrow for the pill; booked has none
const STATUS_ICON = { done: [PiCheckBold, 'text-success'], 'no-show': [PiProhibitBold, 'text-danger'], cancelled: [PiXBold, 'text-muted'] }
function StatusIcon({ status, className = '' }) {
  const [Icon, colour] = STATUS_ICON[status] ?? []
  return Icon ? <Icon aria-hidden="true" data-status-icon={status} className={`size-3 shrink-0 ${colour} ${className}`} /> : null
}

function StatusPill({ status, className = '' }) {
  const [label, colours] = STATUS_PILL[status] ?? STATUS_PILL.booked
  const shape = struck({ status }) ? 'rounded-sm px-1.5 text-[11px] leading-4 -rotate-2' : 'rounded-full px-2 text-[11px] leading-[18px]'
  return <span className={`shrink-0 whitespace-nowrap ${shape} ${colours} ${className}`}>{label}</span>
}

// columns: [{ key, label, sub, today, now, off, items }]; time runs down, 10:00 to 20:00
// now: the column gets the current-time line when the clock is inside opening hours
function TimeGrid({ label, title, columns, onOpen, highlightId }) {
  const at = new Date()
  const nowMin = at.getHours() * 60 + at.getMinutes()
  const nowTop = columns.some((c) => c.now) && nowMin >= OPEN_MIN && nowMin < CLOSE_MIN ? (nowMin - OPEN_MIN) * PX_PER_MIN : null
  return (
    <section aria-label={label} className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <ul aria-label="Service colours" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {Object.keys(CATEGORY_BAND).map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-2 rounded-xs ${categoryBand(c)}`} />
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(0, 1fr))` }}>
          <div className="border-b border-line" />
          {columns.map((c) => (
            <div key={c.key} className={`border-b border-l border-line px-3 py-2 ${c.today ? 'bg-soft' : ''}`}>
              <div className={`truncate text-[13px] font-semibold ${c.today ? 'text-rail' : ''}`}>{c.label}</div>
              {c.sub && <div className="text-xs text-muted tabular-nums">{c.sub}</div>}
            </div>
          ))}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {HOURS.map((h, i) => (
              <span key={h} className="absolute left-2 mt-0.5 text-[11px] text-muted tabular-nums" style={{ top: i * 60 * PX_PER_MIN }}>
                {clock(h).replace(':00', '')}
              </span>
            ))}
            {nowTop !== null && (
              <span
                className="absolute right-0.5 z-20 -translate-y-1/2 rounded-sm bg-accent px-1 text-[11px] leading-[18px] font-bold text-ink tabular-nums"
                style={{ top: nowTop }}
              >
                <span className="sr-only">Now </span>
                {clock(`${pad(at.getHours())}:${pad(at.getMinutes())}`).replace(/ [AP]M$/, '')}
              </span>
            )}
          </div>
          {columns.map((c) => (
            <div
              key={c.key}
              className={`relative border-l border-line bg-[repeating-linear-gradient(to_bottom,var(--color-line)_0_1px,transparent_1px_72px)] ${c.off ? 'bg-page' : ''}`}
              style={{ height: GRID_HEIGHT }}
            >
              {c.off && <span className="absolute inset-x-0 top-4 text-center text-xs text-muted">Off</span>}
              {withLanes(c.items).map((a) => {
                const [status] = STATUS_PILL[a.status] ?? STATUS_PILL.booked
                const compact = a.durationMin <= 45 // too short for three lines: time and client on one
                const fade = struck(a) ? 'text-muted line-through' : ''
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-appt={a.id}
                    data-highlight={a.id === highlightId || undefined}
                    aria-label={`${fullDay(a.start.slice(0, 10))}, ${a.employeeName}, ${clock(a.start.slice(11))}, ${a.clientName}, ${a.serviceName}, ${status}`}
                    onClick={() => onOpen(a)}
                    className={`@container absolute overflow-hidden rounded-sm border border-line bg-surface pr-1.5 pl-2.5 text-left text-xs leading-4 hover:bg-soft ${
                      compact ? 'flex items-center gap-1.5' : 'py-1'
                    } ${a.id === highlightId ? 'z-10 ring-2 ring-rail ring-offset-1 ring-offset-surface' : ''}`}
                    style={{
                      top: (minutes(a.start.slice(11)) - OPEN_MIN) * PX_PER_MIN + 1,
                      height: a.durationMin * PX_PER_MIN - 2,
                      left: `calc(${(a.lane * 100) / a.lanes}% + 2px)`,
                      width: `calc(${100 / a.lanes}% - 4px)`,
                    }}
                  >
                    <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${categoryBand(a.category)}`} />
                    {compact ? (
                      <>
                        <StatusIcon status={a.status} />
                        <span className={`shrink-0 text-muted tabular-nums ${fade}`}>{clock(a.start.slice(11))}</span>
                        <span className={`truncate text-[13px] font-semibold ${fade}`}>{a.clientName}</span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center justify-between gap-1">
                          <StatusIcon status={a.status} className="@[10rem]:hidden" />
                          <span className={`mr-auto whitespace-nowrap text-muted tabular-nums ${fade}`}>{shortSpan(a)}</span>
                          <StatusPill status={a.status} className="hidden @[10rem]:inline-block" />
                        </span>
                        <span className={`block truncate text-[13px] font-semibold ${fade}`}>{a.clientName}</span>
                        <span className={`block truncate text-muted ${fade}`}>{a.serviceName}</span>
                      </>
                    )}
                  </button>
                )
              })}
              {c.now && nowTop !== null && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-accent" style={{ top: nowTop - 1 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FIELD_ORDER = ['clientId', 'serviceId', 'employeeId', 'date', 'time']

function BookDialog({ dialog, form, setForm, onBooked }) {
  const { state, bookAppointment } = useDemoStore()
  const [errors, setErrors] = useState({})
  const [clash, setClash] = useState(false) // the time error came from another booking, not the form
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
    setClash(Boolean(result && !result.ok))
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
    className: `${inputClass} ${errors[name] ? '' : 'border-line'}`,
  })
  const field = (name, label, input) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`book-${name}`} className="text-[13px] font-semibold text-muted">
        {label}
      </label>
      {input}
      {errors[name] && !(name === 'time' && clash) && (
        <p id={`book-${name}-error`} className="text-xs text-danger">
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <Modal
      dialog={dialog}
      labelledBy="book-title"
      side
      onClose={() => {
        setErrors({})
        setClash(false)
      }}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4 p-5">
        <h2 id="book-title" className="-mx-5 -mt-1 border-b border-line px-5 pb-4 text-[15px] font-semibold">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        {clash && errors.time && (
          <div className="rounded-md border border-l-4 border-accent bg-warn-bg px-3 py-2.5 text-[13px] text-warn-ink">
            <strong className="block font-semibold">Time clash</strong>
            <p id="book-time-error">{errors.time}</p>
          </div>
        )}
        {service && form.time && !errors.time && (
          <p id="book-time-hint" className="-mt-2 text-xs text-muted tabular-nums">
            Ends {clock(addMinutes(`2000-01-01T${form.time}`, service.durationMin).slice(11))}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <button type="submit" className={primaryButton}>
            Book
          </button>
          <button type="button" onClick={() => dialog.current.close()} className={secondaryButton}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DetailsDialog({ dialog, appointment: a }) {
  const fact = (label, value) => (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
  return (
    <Modal dialog={dialog} labelledBy="appt-title">
      {a && (
        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="appt-title" className="text-xl font-bold">
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
              <button type="button" onClick={() => dialog.current.close()} className={textButton}>
                Close
              </button>
              {a.status === 'booked' && (
                <>
                  <button type="button" onClick={demoOnly} className={secondaryButton}>
                    Cancel booking
                  </button>
                  <button type="button" onClick={demoOnly} className={primaryButton}>
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
  const list = appointmentsInRange(state, week[0], week[6], therapistId || undefined).map((a) => ({
    ...a,
    category: state.services.find((s) => s.id === a.serviceId)?.category,
  }))
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
        now: d === today,
        off: !works(therapist, d),
        items: list.filter((a) => a.start.startsWith(d)),
      }))
    : therapists
        .filter((t) => works(t, day) || dayItems.some((a) => a.employeeId === t.id))
        .map((t) => ({ key: t.id, label: t.name, now: day === today, items: dayItems.filter((a) => a.employeeId === t.id) }))

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-[13px] text-muted tabular-nums">
            {live} {live === 1 ? 'appointment' : 'appointments'} {week.includes(today) ? 'this week' : `for ${monthDay(week[0])} – ${monthDay(week[6])}`}
          </p>
        </div>
        <button type="button" onClick={() => openBooking()} className={primaryButton}>
          <PiPlus aria-hidden="true" className="size-4" />
          Book appointment
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Week" className="flex items-center gap-1">
          <button type="button" aria-label="Previous week" onClick={() => shift(-7)} className={iconButton}>
            <PiCaretLeft aria-hidden="true" className="size-4" />
          </button>
          <span aria-live="polite" className="min-w-[8.5rem] text-center text-[15px] font-semibold tabular-nums">
            {week.includes(today) ? 'This week' : `${monthDay(week[0])} – ${monthDay(week[6])}`}
          </span>
          <button type="button" aria-label="Next week" onClick={() => shift(7)} className={iconButton}>
            <PiCaretRight aria-hidden="true" className="size-4" />
          </button>
        </div>
        <button type="button" onClick={() => setDay(today)} className={secondaryButton}>
          Today
        </button>
        <label className="relative ml-auto inline-flex items-center">
          <span className="sr-only">Therapist</span>
          <select
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            className="h-11 cursor-pointer appearance-none rounded-md border border-line bg-surface pr-9 pl-3 text-sm font-medium text-ink hover:bg-soft"
          >
            <option value="">All therapists</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <PiCaretDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-muted" />
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
            className={`flex min-h-14 flex-col items-center justify-center rounded-md border text-xs transition-colors ${
              d === day ? 'border-highlight bg-highlight font-semibold text-ink' : 'border-line bg-surface text-ink hover:bg-soft'
            }`}
          >
            <span className={d === today && d !== day ? 'font-semibold text-rail' : ''}>{d === today ? 'Today' : weekdayOf(d)}</span>
            <span className="text-base font-semibold tabular-nums">{Number(d.slice(8))}</span>
          </button>
        ))}
      </div>

      <div className="hidden lg:block">
        {columns.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface px-5 py-12 text-center text-sm text-muted">No therapists work on {longDay(day)}</p>
        ) : (
          <TimeGrid
            label={therapist ? `${therapist.name}, week of ${monthDay(week[0])}` : `All therapists, ${longDay(day)}`}
            title={therapist ? `${therapist.name}, week of ${monthDay(week[0])}` : day === today ? `Today, ${longDay(day)}` : longDay(day)}
            columns={columns}
            onOpen={openDetails}
            highlightId={highlightId}
          />
        )}
      </div>

      <section aria-label="Day list" className="rounded-lg border border-line bg-surface px-4 py-2 lg:hidden">
        <h2 className="py-2 text-[13px] font-semibold">{day === today ? `Today, ${longDay(day)}` : longDay(day)}</h2>
        {dayItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No appointments</p>
        ) : (
          <ul>
            {dayItems.map((a) => (
              <li key={a.id} className="border-t border-line">
                <button
                  type="button"
                  data-appt={a.id}
                  data-highlight={a.id === highlightId || undefined}
                  onClick={() => openDetails(a)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-md py-2.5 text-left ${a.id === highlightId ? 'bg-soft px-2' : ''}`}
                >
                  <span aria-hidden="true" className={`w-1 self-stretch rounded-full ${categoryBand(a.category)}`} />
                  <span className={`w-[64px] shrink-0 text-[13px] font-semibold tabular-nums ${struck(a) ? 'text-muted line-through' : ''}`}>{clock(a.start.slice(11))}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${struck(a) ? 'text-muted line-through' : ''}`}>{a.clientName}</span>
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

