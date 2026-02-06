import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logoutThunk } from '@/features/auth/authSlice'
import { Sidebar } from './Sidebar'
import { label } from 'framer-motion/client'

export function TopBar() {
  const dispatch = useAppDispatch()
  const { user, profile } = useAppSelector((s) => s.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const homePath = useMemo(() => {
    if (!profile?.role) return '/'
    switch (profile.role) {
      case 'CLERK':
        return '/clerk'
      case 'OFFICER':
        return '/officer'
      case 'ACCOUNT_MANAGER':
        return '/doubleColumnLedger'
      case 'ADMIN':
        return '/doubleColumnLedger'
      case 'AUDITOR':
        return '/doubleColumnLedger'
      default:
        return '/'
    }
  }, [profile?.role])

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 relative flex items-center justify-between">


        {/* LEFT */}
        <div className="flex items-center min-w-[40px]">
          {user && (
            <button
              className="text-2xl font-bold"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              &#9776;
            </button>
          )}
        </div>

        {/* CENTER — ABSOLUTE TITLE */}
        <Link
          to={homePath}
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            text-base sm:text-lg md:text-xl
            font-extrabold tracking-tight
           text-slate-800
            whitespace-nowrap
            truncate
            max-w-[90%]
            text-center
            "
        >
          Army Officers' Mess Accounts Management System
        </Link>


        {/* RIGHT */}
        <div className="flex items-center min-w-[80px] justify-end">
          {user && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => dispatch(logoutThunk())}
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={profile?.role}
      />
    </div>
  )
}
