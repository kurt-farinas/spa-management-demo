// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from '../auth/RoleProvider.jsx'
import { RequireRole } from './RequireRole.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

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
})
