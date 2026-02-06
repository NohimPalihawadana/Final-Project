import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
  role?: string
}

type MenuItem = { label: string; path: string };


function getMenuItems(role?: string): MenuItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { label: 'Double Column Ledger Book', path: '/doubleColumnLedger' },
        { label: 'Manage Sub-Accounts', path: '/subAccounts' },
        { label: 'User Management', path: '/userManagement' },
        { label: 'Activity Log', path: '/activityLog' },
        { label: 'My Profile', path: '/account' },
      ]
    case 'ACCOUNT_MANAGER':
      return [
        { label: 'Dashboard', path: '/manager' },
        { label: 'Reports', path: '/manager/reports' },
        { label: 'My Profile', path: '/account' },
      ]
    case 'OFFICER':
      return [
        { label: 'Officer Dashboard', path: '/officer' },
        { label: 'Mess Records', path: '/officer/records' },
        { label: 'My Profile', path: '/account' },
      ]
    case 'CLERK':
      return [
        { label: 'Clerk Dashboard', path: '/clerk' },
        { label: 'Mess Records', path: '/clerk/records' },
        { label: 'My Profile', path: '/account' },
      ]
    case 'AUDITOR':
      return [
        { label: 'Auditor Dashboard', path: '/doubleColumnLedger' },
        { label: 'My Profile', path: '/account' },
      ]
    default:
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
      ]
  }
}


export function Sidebar({ isOpen, onClose, role }: SidebarProps) {
  const menuItems = getMenuItems(role) // <-- dynamically based on role

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-lg p-5"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="mb-5 text-slate-700 font-bold"
              onClick={onClose}
            >
              Close
            </button>

            <nav className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-slate-700 hover:text-blue-600 hover:underline"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}