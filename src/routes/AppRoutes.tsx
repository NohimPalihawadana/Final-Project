import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ClerkDashboard from '@/pages/ClerkDashboard'
import OfficerDashboard from '@/pages/OfficerDashboard'
import AccountManagerDashboard from '@/pages/AccountManagerDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Account from '@/pages/Account'
import { RequireRole } from '@/auth/RequireRole'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/clerk"
        element={
          <RequireRole allowed={['CLERK']}>
            <ClerkDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/officer"
        element={
          <RequireRole allowed={['OFFICER']}>
            <OfficerDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/manager"
        element={
          <RequireRole allowed={['ACCOUNT_MANAGER']}>
            <AccountManagerDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole allowed={['ADMIN']}>
            <AdminDashboard />
          </RequireRole>
        }
      />

      <Route path="/account" element={<Account />} />
    </Routes>
  )
}
