import { Link, useParams } from 'react-router-dom'
import { useDemoStore } from '../data/DemoStore.jsx'
import { clientSummaries, clientHistory } from '../data/selectors.js'
import { formatPeso } from '../lib/money.js'
import { visitDate } from '../lib/format.js'
import { linkClass } from '../components/ui.js'
import { BackLink } from '../components/BackLink.jsx'
import { ClientFacts, ClientHeading } from '../components/ClientParts.jsx'

export function ClientProfile() {
  const { id } = useParams()
  const { state } = useDemoStore()
  const today = new Date()
  const client = clientSummaries(state, today).find((c) => c.id === id)

  if (!client)
    return (
      <div className="py-16 text-center">
        <h1 className="font-heading text-[26px] font-medium">Client not found</h1>
        <p className="mt-2 text-sm text-muted">This client may have been removed, or the link is wrong.</p>
        <Link to="/clients" className={`${linkClass} mt-2`}>
          Back to clients
        </Link>
      </div>
    )

  const history = clientHistory(state, client.id)
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="on-plum-mobile -mx-4 bg-plum px-4 pt-1 pb-6 text-white md:mx-0 md:bg-transparent md:p-0 md:text-ink">
        <BackLink to="/clients" className="text-gold-on-plum md:text-gold-text">
          All clients
        </BackLink>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <ClientHeading client={client} as="h1" size="text-[26px] md:text-[32px]" subClass="max-md:[&_span]:text-lavender" />
          <Link
            to={`/appointments?client=${client.id}`}
            className="inline-flex h-11 items-center rounded-full bg-gold-on-plum px-5 text-sm font-medium text-plum hover:bg-white md:bg-plum md:text-gold-on-plum md:hover:bg-plum-light"
          >
            Book again
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-label="Details" className="rounded-2xl border border-tint bg-surface p-5 md:p-[22px]">
          <ClientFacts client={client} />
        </section>

        <section aria-label="Visit history" className="min-w-0 rounded-2xl border border-tint bg-surface">
          <h2 className="px-5 pt-4 font-heading text-[19px] font-medium md:px-[22px]">Visit history</h2>
          {history.length === 0 ? (
            <p className="px-5 pt-2 pb-6 text-sm text-muted md:px-[22px]">No visits yet. Their first visit will show here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th scope="col" className="px-5 py-3 font-medium md:pl-[22px]">Date</th>
                    <th scope="col" className="px-3 py-3 font-medium">Services</th>
                    <th scope="col" className="px-3 py-3 font-medium">Therapist</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium md:pr-[22px]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-tint">
                      <td className="px-5 py-3 whitespace-nowrap tabular-nums md:pl-[22px]">{visitDate(h.date, today)}</td>
                      <td className="px-3 py-3">{h.serviceNames || 'Products only'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{h.therapistName}</td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums md:pr-[22px]">{formatPeso(h.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
