import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, resetAuthStatus, continueAsGuest } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { name, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const fromPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess || user) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    }
    dispatch(resetAuthStatus());
  }, [user, isError, isSuccess, message, navigate, dispatch, fromPath]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email, password }));
    } else {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
      } else {
        dispatch(registerUser({ name, email, password }));
      }
    }
  };

  const handleGuest = () => {
    dispatch(continueAsGuest());
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="flex flex-col items-center pt-24 pb-12 px-6 h-full w-full bg-[#F9FAFB] min-h-screen overflow-x-hidden overflow-y-auto">
      
      {/* Logo Placeholder */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-end justify-center mb-4 text-primary">
          <svg width="80" height="50" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20C10 14.4772 14.4772 10 20 10H45C47.7614 10 50 12.2386 50 15V45H15C12.2386 45 10 42.7614 10 40V20Z" fill="#1e1b4b"/>
            <path d="M10 40V45C10 47.7614 12.2386 50 15 50H45V45H15C12.2386 45 10 42.7614 10 40Z" fill="#1e1b4b"/>
            <rect x="5" y="25" width="10" height="25" rx="3" fill="#1e1b4b"/>
            
            <path d="M45 25C45 19.4772 49.4772 15 55 15H80C85.5228 15 90 19.4772 90 25V45H50C47.2386 45 45 42.7614 45 40V25Z" fill="#5A52E5"/>
            <path d="M45 40V45C45 47.7614 47.2386 50 50 50H80V45H50C47.2386 45 45 42.7614 45 40Z" fill="#5A52E5"/>
            <rect x="85" y="30" width="10" height="20" rx="3" fill="#5A52E5"/>
            <rect x="40" y="30" width="10" height="20" rx="3" fill="#5A52E5"/>
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-center leading-tight text-gray-900">
          Creative Upaay<br/>Hiring Assignment
        </h1>
      </div>

      {/* Toggle Container */}
      <div className="w-full bg-[#f1f2f4] rounded-lg p-1 flex mb-8">
        <button 
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          Login
        </button>
        <button 
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleAuth} className="w-full flex flex-col space-y-6">
        {!isLogin && (
          <div className="w-full">
            <input 
              type="text" 
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Name" 
              required
              className="w-full bg-transparent border-b border-gray-300 py-2 outline-none text-sm text-gray-800 placeholder-gray-400 focus:border-primary transition-colors"
            />
          </div>
        )}
        
        <div className="w-full">
          <input 
            type="email" 
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email ID" 
            required
            className="w-full bg-transparent border-b border-gray-300 py-2 outline-none text-sm text-gray-800 placeholder-gray-400 focus:border-primary transition-colors"
          />
        </div>

        <div className="w-full">
          <input 
            type="password" 
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password" 
            required
            className="w-full bg-transparent border-b border-gray-300 py-2 outline-none text-sm text-gray-800 placeholder-gray-400 focus:border-primary transition-colors"
          />
        </div>

        {!isLogin && (
          <div className="w-full mb-4">
            <input 
              type="password" 
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password" 
              required
              className="w-full bg-transparent border-b border-gray-300 py-2 outline-none text-sm text-gray-800 placeholder-gray-400 focus:border-primary transition-colors"
            />
          </div>
        )}

        <div className="pt-6 space-y-3">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-md font-medium text-sm hover:bg-opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          {isLogin && (
            <button 
              type="button" 
              onClick={() => {
                setFormData({ ...formData, email: 'admin@creativeupaay.com', password: 'password123' });
                dispatch(loginUser({ email: 'admin@creativeupaay.com', password: 'password123' }));
              }}
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-3.5 rounded-md font-medium text-sm hover:bg-opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-70 mt-3"
            >
              Demo Admin Login
            </button>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGuest}
            disabled={isLoading}
            className="w-full bg-white text-primary border border-primary py-3.5 rounded-md font-medium text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-70"
          >
            Continue as Guest
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
