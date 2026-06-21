import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin Layout
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MovieManager from './pages/admin/MovieManager';
import TheatreManager from './pages/admin/TheatreManager';
import ShowManager from './pages/admin/ShowManager';

// Mobile Layout & Pages
import MobileLayout from './layouts/mobile/MobileLayout';
import AuthPage from './pages/mobile/AuthPage';
import HomePage from './pages/mobile/HomePage';
import MovieDetailsPage from './pages/mobile/MovieDetailsPage';
import TheatreDetailsPage from './pages/mobile/TheatreDetailsPage';
import SelectTheatrePage from './pages/mobile/SelectTheatrePage';
import ChooseSchedulePage from './pages/mobile/ChooseSchedulePage';
import SelectSeatsPage from './pages/mobile/SelectSeatsPage';
import BookingSummaryPage from './pages/mobile/BookingSummaryPage';
import CheckoutPage from './pages/mobile/CheckoutPage';
import PaymentSuccessPage from './pages/mobile/PaymentSuccessPage';
import MyBookingsPage from './pages/mobile/MyBookingsPage';
import ProfilePage from './pages/mobile/ProfilePage';

import PrivateRoute from './components/PrivateRoute';

import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        {/* Mobile App Routes */}
        <Route element={<MobileLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/theatres/:id" element={<TheatreDetailsPage />} />
          <Route path="/booking/theatre" element={<SelectTheatrePage />} />
          <Route path="/booking/schedule" element={<ChooseSchedulePage />} />
          {/* Public Mobile Routes */}
          <Route path="/booking/seats" element={<SelectSeatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Protected Mobile Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/booking/summary" element={<BookingSummaryPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<PaymentSuccessPage />} />
            <Route path="/profile/bookings" element={<MyBookingsPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<MovieManager />} />
            <Route path="theatres" element={<TheatreManager />} />
            <Route path="shows" element={<ShowManager />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
