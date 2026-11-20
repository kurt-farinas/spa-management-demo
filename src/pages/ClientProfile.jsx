import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { clientSummaries, clientHistory } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'
import { visitDate } from '../lib/format.js'
import { linkClass, primaryButton, STATUS_PILL, categoryBand } from '../components/ui.js'
import { BackLink } from '../components/BackLink.jsx'
import { ClientFacts, ClientHeading } from '../components/ClientParts.jsx'

const off = (status) => status === 'cancelled' || status === 'no-show'

// done is a round pill; cancelled and no-show are small square stamps, as on Appointments
function StatusPill({ status }) {
  const [label, colours] = STATUS_PILL[status]
  const shape = off(status) ? 'rounded-sm px-1.5 text-[11px] leading-4 -rotate-2' : 'rounded-full px-2 text-[11px] leading-[18px]'
  return <span className={`inline-block whitespace-nowrap ${shape} ${colours}`}>{label}</span>
}

// sales are the visits; cancelled and no-show bookings up to today stay in the list too
function visitHistory(state, clientId, today) {
  const service = (id) => state.services.find((s) => s.id === id)
  const sale = (h) => {
    const record = state.sales.find((s) => s.id === h.id)
    const line = record.lines.find((l) => l.type === 'service')
    return { ...h, at: record.date, status: 'done', category: line && service(line.id)?.category }
  }
  const missed = state.appointments
    .filter((a) => a.clientId === clientId && off(a.status) && a.start.slice(0, 10) <= today)
    .map((a) => ({
      id: a.id,
      at: a.start,
      date: a.start.slice(0, 10),
      serviceNames: service(a.serviceId)?.name ?? '',
      therapistName: state.employees.find((e) => e.id === a.employeeId)?.name ?? '',
      total: null,
      status: a.status,
      category: service(a.serviceId)?.category,
    }))
  return [...clientHistory(state, clientId).map(sale), ...missed].sort((a, b) => b.at.localeCompare(a.at)) // newest first, by time within a day
}

const ROW = 'flex items-center gap-3 pr-3.5 md:gap-4 md:pr-5'
const DATE = 'w-[72px] shrink-0 md:w-24'
const WHAT = 'min-w-0 flex-1 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-center md:gap-4'
const STATUS = 'hidden shrink-0 md:block md:w-24'
const AMOUNT = 'w-[84px] shrink-0 text-right md:w-24'

export function ClientProfile() {
  const { id } = useParams()
  const { state } = useDemoStore()
  const today = new Date()
  const client = clientSummaries(state, today).find((c) => c.id === id)

  if (!client)
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Client not found</h1>
        <p className="mt-2 text-sm text-muted">This client may have been removed, or the link is wrong.</p>
        <Link to="/clients" className={`${linkClass} mt-2`}>
          Back to clients
        </Link>
      </div>
    )

  const history = visitHistory(state, client.id, toDateStr(today))
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header>
        <BackLink to="/clients">All clients</BackLink>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <ClientHeading client={client} as="h1" size="text-[22px] leading-7 md:text-2xl md:leading-8" />
          <Link to={`/appointments?client=${client.id}`} className={primaryButton}>
            Book again
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-label="Details" className="rounded-lg border border-line bg-surface p-3.5 md:p-5">
          <ClientFacts client={client} />
        </section>

        <section aria-label="Visit history" className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex min-h-11 items-center border-b border-line px-3.5 md:min-h-14 md:px-5">
            <h2 className="text-[15px] font-semibold">Visit history</h2>
          </div>
          {history.length === 0 ? (
            <p className="px-3.5 py-6 text-sm text-muted md:px-5">No visits yet. Their first visit will show here.</p>
          ) : (
            <>
              <div aria-hidden="true" className={`${ROW} hidden h-9 border-b border-line text-xs font-semibold text-muted md:flex`}>
                <span className="w-1 shrink-0" />
                <span className={DATE}>Date</span>
                <span className={WHAT}>
                  <span>Services</span>
                  <span>Therapist</span>
                </span>
                <span className={STATUS}>Status</span>
                <span className={AMOUNT}>Amount</span>
              </div>
              <ul>
                {history.map((h) => {
                  const struck = off(h.status) ? 'line-through' : ''
                  return (
                    <li key={h.id} className={`${ROW} min-h-[60px] border-b border-line last:border-b-0 md:min-h-12 ${struck ? 'text-muted' : ''}`}>
                      <span aria-hidden="true" className={`w-1 shrink-0 self-stretch ${categoryBand(h.category)}`} />
                      <span className={`${DATE} text-[13px] font-semibold tabular-nums md:text-sm ${struck}`}>{visitDate(h.date, today)}</span>
                      <span className={WHAT}>
                        <span className={`block text-sm break-words ${struck}`}>{h.serviceNames || 'Products only'}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted md:mt-0 md:text-sm">
                          <span className={`${struck} ${struck ? '' : 'md:text-ink'}`}>{h.therapistName}</span>
                          <span className="md:hidden">
                            <StatusPill status={h.status} />
                          </span>
                        </span>
                      </span>
                      <span className={STATUS}>
                        <StatusPill status={h.status} />
                      </span>
                      <span className={AMOUNT}>
                        {h.total === null ? (
                          <span className="text-xs">No charge</span>
                        ) : (
                          <span className="text-sm font-semibold text-ink tabular-nums">{formatPeso(h.total)}</span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
