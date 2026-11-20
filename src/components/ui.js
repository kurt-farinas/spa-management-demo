// shared class strings
export const linkClass = 'inline-flex min-h-11 items-center text-[13px] font-semibold text-accent-ink underline-offset-4 hover:underline'

export const pillClass = (on) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-[13px] transition-colors ${
    on ? 'bg-rail font-semibold text-rail-ink' : 'border border-line bg-surface text-ink hover:border-rail-active'
  }`

// ink on amber is 6.40:1 (still above 4.5:1 at the hover's 95% brightness); never white on amber
export const primaryButton = 'inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ink hover:brightness-95'

export const secondaryButton = 'inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-soft'

// appointment status → [label, pill and block colours]
// booked: ink on highlight/45 is 12.9:1; done: success on success-bg 5.43:1;
// cancelled and no-show stay visible as bordered stamps (muted 6.33:1, danger 7.07:1 on surface)
const stamp = 'border bg-surface font-bold uppercase tracking-[0.08em]'
export const STATUS_PILL = {
  done: ['Done', 'bg-success-bg font-semibold text-success'],
  booked: ['Booked', 'bg-highlight/45 font-semibold text-ink'],
  cancelled: ['Cancelled', `${stamp} border-muted text-muted`],
  'no-show': ['No-show', `${stamp} border-danger text-danger`],
}

// service category → colour band
export const CATEGORY_BAND = {
  Massage: 'bg-cat-massage',
  // the pale facial colour gets an inset ink hairline so a thin band or dot still shows on surface
  Facial: 'bg-cat-facial ring-1 ring-ink/25 ring-inset',
  Body: 'bg-cat-body',
  Nails: 'bg-cat-nails',
  Package: 'bg-cat-package',
}
export const categoryBand = (category) => CATEGORY_BAND[category] ?? 'bg-muted'

// text buttons: 44px square at least
export const textButton = `${linkClass} min-w-11 justify-center px-2`
