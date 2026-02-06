import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  clerkCreateTransactionThunk,
  clerkFetchMyTransactionsThunk,
  clerkUpdateTransactionThunk,
} from '@/features/transactions/transactionsSlice'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Table, Td, Th } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { formatMoney } from '@/utils/currency'
import { formatISODate, todayISO } from '@/utils/date'
import type { SubAccount, Transaction, TransactionType } from '@/types'
import { fetchOfficers, UserListItem } from '@/features/users/usersService'
import { fetchSubAccounts } from '@/features/subAccounts/subAccountsService'
import CreateClerkTransaction from './components/CreateClerkTransaction'
import CreateOfficerTransaction from './components/CreateOfficerTransaction'

export default function ClerkDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((s) => s.auth)
  const { items, loading, error } = useAppSelector((s) => s.transactions)

  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('DEBIT')

  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [editReason, setEditReason] = useState<string | null>(null)

  const [officers, setOfficers] = useState<UserListItem[]>([])
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([])
  const [selectedOfficerUid, setSelectedOfficerUid] = useState('')
  const [selectedSubAccount, setSelectedSubAccount] = useState('')


  useEffect(() => {
    fetchOfficers()
      .then((list) => {
        setOfficers(list)
        // default to first officer if you want
        if (list.length && !selectedOfficerUid) setSelectedOfficerUid(list[0].uid)
      })
      .catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps

    fetchSubAccounts()
      .then((list) => {
        setSubAccounts(list)
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (profile?.uid) dispatch(clerkFetchMyTransactionsThunk(profile.uid))
  }, [dispatch, profile?.uid])

  const declined = useMemo(() => items.filter((t) => t.status === 'DECLINED'), [items])
  const active = useMemo(() => items.filter((t) => t.status !== 'DECLINED'), [items])

  const statusBadge = (s: string) => {
    if (s === 'PENDING') return <Badge text="PENDING" tone="neutral" />
    if (s === 'PAID') return <Badge text="PAID" tone="warning" />
    if (s === 'DECLINED') return <Badge text="DECLINED" tone="danger" />
    if (s === 'CLOSED') return <Badge text="CLOSED" tone="success" />
    return <Badge text={s} tone="neutral" />
  }

  const onCreate = async () => {
    if (!profile?.uid) return
    const amt = Number(amount)
    if (!description.trim()) return alert('Description is required')
    if (!date) return alert('Date is required')
    if (!Number.isFinite(amt) || amt <= 0) return alert('Amount must be > 0')

    await dispatch(
      clerkCreateTransactionThunk({
        uid: profile.uid,
        date,
        description,
        amount: amt,
        type,
        subAccount: selectedSubAccount,
        assignedOfficerUid: null
      }),
    )
    setDescription('')
    setAmount('')
    await dispatch(clerkFetchMyTransactionsThunk(profile.uid))
  }

  return (
    <div className="page space-y-6">
      <CreateClerkTransaction subAccounts={subAccounts} selectedSubAccount ={subAccounts?.length ? subAccounts[0].name : ''} />
      <CreateOfficerTransaction officers={officers} selectedOfficerId ={officers?.length ? officers[0].uid : ''} />

      <div className="card p-6">
        <div className="text-lg font-semibold">My transactions</div>
        <div className="mt-1 text-sm text-slate-600">Declined items are shown separately with reasons.</div>

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{t.type}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td>{statusBadge(t.status)}</Td>
                  <Td>
                    {t.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditTx(t)}>
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">No actions</span>
                    )}
                  </Td>
                </tr>
              ))}
              {active.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-slate-500">No transactions yet.</span>
                  </Td>
                  <Td />
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
        <div className="text-lg font-semibold">Declined</div>
        <div className="mt-1 text-sm text-slate-600">You cannot edit declined; create a new transaction instead.</div>

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Reason</Th>
              </tr>
            </thead>
            <tbody>
              {declined.map((t) => (
                <tr key={t.id}>
                  <Td>{formatISODate(t.date)}</Td>
                  <Td>{t.description}</Td>
                  <Td>{formatMoney(t.amount)}</Td>
                  <Td>
                    <Button size="sm" variant="ghost" onClick={() => setEditReason(t.declineReason || 'No reason provided')}>
                      View reason
                    </Button>
                  </Td>
                </tr>
              ))}
              {declined.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-slate-500">No declined transactions.</span>
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

      <Modal
        open={!!editTx}
        title="Edit transaction"
        onClose={() => setEditTx(null)}
        onConfirm={async () => {
          if (!editTx || !profile?.uid) return
          await dispatch(
            clerkUpdateTransactionThunk({
              uid: profile.uid,
              id: editTx.id,
              date: editTx.date,
              description: editTx.description,
              amount: editTx.amount,
              type: editTx.type,
              subAccount: editTx.subAccount,
              assignedOfficerUid: null
            }),
          )
          setEditTx(null)
          await dispatch(clerkFetchMyTransactionsThunk(profile.uid))
        }}
        confirmText="Save"
      >
        {editTx ? (
          <div className="space-y-3">
            <Input label="Date" type="date" value={editTx.date} onChange={(e) => setEditTx({ ...editTx, date: e.target.value })} />
            <Input label="Description" value={editTx.description} onChange={(e) => setEditTx({ ...editTx, description: e.target.value })} />
            <Input
              label="Amount"
              value={String(editTx.amount)}
              onChange={(e) => setEditTx({ ...editTx, amount: Number(e.target.value) })}
            />
            {editTx.subAccount && <Select label="Type" value={editTx.type} onChange={(e) => setEditTx({ ...editTx, type: e.target.value as any })}>
              <option value="DEBIT">DEBIT</option>
              <option value="CREDIT">CREDIT</option>
            </Select>}
            {editTx.subAccount && <Select label='Sub Account' value={editTx.subAccount} onChange={(e) => setEditTx({ ...editTx, subAccount: e.target.value as any })} >
              {subAccounts.map((subAccount) => { return (<option value={subAccount.name}>{subAccount.name}</option>) })}
            </Select>}
            {editTx.assignedOfficerUid && <Select label='Assign Officer' value={editTx.assignedOfficerUid} onChange={(e) => setEditTx({ ...editTx, assignedOfficerUid: e.target.value as any })} >
              {officers.map((officer) => { return (<option value={officer.uid}>{officer.email}</option>) })}
            </Select>}
            <div className="text-xs text-slate-500">
              Note: once an officer pays, you can’t edit. If declined, create a new transaction.
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!editReason} title="Decline reason" onClose={() => setEditReason(null)}>
        <div className="text-sm text-slate-700 whitespace-pre-wrap">{editReason}</div>
      </Modal>
    </div>
  )
}
