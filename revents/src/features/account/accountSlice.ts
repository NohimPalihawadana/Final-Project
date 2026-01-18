import { createSlice } from "@reduxjs/toolkit";
import { users } from "../../lib/data/sampleData";
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
        signIn: (state) => {
            state.user = users[0];
        },
        signOut: (state) => {
            state.user = null;
        }
    }
});

export const { signIn, signOut } = accountSlice.actions;