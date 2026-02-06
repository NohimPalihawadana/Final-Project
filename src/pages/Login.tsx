import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginThunk, resetPasswordThunk } from '@/features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type Form = z.infer<typeof schema>

export default function Login() {
  const dispatch = useAppDispatch()
  const nav = useNavigate()
  const { loading, error, user, profile } = useAppSelector((s) => s.auth)

  const { register, handleSubmit, formState, getValues } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user && profile?.role) {
      switch (profile.role) {
        case 'CLERK':
          nav('/clerk')
          break
        case 'OFFICER':
          nav('/officer')
          break
        case 'ACCOUNT_MANAGER':
          nav('/manager')
          break
        case 'ADMIN':
          nav('/doubleColumnLedger')
          break
        case 'AUDITOR':
          nav('doubleColumnLedger')
          break
      }
    }
  }, [user, profile?.role, nav])

  const onSubmit = async (values: Form) => {
    await dispatch(loginThunk(values))
    await dispatch<any>({ type: 'auth/bootstrap' })
  }

  const onReset = async () => {
    const email = getValues('email')
    if (!email) return alert('Enter email first')
    await dispatch(resetPasswordThunk({ email }))
    alert('Password reset email sent (if the account exists).')
  }

  return (
    <div className="page">
      <div className="max-w-md mx-auto card p-6">
        <div className="text-2xl font-semibold">Login</div>
        <div className="mt-1 text-sm text-slate-600">Sign in with your email and password.</div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" placeholder="name@company.com" {...register('email')} error={formState.errors.email?.message} />
          <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={formState.errors.password?.message} />

          {error ? <div className="text-sm text-rose-600">{error}</div> : null}

          <div className="flex items-center gap-2">
            <Button className="flex-1" type="submit" loading={loading}>
              Login
            </Button>
            <Button type="button" variant="secondary" onClick={onReset}>
              Forgot?
            </Button>
          </div>
        </form>

        
      </div>
    </div>
  )
}
