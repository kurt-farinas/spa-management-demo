import { toDateStr, addDays } from './dates.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const sum = (list, fn) => list.reduce((total, x) => total + fn(x), 0)
const lineTotal = (l) => l.qty * l.unitPrice

export function dashboardStats(state, today) {
  const day = toDateStr(today)
  const month = day.slice(0, 7)
  const counts = new Map()
  for (const s of state.sales) {
    if (!s.date.startsWith(month)) continue
    for (const l of s.lines) if (l.type === 'service') counts.set(l.name, (counts.get(l.name) ?? 0) + l.qty)
  }
  return {
    salesToday: sum(state.sales.filter((s) => s.date.startsWith(day)), (s) => s.total),
    bookingsToday: state.appointments.filter((a) => a.start.startsWith(day) && a.status !== 'cancelled' && a.status !== 'no-show').length,
    newClientsThisMonth: state.clients.filter((c) => c.joinedOn.startsWith(month)).length,
    topServices: [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  }
}

export function todaysAppointments(state, today) {
  const day = toDateStr(today)
  const nameOf = (list, id) => list.find((x) => x.id === id)?.name ?? ''
  return state.appointments
    .filter((a) => a.start.startsWith(day))
    .map((a) => ({
      id: a.id,
      time: a.start.slice(11),
      clientName: nameOf(state.clients, a.clientId),
      employeeName: nameOf(state.employees, a.employeeId),
      serviceName: nameOf(state.services, a.serviceId),
      status: a.status,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

// the dashboard list: cancelled left out, appointments still to come first, each group by time
export function agenda(appointments) {
  const live = appointments.filter((a) => a.status !== 'cancelled')
  return [...live.filter((a) => a.status === 'booked'), ...live.filter((a) => a.status !== 'booked')]
}

// from / to are 'YYYY-MM-DD', both included; leave one out for an open range
export function salesSummary(sales, { from, to, groupBy }, state) {
  const rows = new Map()
  const add = (key, label, total, count) => {
    if (!rows.has(key)) rows.set(key, { key, label, total: 0, count: 0 })
    const row = rows.get(key)
    row.total += total
    row.count += count
  }
  for (const s of sales) {
    const day = s.date.slice(0, 10)
    if ((from && day < from) || (to && day > to)) continue
    const [y, m, d] = day.split('-')
    if (groupBy === 'day') add(day, `${MONTHS[m - 1]} ${Number(d)}`, s.total, 1)
    else if (groupBy === 'month') add(`${y}-${m}`, `${MONTHS[m - 1]} ${y}`, s.total, 1)
    else if (groupBy === 'employee')
      add(s.employeeId, state?.employees.find((e) => e.id === s.employeeId)?.name ?? s.employeeId, s.total, 1)
    else if (groupBy === 'service')
      for (const l of s.lines) if (l.type === 'service') add(l.id, l.name, lineTotal(l), l.qty)
  }
  const list = [...rows.values()]
  return groupBy === 'day' || groupBy === 'month'
    ? list.sort((a, b) => a.key.localeCompare(b.key))
    : list.sort((a, b) => b.total - a.total)
}

export function incomeStatement(state, month) {
  const lines = state.sales.filter((s) => s.date.startsWith(month)).flatMap((s) => s.lines)
  const products = lines.filter((l) => l.type === 'product')
  const serviceRevenue = sum(lines.filter((l) => l.type === 'service'), lineTotal)
  const productRevenue = sum(products, lineTotal)
  const costOfProducts = sum(products, (l) => l.qty * (state.products.find((p) => p.id === l.id)?.cost ?? 0))
  const byCategory = new Map()
  for (const e of state.expenses) {
    if (e.date.startsWith(month)) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount)
  }
  const expenses = [...byCategory].map(([category, amount]) => ({ category, amount }))
  const totalRevenue = serviceRevenue + productRevenue
  const totalExpenses = sum(expenses, (e) => e.amount)
  return {
    serviceRevenue,
    productRevenue,
    totalRevenue,
    costOfProducts,
    grossProfit: totalRevenue - costOfProducts,
    expenses,
    totalExpenses,
    netIncome: totalRevenue - costOfProducts - totalExpenses,
  }
}

// one row per day for the `days` days ending today; days with no sales are 0
export function dailySales(sales, today, days) {
  const first = addDays(today, 1 - days)
  const rows = salesSummary(sales, { from: toDateStr(first), to: toDateStr(today), groupBy: 'day' })
  const byDay = new Map(rows.map((r) => [r.key, r]))
  return Array.from({ length: days }, (_, i) => {
    const key = toDateStr(addDays(first, i))
    const [, m, d] = key.split('-')
    return byDay.get(key) ?? { key, label: `${MONTHS[m - 1]} ${Number(d)}`, total: 0, count: 0 }
  })
}
