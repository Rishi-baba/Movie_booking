import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Custom storage wrapper for Vite compatibility
const customStorage = {
  getItem: (key) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
};

import adminMovieReducer from './features/admin/adminMovieSlice';
import adminTheatreReducer from './features/admin/adminTheatreSlice';
import adminShowReducer from './features/admin/adminShowSlice';

import authReducer from './features/auth/authSlice';
import movieReducer from './features/movie/movieSlice';
import bookingReducer from './features/booking/bookingSlice';
import theatreReducer from './features/theatre/theatreSlice';

const rootReducer = combineReducers({
  adminMovie: adminMovieReducer,
  adminTheatre: adminTheatreReducer,
  adminShow: adminShowReducer,
  auth: authReducer,
  movie: movieReducer,
  booking: bookingReducer,
  theatre: theatreReducer,
});

const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['auth', 'movie', 'booking', 'theatre'], // Only persist the user-facing slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
