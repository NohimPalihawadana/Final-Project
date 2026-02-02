import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ActivityLog } from '@/types'
import { fetchLatestActivity } from './activityService'

type State = { items: ActivityLog[]; loading: boolean; error?: string }

const initialState: State = { items: [], loading: false }

export const fetchActivityThunk = createAsyncThunk('activity/fetch', async () => fetchLatestActivity())

const slice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchActivityThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(fetchActivityThunk.fulfilled, (s, a) => {
        s.loading = false
        s.items = a.payload
      })
      .addCase(fetchActivityThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })
  },
})

export default slice.reducer
