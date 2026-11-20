// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { DemoStoreProvider } from '../data/DemoStore.jsx'
import { toDateStr } from '../data/dates.js'
import { EmployeeProfile } from './EmployeeProfile.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const month = toDateStr(new Date()).slice(0, 7)
const state = {
  employees: [{ id: 'e1', name: 'Ana Cruz', role: 'Therapist', phone: '0917 555 0101', hiredOn: '2021-03-15', schedule: ['Mon', 'Tue'], commissionRate: 0.1 }],
  clients: [{ id: 'c1', name: 'Bea Santos' }],
  services: [{ id: 's1', name: 'Swedish massage', category: 'Massage', durationMin: 60, price: 1000, commissionRate: 0.1 }],
  products: [],
  expenses: [],
  appointments: [{ id: 'a1', employeeId: 'e1', serviceId: 's1', clientId: 'c1', start: `${month}-01T10:00`, durationMin: 60, status: 'done' }],
  sales: [{ id: 'S-1', date: `${month}-01T11:00`, clientId: 'c1', employeeId: 'e1', lines: [{ type: 'service', id: 's1', name: 'Swedish massage', qty: 1, unitPrice: 1000 }], total: 1000 }],
}

function render(role, path = '/employees/e1') {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <DemoStoreProvider initialState={state}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/employees/:id" element={<EmployeeProfile />} />
            </Routes>
          </MemoryRouter>
        </DemoStoreProvider>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

describe('EmployeeProfile', () => {
  it('shows commission earned to the owner', () => {
    const { el, root } = render('owner')
    expect(el.textContent).toContain('Ana Cruz')
    expect(el.textContent).toContain('Commission')
    expect(el.textContent).toContain('Bea Santos')
    act(() => root.unmount())
  })

  it('never shows commission or a commission rate to the receptionist', () => {
    const { el, root } = render('receptionist')
    expect(el.textContent).toContain('Service sales')
    expect(el.textContent.toLowerCase()).not.toContain('commission')
    act(() => root.unmount())
  })

  it('marks each booking row with its service category band', () => {
    const { el, root } = render('owner')
    const row = [...el.querySelectorAll('li')].find((li) => li.textContent.includes('Bea Santos'))
    expect(row).toBeDefined()
    expect(row.querySelector('[class*="bg-cat-"]')).not.toBeNull()
    act(() => root.unmount())
  })

  it('says Employee not found for an unknown id', () => {
    const { el, root } = render('owner', '/employees/nobody')
    expect(el.textContent).toContain('Employee not found')
    expect(el.querySelector('a[href="/employees"]')).not.toBeNull()
    act(() => root.unmount())
  })
})
