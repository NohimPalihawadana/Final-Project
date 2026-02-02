import type { FinancialRecord, FinancialRecordEntry, Transaction } from '@/types'
import { getDoc, getDocs, orderBy, query, ref, setDoc, where, col } from '@/firebase/firestore'
import { monthKeyFromISODate } from '@/utils/date'

export async function fetchFinancialRecord(month: string): Promise<FinancialRecord | null> {
  const snap = await getDoc(ref(`financial-records/${month}`))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<FinancialRecord, 'id'>) }
}

export async function fetchAvailableMonths(): Promise<string[]> {
  const snap = await getDocs(query(col('financial-records'), orderBy('month', 'desc')))
  return snap.docs.map((d) => (d.data() as { month: string }).month)
}

/**
 * Client-side helper to rebuild monthly ledger.
 * Production recommended: Cloud Function triggered on transaction CLOSE.
 */
export async function rebuildMonthlyFinancialRecord(month: string) {
  // Get all CLOSED transactions for this month
  try {
  const txSnap = await getDocs(query(col('transactions'), where('status', '==', 'CLOSED'), orderBy('date', 'asc')))
  const all = txSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
  const monthTx = all.filter((t) => monthKeyFromISODate(t.date) === month)

  

  const entries: FinancialRecordEntry[] = monthTx.map((t) => ({
    transactionId: t.id,
    date: t.date,
    description: t.description,
    debit: t.type === 'DEBIT' ? t.amount : 0,
    credit: t.type === 'CREDIT' ? t.amount : 0,
  }))

  // Opening/closing balance: simplistic net (credit - debit)
  const net = entries.reduce((acc, e) => acc + (e.credit || 0) - (e.debit || 0), 0)
  const openingBalance = 0
  const closingBalance = openingBalance + net

  const record: Omit<FinancialRecord, 'id'> = {
    month,
    openingBalance,
    closingBalance,
    entries,
    updatedAt: Date.now(),
  }

  
    await setDoc(ref(`financial-records/${month}`), record, { merge: true })
  } catch (error) {
    console.log('==================>>>>77 ', error);
  }
}
