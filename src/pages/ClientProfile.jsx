import { Link, useParams } from 'react-router-dom'
import { PiArrowLeft } from 'react-icons/pi'
import { useDemoStore } from '../data/DemoStore.jsx'
import { clientSummaries, clientHistory } from '../data/selectors.js'
import { toDateStr } from '../data/dates.js'
import { formatPeso } from '../lib/money.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TAG_COLOR = { VIP: 'text-gold-text', Regular: 'text-muted', New: 'text-success' }
export const linkClass = 'inline-flex min-h-11 items-center text-[13px] text-gold-text underline-offset-4 hover:underline'

export const initials = (name) => {
  const words = name.trim().split(/\s+/)
  return (words[0][0] + (words.length > 1 ? words.at(-1)[0] : '')).toUpperCase()
}
// seed VIPs also carry 'Regular'; show the one that matters
export const mainTag = (tags) => (tags.includes('VIP') ? 'VIP' : tags[0])
// 'YYYY-MM-DD' → 'Today', 'Nov 14', or 'Nov 14, 2025' outside this year
export function visitDate(date, today = new Date()) {
  if (!date) return 'No visits yet'
  if (date === toDateStr(today)) return 'Today'
  const [y, m, d] = date.split('-')
  return `${MONTHS[m - 1]} ${Number(d)}${Number(y) === today.getFullYear() ? '' : `, ${y}`}`
}
const monthYear = (date) => `${MONTHS[date.slice(5, 7) - 1]} ${date.slice(0, 4)}`
const birthday = (date) => (date ? new Date(`${date}T00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'Not given')

export function TagLabel({ tags, className = 'text-xs' }) {
  const tag = mainTag(tags)
  return <span className={`${className} ${TAG_COLOR[tag] ?? 'text-muted'}`}>{tag}</span>
}

export function Avatar({ name, large = false }) {
  return large ? (
    <span aria-hidden="true" className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-plum font-heading text-xl text-gold-on-plum">
      {initials(name)}
    </span>
  ) : (
    <span aria-hidden="true" className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-tint text-xs font-semibold text-plum-light">
      {initials(name)}
    </span>
  )
}

// avatar, name, tag and since-line; the heading level differs between the panel and the page
export function ClientHeading({ client, as: Heading = 'h2', size = 'text-[22px]' }) {
  return (
    <div className="flex items-center gap-3.5">
      <Avatar name={client.name} large />
      <div className="min-w-0">
        <Heading className={`font-heading font-medium break-words ${size}`}>{client.name}</Heading>
        <div className="text-[13px]">
          <TagLabel tags={client.tags} className="" /> <span className="text-muted">· Client since {monthYear(client.joinedOn)}</span>
        </div>
      </div>
    </div>
  )
}

// stat tiles, contact lines and the note box
export function ClientFacts({ client }) {
  return (
    <>
      <dl className="grid grid-cols-2 gap-2.5">
        {[
          ['Visits', client.visits],
          ['Total spent', formatPeso(client.totalSpent)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[10px] bg-page p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-xl font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-4 text-[13px] leading-[1.7]">
        {[
          ['Phone', client.phone],
          ['Email', client.email || 'Not given'],
          ['Birthday', birthday(client.birthday)],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-1.5">
            <dt className="text-muted">{label} ·</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {client.notes ? (
        <p className="mt-4 rounded-[10px] bg-warn-bg px-3.5 py-3 text-[13px] text-warn-ink">Note: {client.notes}</p>
      ) : (
        <p className="mt-4 rounded-[10px] border border-dashed border-lavender px-3.5 py-3 text-[13px] text-muted">No notes yet</p>
      )}
    </>
  )
}

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
        <Link to="/clients" className={`${linkClass} gap-1.5 text-gold-on-plum md:text-gold-text`}>
          <PiArrowLeft aria-hidden="true" className="size-3.5" />
          All clients
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <ClientHeading client={client} as="h1" size="text-[26px] md:text-[32px]" />
          <Link
            to="/appointments"
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
