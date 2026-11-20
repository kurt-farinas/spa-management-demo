// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { Clients } from './Clients.jsx'

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
function render() {
  const el = document.createElement('div')
  document.body.append(el)
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole="receptionist">
        <DemoStoreProvider initialState={initialState}>
          <MemoryRouter>
            <Clients />
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
})
