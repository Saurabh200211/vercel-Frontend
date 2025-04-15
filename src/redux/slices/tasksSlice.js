import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/tasks`;

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTasksByGoal = createAsyncThunk(
  'tasks/fetchTasksByGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/goal/${goalId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    filteredTasks: [],
    selectedGoalId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setSelectedGoal: (state, action) => {
      state.selectedGoalId = action.payload;
      if (action.payload) {
        state.filteredTasks = state.tasks.filter(task => task.goalId === action.payload);
      } else {
        state.filteredTasks = [];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
        if (state.selectedGoalId) {
          state.filteredTasks = action.payload.filter(
            task => task.goalId === state.selectedGoalId
          );
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })
      
      // Fetch tasks by goal
      .addCase(fetchTasksByGoal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksByGoal.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredTasks = action.payload;
      })
      .addCase(fetchTasksByGoal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch tasks by goal';
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks.push(action.payload);
        if (state.selectedGoalId === action.payload.goalId) {
          state.filteredTasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create task';
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        
        const filteredIndex = state.filteredTasks.findIndex(task => task._id === action.payload._id);
        if (filteredIndex !== -1) {
          if (action.payload.goalId === state.selectedGoalId) {
            state.filteredTasks[filteredIndex] = action.payload;
          } else {
            state.filteredTasks.splice(filteredIndex, 1);
          }
        } else if (action.payload.goalId === state.selectedGoalId) {
          state.filteredTasks.push(action.payload);
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to update task';
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.filteredTasks = state.filteredTasks.filter(task => task._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to delete task';
      });
  },
});

export const { resetStatus, setSelectedGoal } = tasksSlice.actions;
export default tasksSlice.reducer;
