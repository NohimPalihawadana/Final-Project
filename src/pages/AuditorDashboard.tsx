import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchUsersThunk, inviteUserThunk, updateUserThunk, deleteUserThunk } from '@/features/users/usersSlice'
import { fetchActivityThunk } from '@/features/activity/activitySlice'
import { fetchMonthsThunk, fetchRecordThunk } from '@/features/records/recordsSlice'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'
import { Table, Td, Th } from '@/components/Table'
import { formatMoney } from '@/utils/currency'
import { formatISODate } from '@/utils/date'


export default function AuditorDashboard() {

  const dispatch = useAppDispatch()
  const { months, current } = useAppSelector((state) => state.records)
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    dispatch(fetchUsersThunk())
    dispatch(fetchActivityThunk())
    dispatch(fetchMonthsThunk())
  }, [dispatch])

  useEffect(() => {
    if (months.length && !selectedMonth) setSelectedMonth(months[0])
  }, [months, selectedMonth])

  useEffect(() => {
    if (selectedMonth) dispatch(fetchRecordThunk(selectedMonth))
  }, [dispatch, selectedMonth])


  return (
    <div className="page space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Financial records</div>
            <div className="mt-1 text-sm text-slate-600">Auditor can view ledgers (per requirements).</div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.length ? months.map((m) => <option key={m} value={m}>{m}</option>) : <option value="">No months yet</option>}
            </Select>
            <Button variant="secondary" onClick={() => selectedMonth && dispatch(fetchRecordThunk(selectedMonth))}>
              Reload
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {current ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="card p-4">
                  <div className="text-xs text-slate-500">Opening balance</div>
                  <div className="text-lg font-semibold">{formatMoney(current.openingBalance)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-slate-500">Closing balance</div>
                  <div className="text-lg font-semibold">{formatMoney(current.closingBalance)}</div>
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
            <div className="text-sm text-slate-600">No record found for this month.</div>
          )}
        </div>
      </div>

    </div>
  )
}
