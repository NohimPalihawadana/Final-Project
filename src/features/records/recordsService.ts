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

function monthToStartEnd(month: string): { startISO: string; endISO: string } {
  // month = "2026-02"
  const [yStr, mStr] = month.split('-')
  const y = Number(yStr)
  const m = Number(mStr)

  // start: yyyy-mm-01
  const start = new Date(Date.UTC(y, m - 1, 1))
  // end (inclusive): last day of month
  const end = new Date(Date.UTC(y, m, 0)) // day 0 of next month = last day of current month

  const toISODate = (d: Date) => d.toISOString().slice(0, 10)
  return { startISO: toISODate(start), endISO: toISODate(end) }
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

/**
 * Gets unique months from /transactions.month.
 * Note: Firestore doesn't support DISTINCT; this reads docs and dedupes client-side.
 * If your dataset gets huge, we can optimize later using a "months" collection.
 */
export async function fetchAvailableMonths(): Promise<string[]> {
  const txRef = collection(db, 'transactions')
  const qy = query(txRef, orderBy('month', 'desc'))

  const snap = await getDocs(qy)
  const set = new Set<string>()
  snap.forEach((d) => {
    const data = d.data() as Partial<TxDoc>
    if (data.month) set.add(data.month)
  })

  return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
}

async function fetchSubAccountNameMap(): Promise<Map<string, string>> {
  const ref = collection(db, 'subAccounts')
  const snap = await getDocs(ref)
  const map = new Map<string, string>()
  snap.forEach((d) => {
    const data = d.data() as Partial<SubAccountDoc>
    map.set(d.id, data.name || d.id)
  })

  // Ensure system IDs still show nicely even if not found
  if (!map.has('cash')) map.set('cash', 'Cash')
  if (!map.has('bank')) map.set('bank', 'Bank')

  return map
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
  const { startISO, endISO } = monthToStartEnd(month)

  const txRef = collection(db, 'transactions')

  // We'll only include CLOSED transactions by default (matches your sample) :contentReference[oaicite:4]{index=4}
  // If you later want APPROVED/PAID included too, tell me and we’ll adjust.
  const priorQ = query(
    txRef,
    where('status', '==', 'CLOSED'),
    where('date', '<', startISO),
    orderBy('date', 'asc')
  )

  const monthQ = query(
    txRef,
    where('status', '==', 'CLOSED'),
    where('date', '>=', startISO),
    where('date', '<=', endISO),
    orderBy('date', 'asc')
  )

  const [subMap, priorSnap, monthSnap] = await Promise.all([
    fetchSubAccountNameMap(),
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
      subAccountId: tx.subAccountId,
      subAccountName: subMap.get(tx.subAccountId) ?? tx.subAccountId,
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
