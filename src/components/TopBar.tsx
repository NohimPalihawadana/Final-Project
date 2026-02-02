import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logoutThunk } from '@/features/auth/authSlice'

export function TopBar() {
  const dispatch = useAppDispatch()
  const { user, profile } = useAppSelector((s) => s.auth)

  const homePath = useMemo(() => {
    if (!profile?.role) return '/'
    switch (profile.role) {
      case 'CLERK':
        return '/clerk'
      case 'OFFICER':
        return '/officer'
      case 'ACCOUNT_MANAGER':
        return '/manager'
      case 'ADMIN':
        return '/admin'
      default:
        return '/'
    }
  }, [profile?.role])

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={homePath} className="font-semibold tracking-tight">
          Finance Workflow
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/account" className="text-sm text-slate-700 hover:underline">
                {profile?.name || user.email}
              </Link>
              <Button size="sm" variant="secondary" onClick={() => dispatch(logoutThunk())}>
                Logout
              </Button>
            </>
          ) : (
            <Link className="text-sm text-slate-700 hover:underline" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
