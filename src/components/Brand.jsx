import { spaConfig } from '../config/spa.config.js'

export function Leaf({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 22 22" fill="none" stroke="currentColor" className={`shrink-0 text-highlight ${className}`}>
      <path d="M11 2C5 7 5 15 11 20 17 15 17 7 11 2Z" strokeWidth="1.6" />
      <path d="M11 6v13" strokeWidth="1.4" />
    </svg>
  )
}

export function Brand({ large = false }) {
  return (
    <div className={`flex items-center ${large ? 'flex-col gap-4 text-center' : 'gap-2'}`}>
      <Leaf className={large ? 'size-14' : 'size-[22px]'} />
      <div>
        <div className={`font-bold text-rail-ink ${large ? 'text-4xl' : 'text-xl leading-6'}`}>{spaConfig.logoText}</div>
        <div className={`font-semibold tracking-[0.14em] text-rail-ink ${large ? 'mt-1 text-xs' : 'text-[11px]'}`}>{spaConfig.subtitle}</div>
      </div>
    </div>
  )
}
