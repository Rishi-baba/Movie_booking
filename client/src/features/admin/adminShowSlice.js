import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  shows: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getAdminShows = createAsyncThunk('adminShows/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/shows');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const createShow = createAsyncThunk('adminShows/create', async (showData, thunkAPI) => {
  try {
    const response = await api.post('/admin/shows', showData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteShow = createAsyncThunk('adminShows/delete', async (id, thunkAPI) => {
    try {
      await api.delete(`/admin/shows/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
});

export const adminShowSlice = createSlice({
  name: 'adminShow',
  initialState,
  reducers: {
    resetShowState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminShows.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminShows.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.shows = action.payload;
      })
      .addCase(getAdminShows.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(createShow.pending, (state) => { state.isLoading = true; })
      .addCase(createShow.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.shows.unshift(action.payload);
      })
      .addCase(createShow.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(deleteShow.fulfilled, (state, action) => {
        state.shows = state.shows.filter((s) => s._id !== action.payload);
      });
  },
});

export const { resetShowState } = adminShowSlice.actions;
export default adminShowSlice.reducer;
