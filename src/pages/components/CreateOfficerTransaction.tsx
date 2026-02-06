import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Select } from "@/components/Select"
import { clerkCreateTransactionThunk, clerkFetchMyTransactionsThunk, clerkUpdateTransactionThunk } from "@/features/transactions/transactionsSlice"
import { fetchOfficers, UserListItem } from "@/features/users/usersService"
import type { TransactionType, Transaction, SubAccount } from "@/types"
import { todayISO } from "@/utils/date"
import { useEffect, useState } from "react"

export default function CreateOfficerTransaction({selectedOfficerId, officers}) {

    const dispatch = useAppDispatch()
    const { profile } = useAppSelector((s) => s.auth)
    const { items, loading, error } = useAppSelector((s) => s.transactions)

    const [date, setDate] = useState(todayISO())
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')

    const [selectedOfficerUid, setSelectedOfficerUid] = useState(selectedOfficerId)

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
                type: "DEBIT",
                subAccount: null,
                assignedOfficerUid: selectedOfficerUid
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
                    <Select
                        label="Assign Officer"
                        value={selectedOfficerUid}
                        onChange={(e) => setSelectedOfficerUid(e.target.value)}
                        required
                    >
                        {officers.length === 0 ? (
                            <option value="">No officers found</option>
                        ) : (
                            officers.map((o) => (
                                <option key={o.uid} value={o.uid}>
                                    {o.name || o.email}
                                </option>
                            ))
                        )}
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