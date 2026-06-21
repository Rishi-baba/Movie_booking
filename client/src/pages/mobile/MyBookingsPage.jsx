import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';
import QRCode from 'react-qr-code';
import { TicketSkeleton } from '../../components/common/Skeletons';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh list
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking', error);
    }
  };

  // Categorize bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter(b => {
    const showDate = new Date(b.showId?.date);
    return b.bookingStatus === 'confirmed' && showDate >= today;
  });

  const pastBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return true;
    const showDate = new Date(b.showId?.date);
    return showDate < today;
  });

  const renderBookingCard = (b, isActive) => {
    const movie = b.movieId;
    const theatre = b.theatreId;
    const show = b.showId;
    const formattedDate = show ? new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
    const txDate = new Date(b.createdAt).toLocaleString();

    return (
      <div key={b._id} className="w-[85%] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex flex-col relative opacity-100 transition-opacity">
        <div className="h-[140px] w-full">
          <img 
            src={movie?.poster ? getImageUrl(movie.poster) : "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
            alt={movie?.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-gray-900">{movie?.title}</h2>
            {b.bookingStatus === 'cancelled' && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">CANCELLED</span>
            )}
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[13px] font-bold text-gray-900 mb-1">{theatre?.name}</p>
              <p className="text-[12px] font-medium text-[#64748b]">{formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-gray-900 mb-1">Screen 1 - {show?.format}</p>
              <p className="text-[12px] font-medium text-[#64748b]">{show?.time}</p>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[13px] font-bold text-gray-900 mb-2">Seats:</p>
              <div className="flex flex-wrap gap-2">
                {b.seats?.map(seat => (
                  <div key={seat} className="bg-[#64748b] text-white px-2 py-0.5 rounded text-[12px] font-bold">{seat}</div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-gray-900 mb-1">Amount Paid:</p>
              <p className="text-[13px] font-medium text-[#64748b]">₹{b.totalAmount}</p>
            </div>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div className="flex flex-col space-y-4">
              {isActive && (
                <button 
                  onClick={() => handleCancelBooking(b._id)}
                  className="text-[#ef4444] border border-[#ef4444] text-[10px] font-bold px-3 py-1.5 rounded active:scale-95 transition-transform w-fit"
                >
                  Cancel Booking
                </button>
              )}
              <div className="text-[10px] text-[#64748b] leading-tight">
                Transaction Date:<br/>
                {txDate}<br/><br/>
                Ref: <span className="font-bold text-gray-900">{b.bookingReference || b._id}</span>
              </div>
            </div>
            {b.bookingStatus === 'confirmed' && (
              <div className="w-20 h-20 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                <QRCode value={b.bookingReference || b._id} size={68} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const displayBookings = activeTab === 'My Bookings' ? activeBookings : pastBookings;

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center bg-[#F9FAFB] relative pb-[100px] overflow-x-hidden overflow-y-auto">
      
      {/* Header */}
      <div className="w-full px-5 pt-10 pb-2">
        <div className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform w-fit" onClick={() => navigate(-1)}>
          <ChevronLeft color="#1f2937" size={20} />
          <span className="text-gray-900 text-[14px] font-medium">Back</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full px-5 flex space-x-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('My Bookings')}
          className={`pb-2 text-[13px] font-bold transition-all ${activeTab === 'My Bookings' ? 'text-primary border-b-2 border-primary' : 'text-[#64748b]'}`}
        >
          My Bookings
        </button>
        <button 
          onClick={() => setActiveTab('Past Bookings')}
          className={`pb-2 text-[13px] font-bold transition-all ${activeTab === 'Past Bookings' ? 'text-primary border-b-2 border-primary' : 'text-[#64748b]'}`}
        >
          Past Bookings
        </button>
      </div>

      {loading ? (
        <div className="w-full px-5 flex flex-col items-center">
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      ) : displayBookings.length > 0 ? (
        displayBookings.map(b => renderBookingCard(b, activeTab === 'My Bookings'))
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-[14px] text-gray-400">No {activeTab.toLowerCase()} found.</p>
        </div>
      )}

    </div>
  );
};

export default MyBookingsPage;

