import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/goals`;

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
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
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch goals';
      })
      
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create goal';
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update goal';
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.goals = state.goals.filter(goal => goal._id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to delete goal';
      });
  },
});

export const { resetStatus } = goalsSlice.actions;
export default goalsSlice.reducer;
