// shared class strings
export const linkClass = 'inline-flex min-h-11 items-center text-[13px] text-gold-text underline-offset-4 hover:underline'

export const pillClass = (on) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-[13px] transition-colors ${
    on ? 'bg-plum text-white' : 'border border-lavender bg-surface text-ink hover:border-plum-light'
  }`

export const primaryButton = 'inline-flex h-11 items-center rounded-full bg-plum px-5 text-sm font-medium text-gold-on-plum hover:bg-plum-light'

// appointment status → [label, pill and block colours]
// contrast: muted #5F5A73 on muted/10 over page #FBF8F3 is 5.40:1 (white surface 5.70:1), both pass 4.5:1
export const STATUS_PILL = {
  done: ['Done', 'bg-success-bg text-success'],
  booked: ['Booked', 'bg-tint text-plum-light'],
  cancelled: ['Cancelled', 'bg-muted/10 text-muted'],
  'no-show': ['No-show', 'bg-muted/10 text-muted'],
}

// text buttons: 44px square at least
export const textButton = `${linkClass} min-w-11 justify-center px-2`
