// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { RequireRole } from './RequireRole.jsx'

vi.mock('react-hot-toast', () => ({ default: vi.fn() }))

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function mount(role) {
  const el = document.createElement('div')
  const root = createRoot(el)
  act(() =>
    root.render(
      <RoleProvider initialRole={role}>
        <MemoryRouter initialEntries={['/financial-statement']}>
          <Routes>
            <Route path="/" element={<p>home</p>} />
            <Route path="/login" element={<p>login</p>} />
            <Route path="/financial-statement" element={<RequireRole page="financial-statement"><p>secret</p></RequireRole>} />
          </Routes>
        </MemoryRouter>
      </RoleProvider>,
    ),
  )
  return { el, root }
}

beforeEach(() => vi.mocked(toast).mockClear())

describe('RequireRole', () => {
  it('sends a receptionist on an owner-only page back to the dashboard', () => {
    const el = document.createElement('div')
    const root = createRoot(el)
    act(() =>
      root.render(
        <RoleProvider initialRole="receptionist">
          <MemoryRouter initialEntries={['/financial-statement']}>
            <Routes>
              <Route path="/" element={<p>home</p>} />
              <Route path="/financial-statement" element={<RequireRole page="financial-statement"><p>secret</p></RequireRole>} />
            </Routes>
          </MemoryRouter>
        </RoleProvider>,
      ),
    )
    expect(el.textContent).toBe('home')
    act(() => root.unmount())
  })

  it('sends a visitor with no role to /login, with no toast', () => {
    const { el, root } = mount(null)
    expect(el.textContent).toBe('login')
    expect(toast).not.toHaveBeenCalled()
    act(() => root.unmount())
  })

  it('shows the Owner only toast to a receptionist, not to the owner', () => {
    const rec = mount('receptionist')
    expect(toast).toHaveBeenCalledWith('Owner only', { id: 'owner-only' })
    act(() => rec.root.unmount())
    vi.mocked(toast).mockClear()
    const owner = mount('owner')
    expect(owner.el.textContent).toBe('secret')
    expect(toast).not.toHaveBeenCalled()
    act(() => owner.root.unmount())
  })
})
