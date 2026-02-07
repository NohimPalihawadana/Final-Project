// src/features/records/recordsService.ts
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import type { FinancialRecord, FinancialRecordEntry } from '@/types'

// ✅ change this import path to wherever you export your Firestore db
import { db } from "@/firebase/firebase"

type TxType = 'CREDIT' | 'DEBIT'
type TxStatus = 'PENDING' | 'PAID' | 'APPROVED' | 'DECLINED' | 'CLOSED'

type TxDoc = {
  amount: number
  date: string // ISO yyyy-mm-dd
  description: string
  month: string // yyyy-mm
  subAccountId: string
  type: TxType
  subAccount: string
  status: TxStatus
  createdAt: number
  updatedAt: number
}

type SubAccountDoc = {
  name: string
  description?: string
  date: string
  createdAt?: number
}

function getMonthStartAndEndISO(yearMonth) {
  const [year, monthName] = yearMonth.split("-");

  // Create start date (1st day of the month)
  const startDate = new Date(`${monthName} 1, ${year}`);

  // Create end date (last day of the month)
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  );

  // Optional: set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
}

function prevMonth(month: string): string {
  const [yStr, mStr] = month.split('-')
  let y = Number(yStr)
  let m = Number(mStr)
  m -= 1
  if (m === 0) {
    m = 12
    y -= 1
  }
  return `${y}-${String(m).padStart(2, '0')}`
}

function getYearMonth(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  return `${year}-${month}`;
}


export async function fetchAvailableMonths(): Promise<string[]> {
  const txRef = collection(db, 'transactions')
  const qy = query(txRef, orderBy('date', 'desc'))

  const snap = await getDocs(qy)
  const set = new Set<string>()
  snap.forEach((d) => {
    const data = d.data() as Partial<TxDoc>
    if (data?.date) {
      const monthName = getYearMonth(data.date);
      set.add(monthName);
    }
  })

  return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
}


function signedAmount(tx: TxDoc): number {
  // Accounting rule for overall ledger balance:
  // CREDIT increases, DEBIT decreases
  return tx.type === 'CREDIT' ? tx.amount : -tx.amount
}

/**
 * Builds a FinancialRecord for a month from /transactions:
 * - openingBalance = sum(all tx signed amounts BEFORE this month start)
 * - closingBalance = openingBalance + sum(signed amounts WITHIN month)
 * - entries are month txs, each mapped to debit/credit columns and subAccountName
 */
export async function fetchFinancialRecord(month: string): Promise<FinancialRecord> {
  const { startISO, endISO } = getMonthStartAndEndISO(month)

  const txRef = collection(db, 'transactions')

  // We'll only include CLOSED transactions by default (matches your sample) :contentReference[oaicite:4]{index=4}
  // If you later want APPROVED/PAID included too, tell me and we’ll adjust.
  const priorQ = query(
    txRef,
    where('status', 'in', ['PAID', 'CLOSED']),
    where('date', '<', startISO),
    orderBy('date', 'asc')
  )

  const monthQ = query(
    txRef,
    where('status', 'in', ['PAID', 'CLOSED']),
    where('date', '>=', startISO),
    where('date', '<=', endISO),
    orderBy('date', 'asc')
  )

  const [priorSnap, monthSnap] = await Promise.all([
    getDocs(priorQ),
    getDocs(monthQ),
  ])

  let openingBalance = 0
  priorSnap.forEach((d) => {
    const tx = d.data() as TxDoc
    openingBalance += signedAmount(tx)
  })

  const entries: FinancialRecordEntry[] = []
  let monthNet = 0

  monthSnap.forEach((d) => {
    const tx = d.data() as TxDoc
    monthNet += signedAmount(tx)

    entries.push({
      transactionId: d.id,
      date: tx.date,
      description: tx.description,
      debit: tx.type === 'DEBIT' ? tx.amount : undefined,
      credit: tx.type === 'CREDIT' ? tx.amount : undefined,
      subAccountName: tx.subAccount,
    })
  })

  const closingBalance = openingBalance + monthNet

  return {
    id: month,
    month,
    openingBalance,
    closingBalance,
    entries,
    updatedAt: Date.now(),
  }
}

// ✅ Backwards-compatible export (older code expects this name)
export async function rebuildMonthlyFinancialRecord(month: string) {
  return fetchFinancialRecord(month)
}
