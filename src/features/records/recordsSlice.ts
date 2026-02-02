import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { FinancialRecord } from '@/types'
import { fetchAvailableMonths, fetchFinancialRecord } from './recordsService'

type State = {
  months: string[]
  current: FinancialRecord | null
  loading: boolean
  error?: string
}

const initialState: State = {
  months: [],
  current: null,
  loading: false,
}

export const fetchMonthsThunk = createAsyncThunk('records/fetchMonths', async () => fetchAvailableMonths())
export const fetchRecordThunk = createAsyncThunk('records/fetchRecord', async (month: string) => fetchFinancialRecord(month))

const slice = createSlice({
  name: 'records',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMonthsThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(fetchMonthsThunk.fulfilled, (s, a) => {
        s.loading = false
        s.months = a.payload
      })
      .addCase(fetchMonthsThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })
      .addCase(fetchRecordThunk.pending, (s) => {
        s.loading = true
        s.error = undefined
      })
      .addCase(fetchRecordThunk.fulfilled, (s, a) => {
        s.loading = false
        s.current = a.payload
      })
      .addCase(fetchRecordThunk.rejected, (s, a) => {
        s.loading = false
        s.error = a.error.message
      })
  },
})

export default slice.reducer
