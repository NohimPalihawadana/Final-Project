import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AppUser } from '@/types'
import { authApi } from '@/firebase/auth'
import { auth } from '@/firebase/firebase'
import { getDoc, ref, setDoc } from '@/firebase/firestore'

type AuthState = {
  initialized: boolean
  user: { uid: string; email: string | null } | null
  profile: AppUser | null
  loading: boolean
  error?: string
}

const initialState: AuthState = {
  initialized: false,
  user: null,
  profile: null,
  loading: false,
}

export const authThunk = createAsyncThunk('auth', async () => {
  const authUser = auth.currentUser
  if (!authUser) return { user: null as AuthState['user'], profile: null as AppUser | null }

  const user = { uid: authUser.uid, email: authUser.email }
  const snap = await getDoc(ref(`users/${user.uid}`))
  const profile = snap.exists() ? (snap.data() as AppUser) : null
  return { user, profile }
})

export const loginThunk = createAsyncThunk('auth/login', async (args: { email: string; password: string }) => {
  await authApi.login(args.email, args.password)
})

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (args: { email: string; password: string; name: string }) => {
    const cred = await authApi.register(args.email, args.password)

    // For local/dev convenience:
    // Create user profile if not exists (role must be set by Admin later)
    const now = Date.now()
    const userDoc: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || args.email,
      name: args.name,
      role: 'CLERK', // default; change in Firestore for testing or via Admin page (Cloud Function recommended)
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(ref(`users/${cred.user.uid}`), userDoc, { merge: true })
  },
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
})

export const updateEmailThunk = createAsyncThunk('auth/updateEmail', async (args: { email: string }) => {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  await authApi.updateEmail(u, args.email)
})

export const updatePasswordThunk = createAsyncThunk('auth/updatePassword', async (args: { password: string }) => {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  await authApi.updatePassword(u, args.password)
})

export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (args: { email: string }) => {
  await authApi.resetPasswordEmail(args.email)
})

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(authThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(authThunk.fulfilled, (s, a) => {
        s.loading = false
        s.initialized = true
        s.user = a.payload.user
        s.profile = a.payload.profile
      })
      .addCase(authThunk.rejected, (s, a) => {
        s.loading = false
        s.initialized = true
        s.error = a.error.message
        s.user = null
        s.profile = null
      })

      .addCase(loginThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(loginThunk.fulfilled, (s) => {
        s.loading = false
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })

      .addCase(registerThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(registerThunk.fulfilled, (s) => {
        s.loading = false
      })
      .addCase(registerThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })

      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null
        s.profile = null
        s.initialized = true
      })
  },
})

export default slice.reducer
