// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoStoreProvider, useDemoStore } from './DemoStore.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const initialState = {
  employees: [{ id: 'e1', name: 'Ana', role: 'Therapist' }],
  clients: [],
  services: [{ id: 'svc-swedish', name: 'Swedish massage', durationMin: 60, price: 800 }],
  products: [{ id: 'p1', name: 'Lavender oil', price: 350, cost: 100, stock: 10, reorderAt: 3 }],
  appointments: [{ id: 'A-1', clientId: 'c1', employeeId: 'e1', serviceId: 'svc-swedish', start: '2026-11-20T10:00', durationMin: 60, status: 'booked' }],
  sales: [],
  expenses: [],
}

describe('DemoStore', () => {
  it('validates before it dispatches', () => {
    let store
    const Probe = () => ((store = useDemoStore()), null)
    const root = createRoot(document.createElement('div'))
    act(() => root.render(<DemoStoreProvider initialState={initialState}><Probe /></DemoStoreProvider>))

    expect(store.checkout({ lines: [] })).toEqual({ ok: false, error: 'Add at least one item' })
    const clash = store.bookAppointment({ employeeId: 'e1', start: '2026-11-20T10:30', durationMin: 60 })
    expect(clash).toEqual({ ok: false, error: 'Ana is booked 10:00–11:00' })

    let result
    act(() => (result = store.checkout({ clientId: 'c1', employeeId: 'e1', lines: [{ type: 'product', id: 'p1', qty: 3 }], payment: 'cash' })))
    expect(result.ok).toBe(true)
    expect(store.state.sales).toHaveLength(1)
    expect(store.state.products[0].stock).toBe(7)
    expect(store.state.appointments).toHaveLength(1)
    act(() => root.unmount())
  })
})
