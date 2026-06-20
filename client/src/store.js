import { configureStore } from '@reduxjs/toolkit';
import adminMovieReducer from './features/admin/adminMovieSlice';
import adminTheatreReducer from './features/admin/adminTheatreSlice';
import adminShowReducer from './features/admin/adminShowSlice';

export const store = configureStore({
  reducer: {
    adminMovie: adminMovieReducer,
    adminTheatre: adminTheatreReducer,
    adminShow: adminShowReducer,
  },
});
