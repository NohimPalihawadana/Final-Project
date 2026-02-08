import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { officerFetchThunk, officerPayThunk } from '@/features/transactions/transactionsSlice'
import { Button } from '@/components/Button'
import { Table, Td, Th } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { formatISODate } from '@/utils/date'
import { formatMoney } from '@/utils/currency'

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

  return (
    <div className="page space-y-6">
      <div className="card p-6">
        <div className="text-xl font-semibold">{currentUser?.role}</div>
        <div className="mt-1 text-sm text-slate-600">
          Hello, {currentUser?.name ?? 'Officer'} !!
        </div>
      </div>

      <div className="card p-6">
        <div className="text-lg font-semibold">Pending payments</div>
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
                  <Td><Badge text="PENDING" tone="neutral" /></Td>
                  <Td>
                    <Button
                      size="sm"
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
                  <Td><span className="text-slate-500">No pending items.</span></Td>
                  <Td /><Td /><Td /><Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-lg font-semibold">Already paid by me</div>
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
              {officerPaid.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td><Badge text={t.status} tone={t.status === 'PAID' ? 'warning' : 'success'} /></Td>
                </tr>
              ))}
              {officerPaid.length === 0 ? (
                <tr>
                  <Td><span className="text-slate-500">No paid items.</span></Td>
                  <Td /><Td /><Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}
