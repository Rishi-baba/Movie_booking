import React from 'react';
import { MapPin } from 'lucide-react';

const TheatreItem = ({ name, location, price, logo, onClick }) => {
  return (
    <div onClick={onClick} className="flex items-center mb-5 cursor-pointer active:scale-95 transition-transform">
      <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden mr-4">
        {logo ? (
          <img src={logo} alt={name} className="w-12 h-12 object-contain" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
        )}
      </div>
      <div className="flex-1 border-b border-gray-100 pb-4 min-w-0">
        <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">{name}</h3>
        <div className="flex items-center text-gray-500 text-[12px] mt-1 mb-1.5 min-w-0">
          <MapPin size={12} className="mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <p className="font-semibold text-[13px] text-gray-700">{price}</p>
      </div>
    </div>
  );
};

export default TheatreItem;
