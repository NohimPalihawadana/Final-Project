import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal"
import { Table, Th, Td } from "@/components/Table"
import { fetchMonthsThunk, fetchRecordThunk } from "@/features/records/recordsSlice"
import { managerApproveThunk, managerDeclineThunk, managerFetchThunk } from "@/features/transactions/transactionsSlice"
import { formatMoney } from "@/utils/currency"
import { formatISODate, monthKeyFromISODate } from "@/utils/date"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useState, useEffect, useMemo } from "react"



export default function PendingApprovals() {

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

    return(
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