import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { officerFetchThunk, officerPayThunk } from '@/features/transactions/transactionsSlice'
import { Button } from '@/components/Button'
import { Table, Td, Th } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { formatISODate } from '@/utils/date'
import { formatMoney } from '@/utils/currency'

// PDF (jsPDF + autoTable)
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function monthKeyFromISO(iso: string) {
  // iso: yyyy-mm-dd
  return iso.slice(0, 7) // yyyy-mm
}

function monthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number)
  const d = new Date(y, (m ?? 1) - 1, 1)
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export default function OfficerDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((s) => s.auth)
  const { officerPending, officerPaid, loading, error } = useAppSelector((s) => s.transactions)

  const authUid = useAppSelector((state) => state.auth.user?.uid)
  const users = useAppSelector((state) => state.users.items)
  const currentUser = users.find((u) => u.uid === authUid)

  useEffect(() => {
    if (profile?.uid) dispatch(officerFetchThunk(profile.uid))
  }, [dispatch, profile?.uid])

  // Build available months from already-paid items
  const paidMonths = useMemo(() => {
    const set = new Set<string>()
    for (const t of officerPaid) set.add(monthKeyFromISO(t.date))
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1)) // newest first
  }, [officerPaid])

  const [selectedMonth, setSelectedMonth] = useState<string>('')

  // Default to newest month whenever list changes
  useEffect(() => {
    if (!selectedMonth && paidMonths.length) setSelectedMonth(paidMonths[0])
    // If selected month disappeared (e.g., data refresh), reset
    if (selectedMonth && paidMonths.length && !paidMonths.includes(selectedMonth)) {
      setSelectedMonth(paidMonths[0])
    }
  }, [paidMonths, selectedMonth])

  const paidForSelectedMonth = useMemo(() => {
    if (!selectedMonth) return officerPaid
    return officerPaid.filter((t) => monthKeyFromISO(t.date) === selectedMonth)
  }, [officerPaid, selectedMonth])

  const handlePrintMonthlyPaid = () => {
    const officerName = currentUser?.name ?? 'Officer'
    const officerEmail = currentUser?.email ?? ''
    const monthText = selectedMonth ? monthLabel(selectedMonth) : 'All Months'

    const rows = paidForSelectedMonth
      .slice()
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((t, idx) => [
        String(idx + 1),
        formatISODate(t.date),
        t.description,
        formatMoney(t.amount),
        t.status,
      ])

    const total = paidForSelectedMonth.reduce((sum, t) => sum + (t.amount || 0), 0)

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Army Officers’ Mess - Monthly Payments Report', 14, 16)

    doc.setFontSize(10)
    doc.text(`Officer: ${officerName}${officerEmail ? ` (${officerEmail})` : ''}`, 14, 24)
    doc.text(`Month: ${monthText}`, 14, 30)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36)

    autoTable(doc, {
      startY: 42,
      head: [['#', 'Date', 'Description', 'Amount', 'Status']],
      body: rows.length ? rows : [['', '', 'No paid items for this month.', '', '']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] }, // slate-ish; if you want, I can remove custom colors
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 28 },
        2: { cellWidth: 85 },
        3: { halign: 'right', cellWidth: 28 },
        4: { cellWidth: 22 },
      },
    })

    const finalY = (doc as any).lastAutoTable?.finalY ?? 42
    doc.setFontSize(10)
    doc.text(`Total Paid: ${formatMoney(total)}`, 14, finalY + 10)

    const safeOfficer = officerName.replace(/[^\w\-]+/g, '_')
    const filename = `Officer_Payments_${safeOfficer}_${selectedMonth || 'ALL'}.pdf`
    doc.save(filename)
  }

  return (
    <div className="page space-y-6">
      <div className="card p-6">
        <div className="text-xl font-semibold">{currentUser?.role}</div>
        <div className="mt-1 text-sm text-slate-600">Hello, {currentUser?.name ?? 'Officer'} !!</div>
      </div>

      <div className="card p-6">
        <div className="text-lg font-semibold">Pending payments</div>

        {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {officerPending.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td>
                    <Badge text="PENDING" tone="neutral" />
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      loading={loading}
                      onClick={async () => {
                        if (!profile?.uid) return
                        await dispatch(officerPayThunk({ uid: profile.uid, id: t.id }))
                        await dispatch(officerFetchThunk(profile.uid))
                      }}
                    >
                      Pay
                    </Button>
                  </Td>
                </tr>
              ))}
              {officerPending.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-slate-500">No pending items.</span>
                  </Td>
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Already paid by me</div>
            <div className="mt-1 text-sm text-slate-600">
              Select a month and print/download your payments for that month.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {/* Month selector */}
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={paidMonths.length === 0}
              title={paidMonths.length ? 'Select month' : 'No paid months available'}
            >
              {paidMonths.length === 0 ? (
                <option value="">No months</option>
              ) : (
                paidMonths.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))
              )}
            </select>

            {/* Print button */}
            <Button
              variant="secondary"
              onClick={handlePrintMonthlyPaid}
              disabled={paidForSelectedMonth.length === 0}
              title={paidForSelectedMonth.length ? 'Download PDF' : 'Nothing to print for this month'}
            >
              Print (Monthly)
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {paidForSelectedMonth.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td>
                    <Badge text={t.status} tone={t.status === 'PAID' ? 'warning' : 'success'} />
                  </Td>
                </tr>
              ))}
              {paidForSelectedMonth.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-slate-500">No paid items.</span>
                  </Td>
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}
