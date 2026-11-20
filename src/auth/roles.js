import { PiHouse, PiCalendarBlank, PiUsers, PiIdentificationBadge, PiFlowerLotus, PiPackage, PiCashRegister, PiChartBar, PiReceipt } from 'react-icons/pi'

const page = (key, label, icon, section) => ({ key, label, path: `/${key}`, icon, section })

export const PAGES = [
  { ...page('dashboard', 'Dashboard', PiHouse), path: '/' },
  page('appointments', 'Appointments', PiCalendarBlank),
  page('clients', 'Clients', PiUsers),
  page('employees', 'Employees', PiIdentificationBadge),
  page('services', 'Services', PiFlowerLotus),
  page('inventory', 'Inventory', PiPackage),
  page('pos', 'Point of Sale', PiCashRegister),
  page('sales-report', 'Sales report', PiChartBar, 'Reports'),
  page('financial-statement', 'Financial statement', PiReceipt, 'Reports'),
]

// pseudo-keys (not pages) gate parts of a page
const OWNER_ONLY = ['financial-statement', 'profit', 'commission']
const KNOWN = new Set([...PAGES.map((p) => p.key), ...OWNER_ONLY])

export function canSee(role, key) {
  if (!KNOWN.has(key)) return false
  if (role === 'owner') return true
  if (role === 'receptionist') return !OWNER_ONLY.includes(key)
  return false
}
