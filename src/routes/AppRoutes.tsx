import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ClerkDashboard from '@/pages/ClerkDashboard'
import OfficerDashboard from '@/pages/OfficerDashboard'
import AccountManagerDashboard from '@/pages/AccountManagerDashboard'
import Account from '@/pages/Account'
import { RequireRole } from '@/auth/RequireRole'
import UserManagement from '@/pages/UserManagement'
import ActivityLog from '@/pages/ActivityLog'
import AuditorDashboard from '@/pages/AuditorDashboard'
import DoubleColumnLedger from '@/pages/DoubleColumnLedger'
import SubAccounts from '@/pages/SubAccounts'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />

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
        path="/doubleColumnLedger"
        element={
          <RequireRole allowed={['ADMIN', 'ACCOUNT_MANAGER', 'AUDITOR']}>
            <DoubleColumnLedger />
          </RequireRole>
        }
      />

      <Route
        path="/userManagement"
        element={
          <RequireRole allowed={['ADMIN']}>
            <UserManagement />
          </RequireRole>
        }
      />

      <Route
        path="/activityLog"
        element={
          <RequireRole allowed={['ADMIN']}>
            <ActivityLog />
          </RequireRole>
        }
      />

      <Route
        path="/subAccounts"
        element={
          <RequireRole allowed={['ADMIN']}>
            <SubAccounts />
          </RequireRole>
        }
      />

    </Routes>
  )
}
