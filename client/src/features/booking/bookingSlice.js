import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  selectedShow: null,
  selectedSeats: [],
  currentBooking: null, // Holds the result after successful POST
  myBookings: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const createBooking = createAsyncThunk('booking/create', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMyBookings = createAsyncThunk('booking/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const cancelBooking = createAsyncThunk('booking/cancel', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedShow: (state, action) => {
      state.selectedShow = action.payload;
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearTransientBookingState: (state) => {
      state.selectedShow = null;
      state.selectedSeats = [];
      // Note: We don't clear currentBooking here because it's needed for the success page
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    resetBookingStatus: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // createBooking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBooking = action.payload; // Store the success payload
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // getMyBookings
      .addCase(getMyBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myBookings = action.payload;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // cancelBooking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        // Update the specific booking in the list
        const updatedBooking = action.payload;
        state.myBookings = state.myBookings.map((b) => 
          b._id === updatedBooking._id ? updatedBooking : b
        );
      });
  },
});

export const { 
  setSelectedShow, 
  setSelectedSeats, 
  clearTransientBookingState, 
  clearCurrentBooking, 
  resetBookingStatus 
} = bookingSlice.actions;

export default bookingSlice.reducer;
