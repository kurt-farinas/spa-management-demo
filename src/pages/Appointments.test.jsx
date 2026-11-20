// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { toDateStr, addDays } from '../data/dates.js'
import { Appointments } from './Appointments.jsx'

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

const today = toDateStr(new Date())
const EVERY_DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const initialState = {
  employees: [
    { id: 'e1', name: 'Ana Cruz', role: 'Therapist', schedule: EVERY_DAY },
    { id: 'e7', name: 'Kristine Garcia', role: 'Receptionist', schedule: EVERY_DAY },
  ],
  clients: [
    { id: 'c2', name: 'Carlo Mendoza', phone: '0928 115 7740', joinedOn: '2025-01-15', tags: [] },
    { id: 'c1', name: 'Ana Reyes', phone: '0917 482 1103', joinedOn: '2024-03-02', tags: [] },
  ],
  services: [{ id: 's1', name: 'Swedish massage', durationMin: 60, price: 1200 }],
  products: [],
  appointments: [{ id: 'A-1', clientId: 'c2', employeeId: 'e1', serviceId: 's1', start: `${today}T10:00`, durationMin: 60, status: 'booked' }],
  sales: [],
  expenses: [],
}

let mounted
function render(url = '/appointments?client=c1') {
  const el = document.createElement('div')
  document.body.append(el)
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole="receptionist">
        <DemoStoreProvider initialState={initialState}>
          <MemoryRouter initialEntries={[url]}>
            <Appointments />
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

function choose(select, value) {
  act(() => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}
const dayList = (el) => el.querySelector('section[aria-label="Day list"]').textContent

describe('Appointments', () => {
  it('?client= opens the booking dialog with that client chosen', () => {
    const el = render()
    const dialog = el.querySelector('dialog[aria-labelledby="book-title"]')
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('#book-clientId').value).toBe('c1')
    expect(dialog.querySelector('#book-date').value).toBe(today)
    expect(dialog.querySelector('#book-date').min).toBe(today)
  })

  it('names each calendar block with day, therapist, time, client, service and status', () => {
    const el = render('/appointments')
    const block = el.querySelector('section[aria-label^="All therapists"] button[data-appt="A-1"]')
    const weekday = new Date(`${today}T00:00`).toLocaleDateString('en-US', { weekday: 'long' })
    const name = block.getAttribute('aria-label')
    expect(name).toContain(weekday)
    expect(name).toContain('Ana Cruz')
    expect(name).toMatch(/10:00 AM, Carlo Mendoza, Swedish massage, Booked$/)
  })

  it('books on another day, moves the view there and highlights the new block', () => {
    const el = render()
    const form = el.querySelector('dialog[aria-labelledby="book-title"] form')
    const nextWeek = toDateStr(addDays(new Date(`${today}T00:00`), 7))
    choose(form.querySelector('#book-serviceId'), 's1')
    choose(form.querySelector('#book-employeeId'), 'e1')
    choose(form.querySelector('#book-time'), '11:00')
    act(() => {
      const date = form.querySelector('#book-date')
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(date, nextWeek)
      date.dispatchEvent(new Event('input', { bubbles: true }))
    })
    act(() => form.requestSubmit())
    expect(toast.success).toHaveBeenCalledWith('Booked Ana Reyes with Ana Cruz')
    expect(el.querySelector('[role="group"][aria-label="Day"] [aria-pressed="true"]').textContent).toContain(String(Number(nextWeek.slice(8))))
    expect(el.querySelector('[role="group"][aria-label="Week"]').textContent).not.toContain('This week')
    const shown = el.querySelector('section[aria-label="Day list"] [data-highlight]')
    expect(shown.textContent).toContain('Ana Reyes')
    expect(el.querySelectorAll('[data-highlight]').length).toBe(2) // day list and grid
  })

  it('shows the overlap under the time, then books a free slot and lists it', () => {
    const el = render()
    const form = el.querySelector('dialog[aria-labelledby="book-title"] form')
    choose(form.querySelector('#book-serviceId'), 's1')
    choose(form.querySelector('#book-employeeId'), 'e1')
    choose(form.querySelector('#book-time'), '10:30')
    act(() => form.requestSubmit())
    expect(form.querySelector('#book-time-error').textContent).toBe('Ana Cruz is booked 10:00–11:00')
    expect(dayList(el)).not.toContain('Ana Reyes')

    choose(form.querySelector('#book-time'), '11:00')
    act(() => form.requestSubmit())
    expect(toast.success).toHaveBeenCalledWith('Booked Ana Reyes with Ana Cruz')
    expect(form.closest('dialog').open).toBe(false)
    expect(dayList(el)).toContain('Ana Reyes')
    expect(dayList(el)).toContain('11:00 AM')
  })

  it('offers therapists only', () => {
    const el = render()
    const names = [...el.querySelectorAll('#book-employeeId option')].map((o) => o.textContent)
    expect(names).toEqual(['Choose a therapist', 'Ana Cruz'])
  })
})
