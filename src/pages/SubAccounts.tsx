import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/Button"
import {
  fetchSubAccountsThunk,
  createSubAccountThunk,
  updateSubAccountThunk,
  deleteSubAccountThunk,
} from "@/features/subAccounts/subAccountsSlice"

const PROTECTED = ["cash", "bank"]

export default function SubAccounts() {
  const dispatch = useAppDispatch()
  const { items: subAccounts, loading } = useAppSelector(
    (state) => state.subAccounts
  )

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selected = subAccounts.find((sa) => sa.id === selectedId)
  const isProtected =
    selected && PROTECTED.includes(selected.name.toLowerCase())

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDate, setEditDate] = useState("")

  useEffect(() => {
    dispatch(fetchSubAccountsThunk())
  }, [dispatch])

  useEffect(() => {
    if (selected) {
      setEditName(selected.name)
      setEditDescription(selected.description || "")
      setEditDate(selected.date)
    }
  }, [selected])

  function onCreate() {
    if (!name || !date) return
    dispatch(createSubAccountThunk({ name, description, date }))
    setName("")
    setDescription("")
    setDate("")
  }

  function onSave() {
    if (!selected) return
    dispatch(
      updateSubAccountThunk({
        id: selected.id,
        name: editName,
        description: editDescription,
        date: editDate,
      })
    )
    setIsModalOpen(false)
  }

  function onDelete() {
    if (!selected) return
    if (!confirm("Are you sure?")) return

    dispatch(
      deleteSubAccountThunk({
        id: selected.id,
        name: selected.name,
      })
    )

    setIsModalOpen(false)
    setSelectedId(null)
  }

  return (
    <>
      <div
        className={`page space-y-8 ${
          isModalOpen ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* CREATE */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Sub Accounts</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button onClick={onCreate} loading={loading}>
            Create Sub Account
          </Button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Existing Sub Accounts</h3>
            <Button
              disabled={!selectedId || isProtected}
              onClick={() => setIsModalOpen(true)}
            >
              Modify Selected
            </Button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th>Date</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {subAccounts.map((sa) => (
                <tr
                  key={sa.id}
                  onClick={() => setSelectedId(sa.id)}
                  className={`cursor-pointer border-b ${
                    selectedId === sa.id
                      ? "bg-slate-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td>{sa.date}</td>
                  <td className="font-medium">
                    {sa.name}
                    {PROTECTED.includes(sa.name.toLowerCase()) && (
                      <span className="ml-2 text-xs text-slate-500">
                        (system)
                      </span>
                    )}
                  </td>
                  <td>{sa.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Modify Sub Account</h3>

            {isProtected && (
              <p className="text-sm text-red-600">
                Cash and Bank accounts are system accounts and cannot be
                modified.
              </p>
            )}

            <input
              disabled={isProtected}
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              disabled={isProtected}
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <input
              disabled={isProtected}
              type="date"
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />

            <div className="flex justify-between pt-4">
              <Button
                variant="danger"
                disabled={isProtected}
                onClick={onDelete}
              >
                Delete
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  disabled={isProtected}
                  onClick={onSave}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
