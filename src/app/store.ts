import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import transactionsReducer from '@/features/transactions/transactionsSlice'
import usersReducer from '@/features/users/usersSlice'
import recordsReducer from '@/features/records/recordsSlice'
import activityReducer from '@/features/activity/activitySlice'
import subAccountsReducer from "@/features/subAccounts/subAccountsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    users: usersReducer,
    records: recordsReducer,
    activity: activityReducer,
    subAccounts: subAccountsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
