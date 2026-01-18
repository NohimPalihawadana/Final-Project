import { createSlice, type PayloadAction } from "@reduxjs/toolkit/react";
import type { AppEvent } from "../../lib/types";
import { events } from "../../lib/data/sampleData";

type State = {
    events: AppEvent[];
    selectedEvent: AppEvent | null;
    formOpen: boolean;
}

const initialState: State = {
    events: events,
    selectedEvent: null,
    formOpen: false,
}

export const eventSlice = createSlice( {
    name: 'event',
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<AppEvent[]>) => {
            state.events = action.payload;
        },
        createEvent: (state, action: PayloadAction<AppEvent>) => {
            state.events.push(action.payload);
        },
        updateEvent: (state, action: PayloadAction<AppEvent>) => {
            state.events = state.events.map(event => event.id === action.payload.id ? action.payload : event);
        },
        deleteEvent: (state, action: PayloadAction<string>) => {
            state.events = state.events.filter(event => event.id !== action.payload);
        },
        selectEvent: (state, action: PayloadAction<string | null>) => {
            state.selectedEvent = state.events.find(event => event.id === action.payload) || null;
        }
    }
});

export const { setEvents, createEvent, updateEvent, deleteEvent, selectEvent} = eventSlice.actions;