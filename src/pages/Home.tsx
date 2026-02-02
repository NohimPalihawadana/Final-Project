import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export default function Home() {
  const { user, profile, bootstrapped } = useAppSelector((s) => s.auth)

  if (!bootstrapped) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.role) return <Navigate to="/account" replace />

  switch (profile.role) {
    case 'CLERK':
      return <Navigate to="/clerk" replace />
    case 'OFFICER':
      return <Navigate to="/officer" replace />
    case 'ACCOUNT_MANAGER':
      return <Navigate to="/manager" replace />
    case 'ADMIN':
      return <Navigate to="/admin" replace />
    default:
      return <Navigate to="/account" replace />
  }
}
