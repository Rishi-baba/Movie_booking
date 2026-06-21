import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../../components/mobile/BottomNav';

const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-[#111] flex justify-center text-[#1f2937] font-sans">
      {/* 390px Mobile App Container */}
      <div className="w-full max-w-[390px] bg-[#F9FAFB] h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col pb-[60px]">
        <div className="flex-1 relative w-full h-full flex flex-col overflow-hidden">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default MobileLayout;
