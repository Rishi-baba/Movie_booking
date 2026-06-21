import React, { useState, useEffect } from 'react';
import { ChevronLeft, Building2, CalendarDays } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedShow } from '../../features/booking/bookingSlice';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { TextSkeleton } from '../../components/common/Skeletons';

const ChooseSchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { theatre, selectedDate, movie } = location.state || {};

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFormat, setSelectedFormat] = useState('2D');
  const [selectedShowId, setSelectedShowId] = useState('');

  useEffect(() => {
    if (!theatre || !movie || !selectedDate) {
      navigate('/');
      return;
    }

    const fetchShows = async () => {
      try {
        const response = await api.get(`/shows?movieId=${movie._id}&theatreId=${theatre._id}&date=${selectedDate}`);
        setShows(response.data);
      } catch (error) {
        console.error('Error fetching shows for schedule', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [theatre, movie, selectedDate, navigate]);

  // Group shows by screen
  const screens = {};
  shows.filter(s => s.format === selectedFormat).forEach(show => {
    const screenName = show.screen || 'Screen 1';
    if (!screens[screenName]) {
      screens[screenName] = [];
    }
    screens[screenName].push(show);
  });

  const handleGetTickets = () => {
    if (!selectedShowId) return;
    const selectedShowObj = shows.find(s => s._id === selectedShowId);
    dispatch(setSelectedShow(selectedShowObj));
    navigate('/booking/seats');
  };

  const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  // No loading early return so we can render the skeleton in place

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-[76px]">
      {/* Blurred Header */}
      <div className="relative w-full h-[180px] overflow-hidden bg-gray-900">
        <img 
          src={movie?.poster ? getImageUrl(movie.poster) : "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
          alt={movie?.title} 
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-[#1e1b4b]/50 backdrop-blur-sm"></div>
        
        {/* Header Actions */}
        <div className="absolute top-10 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
            <ChevronLeft color="white" size={20} />
            <span className="text-white text-[14px] font-medium">Back</span>
          </div>
          <span className="text-white text-[14px] font-medium cursor-pointer" onClick={() => navigate('/')}>Cancel</span>
        </div>

        {/* Movie Info with extra details */}
        <div className="absolute bottom-6 left-6">
          <h1 className="text-white text-[20px] font-bold leading-tight mb-2">{movie?.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-gray-300">
              <Building2 size={12} />
              <span className="text-[11px]">{theatre?.name}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-300">
              <CalendarDays size={12} />
              <span className="text-[11px]">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 flex-1 overflow-x-hidden overflow-y-auto pb-24">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
          <div className="w-2/3 h-full bg-primary rounded-full"></div>
        </div>

        <h2 className="text-[18px] font-bold text-gray-900 mb-5">Choose Schedule</h2>

        {/* Format Selection & Price */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-[14px] font-bold text-gray-900">Format</span>
            <div className="flex space-x-2">
              {['2D', '3D'].map(fmt => (
                <button 
                  key={fmt}
                  onClick={() => {
                    setSelectedFormat(fmt);
                    setSelectedShowId(''); // Reset selection when changing format
                  }}
                  className={`w-10 h-8 flex items-center justify-center rounded text-[12px] font-semibold transition-colors border ${selectedFormat === fmt ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-gray-200 text-primary hover:bg-gray-50'}`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[14px] font-semibold text-gray-600">
            {theatre?.price || `₹${theatre?.basePrice || 300}`}
          </span>
        </div>

        {/* Screens & Times */}
        {loading ? (
          <div className="mt-8">
            <TextSkeleton lines={3} />
            <div className="mt-6">
              <TextSkeleton lines={2} />
            </div>
          </div>
        ) : Object.keys(screens).length === 0 ? (
          <p className="text-sm text-gray-500">No shows available for this format.</p>
        ) : (
          Object.keys(screens).map(screenName => (
            <div key={screenName} className="mb-6">
              <h3 className="text-[14px] font-bold text-gray-900 mb-3">{screenName}</h3>
              <div className="flex flex-wrap gap-3">
                {screens[screenName].map(show => (
                  <button 
                    key={show._id}
                    onClick={() => setSelectedShowId(show._id)}
                    className={`px-3 py-1.5 rounded border text-[12px] font-semibold transition-colors ${selectedShowId === show._id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-gray-200 text-primary hover:bg-gray-50'}`}
                  >
                    {show.time}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full px-5 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <button 
          onClick={handleGetTickets}
          disabled={!selectedShowId}
          className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-[15px] shadow-lg active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Get Tickets
        </button>
      </div>
    </div>
  );
};

export default ChooseSchedulePage;

