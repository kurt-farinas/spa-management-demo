import { Link } from 'react-router-dom'
import { PiArrowLeft } from 'react-icons/pi'

export function BackLink({ to, children, className = 'self-start text-accent-ink' }) {
  return (
    <Link to={to} className={`inline-flex min-h-11 items-center gap-1.5 text-[13px] underline-offset-4 hover:underline ${className}`}>
      <PiArrowLeft aria-hidden="true" className="size-3.5" />
      {children}
    </Link>
  )
}
