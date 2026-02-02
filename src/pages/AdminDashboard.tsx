import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchUsersThunk, inviteUserThunk, updateUserThunk, deleteUserThunk } from '@/features/users/usersSlice'
import { fetchActivityThunk } from '@/features/activity/activitySlice'
import { fetchMonthsThunk, fetchRecordThunk } from '@/features/records/recordsSlice'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Table, Td, Th } from '@/components/Table'
import type { UserRole } from '@/types'
import { formatMoney } from '@/utils/currency'
import { formatISODate } from '@/utils/date'

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((state) => state.auth)
  const users = useAppSelector((state) => state.users.items)
  const activity = useAppSelector((state) => state.activity.items)
  const { months, current } = useAppSelector((state) => state.records)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('CLERK')

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

  const canInvite = useMemo(() => inviteEmail.includes('@') && inviteName.trim().length >= 2, [inviteEmail, inviteName]);

  return (
    <div className="page space-y-6">
      <div className="card p-6">
        <div className="text-xl font-semibold">Admin</div>
        <div className="mt-1 text-sm text-slate-600">Manage users, view financial records, and view activity logs.</div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">User management</div>
            <div className="mt-1 text-sm text-slate-600">
              Invite requires Cloud Functions (callable). For quick local testing, you can register users via UI and set roles in Firestore.
            </div>
          </div>
          <Button variant="secondary" onClick={() => dispatch(fetchUsersThunk())}>Refresh</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input label="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@company.com" />
          <Input label="Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Full name" />
          <Select label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
            <option value="CLERK">CLERK</option>
            <option value="OFFICER">OFFICER</option>
            <option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={!canInvite || !profile?.uid}
              onClick={async () => {
                if (!profile?.uid) return
                await dispatch(inviteUserThunk({ actorUid: profile.uid, email: inviteEmail, name: inviteName, role: inviteRole }))
                setInviteEmail('')
                setInviteName('')
                dispatch(fetchUsersThunk())
              }}
            >
              Invite
            </Button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Select
                    value={user.role}
                    onChange={(e) => {
                      if (!profile?.uid) return
                      const role = e.target.value as UserRole
                      dispatch(updateUserThunk({ actorUid: profile.uid, uid: user.uid, patch: { role } }))
                    }}
                  >
                    <option value="CLERK">CLERK</option>
                    <option value="OFFICER">OFFICER</option>
                    <option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!profile?.uid}
                    onClick={async () => {
                      if (!profile?.uid) return
                      if (!confirm('Delete Firestore user profile? (Auth user is not deleted)')) return
                      await dispatch(deleteUserThunk({ actorUid: profile.uid, uid: user.uid }))
                      dispatch(fetchUsersThunk())
                    }}
                  >
                    Delete
                  </Button>
                </Td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr><Td><span className="text-slate-500">No users.</span></Td><Td /><Td /><Td /></tr>
            ) : null}
          </tbody>
        </Table>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Financial records</div>
            <div className="mt-1 text-sm text-slate-600">Admin can view ledgers but cannot print (per requirements).</div>
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

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Activity log</div>
            <div className="mt-1 text-sm text-slate-600">Latest actions (client-logged; production: server logged recommended).</div>
          </div>
          <Button variant="secondary" onClick={() => dispatch(fetchActivityThunk())}>Refresh</Button>
        </div>

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a) => (
                <tr key={a.id}>
                  <Td>{new Date(a.createdAt).toLocaleString()}</Td>
                  <Td><span className="text-xs text-slate-500">{a.actorUid}</span></Td>
                  <Td>{a.action}</Td>
                  <Td><span className="text-xs text-slate-500">{a.targetId || '-'}</span></Td>
                </tr>
              ))}
              {activity.length === 0 ? (
                <tr><Td><span className="text-slate-500">No activity yet.</span></Td><Td /><Td /><Td /></tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}
