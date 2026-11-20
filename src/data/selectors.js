import { toDateStr, addDays, addMinutes } from './dates.js'
import { MONTHS, WEEK, nameOf, clock } from '../lib/format.js'

const sum = (list, fn) => list.reduce((total, x) => total + fn(x), 0)
const lineTotal = (l) => l.qty * l.unitPrice

// still counts toward the day: cancelled and no-show bookings do not
export const isActiveBooking = (a) => a.status !== 'cancelled' && a.status !== 'no-show'

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
    bookingsToday: state.appointments.filter((a) => a.start.startsWith(day) && isActiveBooking(a)).length,
    newClientsThisMonth: state.clients.filter((c) => c.joinedOn.startsWith(month)).length,
    topServices: [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  }
}

export function todaysAppointments(state, today) {
  const day = toDateStr(today)
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
      s.employeeId
        ? add(s.employeeId, state?.employees.find((e) => e.id === s.employeeId)?.name ?? s.employeeId, s.total, 1)
        : add('none', 'No therapist (retail)', s.total, 1)
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

// every 'YYYY-MM' with sales or expenses, newest first
export const statementMonths = (state) =>
  [...new Set([...state.sales, ...state.expenses].map((x) => x.date.slice(0, 7)))].sort().reverse()

// change is a % of the previous amount's size (so a smaller loss reads as a rise), or null with no previous to compare
const compareLine = (current, previous) => ({
  current,
  previous,
  change: previous ? Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10 : null,
})

// cur and prev are incomeStatement results; prev may be null for the first month
export function compareStatements(cur, prev) {
  const keys = ['serviceRevenue', 'productRevenue', 'totalRevenue', 'costOfProducts', 'grossProfit', 'totalExpenses', 'netIncome']
  const result = Object.fromEntries(keys.map((k) => [k, compareLine(cur[k], prev ? prev[k] : null)]))
  const amountOf = (list, category) => list.find((e) => e.category === category)?.amount ?? 0
  const categories = [...new Set([...cur.expenses, ...(prev?.expenses ?? [])].map((e) => e.category))]
  result.expenses = categories.map((category) => ({
    category,
    ...compareLine(amountOf(cur.expenses, category), prev ? amountOf(prev.expenses, category) : null),
  }))
  return result
}

// months in the order given; costs are products sold plus operating expenses
export const monthlyTrend = (state, months) =>
  months.map((month) => {
    const s = incomeStatement(state, month)
    return { month, label: MONTHS[month.slice(5, 7) - 1], revenue: s.totalRevenue, costs: s.costOfProducts + s.totalExpenses, netIncome: s.netIncome }
  })

// joined in the last 30 days, today counted: the one rule for the New tag and the header count
export const isNewClient = (client, today) => client.joinedOn > toDateStr(addDays(today, -30)) && client.joinedOn <= toDateStr(today)

// keeps state order, which is newest client first: addClient puts new clients at the front
export function clientSummaries(state, today) {
  const day = toDateStr(today)
  const byClient = new Map()
  for (const s of state.sales) {
    const date = s.date.slice(0, 10)
    if (date > day) continue
    const row = byClient.get(s.clientId) ?? { visits: 0, totalSpent: 0, lastVisit: null }
    row.visits += 1
    row.totalSpent += s.total
    if (!row.lastVisit || date > row.lastVisit) row.lastVisit = date
    byClient.set(s.clientId, row)
  }
  // 'New' is worked out from the join date, never read from the stored tags
  const tagsOf = (c) => {
    const kept = c.tags.filter((t) => t !== 'New')
    if (isNewClient(c, today)) return [...kept, 'New']
    return kept.length ? kept : ['Regular']
  }
  return state.clients.map((c) => ({ ...c, tags: tagsOf(c), visits: 0, totalSpent: 0, lastVisit: null, ...byClient.get(c.id) }))
}

// one row per sale, newest first; date is 'YYYY-MM-DD'
export function clientHistory(state, clientId) {
  return state.sales
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => ({
      id: s.id,
      date: s.date.slice(0, 10),
      serviceNames: s.lines.filter((l) => l.type === 'service').map((l) => l.name).join(', '),
      therapistName: state.employees.find((e) => e.id === s.employeeId)?.name ?? '',
      total: s.total,
    }))
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

// month is 'YYYY-MM'; cancelled ones stay in the list (the profile shows them), sorted by start
export function employeeMonthAppointments(state, employeeId, month) {
  return state.appointments
    .filter((a) => a.employeeId === employeeId && a.start.startsWith(month))
    .sort((a, b) => a.start.localeCompare(b.start))
}

// commission is each service line at that service's own rate, rounded to whole pesos
export function employeeStats(state, employeeId, month) {
  const lines = state.sales
    .filter((s) => s.employeeId === employeeId && s.date.startsWith(month))
    .flatMap((s) => s.lines.filter((l) => l.type === 'service'))
  const rate = (l) => state.services.find((s) => s.id === l.id)?.commissionRate ?? 0
  return {
    appointments: employeeMonthAppointments(state, employeeId, month).filter((a) => a.status !== 'cancelled').length,
    servicesDone: sum(lines, (l) => l.qty),
    serviceSales: sum(lines, lineTotal),
    commission: Math.round(sum(lines, (l) => lineTotal(l) * rate(l))),
  }
}

// 'YYYY-MM-DD' → the 7 days of its week, Monday first
export function weekDays(anyDate) {
  const d = new Date(`${anyDate}T00:00`)
  const monday = addDays(d, -((d.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(monday, i)))
}

// both ends included, sorted by start; leave employeeId out for every therapist
export function appointmentsInRange(state, fromDate, toDate, employeeId) {
  return state.appointments
    .filter((a) => a.start.slice(0, 10) >= fromDate && a.start.slice(0, 10) <= toDate && (!employeeId || a.employeeId === employeeId))
    .sort((a, b) => a.start.localeCompare(b.start) || a.employeeId.localeCompare(b.employeeId))
    .map((a) => ({
      ...a,
      clientName: nameOf(state.clients, a.clientId),
      employeeName: nameOf(state.employees, a.employeeId),
      serviceName: nameOf(state.services, a.serviceId),
    }))
}

export const SPA_OPEN = '10:00'
export const SPA_CLOSE = '20:00'
// 'YYYY-MM-DD' → 'Mon' … 'Sun', the form employee schedules use
export const weekdayOf = (date) => WEEK[(new Date(`${date}T00:00`).getDay() + 6) % 7]

// the form's own rules; overlaps are checked by the store's validateBooking
export function validateBookingForm(state, { clientId, serviceId, employeeId, date, time }, today = toDateStr(new Date())) {
  const errors = {}
  if (!state.clients.some((c) => c.id === clientId)) errors.clientId = 'Choose a client'
  if (!serviceId) errors.serviceId = 'Choose a service'
  if (!date) errors.date = 'Choose a date'
  else if (date < today) errors.date = 'Pick today or a later date'
  if (!time) errors.time = 'Choose a time'
  const employee = state.employees.find((e) => e.id === employeeId)
  if (!employee) errors.employeeId = 'Choose a therapist'
  else if (date && !employee.schedule?.includes(weekdayOf(date)))
    errors.employeeId = `${employee.name} is off on ${new Date(`${date}T00:00`).toLocaleDateString('en-US', { weekday: 'long' })}`
  const service = state.services.find((s) => s.id === serviceId)
  if (service && date && time && addMinutes(`${date}T${time}`, service.durationMin) > `${date}T${SPA_CLOSE}`)
    errors.time = `Ends after closing (${clock(SPA_CLOSE)})`
  return errors
}
// out at 0, low at or below the reorder point
export const stockStatus = (p) => (p.stock <= 0 ? 'out' : p.stock <= p.reorderAt ? 'low' : 'ok')

// lowStock counts every product at or below its reorder point, out of stock included
export const inventorySummary = (state) => ({
  products: state.products.length,
  lowStock: state.products.filter((p) => stockStatus(p) !== 'ok').length,
  stockValueAtCost: sum(state.products, (p) => p.stock * p.cost),
})

// lines are checkout input: { type: 'service' | 'product', id, qty }
export const cartTotal = (state, lines) =>
  sum(lines, (l) => l.qty * ((l.type === 'service' ? state.services : state.products).find((x) => x.id === l.id)?.price ?? 0))
