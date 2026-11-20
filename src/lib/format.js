import { toDateStr } from '../data/dates.js'

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// first letter of the first and of the last word: 'Ramon dela Cruz' → 'RC', 'Ana' → 'A'
export const initials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words.at(-1)[0] : '')).toUpperCase()
}

export const nameOf = (list, id) => list.find((x) => x.id === id)?.name ?? ''

// 'YYYY-MM-DD' → 'Nov 14'
export const monthDay = (date) => `${MONTHS[date.slice(5, 7) - 1]} ${Number(date.slice(8, 10))}`
// 'YYYY-MM-…' → 'Nov 2026'
export const monthYear = (date) => `${MONTHS[date.slice(5, 7) - 1]} ${date.slice(0, 4)}`

// 'HH:mm' → '1:30 PM'
export const clock = (hhmm) => new Date(`2000-01-01T${hhmm}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// 'YYYY-MM-DD' → 'Today', 'Nov 14', or 'Nov 14, 2025' outside this year
export function visitDate(date, today = new Date()) {
  if (!date) return 'No visits yet'
  if (date === toDateStr(today)) return 'Today'
  return `${monthDay(date)}${Number(date.slice(0, 4)) === today.getFullYear() ? '' : `, ${date.slice(0, 4)}`}`
}
