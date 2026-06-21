import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome back, Admin!</h2>
        <p className="text-gray-500">
          Select an option from the sidebar to manage movies, theatres, and shows.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
