import { Link } from 'react-router-dom'
import { linkClass } from '../components/ui.js'

const PHASE = { employees: 2, clients: 2, services: 2, appointments: 3, inventory: 3, pos: 3, 'sales-report': 4, 'financial-statement': 4 }

export function ComingSoon({ page }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">{page.label}</h1>
      <p className="text-sm text-muted">Coming in Phase {PHASE[page.key]}.</p>
      <Link to="/" className={`${linkClass} mt-2 self-start`}>
        Back to the dashboard
      </Link>
    </div>
  )
}
