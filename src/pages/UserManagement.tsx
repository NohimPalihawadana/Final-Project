import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import { Table, Td, Th } from "@/components/Table"
import { fetchActivityThunk } from "@/features/activity/activitySlice"
import { fetchMonthsThunk } from "@/features/records/recordsSlice"
import {
  fetchUsersThunk,
  deleteUserThunk,
  updateUserThunk,
  inviteUserThunk,
} from "@/features/users/usersSlice"

import type { AppUser, UserRole } from "@/types"

const emptyInvite = {
  name: "",
  email: "",
  role: "OFFICER" as UserRole,
}

export default function UserManagement() {
  const dispatch = useAppDispatch()

  // Redux state
  const users = useAppSelector((state) => state.users.items)
  const profile = useAppSelector((state) => state.auth.profile)

  // Local UI state
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState(emptyInvite)

  // Initial load
  useEffect(() => {
    dispatch(fetchUsersThunk())
    dispatch(fetchActivityThunk())
    dispatch(fetchMonthsThunk())
  }, [dispatch])

  return (
    <div className="space-y-6">
      {/* USER MANAGEMENT CARD */}
      <div className="card p-6 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">User Management</div>
            <div className="text-sm text-slate-500">
              Manage system users and roles
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => dispatch(fetchUsersThunk())}
          >
            Refresh
          </Button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <Table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.uid}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <Td className="font-medium">{user.name}</Td>
                  <Td className="text-slate-600">{user.email}</Td>

                  <Td>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">
                      {user.role}
                    </span>
                  </Td>

                  <Td className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      Modify
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!profile?.uid}
                      onClick={async () => {
                        if (!profile?.uid) return
                        if (!confirm("Delete Firestore user profile?")) return

                        await dispatch(
                          deleteUserThunk({
                            actorUid: profile.uid,
                            uid: user.uid,
                          })
                        )

                        dispatch(fetchUsersThunk())
                      }}
                    >
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* INVITE USER BUTTON */}
        <div className="flex justify-end pt-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => {
              setInvite(emptyInvite)
              setInviteOpen(true)
            }}
          >
            + Invite User
          </Button>
        </div>
      </div>

      {/* MODIFY USER MODAL */}
      <Modal
        open={!!editingUser}
        title="Modify User"
        onClose={() => setEditingUser(null)}
        onConfirm={async () => {
          if (!profile?.uid || !editingUser) return

          await dispatch(
            updateUserThunk({
              actorUid: profile.uid,
              uid: editingUser.uid,
              patch: {
                name: editingUser.name,
                role: editingUser.role,
              },
            })
          )

          setEditingUser(null)
          dispatch(fetchUsersThunk())
        }}
        confirmText="Save Changes"
      >
        {editingUser && (
          <div className="space-y-4">
            <Input
              label="Name"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />

            <Input label="Email" value={editingUser.email} disabled />

            <Select
              label="Role"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: e.target.value as UserRole,
                })
              }
            >
              <option value="CLERK">CLERK</option>
              <option value="OFFICER">OFFICER</option>
              <option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
        )}
      </Modal>

      {/* INVITE USER MODAL */}
      <Modal
        open={inviteOpen}
        title="Invite New User"
        onClose={() => setInviteOpen(false)}
        onConfirm={async () => {
          if (!profile?.uid) return

          await dispatch(
            inviteUserThunk({
              actorUid: profile.uid,
              email: invite.email,
              name: invite.name,
              role: invite.role,
            })
          )

          setInviteOpen(false)
          dispatch(fetchUsersThunk())
        }}
        confirmText="Send Invitation"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={invite.name}
            onChange={(e) =>
              setInvite({ ...invite, name: e.target.value })
            }
          />

          <Input
            label="Email Address"
            placeholder="john.doe@army.lk"
            value={invite.email}
            onChange={(e) =>
              setInvite({ ...invite, email: e.target.value })
            }
          />

          <Select
            label="Role"
            value={invite.role}
            onChange={(e) =>
              setInvite({
                ...invite,
                role: e.target.value as UserRole,
              })
            }
          >
            <option value="CLERK">CLERK</option>
            <option value="OFFICER">OFFICER</option>
            <option value="ACCOUNT_MANAGER">ACCOUNT_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="AUDITOR">AUDITOR</option>
          </Select>

          <div className="text-xs text-slate-500 pt-2">
            An invitation email will be sent to the user with account setup instructions.
          </div>
        </div>
      </Modal>
    </div>
  )
}
