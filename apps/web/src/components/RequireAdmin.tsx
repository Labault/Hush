import { Navigate, Outlet } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

export default function RequireAdmin() {
  const { admin, isLoading } = useAdmin()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
      }}>
        Chargement…
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
