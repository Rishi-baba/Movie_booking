import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  movies: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all movies
export const getAdminMovies = createAsyncThunk('adminMovies/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/movies');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Create new movie
export const createMovie = createAsyncThunk('adminMovies/create', async (movieData, thunkAPI) => {
  try {
    // We send FormData because of the image upload
    const response = await api.post('/admin/movies', movieData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete movie
export const deleteMovie = createAsyncThunk('adminMovies/delete', async (id, thunkAPI) => {
    try {
      await api.delete(`/admin/movies/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  });

// Update movie
export const updateMovie = createAsyncThunk('adminMovies/update', async ({ id, movieData }, thunkAPI) => {
    try {
      const response = await api.put(`/admin/movies/${id}`, movieData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
});

export const adminMovieSlice = createSlice({
  name: 'adminMovie',
  initialState,
  reducers: {
    resetMovieState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Movies
      .addCase(getAdminMovies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.movies = action.payload;
      })
      .addCase(getAdminMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Movie
      .addCase(createMovie.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.movies.unshift(action.payload);
      })
      .addCase(createMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Movie
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.movies = state.movies.filter((movie) => movie._id !== action.payload);
      })
      // Update Movie
      .addCase(updateMovie.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.movies.findIndex(movie => movie._id === action.payload._id);
        if (index !== -1) {
            state.movies[index] = action.payload;
        }
      })
      .addCase(updateMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetMovieState } = adminMovieSlice.actions;
export default adminMovieSlice.reducer;
