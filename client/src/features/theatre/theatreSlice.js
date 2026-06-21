import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  theatres: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const getTheatres = createAsyncThunk('theatre/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/theatres');
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const theatreSlice = createSlice({
  name: 'theatre',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTheatres.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTheatres.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.theatres = action.payload;
      })
      .addCase(getTheatres.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = theatreSlice.actions;
export default theatreSlice.reducer;
