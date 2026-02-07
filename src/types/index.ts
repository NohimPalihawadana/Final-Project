export type UserRole = 'CLERK' | 'OFFICER' | 'ACCOUNT_MANAGER' | 'ADMIN' | 'AUDITOR'

export type TransactionType = 'CREDIT' | 'DEBIT'
export type TransactionStatus = 'PENDING' | 'PAID' | 'APPROVED' | 'DECLINED' | 'CLOSED'

export type ISODate = string // yyyy-mm-dd

export interface AppUser {
  uid: string
  email: string
  name: string
  role: UserRole
  createdAt?: number
  updatedAt?: number
}

export interface SubAccount {
  createdAt: string
  date: string
  name: string
  description: string
}

export interface Transaction {
  id: string
  date: ISODate
  description: string
  amount: number
  type: TransactionType

  status: TransactionStatus

  createdBy: string
  assignedOfficerUid: string | null
  paidBy?: string
  approvedBy?: string

  declineReason?: string

  createdAt: number
  updatedAt: number

  subAccount: string | null
}

export interface ActivityLog {
  id: string
  actorUid: string
  action: string
  targetId?: string
  metadata?: Record<string, unknown>
  createdAt: number
}

export interface FinancialRecordEntry {
  transactionId: string
  date: ISODate
  description: string
  debit?: number
  credit?: number
  subAccountName: string
}

export interface FinancialRecord {
  id: string // yyyy-mm
  month: string // yyyy-mm
  openingBalance: number
  closingBalance: number
  entries: FinancialRecordEntry[]
  updatedAt: number
}
