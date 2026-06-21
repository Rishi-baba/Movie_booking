import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ChevronRight, Settings, Ticket, LogIn, ShieldAlert } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';

const ProfilePage = () => {
  const { user, isGuest } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/auth', { state: { from: { pathname: '/profile' } } });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#F9FAFB] w-full flex flex-col pb-6">
      {/* Header */}
      <div className="w-full px-5 pt-12 pb-6 bg-white border-b border-gray-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200">
          <User size={40} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {user ? user.name : 'Guest User'}
        </h1>
        <p className="text-sm font-medium text-gray-500 flex items-center">
          <Mail size={14} className="mr-1" />
          {user ? user.email : 'Not logged in'}
        </p>
      </div>

      {/* Menu Options */}
      <div className="flex-1 px-5 mt-6 space-y-4">
        
        {user?.role === 'admin' && (
          <div 
            onClick={() => navigate('/admin')}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <ShieldAlert size={20} className="text-red-500" />
              </div>
              <span className="text-sm font-bold text-red-600">Admin Panel</span>
            </div>
            <ChevronRight size={20} className="text-red-400" />
          </div>
        )}

        <div 
          onClick={() => navigate('/profile/bookings')}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <Ticket size={20} className="text-primary" />
            </div>
            <span className="text-sm font-bold text-gray-900">My Bookings</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
              <Settings size={20} className="text-gray-500" />
            </div>
            <span className="text-sm font-bold text-gray-900">Settings (Coming Soon)</span>
          </div>
        </div>

      </div>

      {/* Auth Action */}
      <div className="px-5 mt-auto mb-6">
        {user ? (
          <button 
            onClick={handleLogout}
            className="w-full bg-white border border-red-100 text-red-500 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-transform"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-transform"
          >
            <LogIn size={18} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
