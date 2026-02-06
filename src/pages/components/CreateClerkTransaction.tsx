import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import { fetchSubAccounts } from "@/features/subAccounts/subAccountsService"
import { clerkCreateTransactionThunk, clerkFetchMyTransactionsThunk, clerkUpdateTransactionThunk } from "@/features/transactions/transactionsSlice"
import { fetchOfficers, UserListItem } from "@/features/users/usersService"
import type { TransactionType, Transaction, SubAccount } from "@/types"
import { todayISO } from "@/utils/date"
import { useEffect, useState } from "react"

export default function CreateClerkTransaction( {selectedSubAccount: defaultSelectedAccount, subAccounts}) {

    const dispatch = useAppDispatch()
    const { profile } = useAppSelector((s) => s.auth)
    const { items, loading, error } = useAppSelector((s) => s.transactions)

    const [date, setDate] = useState(todayISO())
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<TransactionType>('DEBIT')

    const [selectedSubAccount, setSelectedSubAccount] = useState(defaultSelectedAccount)

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
        <>
        <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xl font-semibold">Clerk</div>
                    <div className="mt-1 text-sm text-slate-600">Create transactions. You can edit only until it is paid.</div>
                </div>
                <Button variant="secondary" onClick={() => profile?.uid && dispatch(clerkFetchMyTransactionsThunk(profile.uid))} loading={loading}>
                    Refresh
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Office supplies" />
                <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120.50" />
                <Select label="Type" value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                </Select>
                <Select label='Sub Account' value={selectedSubAccount} onChange={(e) => setSelectedSubAccount(e.target.value as any)} required >
                    {subAccounts.map((subAccount) => { return (<option value={subAccount.name}>{subAccount.name}</option>) })}
                </Select>
            </div>
            <div className="mt-4">
                <Button onClick={onCreate}>Create transaction</Button>
            </div>

            {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
        </div>
       
    </>
    )
}