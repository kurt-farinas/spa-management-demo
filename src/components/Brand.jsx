import { spaConfig } from '../config/spa.config.js'

export function Brand({ large = false }) {
  return (
    <div className={`flex items-center ${large ? 'flex-col gap-4 text-center' : 'gap-2.5'}`}>
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-on-plum font-heading text-gold-on-plum ${large ? 'size-16 text-3xl' : 'size-9 text-lg'}`}
      >
        {spaConfig.logoText[0]}
      </div>
      <div>
        <div className={`font-heading text-gold-on-plum ${large ? 'text-4xl' : 'text-[19px]'}`}>{spaConfig.logoText}</div>
        <div className={`tracking-[0.12em] text-lavender ${large ? 'mt-1 text-xs' : 'text-[11px]'}`}>DAY SPA</div>
      </div>
    </div>
  )
}
