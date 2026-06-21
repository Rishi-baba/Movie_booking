import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setSelectedSeats } from '../../features/booking/bookingSlice';
import api from '../../utils/api';

const SelectSeatsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedShow } = useSelector((state) => state.booking);
  
  const [seatConfig, setSeatConfig] = useState({ rows: 10, columns: 10, bookedSeats: [], lockedSeats: [] });
  const [loading, setLoading] = useState(true);

  // Selected seats state to toggle purple selection
  const [selectedSeatsLocal, setSelectedSeatsLocal] = useState([]);

  useEffect(() => {
    if (!selectedShow) {
      navigate('/');
      return;
    }

    const fetchSeats = async () => {
      try {
        const response = await api.get(`/shows/${selectedShow._id}/seats`);
        setSeatConfig(response.data);
      } catch (error) {
        console.error('Error fetching seats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [selectedShow, navigate]);

  const toggleSeat = (seatId) => {
    if (seatConfig.bookedSeats.includes(seatId) || (seatConfig.lockedSeats && seatConfig.lockedSeats.includes(seatId))) return;
    if (selectedSeatsLocal.includes(seatId)) {
      setSelectedSeatsLocal(selectedSeatsLocal.filter(s => s !== seatId));
    } else {
      if (selectedSeatsLocal.length >= 7) {
        alert("You can select a maximum of 7 seats.");
        return;
      }
      setSelectedSeatsLocal([...selectedSeatsLocal, seatId]);
    }
  };

  const [isLocking, setIsLocking] = useState(false);

  const handleProceed = async () => {
    setIsLocking(true);
    try {
      // Attempt to acquire 2-minute lock on selected seats
      await api.post('/bookings/lock', { 
        showId: selectedShow._id, 
        seats: selectedSeatsLocal 
      });
      
      dispatch(setSelectedSeats(selectedSeatsLocal));
      navigate('/booking/summary');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Seats are no longer available. Please select different seats.');
      setSelectedSeatsLocal([]);
      // Refresh seat map
      try {
        const response = await api.get(`/shows/${selectedShow._id}/seats`);
        setSeatConfig(response.data);
      } catch (e) {}
    } finally {
      setIsLocking(false);
    }
  };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB]">Loading seats...</div>;
  }

  // Generate row labels dynamically
  const rowLabels = Array.from({ length: seatConfig.rows }).map((_, i) => String.fromCharCode(65 + i));
  const ticketPrice = selectedShow ? selectedShow.price : 0;
  const totalPrice = selectedSeatsLocal.length * ticketPrice;

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-[76px]">
      
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
            <ChevronLeft color="#1f2937" size={20} />
            <span className="text-gray-900 text-[14px] font-medium">Back</span>
          </div>
          <span className="text-gray-500 text-[14px] font-medium cursor-pointer" onClick={() => navigate('/')}>Cancel</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="w-full h-full bg-primary rounded-full"></div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 mb-1">Select Seats</h1>
            <div className="flex items-center space-x-2 text-[13px] font-semibold">
              <span className="text-gray-800">{selectedShow?.screen || 'Screen 1'}</span>
              <span className="text-primary">{selectedShow?.time}</span>
            </div>
          </div>
          <div className="text-[16px] font-bold text-gray-900">
            {totalPrice > 0 ? `₹${totalPrice}` : `₹${ticketPrice}/seat`}
          </div>
        </div>
      </div>

      <div className="px-5 flex-1 overflow-x-hidden overflow-y-auto">
        {/* Screen curve indicator */}
        <div className="w-full mt-2 mb-6 relative flex flex-col items-center">
          {seatConfig.screenType === 'Plain' ? (
            <div className="w-[90%] h-[4px] bg-[#cbd5e1] mb-4"></div>
          ) : (
            <div className="w-[90%] h-[20px] rounded-[50%] border-t-4 border-[#cbd5e1]"></div>
          )}
          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Screen</span>
        </div>

        {/* Seat Grid */}
        <div className="flex flex-col items-center space-y-2 mb-8 overflow-x-auto hide-scrollbar">
          {rowLabels.map((rowLabel, rIdx) => {
            return (
              <div key={rIdx} className="flex items-center space-x-1.5 w-full justify-center">
                <span className="text-[12px] font-bold text-gray-700 w-4 text-center mr-2">{rowLabel}</span>
                {Array.from({ length: seatConfig.columns }).map((_, cIdx) => {
                  const seatNum = cIdx + 1;
                  const seatId = `${rowLabel}${seatNum}`;
                  const isOccupied = seatConfig.bookedSeats.includes(seatId) || (seatConfig.lockedSeats && seatConfig.lockedSeats.includes(seatId));
                  const isSelected = selectedSeatsLocal.includes(seatId);

                  let bgClass = "bg-white border-gray-300 text-gray-400";
                  if (isOccupied) bgClass = "bg-[#94a3b8] border-[#94a3b8] text-white";
                  if (isSelected) bgClass = "bg-primary border-primary text-white";

                  return (
                    <button 
                      key={cIdx} 
                      onClick={() => toggleSeat(seatId)}
                      className={`min-w-[24px] h-6 flex items-center justify-center rounded text-[10px] font-bold border transition-colors ${bgClass}`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
            <span className="text-[12px] text-gray-500 font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border border-[#94a3b8] bg-[#94a3b8]"></div>
            <span className="text-[12px] text-gray-500 font-medium">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border border-primary bg-primary"></div>
            <span className="text-[12px] text-primary font-medium">Selected</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full px-5 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <button 
          onClick={handleProceed}
          disabled={selectedSeatsLocal.length === 0 || isLocking}
          className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-[15px] shadow-sm active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>{isLocking ? 'Locking Seats...' : 'View Booking Summary'}</span>
        </button>
      </div>
    </div>
  );
};

export default SelectSeatsPage;

