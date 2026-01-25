import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppUser } from "../../lib/types";

type State = {
    user: AppUser | null;
}

const intiaState: State = {
    user: null
}

export const accountSlice = createSlice({
    name: 'account',
    initialState: intiaState,
    reducers: {
        signIn: (state, action: PayloadAction<AppUser>) => {
            state.user = action.payload;
        },
        signOut: (state) => {
            state.user = null;
        }
    }
});

export const { signIn, signOut } = accountSlice.actions;