import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { managerFetchThunk } from '@/features/transactions/transactionsSlice'
import { fetchMonthsThunk, fetchRecordThunk } from '@/features/records/recordsSlice'
import { Button } from '@/components/Button'
import { Table, Td, Th } from '@/components/Table'
import { formatISODate } from '@/utils/date'
import { formatMoney } from '@/utils/currency'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Select } from '@/components/Select'

export default function AccountManagerDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((s) => s.auth)
  const { months, current } = useAppSelector((s) => s.records)

  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const authUid = useAppSelector((state) => state.auth.user?.uid)
  const users = useAppSelector((state) => state.users.items)
  const currentUser = users.find((u) => u.uid === authUid)

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
        <div className="text-xl font-semibold"><label>{currentUser?.role}</label></div>
        <div className="mt-1 text-sm text-slate-600">
          Hello, {currentUser?.name ?? 'Account Manager'} !!
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
    </div>
  )
}
