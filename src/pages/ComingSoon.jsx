import { Link } from 'react-router-dom'

const PHASE = { employees: 2, clients: 2, services: 2, appointments: 3, inventory: 3, pos: 3, 'sales-report': 4, 'financial-statement': 4 }

export function ComingSoon({ page }) {
  return (
    <div className="flex flex-col gap-3 pt-6 md:pt-4">
      <h1 className="font-heading text-[32px] font-medium">{page.label}</h1>
      <p className="text-muted">Coming in Phase {PHASE[page.key]}.</p>
      <Link to="/" className="inline-flex min-h-11 items-center self-start text-sm text-accent-ink underline underline-offset-4">
        Back to the dashboard
      </Link>
    </div>
  )
}
