import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  movies: [],
  currentPage: 1,
  totalPages: 1,
  totalMovies: 0,
  selectedMovie: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getMovies = createAsyncThunk('movie/getAll', async ({ status, page = 1, limit = 5 } = {}, thunkAPI) => {
  try {
    let url = `/movies?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const response = await api.get(url);
    // return { ...response.data, page } so reducer knows if it should append or replace
    return { ...response.data, page };
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMovieById = createAsyncThunk('movie/getById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    resetMovieStatus: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },
    setSelectedMovieSync: (state, action) => {
      state.selectedMovie = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMovies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        if (action.payload.page === 1) {
          state.movies = action.payload.movies;
        } else {
          // Append for page > 1
          state.movies = [...state.movies, ...action.payload.movies];
        }
        
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalMovies = action.payload.totalMovies;
      })
      .addCase(getMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMovieById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMovieById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedMovie = action.payload;
      })
      .addCase(getMovieById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetMovieStatus, clearSelectedMovie, setSelectedMovieSync } = movieSlice.actions;
export default movieSlice.reducer;
