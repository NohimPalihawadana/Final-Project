import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import type { UserRole } from '@/types'

export function RequireRole({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) {
  const { user, profile, bootstrapped } = useAppSelector((s) => s.auth)

  if (!bootstrapped) {
    return (
      <div className="page">
        <div className="card p-6">Loading…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!profile?.role || !allowed.includes(profile.role)) {
    return (
      <div className="page">
        <div className="card p-6">
          <div className="text-lg font-semibold">Access denied</div>
          <div className="mt-1 text-sm text-slate-600">Your role does not have access to this page.</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
