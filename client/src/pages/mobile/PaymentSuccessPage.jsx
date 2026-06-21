import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearTransientBookingState, clearCurrentBooking } from '../../features/booking/bookingSlice';
import { getImageUrl } from '../../utils/helpers';
import QRCode from 'react-qr-code';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBooking } = useSelector((state) => state.booking);
  const { selectedMovie } = useSelector((state) => state.movie);

  const { selectedShow } = useSelector((state) => state.booking);

  if (!currentBooking || !selectedMovie) {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-[#F9FAFB]">
        <p className="text-gray-500 mb-4">No recent booking found.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-4 py-2 rounded">Go Home</button>
      </div>
    );
  }

  // Find the selected show to render the exact details we booked
  // Wait, the backend doesn't populate the show deeply for the create endpoint.
  // Actually, we can read selectedShow from state one last time before it's cleared on unmount!
  // Wait, currentBooking has the `bookingReference` we can use for the QR code.
  
  const formattedDate = selectedShow ? new Date(selectedShow.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
  const txDate = new Date(currentBooking.createdAt || Date.now()).toLocaleString();

  const bannerImage = selectedMovie?.banner?.url ? getImageUrl(selectedMovie.banner) : getImageUrl(selectedMovie?.poster);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-[100px] overflow-x-hidden overflow-y-auto">
      
      {/* Header */}
      <div className="w-full px-6 pt-6 flex justify-end">
        <span 
          onClick={() => navigate('/')}
          className="text-[#64748b] text-[14px] font-medium cursor-pointer hover:text-gray-900 transition-colors"
        >
          Close
        </span>
      </div>

      <div className="flex flex-col items-center mt-6 mb-8">
        <Check color="#10b981" size={48} strokeWidth={4} className="mb-4" />
        <h1 className="text-[16px] text-[#64748b] font-medium">Payment Successful!</h1>
      </div>

      {/* Ticket Card */}
      <div className="w-[88%] mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-8 flex flex-col relative flex-shrink-0">
        <div className="h-[200px] w-full flex-shrink-0">
          <img 
            src={bannerImage || "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
            alt={selectedMovie.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 flex-shrink-0">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">{selectedMovie.title}</h2>

          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[15px] font-medium text-gray-900 mb-1">{selectedShow?.theatreId?.name}</p>
                <p className="text-[14px] font-medium text-slate-500">{formattedDate}</p>
              </div>
              <div>
                <p className="text-[15px] font-medium text-gray-900 mb-1">{selectedShow?.screen} - {selectedShow?.format}</p>
                <p className="text-[14px] font-medium text-slate-500">{selectedShow?.time}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[15px] font-medium text-gray-900 mb-2">Seats:</p>
                <div className="flex flex-wrap gap-2">
                  {currentBooking.seats.map(seat => (
                    <div key={seat} className="bg-slate-500 text-white px-3 py-1.5 rounded-md text-[13px] font-medium tracking-wide">
                      {seat}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col">
                <p className="text-[15px] font-medium text-gray-900 mb-1">Amount Paid:</p>
                <p className="text-[14px] font-medium text-slate-500">₹{currentBooking.totalAmount}</p>
              </div>
            </div>

            <div className="flex justify-between items-end mt-4">
              <div className="text-[13px] text-slate-500">
                Transaction Date:<br/>
                <span className="mt-1 block">{txDate}</span>
              </div>
              <div className="w-[88px] h-[88px] bg-white flex items-center justify-center">
                <QRCode value={currentBooking.bookingReference || currentBooking._id} size={88} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[13px] text-[#64748b] px-12 leading-relaxed">
        You may view all purchased tickets in the ticket page.
      </p>

    </div>
  );
};

export default PaymentSuccessPage;

