import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRole } from '../auth/RoleProvider.jsx'
import { canSee } from '../auth/roles.js'

export function RequireRole({ page, children }) {
  const { role } = useRole()
  const allowed = canSee(role, page)
  useEffect(() => {
    if (role && !allowed) toast('Owner only', { id: 'owner-only' })
  }, [role, allowed])
  if (!role) return <Navigate to="/login" replace />
  if (!allowed) return <Navigate to="/" replace />
  return children
}
