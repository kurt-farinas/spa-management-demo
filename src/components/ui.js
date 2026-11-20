// shared class strings
export const linkClass = 'inline-flex min-h-11 items-center text-[13px] text-accent-ink underline-offset-4 hover:underline'

export const pillClass = (on) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-[13px] transition-colors ${
    on ? 'bg-rail text-white' : 'border border-line bg-surface text-ink hover:border-rail-active'
  }`

export const primaryButton = 'inline-flex h-11 items-center rounded-full bg-rail px-5 text-sm font-medium text-rail-ink hover:bg-rail-active'

// appointment status → [label, pill and block colours]
// contrast: text-muted on muted/10 over the page colour is 5.40:1 (on surface 5.70:1), both pass 4.5:1
export const STATUS_PILL = {
  done: ['Done', 'bg-success-bg text-success'],
  booked: ['Booked', 'bg-soft text-rail-active'],
  cancelled: ['Cancelled', 'bg-muted/10 text-muted'],
  'no-show': ['No-show', 'bg-muted/10 text-muted'],
}

// text buttons: 44px square at least
export const textButton = `${linkClass} min-w-11 justify-center px-2`
