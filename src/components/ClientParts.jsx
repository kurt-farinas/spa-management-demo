import { Avatar } from './Avatar.jsx'
import { monthYear } from '../lib/format.js'
import { formatPeso } from '../lib/money.js'

const TAG_COLOR = { VIP: 'text-accent-ink', Regular: 'text-muted', New: 'text-success' }
// seed VIPs also carry 'Regular'; show the one that matters
export const mainTag = (tags) => (tags.includes('VIP') ? 'VIP' : tags[0])
const birthday = (date) => (date ? new Date(`${date}T00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'Not given')

export function TagLabel({ tags, className = 'text-xs' }) {
  const tag = mainTag(tags)
  return <span className={`${className} ${TAG_COLOR[tag] ?? 'text-muted'}`}>{tag}</span>
}

// avatar, name, tag and since-line; the heading level differs between the panel and the page
export function ClientHeading({ client, as: Heading = 'h2', size = 'text-[22px]', subClass = '' }) {
  return (
    <div className="flex items-center gap-3.5">
      <Avatar name={client.name} large />
      <div className="min-w-0">
        <Heading className={`font-heading font-medium break-words ${size}`}>{client.name}</Heading>
        <div className={`text-[13px] ${subClass}`}>
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
        <p className="mt-4 rounded-[10px] border border-dashed border-line px-3.5 py-3 text-[13px] text-muted">No notes yet</p>
      )}
    </>
  )
}
