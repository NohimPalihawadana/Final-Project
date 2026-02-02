import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Transaction, TransactionType } from '@/types'
import {
  approveTransaction,
  createTransaction,
  declineTransaction,
  fetchTransactionsForRole,
  markPaid,
  updateTransactionEditableByClerk,
} from './transactionsService'
import { logActivity } from '@/features/activity/activityService'
import { rebuildMonthlyFinancialRecord } from '@/features/records/recordsService'

type State = {
  items: Transaction[]
  loading: boolean
  error?: string

  officerPending: Transaction[]
  officerPaid: Transaction[]

  managerPaid: Transaction[]
}

const initialState: State = {
  items: [],
  loading: false,
  officerPending: [],
  officerPaid: [],
  managerPaid: [],
}

export const clerkFetchMyTransactionsThunk = createAsyncThunk('transactions/clerkFetch', async (uid: string) => {
  const res = (await fetchTransactionsForRole({ role: 'CLERK', uid })) as Transaction[]
  return res
})

export const clerkCreateTransactionThunk = createAsyncThunk(
  'transactions/clerkCreate',
  async (args: { uid: string; date: string; description: string; amount: number; type: TransactionType, assignedOfficerUid: string }) => {
    await createTransaction({ ...args, createdBy: args.uid })
    await logActivity(args.uid, 'transaction.create', undefined, { amount: args.amount })
  },
)

export const clerkUpdateTransactionThunk = createAsyncThunk(
  'transactions/clerkUpdate',
  async (args: { uid: string; id: string; date: string; description: string; amount: number; type: TransactionType }) => {
    await updateTransactionEditableByClerk(args)
    await logActivity(args.uid, 'transaction.update', args.id)
  },
)

export const officerFetchThunk = createAsyncThunk('transactions/officerFetch', async (uid: string) => {
  const res = (await fetchTransactionsForRole({ role: 'OFFICER', uid })) as { pending: Transaction[]; paid: Transaction[] }
  return res
})

export const officerPayThunk = createAsyncThunk('transactions/officerPay', async (args: { uid: string; id: string }) => {
  await markPaid({ id: args.id, officerUid: args.uid })
  await logActivity(args.uid, 'transaction.pay', args.id)
})

export const managerFetchThunk = createAsyncThunk('transactions/managerFetch', async (uid: string) => {
  const res = (await fetchTransactionsForRole({ role: 'ACCOUNT_MANAGER', uid })) as Transaction[]
  return res
})

export const managerApproveThunk = createAsyncThunk('transactions/managerApprove', async (args: { uid: string; id: string }) => {
  const monthKey = await approveTransaction({ id: args.id, managerUid: args.uid })
  await logActivity(args.uid, 'transaction.approve', args.id)
  // Update monthly ledger (client-side helper; production: do this in Cloud Function)
  await rebuildMonthlyFinancialRecord(monthKey)
})

export const managerDeclineThunk = createAsyncThunk(
  'transactions/managerDecline',
  async (args: { uid: string; id: string; reason: string }) => {
    await declineTransaction({ id: args.id, managerUid: args.uid, reason: args.reason })
    await logActivity(args.uid, 'transaction.decline', args.id, { reason: args.reason })
  },
)

const slice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(clerkFetchMyTransactionsThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(clerkFetchMyTransactionsThunk.fulfilled, (s, a) => {
        s.loading = false
        s.items = a.payload
      })
      .addCase(clerkFetchMyTransactionsThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })

      .addCase(officerFetchThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(officerFetchThunk.fulfilled, (s, a) => {
        s.loading = false
        s.officerPending = a.payload.pending
        s.officerPaid = a.payload.paid
      })
      .addCase(officerFetchThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })

      .addCase(managerFetchThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(managerFetchThunk.fulfilled, (s, a) => {
        s.loading = false
        s.managerPaid = a.payload
      })
      .addCase(managerFetchThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })
  },
})

export default slice.reducer
