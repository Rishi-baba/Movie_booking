import React from 'react';
import { ChevronLeft, Building2, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../../utils/helpers';

const BookingSummaryPage = () => {
  const navigate = useNavigate();
  const { selectedShow, selectedSeats } = useSelector((state) => state.booking);
  const { selectedMovie } = useSelector((state) => state.movie);

  if (!selectedShow || !selectedMovie) {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-[#F9FAFB]">
        <p className="text-gray-500 mb-4">No booking details found.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-4 py-2 rounded">Go Home</button>
      </div>
    );
  }

  const ticketCost = selectedShow.price * selectedSeats.length;
  const bookingFee = 20;
  const totalAmount = ticketCost + bookingFee;
  
  const formattedDate = new Date(selectedShow.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative">
      
      {/* Header and Content */}
      <div className="px-5 pt-10 pb-4 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
            <ChevronLeft color="#1f2937" size={20} />
            <span className="text-gray-900 text-[14px] font-medium">Back</span>
          </div>
          <span className="text-gray-500 text-[14px] font-medium cursor-pointer" onClick={() => navigate('/')}>Cancel</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="w-3/4 h-full bg-primary rounded-full"></div>
        </div>

        <h1 className="text-[20px] font-bold text-gray-900 mb-5">Booking Summary</h1>

        {/* Movie Card */}
        <div className="w-full rounded-xl overflow-hidden mb-5 h-[180px] shadow-sm">
          <img 
            src={selectedMovie.poster ? getImageUrl(selectedMovie.poster) : "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
            alt={selectedMovie.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-[22px] font-bold text-gray-900 mb-4">{selectedMovie.title}</h2>

        <div className="flex items-center space-x-6 mb-5">
          <div className="flex items-center space-x-2 text-[#64748b]">
            <Building2 size={16} />
            <span className="text-[14px] font-semibold">{selectedShow.theatreId?.name || "The Grandview"}</span>
          </div>
          <div className="flex items-center space-x-2 text-[#64748b]">
            <CalendarDays size={16} />
            <span className="text-[14px] font-semibold">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <span className="text-[15px] font-bold text-gray-900 w-24">{selectedShow.screen || 'Screen 1'}</span>
          <div className="flex items-center space-x-3">
            <span className="text-[15px] font-semibold text-[#64748b]">{selectedShow.time}</span>
            <span className="text-[15px] font-semibold text-[#64748b]">{selectedShow.format}</span>
          </div>
        </div>

        <div className="flex items-center mb-8">
          <span className="text-[15px] font-bold text-gray-900 w-24">Seats</span>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <div key={seat} className="bg-[#94a3b8] text-white px-2.5 py-1 rounded text-[13px] font-bold">
                {seat}
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[15px] text-gray-700">{selectedSeats.length}x Tickets</span>
            <span className="text-[15px] text-gray-900 font-medium">₹{ticketCost}</span>
          </div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-[15px] text-gray-700">Booking Fee</span>
            <span className="text-[15px] text-gray-900 font-medium">₹{bookingFee}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-[18px] font-bold text-gray-900">Total</span>
            <span className="text-[18px] font-bold text-gray-900">₹{totalAmount}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 mb-4">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-[15px] shadow-sm active:scale-95 transition-transform"
          >
            Proceed to Payment
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSummaryPage;

