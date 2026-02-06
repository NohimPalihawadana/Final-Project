import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { managerApproveThunk, managerDeclineThunk, managerFetchThunk } from '@/features/transactions/transactionsSlice'
import { fetchMonthsThunk, fetchRecordThunk } from '@/features/records/recordsSlice'
import { Button } from '@/components/Button'
import { Table, Td, Th } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { formatISODate, monthKeyFromISODate } from '@/utils/date'
import { formatMoney } from '@/utils/currency'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/Input'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Select } from '@/components/Select'

export default function AccountManagerDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((s) => s.auth)
  const { managerPaid, loading, error } = useAppSelector((s) => s.transactions)
  const { months, current } = useAppSelector((s) => s.records)

  const [declineTxId, setDeclineTxId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  const [selectedMonth, setSelectedMonth] = useState<string>('')

  useEffect(() => {
    if (profile?.uid) dispatch(managerFetchThunk(profile.uid))
    dispatch(fetchMonthsThunk())
  }, [dispatch, profile?.uid])

  useEffect(() => {
    if (months.length && !selectedMonth) setSelectedMonth(months[0])
  }, [months, selectedMonth])

  useEffect(() => {
    if (selectedMonth) dispatch(fetchRecordThunk(selectedMonth))
  }, [dispatch, selectedMonth])

  const monthHint = useMemo(() => {
    if (!managerPaid.length) return null
    const m = monthKeyFromISODate(managerPaid[0].date)
    return m
  }, [managerPaid])

  const printPdf = () => {
    if (!current) return alert('No record for selected month')

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`Financial Record - ${current.month}`, 14, 16)

    doc.setFontSize(10)
    doc.text(`Opening Balance: ${formatMoney(current.openingBalance)}`, 14, 24)
    doc.text(`Closing Balance: ${formatMoney(current.closingBalance)}`, 14, 30)
    doc.text(`Updated: ${new Date(current.updatedAt).toLocaleString()}`, 14, 36)

    const rows = current.entries.map((e) => [
      formatISODate(e.date),
      e.description,
      e.debit ? formatMoney(e.debit) : '',
      e.credit ? formatMoney(e.credit) : '',
      e.transactionId,
    ])

    autoTable(doc, {
      startY: 44,
      head: [['Date', 'Description', 'Debit', 'Credit', 'Tx ID']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    })

    doc.save(`financial-record-${current.month}.pdf`)
  }

  return (
    <div className="page space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">Account Manager</div>
            <div className="mt-1 text-sm text-slate-600">Approve or decline PAID transactions. Printing available for ledger.</div>
            {monthHint ? <div className="mt-2 text-xs text-slate-500">Tip: approving creates/updates ledger for month {monthHint}.</div> : null}
          </div>
          <Button variant="secondary" onClick={() => profile?.uid && dispatch(managerFetchThunk(profile.uid))} loading={loading}>
            Refresh
          </Button>
        </div>
        {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
      </div>

      <div className="card p-6">
        <div className="text-lg font-semibold">Pending approvals (PAID)</div>
        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {managerPaid.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td><Badge text="PENDING" tone="warning" /></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (!profile?.uid) return
                          await dispatch(managerApproveThunk({ uid: profile.uid, id: t.id }))
                          await dispatch(managerFetchThunk(profile.uid))
                          dispatch(fetchMonthsThunk())
                        }}
                      >
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeclineTxId(t.id)}>
                        Decline
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
              {managerPaid.length === 0 ? (
                <tr>
                  <Td><span className="text-slate-500">No PAID transactions.</span></Td>
                  <Td /><Td /><Td /><Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Financial records</div>
            <div className="mt-1 text-sm text-slate-600">Select month to view ledger. You have PDF print.</div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.length ? months.map((m) => <option key={m} value={m}>{m}</option>) : <option value="">No months yet</option>}
            </Select>
            <Button variant="secondary" onClick={() => selectedMonth && dispatch(fetchRecordThunk(selectedMonth))}>
              Reload
            </Button>
            <Button onClick={printPdf}>Print PDF</Button>
          </div>
        </div>

        <div className="mt-4">
          {current ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="card p-4">
                  <div className="text-xs text-slate-500">Opening balance</div>
                  <div className="text-lg font-semibold">{formatMoney(current.openingBalance)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-slate-500">Closing balance</div>
                  <div className="text-lg font-semibold">{formatMoney(current.closingBalance)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-slate-500">Updated</div>
                  <div className="text-sm">{new Date(current.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Description</Th>
                    <Th>Debit</Th>
                    <Th>Credit</Th>
                    <Th>Tx ID</Th>
                  </tr>
                </thead>
                <tbody>
                  {current.entries.map((e) => (
                    <tr key={e.transactionId}>
                      <Td>{formatISODate(e.date)}</Td>
                      <Td>{e.description}</Td>
                      <Td>{e.debit ? formatMoney(e.debit) : ''}</Td>
                      <Td>{e.credit ? formatMoney(e.credit) : ''}</Td>
                      <Td><span className="text-xs text-slate-500">{e.transactionId}</span></Td>
                    </tr>
                  ))}
                  {current.entries.length === 0 ? (
                    <tr><Td><span className="text-slate-500">No entries.</span></Td><Td /><Td /><Td /><Td /></tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-slate-600">No record found for this month (yet).</div>
          )}
        </div>
      </div>

      <Modal
        open={!!declineTxId}
        title="Decline transaction"
        onClose={() => {
          setDeclineTxId(null)
          setDeclineReason('')
        }}
        onConfirm={async () => {
          if (!profile?.uid || !declineTxId) return
          if (!declineReason.trim()) return alert('Reason is required')
          await dispatch(managerDeclineThunk({ uid: profile.uid, id: declineTxId, reason: declineReason }))
          setDeclineTxId(null)
          setDeclineReason('')
          await dispatch(managerFetchThunk(profile.uid))
        }}
        confirmText="Decline"
        confirmVariant="danger"
      >
        <Input label="Reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Enter reason for decline" />
        <div className="mt-2 text-xs text-slate-500">Clerk will see the reason under Declined list.</div>
      </Modal>
    </div>
  )
}
