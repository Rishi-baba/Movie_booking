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

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<MovieManager />} />
          <Route path="theatres" element={<TheatreManager />} />
          <Route path="shows" element={<ShowManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
