import { useNavigate } from 'react-router-dom'
import { PiArrowRight } from 'react-icons/pi'
import { useRole } from '../auth/RoleProvider.jsx'
import { Brand } from '../components/Brand.jsx'
import { spaConfig } from '../config/spa.config.js'

const CHOICES = [
  { role: 'owner', label: 'Enter as Owner', line: 'Everything, including profit and the financial statement.' },
  { role: 'receptionist', label: 'Enter as Receptionist', line: 'Bookings, clients and sales. No profit figures.' },
]

export function Login() {
  const { login } = useRole()
  const navigate = useNavigate()
  const enter = (role) => {
    login(role)
    navigate('/')
  }
  return (
    <main className="on-rail flex min-h-dvh items-center justify-center bg-rail px-5 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-5">
          <Brand large />
          <p className="font-heading text-lg text-line italic">{spaConfig.tagline}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          {CHOICES.map((c) => (
            <button
              key={c.role}
              type="button"
              onClick={() => enter(c.role)}
              className="group flex min-h-11 w-full items-center gap-4 rounded-2xl border border-rail-active bg-rail-active/40 px-6 py-5 text-left transition-colors hover:border-rail-ink/60 hover:bg-rail-active"
            >
              <span className="flex-1">
                <span className="block font-heading text-xl text-rail-ink">{c.label}</span>
                <span className="mt-1 block text-sm text-line">{c.line}</span>
              </span>
              <PiArrowRight aria-hidden="true" className="size-5 shrink-0 text-line transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-line">A demo with sample data. No password needed.</p>
      </div>
    </main>
  )
}
