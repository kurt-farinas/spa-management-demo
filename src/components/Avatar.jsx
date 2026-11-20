import { initials } from '../lib/format.js'

export function Avatar({ name, large = false }) {
  return large ? (
    <span aria-hidden="true" className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-rail text-xl font-semibold text-rail-ink">
      {initials(name)}
    </span>
  ) : (
    <span aria-hidden="true" className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-soft text-xs font-semibold text-ink">
      {initials(name)}
    </span>
  )
}
