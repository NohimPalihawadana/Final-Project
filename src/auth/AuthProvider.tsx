import { onAuthStateChanged } from 'firebase/auth'
import React, { useEffect } from 'react'
import { auth } from '@/firebase/firebase'
import { useAppDispatch } from '@/app/hooks'
import { authThunk } from '@/features/auth/authSlice'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      // Re-bootstrap on every auth state change (login/logout)
      dispatch(authThunk())
    })
    dispatch(authThunk())
    return () => unsub()
  }, [])

  return <>{children}</>
}
