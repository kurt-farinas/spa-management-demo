import { spaConfig } from '../config/spa.config.js'
import { createRandom, int, pick } from './random.js'
import { pad, toDateStr, toDateTimeStr, addDays } from './dates.js'

const EMPLOYEES = [
  { id: 'e1', name: 'Ana Cruz', role: 'Therapist', phone: '0917 555 0101', hiredOn: '2021-03-15', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'e2', name: 'Maricel Santos', role: 'Therapist', phone: '0918 555 0102', hiredOn: '2021-08-02', schedule: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: 'e3', name: 'Jomar Reyes', role: 'Therapist', phone: '0919 555 0103', hiredOn: '2022-01-10', schedule: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'e4', name: 'Liza Bautista', role: 'Therapist', phone: '0920 555 0104', hiredOn: '2022-06-20', schedule: ['Mon', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'e5', name: 'Rhea Villanueva', role: 'Therapist', phone: '0921 555 0105', hiredOn: '2023-02-13', schedule: ['Mon', 'Tue', 'Fri', 'Sat', 'Sun'] },
  { id: 'e6', name: 'Paolo Mendoza', role: 'Therapist', phone: '0922 555 0106', hiredOn: '2024-04-01', schedule: ['Mon', 'Tue', 'Wed', 'Sat', 'Sun'] },
  { id: 'e7', name: 'Kristine Garcia', role: 'Receptionist', phone: '0923 555 0107', hiredOn: '2022-09-05', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: 'e8', name: 'Ramon dela Cruz', role: 'Manager', phone: '0924 555 0108', hiredOn: '2020-11-03', schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
]

const PRODUCTS = [
  { id: 'p1', name: 'Lavender massage oil', category: 'Oils', price: 650, cost: 260, stock: 24, reorderAt: 8 },
  { id: 'p2', name: 'Eucalyptus massage oil', category: 'Oils', price: 650, cost: 260, stock: 18, reorderAt: 8 },
  { id: 'p3', name: 'Virgin coconut oil', category: 'Oils', price: 480, cost: 190, stock: 6, reorderAt: 8 },
  { id: 'p4', name: 'Ylang-ylang essential oil', category: 'Oils', price: 520, cost: 210, stock: 15, reorderAt: 6 },
  { id: 'p5', name: 'Gold clay mask', category: 'Masks', price: 890, cost: 350, stock: 12, reorderAt: 5 },
  { id: 'p6', name: 'Charcoal detox mask', category: 'Masks', price: 720, cost: 280, stock: 4, reorderAt: 5 },
  { id: 'p7', name: 'Sheet mask set of 5', category: 'Masks', price: 450, cost: 160, stock: 30, reorderAt: 10 },
  { id: 'p8', name: 'Coffee body scrub', category: 'Scrubs', price: 580, cost: 220, stock: 20, reorderAt: 8 },
  { id: 'p9', name: 'Sea salt scrub', category: 'Scrubs', price: 620, cost: 240, stock: 14, reorderAt: 6 },
  { id: 'p10', name: 'Brown sugar lip scrub', category: 'Scrubs', price: 280, cost: 100, stock: 25, reorderAt: 10 },
  { id: 'p11', name: 'Shea body butter', category: 'Body care', price: 750, cost: 300, stock: 16, reorderAt: 6 },
  { id: 'p12', name: 'Aloe after-sun gel', category: 'Body care', price: 390, cost: 150, stock: 22, reorderAt: 8 },
  { id: 'p13', name: 'Aromatherapy candle', category: 'Home', price: 850, cost: 320, stock: 10, reorderAt: 4 },
  { id: 'p14', name: 'Reed diffuser', category: 'Home', price: 980, cost: 380, stock: 8, reorderAt: 4 },
  { id: 'p15', name: 'Herbal bath salts', category: 'Bath', price: 420, cost: 160, stock: 9, reorderAt: 6 },
]

const FIRST_NAMES = ['Maria', 'Jasmine', 'Kristine', 'Angelica', 'Camille', 'Patricia', 'Bea', 'Nicole', 'Joy', 'Grace', 'Andrea', 'Carmela', 'Rowena', 'Jennifer', 'Princess', 'Lovely', 'Mark', 'John Paul', 'Miguel', 'Carlo', 'Renz', 'Joshua', 'Rafael', 'Gabriel', 'Jerome']
const LAST_NAMES = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Tomas', 'Castillo', 'Flores', 'Villanueva', 'Ramos', 'Castro', 'Rivera', 'Aquino', 'Navarro', 'Salazar', 'Mercado', 'Dizon', 'Pascual', 'Soriano', 'Manalo', 'Lim', 'Tan', 'Gonzales', 'Domingo', 'Del Rosario', 'Aguilar']
const NOTES = ['', '', '', 'Prefers firm pressure', 'Allergic to nuts, no almond oil', 'Likes a quiet room', 'Lower back pain', 'Prefers a female therapist', 'Sensitive skin']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// how often each category is booked, relative to the others
const CATEGORY_WEIGHT = { Massage: 4, Facial: 3, Body: 2, Nails: 3, Package: 1 }
const OPEN_MIN = 10 * 60
const CLOSE_MIN = 20 * 60

const daysBetween = (a, b) => Math.round((b - a) / 86400000)
const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

export function buildSeed(seed = 42, today = new Date()) {
  const rand = createRandom(seed)
  const services = structuredClone(spaConfig.services)
  const employees = structuredClone(EMPLOYEES)
  const products = structuredClone(PRODUCTS)

  const todayStr = toDateStr(today)
  const nowStr = toDateTimeStr(today)
  const windowStart = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // Clients: most joined before the six-month window, some during it, a few this month
  const clients = []
  const names = new Set()
  for (let i = 1; i <= 60; i++) {
    let first, last
    do {
      first = pick(rand, FIRST_NAMES)
      last = pick(rand, LAST_NAMES)
    } while (names.has(`${first} ${last}`))
    names.add(`${first} ${last}`)
    const joined =
      i <= 44 ? addDays(windowStart, -int(rand, 1, 1000))
      : i <= 56 ? addDays(windowStart, int(rand, 0, daysBetween(windowStart, monthStart) - 1))
      : addDays(monthStart, int(rand, 0, today.getDate() - 1))
    const joinedOn = toDateStr(joined)
    clients.push({
      id: `c${i}`,
      name: `${first} ${last}`,
      phone: `09${int(rand, 10, 99)} ${int(rand, 100, 999)} ${int(rand, 1000, 9999)}`,
      email: `${first}.${last}@example.com`.toLowerCase().replaceAll(' ', ''),
      birthday: `${int(rand, 1965, 2003)}-${pad(int(rand, 1, 12))}-${pad(int(rand, 1, 28))}`,
      joinedOn,
      notes: pick(rand, NOTES),
      tags: daysBetween(joined, today) <= 30 ? ['New'] : rand() < 0.15 ? ['VIP', 'Regular'] : ['Regular'],
    })
  }

  // Appointments: each therapist's day is filled in order, so they never overlap
  const therapists = employees.filter((e) => e.role === 'Therapist')
  const servicePool = services.flatMap((s) => Array(CATEGORY_WEIGHT[s.category] ?? 1).fill(s))
  const appointments = []
  const lastDay = daysBetween(windowStart, today) + 7
  for (let i = 0; i <= lastDay; i++) {
    const day = addDays(windowStart, i)
    const dayStr = toDateStr(day)
    const future = dayStr > todayStr
    const known = clients.filter((c) => c.joinedOn <= dayStr)
    for (const t of therapists) {
      if (!t.schedule.includes(WEEKDAYS[day.getDay()])) continue
      let min = OPEN_MIN
      for (;;) {
        min += pick(rand, [0, 30, 60, 90, 120])
        const svc = pick(rand, servicePool)
        if (min + svc.durationMin > CLOSE_MIN) break
        // the coming week is only lightly booked so far
        if (!future || rand() < 0.1) {
          const ended = `${dayStr}T${hhmm(min + svc.durationMin)}` <= nowStr
          const r = rand()
          appointments.push({
            clientId: pick(rand, known).id,
            employeeId: t.id,
            serviceId: svc.id,
            start: `${dayStr}T${hhmm(min)}`,
            durationMin: svc.durationMin,
            status: !ended ? 'booked' : r < 0.05 ? 'cancelled' : r < 0.09 ? 'no-show' : 'done',
          })
        }
        min += svc.durationMin
      }
    }
  }
  appointments.sort((a, b) => a.start.localeCompare(b.start) || a.employeeId.localeCompare(b.employeeId))
  appointments.forEach((a, i) => (a.id = `A-${i + 1}`))

  // Sales: one per done appointment, sometimes with a retail product
  const sales = []
  for (const a of appointments) {
    if (a.status !== 'done') continue
    const svc = services.find((s) => s.id === a.serviceId)
    const lines = [{ type: 'service', id: svc.id, name: svc.name, qty: 1, unitPrice: svc.price }]
    if (rand() < 0.25) {
      const p = pick(rand, products)
      lines.push({ type: 'product', id: p.id, name: p.name, qty: int(rand, 1, 2), unitPrice: p.price })
    }
    sales.push({
      id: `S-${sales.length + 1}`,
      date: a.start,
      clientId: a.clientId,
      employeeId: a.employeeId,
      lines,
      total: lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
      payment: pick(rand, ['cash', 'cash', 'card', 'gcash', 'gcash']),
    })
  }

  // Expenses: rent and salaries are fixed (prorated for the partial first and last
  // months), the rest follow the month's revenue, which lands margins near 30%
  const coveredDays = daysBetween(windowStart, today) + 1
  const fullMonthRevenue = (sales.reduce((sum, s) => sum + s.total, 0) / coveredDays) * 30
  const expenses = []
  for (let m = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1); m <= today; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
    const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0)
    const from = m < windowStart ? windowStart : m
    const to = monthEnd > today ? today : monthEnd
    const share = (daysBetween(from, to) + 1) / monthEnd.getDate()
    const key = toDateStr(m).slice(0, 7)
    const revenue = sales.filter((s) => s.date.startsWith(key)).reduce((sum, s) => sum + s.total, 0)
    const vary = (rate) => Math.round(revenue * rate * (0.9 + 0.2 * rand()))
    // the current month is still filling up, so its rent and salaries follow its own
    // revenue like the other costs; prorated averages would swamp the first days
    const fixed = (rate) => Math.round(((key === todayStr.slice(0, 7) ? revenue : fullMonthRevenue * share) * rate) / 100) * 100
    const amounts = {
      Rent: fixed(0.14),
      Salaries: fixed(0.33),
      Utilities: vary(0.06),
      Supplies: vary(0.07),
      Marketing: vary(0.04),
    }
    for (const [category, amount] of Object.entries(amounts)) {
      expenses.push({ id: `X-${expenses.length + 1}`, date: toDateStr(from), category, amount })
    }
  }

  return { employees, clients, services, products, appointments, sales, expenses }
}
