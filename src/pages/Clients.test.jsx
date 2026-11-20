// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { Clients } from './Clients.jsx'
import { ClientProfile } from './ClientProfile.jsx'
import { toDateStr, addDays } from '../data/dates.js'

vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn() }) }))

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no modal dialog support
HTMLDialogElement.prototype.showModal ??= function () {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function () {
  this.open = false
  this.dispatchEvent(new Event('close'))
}

const initialState = {
  employees: [{ id: 'e1', name: 'Liza Bautista' }],
  clients: [
    { id: 'c1', name: 'Ana Reyes', phone: '0917 482 1103', email: '', birthday: '', joinedOn: '2024-03-02', notes: '', tags: ['VIP', 'Regular'] },
    { id: 'c2', name: 'Carlo Mendoza', phone: '0928 115 7740', email: '', birthday: '', joinedOn: '2025-01-15', notes: '', tags: ['Regular'] },
  ],
  services: [],
  products: [],
  appointments: [],
  sales: [{ id: 'S-1', date: '2026-01-05T10:00', clientId: 'c1', employeeId: 'e1', total: 1200, lines: [{ type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice: 1200 }] }],
  expenses: [],
}

let mounted
function render(state = initialState, { at = '/', page = <Clients /> } = {}) {
  const el = document.createElement('div')
  document.body.append(el)
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole="receptionist">
        <DemoStoreProvider initialState={state}>
          <MemoryRouter initialEntries={[at]}>
            {page}
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  mounted = { el, root }
  return el
}
afterEach(() => {
  act(() => mounted.root.unmount())
  mounted.el.remove()
})

// React listens for input events; set the value the way a browser would
function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
const click = (node) => act(() => node.click())
const button = (el, name) => [...el.querySelectorAll('button')].find((b) => b.textContent.trim() === name)
const rowNames = (el) => [...el.querySelectorAll('tbody tr')].map((tr) => tr.querySelector('a').textContent)

describe('Clients', () => {
  it("typing 'ana' filters the list to Ana's row", () => {
    const el = render()
    expect(rowNames(el)).toEqual(['Ana Reyes', 'Carlo Mendoza'])
    type(el.querySelector('#client-search'), 'ana')
    expect(rowNames(el)).toEqual(['Ana Reyes'])
  })

  it('finds a client by phone digits, and offers to clear a search with no match', () => {
    const el = render()
    type(el.querySelector('#client-search'), '09281157')
    expect(rowNames(el)).toEqual(['Carlo Mendoza'])
    type(el.querySelector('#client-search'), 'zzz')
    expect(el.textContent).toContain('No clients match "zzz"')
    click(button(el, 'Clear search'))
    expect(rowNames(el)).toHaveLength(2)
  })

  it('adds a client through the dialog: errors first, then they show at the top with 0 visits', () => {
    const el = render()
    click(button(el, 'Add client'))
    const form = el.querySelector('dialog form')
    act(() => form.requestSubmit())
    expect(form.textContent).toContain('Enter a name')
    expect(form.textContent).toContain('Enter a mobile number like 0917 123 4567')

    type(form.querySelector('#client-name'), 'Pia Dizon')
    type(form.querySelector('#client-phone'), '09396640185')
    act(() => form.requestSubmit())

    expect(toast.success).toHaveBeenCalledWith('Client added')
    expect(el.querySelector('dialog').open).toBe(false)
    const first = el.querySelector('tbody tr')
    expect(first.querySelector('a').textContent).toBe('Pia Dizon')
    expect(first.textContent).toContain('New')
    expect(first.textContent).toContain('0939 664 0185')
    expect(first.querySelectorAll('td')[3].textContent).toBe('0')
  })

  it('the name is a real link to the profile; Preview selects the client for the side panel', () => {
    const el = render()
    const row = el.querySelectorAll('tbody tr')[1]
    expect(row.querySelector('a').getAttribute('href')).toBe('/clients/c2')
    const panel = () => el.querySelector('section[aria-label$="profile"]').getAttribute('aria-label')
    expect(panel()).toBe('Ana Reyes profile')
    click(row.querySelector('button[aria-label="Preview Carlo Mendoza"]'))
    expect(panel()).toBe('Carlo Mendoza profile')
    expect(row.querySelector('a').getAttribute('href')).toBe('/clients/c2')
  })

  it('Book again links to the appointments page with the client', () => {
    const el = render()
    const link = [...el.querySelectorAll('a')].find((a) => a.textContent === 'Book again')
    expect(link.getAttribute('href')).toBe('/appointments?client=c1')
  })

  it('the header count and the New filter use the same rule', () => {
    const today = new Date()
    const day = (n) => toDateStr(addDays(today, -n))
    const base = { phone: '0917 000 0000', email: '', birthday: '', notes: '' }
    const el = render({
      ...initialState,
      clients: [
        { ...base, id: 'n1', name: 'Joined today', joinedOn: day(0), tags: ['Regular'] },
        { ...base, id: 'n2', name: 'Three days', joinedOn: day(3), tags: ['New'] },
        { ...base, id: 'o1', name: 'Forty days', joinedOn: day(40), tags: ['New'] },
      ],
      sales: [],
    })
    expect(el.textContent).toContain('2 new in the last 30 days')
    click(button(el, 'New'))
    expect(rowNames(el)).toEqual(['Joined today', 'Three days'])
  })

  it('closes the add dialog on a backdrop click only when the press started on the backdrop', () => {
    const el = render()
    const dialog = el.querySelector('dialog')
    const form = dialog.querySelector('form')
    click(button(el, 'Add client'))
    act(() => {
      form.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(dialog.open).toBe(true)
    act(() => {
      dialog.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(dialog.open).toBe(false)
  })
})

describe('ClientProfile', () => {
  const profile = (state) =>
    render(state, { at: '/clients/c1', page: <Routes><Route path="/clients/:id" element={<ClientProfile />} /></Routes> })
  const services = [{ id: 's1', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 1200 }]
  const history = (el) => el.querySelector('section[aria-label="Visit history"]')

  it("marks each visit in the history with its service's category band", () => {
    const el = profile({ ...initialState, services })
    expect(history(el).textContent).toContain('Swedish massage')
    expect(history(el).querySelector('li [class*="bg-cat-massage"]')).not.toBeNull()
  })

  it('keeps a no-show in the history, stamped, with no charge', () => {
    const el = profile({
      ...initialState,
      services,
      appointments: [{ id: 'A-1', clientId: 'c1', employeeId: 'e1', serviceId: 's1', start: '2026-02-01T11:00', durationMin: 60, status: 'no-show' }],
    })
    const rows = [...history(el).querySelectorAll('li')]
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain('No-show')
    expect(rows[0].textContent).toContain('No charge')
    expect(rows[1].textContent).toContain('Done')
  })

  it('lists only this client’s missed bookings up to today, newest first by time', () => {
    const appt = (id, clientId, start, status) => ({ id, clientId, employeeId: 'e1', serviceId: 's1', start, durationMin: 60, status })
    const tomorrow = `${toDateStr(addDays(new Date(), 1))}T10:00`
    const el = profile({
      ...initialState,
      services,
      appointments: [
        appt('A-1', 'c1', '2026-01-05T15:00', 'no-show'), // same day as the 10:00 sale, later, so listed above it
        appt('A-2', 'c1', tomorrow, 'cancelled'), // future: left out
        appt('A-3', 'c2', '2026-01-06T10:00', 'no-show'), // another client: left out
        appt('A-4', 'c1', '2026-01-04T10:00', 'booked'), // not missed: left out
      ],
    })
    const rows = [...history(el).querySelectorAll('li')]
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain('No-show')
    expect(rows[1].textContent).toContain('Done')
  })
})

describe('Clients on a phone', () => {
  it('keeps each sub-line token and the sort headers from breaking inside', () => {
    const el = render()
    const tokens = [...el.querySelector('tbody tr .md\\:hidden').children]
    expect(tokens).toHaveLength(2)
    tokens.forEach((t) => expect(t.className).toContain('whitespace-nowrap'))
    expect(button(el, 'Total spent').className).toContain('whitespace-nowrap')
  })
})
