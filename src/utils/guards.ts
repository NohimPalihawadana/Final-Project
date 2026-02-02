import type { UserRole } from '@/types'

export const hasRole = (role: UserRole | undefined, allowed: UserRole[]) =>
  !!role && allowed.includes(role)
