import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/firebase/firebase"

/* ----------------------------------
   Types
----------------------------------- */

export type SubAccount = {
  id: string
  name: string
  description?: string
  date: string
}

type SubAccountsState = {
  items: SubAccount[]
  loading: boolean
  error?: string
}

/* ----------------------------------
   Constants
----------------------------------- */

const PROTECTED_SUB_ACCOUNTS = ["cash", "bank"]

const isProtected = (name: string) =>
  PROTECTED_SUB_ACCOUNTS.includes(name.toLowerCase())

/* ----------------------------------
   Initial State
----------------------------------- */

const initialState: SubAccountsState = {
  items: [],
  loading: false,
}

/* ----------------------------------
   Thunks
----------------------------------- */

export const fetchSubAccountsThunk = createAsyncThunk<
  SubAccount[]
>("subAccounts/fetchAll", async () => {
  const q = query(
    collection(db, "subAccounts"),
    orderBy("createdAt", "asc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description || "",
      date: data.date || "",
    }
  })
})

export const createSubAccountThunk = createAsyncThunk<
  SubAccount,
  { name: string; description?: string; date: string }
>("subAccounts/create", async (data) => {
  const docRef = await addDoc(collection(db, "subAccounts"), {
    name: data.name,
    description: data.description || "",
    date: data.date,
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    name: data.name,
    description: data.description || "",
    date: data.date,
  }
})

export const updateSubAccountThunk = createAsyncThunk<
  SubAccount,
  { id: string; name: string; description?: string; date: string }
>("subAccounts/update", async (data, { rejectWithValue }) => {
  if (isProtected(data.name)) {
    return rejectWithValue("Cash and Bank accounts cannot be modified.")
  }

  await updateDoc(doc(db, "subAccounts", data.id), {
    name: data.name,
    description: data.description || "",
    date: data.date,
  })

  return data
})

export const deleteSubAccountThunk = createAsyncThunk<
  string,
  { id: string; name: string }
>("subAccounts/delete", async ({ id, name }, { rejectWithValue }) => {
  if (isProtected(name)) {
    return rejectWithValue("Cash and Bank accounts cannot be deleted.")
  }

  await deleteDoc(doc(db, "subAccounts", id))
  return id
})

/* ----------------------------------
   Slice
----------------------------------- */

const subAccountsSlice = createSlice({
  name: "subAccounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubAccountsThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSubAccountsThunk.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(fetchSubAccountsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(createSubAccountThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(createSubAccountThunk.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.loading = false
      })
      .addCase(createSubAccountThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(updateSubAccountThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (sa) => sa.id === action.payload.id
        )
        if (index !== -1) state.items[index] = action.payload
        state.loading = false
      })

      .addCase(deleteSubAccountThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (sa) => sa.id !== action.payload
        )
        state.loading = false
      })
  },
})

export default subAccountsSlice.reducer
