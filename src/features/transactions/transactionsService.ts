import type { Transaction, TransactionStatus, TransactionType } from '@/types'
import { addDoc, col, getDocs, orderBy, query, where, updateDoc, ref, getDoc } from '@/firebase/firestore'
import { monthKeyFromISODate } from '@/utils/date'

export async function createTransaction(args: {
  date: string
  description: string
  amount: number
  type: TransactionType
  createdBy: string
  subAccount: string | null
  assignedOfficerUid: string | null 
}) {
  const now = Date.now()
  await addDoc(col('transactions'), {
    date: args.date,
    description: args.description.trim(),
    amount: args.amount,
    type: args.type,
    status: 'PENDING' as TransactionStatus,
    subAccount: args.subAccount,
    createdBy: args.createdBy,
    createdAt: now,
    updatedAt: now,
    assignedOfficerUid: args.assignedOfficerUid
  })
}

export async function updateTransactionEditableByClerk(args: {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  subAccount: string
  assignedOfficerUid: string
}) {
  const txSnap = await getDoc(ref(`transactions/${args.id}`))
  if (!txSnap.exists()) throw new Error('Transaction not found')
  const tx = txSnap.data() as Transaction

  if (tx.status !== 'PENDING') throw new Error('Only PENDING transactions can be edited')

  await updateDoc(ref(`transactions/${args.id}`), {
    date: args.date,
    description: args.description.trim(),
    amount: args.amount,
    type: args.type,
    subAccount: args.subAccount,
    assignedOfficerUid: args.assignedOfficerUid,
    updatedAt: Date.now(),
  })
}

export async function markPaid(args: { id: string; officerUid: string }) {
  const txSnap = await getDoc(ref(`transactions/${args.id}`))
  if (!txSnap.exists()) throw new Error('Transaction not found')

  const tx = txSnap.data() as Transaction

  if (tx.assignedOfficerUid !== args.officerUid) {
    throw new Error('Not assigned to you')
  }

  if (tx.type !== 'DEBIT') {
    throw new Error('Only DEBIT transactions require payment')
  }

  if (tx.status !== 'PENDING') {
    throw new Error('Only PENDING transactions can be paid')
  }

  await updateDoc(ref(`transactions/${args.id}`), {
    status: 'PAID',
    paidBy: args.officerUid,
    updatedAt: Date.now(),
  })
}


export async function approveTransaction(args: { id: string; managerUid: string }) {
  const txSnap = await getDoc(ref(`transactions/${args.id}`))
  if (!txSnap.exists()) throw new Error('Transaction not found')
  const tx = txSnap.data() as Transaction


  await updateDoc(ref(`transactions/${args.id}`), {
    status: 'APPROVED',
    approvedBy: args.managerUid,
    updatedAt: Date.now(),
  })

  // Optional: close immediately
  await updateDoc(ref(`transactions/${args.id}`), {
    status: 'CLOSED',
    updatedAt: Date.now(),
  })

  return monthKeyFromISODate(tx.date)
}

export async function declineTransaction(args: { id: string; managerUid: string; reason: string }) {
  const txSnap = await getDoc(ref(`transactions/${args.id}`))
  if (!txSnap.exists()) throw new Error('Transaction not found')
  const tx = txSnap.data() as Transaction

  if (tx.status !== 'PAID') throw new Error('Only PAID can be declined')

  await updateDoc(ref(`transactions/${args.id}`), {
    status: 'DECLINED',
    approvedBy: args.managerUid,
    declineReason: args.reason.trim(),
    updatedAt: Date.now(),
  })
}

export async function fetchTransactionsForRole(args: {
  role: 'CLERK' | 'OFFICER' | 'ACCOUNT_MANAGER' | 'ADMIN'
  uid: string
}) {
  // Basic queries; adjust as needed.
  // Clerk: see own
  if (args.role === 'CLERK') {
    const q = query(col('transactions'), where('createdBy', '==', args.uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
  }

  // Officer: pending + paid by them
  if (args.role === 'OFFICER') {
    const pendingQ = query(
      col('transactions'),
      where('assignedOfficerUid', '==', args.uid),
      where('status', '==', 'PENDING'),
      orderBy('createdAt', 'desc')
    )
    const paidQ = query(
      col('transactions'),
      where('assignedOfficerUid', '==', args.uid),
      where('status', 'in', ['PAID', 'CLOSED']),
      orderBy('updatedAt', 'desc')
    )
    const [p1, p2] = await Promise.all([getDocs(pendingQ), getDocs(paidQ)])
    const pending = p1.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
    const paid = p2.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
    return { pending, paid }
  }

  // Manager: PAID transactions to approve/decline
  if (args.role === 'ACCOUNT_MANAGER') {
    const q = query(col('transactions'), where('status', '==', 'PENDING'), where('assignedOfficerUid', '==', null ), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
  }

  // Admin: all
  const q = query(col('transactions'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
}
