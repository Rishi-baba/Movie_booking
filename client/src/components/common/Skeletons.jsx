import React from 'react';

export const MovieCardSkeleton = () => (
  <div className="flex-shrink-0 w-[106px] h-[230px] mr-4 animate-pulse flex flex-col snap-start">
    <div className="w-full h-[172px] bg-gray-200 rounded-xl mb-2 shrink-0"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const BannerSkeleton = () => (
  <div className="relative w-full h-[300px] bg-gray-200 animate-pulse">
    <div className="absolute top-4 left-4 w-8 h-8 bg-gray-300 rounded-full"></div>
    <div className="absolute -bottom-8 left-6 flex items-end">
      <div className="w-28 h-40 bg-gray-300 rounded-xl border-4 border-white shadow-md"></div>
      <div className="ml-4 mb-4">
        <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-3 mt-4">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 3 }) => (
  <div className="animate-pulse space-y-4 px-5">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="w-full p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="flex space-x-2 pt-2">
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SeatMatrixSkeleton = () => (
  <div className="animate-pulse flex flex-col items-center mt-8">
    {/* Screen */}
    <div className="w-64 h-2 bg-gray-300 rounded mb-10 relative">
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-gray-200/50 to-transparent rounded-b-full"></div>
    </div>
    
    {/* Seats */}
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="flex space-x-2">
          {Array.from({ length: 8 }).map((_, col) => (
            <div key={col} className="w-7 h-7 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const TicketSkeleton = () => (
  <div className="animate-pulse w-full bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm flex">
    <div className="w-20 h-28 bg-gray-200 rounded-lg mr-4"></div>
    <div className="flex-1 space-y-3 pt-1">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex space-x-4 mt-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);
