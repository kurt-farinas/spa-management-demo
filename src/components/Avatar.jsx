import { initials } from '../lib/format.js'

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
