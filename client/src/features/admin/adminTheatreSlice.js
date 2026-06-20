import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  theatres: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getAdminTheatres = createAsyncThunk('adminTheatres/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/theatres');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const createTheatre = createAsyncThunk('adminTheatres/create', async (theatreData, thunkAPI) => {
  try {
    const response = await api.post('/admin/theatres', theatreData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteTheatre = createAsyncThunk('adminTheatres/delete', async (id, thunkAPI) => {
    try {
      await api.delete(`/admin/theatres/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
});

export const adminTheatreSlice = createSlice({
  name: 'adminTheatre',
  initialState,
  reducers: {
    resetTheatreState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminTheatres.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminTheatres.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.theatres = action.payload;
      })
      .addCase(getAdminTheatres.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(createTheatre.pending, (state) => { state.isLoading = true; })
      .addCase(createTheatre.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.theatres.unshift(action.payload);
      })
      .addCase(createTheatre.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(deleteTheatre.fulfilled, (state, action) => {
        state.theatres = state.theatres.filter((t) => t._id !== action.payload);
      });
  },
});

export const { resetTheatreState } = adminTheatreSlice.actions;
export default adminTheatreSlice.reducer;
