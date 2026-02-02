import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AppUser, UserRole } from '@/types'
import { deleteUser, fetchUsers, inviteUser, updateUserProfile } from './usersService'
import { logActivity } from '@/features/activity/activityService'

type State = { items: AppUser[]; loading: boolean; error?: string }

const initialState: State = { items: [], loading: false }

export const fetchUsersThunk = createAsyncThunk('users/fetch', async () => fetchUsers())

export const inviteUserThunk = createAsyncThunk(
  'users/invite',
  async (args: { actorUid: string; email: string; name: string; role: UserRole }) => {
    await inviteUser({ email: args.email, name: args.name, role: args.role })
    await logActivity(args.actorUid, 'user.invite', undefined, { email: args.email, role: args.role })
  },
)

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async (args: { actorUid: string; uid: string; patch: { name?: string; role?: UserRole } }) => {
    await updateUserProfile(args.uid, args.patch)
    await logActivity(args.actorUid, 'user.update', args.uid, args.patch as any)
  },
)

export const deleteUserThunk = createAsyncThunk('users/delete', async (args: { actorUid: string; uid: string }) => {
  await deleteUser(args.uid)
  await logActivity(args.actorUid, 'user.delete', args.uid)
})

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default slice.reducer
