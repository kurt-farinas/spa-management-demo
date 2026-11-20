import { useNavigate } from 'react-router-dom'
import { PiArrowRight, PiInfo } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { Brand } from '../components/Brand.jsx'
import { CATEGORY_BAND, categoryBand } from '../components/ui.js'
import { spaConfig } from '../config/spa.config.js'
import { SPA_CLOSE, SPA_OPEN } from '../data/selectors.js'
import { clock } from '../lib/format.js'

const CHOICES = [
  { role: 'owner', label: 'Enter as Owner', initial: 'O', tag: 'Full access', mark: 'bg-rail text-rail-ink', line: 'Everything, including profit and the financial statement.' },
  { role: 'receptionist', label: 'Enter as Receptionist', initial: 'R', mark: 'bg-highlight/45 text-ink', line: 'Bookings, clients and sales. No profit figures.' },
]

export function Login() {
  const { login } = useRole()
  const navigate = useNavigate()
  const enter = (role) => {
    login(role)
    navigate('/')
  }
  return (
    <main className="grid min-h-dvh bg-page lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
      <aside className="on-rail flex flex-col bg-rail px-6 py-6 text-rail-ink md:px-12 md:py-10 lg:px-16 lg:py-14">
        <div className="max-lg:hidden">
          <Brand />
        </div>
        <div className="lg:mt-auto">
          <div className="text-5xl font-bold tracking-[-0.03em] lg:text-[88px] lg:leading-[88px]">{spaConfig.logoText}</div>
          <div className="mt-3 flex items-center gap-3 text-[13px] font-semibold tracking-[0.32em] lg:mt-4">
            <span aria-hidden="true" className="h-0.5 w-8 bg-highlight" />
            {spaConfig.subtitle}
          </div>
          <p className="mt-4 max-w-[380px] text-lg font-medium lg:mt-8 lg:text-2xl lg:leading-8">{spaConfig.tagline}</p>
        </div>
        <ul aria-label="Service categories" className="mt-6 grid grid-cols-5 overflow-hidden rounded-lg bg-surface lg:mt-auto">
          {Object.keys(CATEGORY_BAND).map((c) => (
            <li key={c} className="relative border-l border-line pt-3.5 pb-3 text-center text-xs font-semibold tracking-[0.04em] text-ink first:border-l-0">
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${categoryBand(c)}`} />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden justify-between gap-4 text-xs lg:flex">
          <span>Spa management, demo edition</span>
          <span className="tabular-nums">
            Open daily · {clock(SPA_OPEN)} – {clock(SPA_CLOSE)}
          </span>
        </div>
      </aside>

      <section aria-label="Choose a role" className="flex flex-col justify-center px-5 py-10 md:px-12 lg:px-16 xl:px-32">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-muted">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Demo · sample data
        </span>
        <h1 className="mt-6 text-[32px] leading-10 font-bold tracking-[-0.01em] lg:text-[40px] lg:leading-[48px]">Welcome to the demo</h1>
        <p className="mt-3 text-[17px] leading-[26px] text-muted">Pick how you want to look around. No password needed.</p>
        <div className="mt-8 flex max-w-xl flex-col gap-4 lg:mt-10">
          {CHOICES.map((c) => (
            <button
              key={c.role}
              type="button"
              onClick={() => enter(c.role)}
              className="group grid grid-cols-[48px_minmax(0,1fr)_40px] items-center gap-4 rounded-[10px] border border-line bg-surface p-4 text-left text-ink transition-colors hover:border-rail focus-visible:border-rail md:gap-5 md:p-6"
            >
              <span aria-hidden="true" className={`grid size-12 place-items-center rounded-lg text-lg font-bold ${c.mark}`}>
                {c.initial}
              </span>
              <span>
                <span className="block text-lg leading-6 font-bold">
                  {c.label}
                  {c.tag && (
                    <span className="ml-2 inline-block rounded border border-line px-1.5 align-[2px] text-[11px] leading-4 font-semibold text-muted">
                      {c.tag}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-muted">{c.line}</span>
              </span>
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-full border border-line">
                <PiArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
        <p className="mt-7 flex items-center gap-2 text-[13px] text-muted">
          <PiInfo aria-hidden="true" className="size-4 shrink-0" />A demo with sample data. It resets when you reload.
        </p>
      </section>
    </main>
  )
}
