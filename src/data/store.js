import { toDateStr, toDateTimeStr, addMinutes } from './dates.js'

// Every change to the demo data goes through here. The reducer trusts its input:
// validate first with validateCheckout / validateBooking.
export function demoReducer(state, action) {
  switch (action.type) {
    case 'addClient':
      return { ...state, clients: [action.client, ...state.clients] }
    case 'bookAppointment':
      return { ...state, appointments: [...state.appointments, action.appointment] }
    case 'checkout': {
      const sold = {}
      for (const l of action.sale.lines) if (l.type === 'product') sold[l.id] = (sold[l.id] ?? 0) + l.qty
      return {
        ...state,
        sales: [...state.sales, action.sale],
        products: state.products.map((p) => (sold[p.id] ? { ...p, stock: p.stock - sold[p.id] } : p)),
      }
    }
    default:
      return state
  }
}

export function validateCheckout(state, { lines }) {
  if (!lines?.length) return 'Add at least one item'
  for (const l of lines) {
    if (l.type !== 'product') continue
    const p = state.products.find((x) => x.id === l.id)
    if (p && l.qty > p.stock) return `Only ${p.stock} left`
  }
  return null
}

const blocks = (a) => a.status !== 'cancelled' && a.status !== 'no-show'

export function validateBooking(state, { employeeId, start, durationMin }) {
  const end = addMinutes(start, durationMin)
  const clash = state.appointments.find(
    (a) => a.employeeId === employeeId && blocks(a) && a.start < end && start < addMinutes(a.start, a.durationMin),
  )
  if (!clash) return null
  const employee = state.employees.find((e) => e.id === employeeId)
  return `${employee.name} is booked ${clash.start.slice(11)}–${addMinutes(clash.start, clash.durationMin).slice(11)}`
}

export function buildSale(state, { clientId, employeeId, lines, payment }, now) {
  const full = lines.map(({ type, id, qty }) => {
    const item = (type === 'service' ? state.services : state.products).find((x) => x.id === id)
    return { type, id, name: item.name, qty, unitPrice: item.price }
  })
  return {
    id: `S-${state.sales.length + 1}`,
    date: toDateTimeStr(now),
    clientId,
    employeeId,
    lines: full,
    total: full.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
    payment,
  }
}

export const buildClient = (state, input, now) => ({
  ...input,
  id: `C-${state.clients.length + 1}`,
  joinedOn: toDateStr(now),
  tags: ['New'],
})

export const buildAppointment = (state, input) => ({
  ...input,
  id: `A-${state.appointments.length + 1}`,
  status: 'booked',
})
