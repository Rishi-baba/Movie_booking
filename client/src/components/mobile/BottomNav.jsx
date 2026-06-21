import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Ticket, Heart, User } from 'lucide-react';
import { toast } from 'react-toastify';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Ticket, path: '/profile/bookings', label: 'Tickets' },
    { icon: Heart, path: '/favorites', label: 'Favorites' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white h-[60px] flex items-center justify-around border-t border-gray-200 px-4 z-50">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/movies'));
        return (
          <Link 
            to={item.path} 
            key={index} 
            className="flex flex-col items-center justify-center w-16 h-full cursor-pointer"
            onClick={(e) => {
              if (item.path === '/favorites') {
                e.preventDefault();
                toast.info('Favorites feature is coming soon!', { icon: '✨' });
              }
            }}
          >
            <Icon 
              size={24} 
              className={`transition-colors ${isActive ? 'text-primary' : 'text-[#9ca3af]'}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
