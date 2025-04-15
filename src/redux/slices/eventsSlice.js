import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/events`;

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch events';
      })
      
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events.push({
          ...action.payload,
          start: new Date(action.payload.start),
          end: new Date(action.payload.end),
        });
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create event';
      })
      
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedEvent = {
          ...action.payload,
          start: new Date(action.payload.start),
          end: new Date(action.payload.end),
        };
        const index = state.events.findIndex(event => event._id === updatedEvent._id);
        if (index !== -1) {
          state.events[index] = updatedEvent;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update event';
      })
      
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = state.events.filter(event => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to delete event';
      });
  },
});

export const { resetStatus } = eventsSlice.actions;
export default eventsSlice.reducer;
