import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  clerkCreateTransactionThunk,
  clerkFetchMyTransactionsThunk,
} from '@/features/transactions/transactionsSlice'
import { todayISO } from '@/utils/date'
import type { SubAccount, TransactionType } from '@/types'
import { fetchOfficers, UserListItem } from '@/features/users/usersService'
import { fetchSubAccounts } from '@/features/subAccounts/subAccountsService'
import CreateClerkTransaction from './components/CreateClerkTransaction'
import CreateOfficerTransaction from './components/CreateOfficerTransaction'

export default function ClerkDashboard() {
  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((s) => s.auth)

  const [date ] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type ] = useState<TransactionType>('DEBIT')


  const [officers, setOfficers] = useState<UserListItem[]>([])
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([])
  const [selectedOfficerUid, setSelectedOfficerUid] = useState('')
  const [selectedSubAccount ] = useState('')


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

  console.log('================+>>>>>> ', officers);

  return (
    <div className="page space-y-6">
      <CreateClerkTransaction subAccounts={subAccounts} selectedSubAccount ={subAccounts?.length ? subAccounts[0].name : ''} />
      <CreateOfficerTransaction officers={officers} selectedOfficerId ={officers?.length ? officers[0].uid : ''} />
    </div>
  )
}
