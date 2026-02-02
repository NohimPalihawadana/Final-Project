import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { registerThunk } from '@/features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

type Form = z.infer<typeof schema>

export default function Register() {
  const dispatch = useAppDispatch()
  const nav = useNavigate()
  const { loading, error, user } = useAppSelector((s) => s.auth)

  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user) nav('/')
  }, [user, nav])

  const onSubmit = async (values: Form) => {
    await dispatch(registerThunk(values))
    nav('/login')
  }

  return (
    <div className="page">
      <div className="max-w-md mx-auto card p-6">
        <div className="text-2xl font-semibold">Create account</div>
        <div className="mt-1 text-sm text-slate-600">For local testing. In production, Admin invite flow is recommended.</div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full name" placeholder="Your name" {...register('name')} error={formState.errors.name?.message} />
          <Input label="Email" type="email" placeholder="name@company.com" {...register('email')} error={formState.errors.email?.message} />
          <Input label="Password" type="password" placeholder="Min 6 characters" {...register('password')} error={formState.errors.password?.message} />

          {error ? <div className="text-sm text-rose-600">{error}</div> : null}

          <Button className="w-full" type="submit" loading={loading}>
            Register
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="text-slate-900 underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
