import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { updateEmailThunk, updatePasswordThunk } from '@/features/auth/authSlice'

export default function Account() {
  const dispatch = useAppDispatch()
  const { user, profile } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')

  if (!user) {
    return (
      <div className="page">
        <div className="card p-6">Please login.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card p-6">
        <div className="text-xl font-semibold">Account</div>
        <div className="mt-1 text-sm text-slate-600">Manage email and password.</div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="font-semibold">Profile</div>
            <div className="mt-2 text-sm text-slate-700">
              <div><span className="text-slate-500">Name:</span> {profile?.name || '-'}</div>
              <div><span className="text-slate-500">Role:</span> {profile?.role || '-'}</div>
              <div><span className="text-slate-500">UID:</span> {user.uid}</div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="font-semibold">Update email</div>
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button
              variant="secondary"
              onClick={async () => {
                await dispatch(updateEmailThunk({ email }))
                alert('Email updated.')
              }}
            >
              Update Email
            </Button>
          </div>

          <div className="card p-5 space-y-3 md:col-span-2">
            <div className="font-semibold">Update password</div>
            <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button
              variant="secondary"
              onClick={async () => {
                if (password.length < 6) return alert('Password must be at least 6 characters.')
                await dispatch(updatePasswordThunk({ password }))
                setPassword('')
                alert('Password updated.')
              }}
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
