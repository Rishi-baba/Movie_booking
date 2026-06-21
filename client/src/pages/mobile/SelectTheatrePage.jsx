import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import TheatreItem from '../../components/mobile/TheatreItem';
import { getImageUrl } from '../../utils/helpers';
import { ListSkeleton } from '../../components/common/Skeletons';

const SelectTheatrePage = () => {
  const navigate = useNavigate();
  const { selectedMovie } = useSelector((state) => state.movie);
  
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!selectedMovie) {
      navigate('/');
      return;
    }
    const fetchShows = async () => {
      try {
        const response = await api.get(`/shows?movieId=${selectedMovie._id}`);
        setShows(response.data);
        if (response.data.length > 0) {
          setSelectedDate(response.data[0].date);
        }
      } catch (error) {
        console.error('Error fetching shows', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [selectedMovie, navigate]);

  // Extract unique dates
  const uniqueDates = [...new Set(shows.map(s => s.date))].sort();
  const dateObjects = uniqueDates.map(dateStr => {
    const d = new Date(dateStr);
    return {
      fullDate: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString()
    };
  });

  // Extract theatres for the selected date
  const showsForDate = shows.filter(s => s.date === selectedDate);
  const uniqueTheatres = [];
  const theatreMap = new Map();
  showsForDate.forEach(show => {
    if (!theatreMap.has(show.theatreId._id)) {
      theatreMap.set(show.theatreId._id, true);
      uniqueTheatres.push({
        ...show.theatreId,
        id: show.theatreId._id,
        logo: getImageUrl(show.theatreId.logo) || 'https://cdn-icons-png.flaticon.com/512/2809/2809636.png',
        price: `₹${show.theatreId.basePrice}`
      });
    }
  });

  // No loading early return here so we can show the skeleton in the layout

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-6">
      {/* Blurred Header */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <img 
          src={selectedMovie?.poster ? getImageUrl(selectedMovie.poster) : "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
          alt={selectedMovie?.title} 
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-[#1e1b4b]/40 backdrop-blur-sm"></div>
        
        {/* Header Actions */}
        <div className="absolute top-10 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
            <ChevronLeft color="white" size={20} />
            <span className="text-white text-[14px] font-medium">Back</span>
          </div>
          <span className="text-white text-[14px] font-medium cursor-pointer" onClick={() => navigate('/')}>Cancel</span>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-6 left-6">
          <h1 className="text-white text-[20px] font-bold leading-tight mb-1">{selectedMovie?.title}</h1>
          <p className="text-gray-300 text-[12px]">{selectedMovie?.genre?.join(', ')}</p>
        </div>
      </div>

      <div className="px-5 pt-4 flex-1 overflow-x-hidden overflow-y-auto pb-24">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
          <div className="w-1/3 h-full bg-primary rounded-full"></div>
        </div>

        <h2 className="text-[18px] font-bold text-gray-900 mb-4">Select Movie Theatre</h2>

        {/* Date Ribbon */}
        <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar mb-6 pb-2">
          {dateObjects.length === 0 ? (
            <p className="text-sm text-gray-500">No dates available.</p>
          ) : (
            dateObjects.map((d, i) => {
              const isActive = selectedDate === d.fullDate;
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(d.fullDate)}
                  className="flex flex-col items-center cursor-pointer flex-shrink-0"
                >
                  <span className={`text-[12px] font-semibold mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}>{d.day}</span>
                  <div className={`w-9 h-9 rounded flex items-center justify-center text-[14px] font-bold transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700'}`}>
                    {d.date}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Theatres List */}
        <div className="flex flex-col space-y-2 pb-4 -mx-5">
          {loading ? (
            <ListSkeleton items={4} />
          ) : uniqueTheatres.length === 0 ? (
            <p className="text-sm text-gray-500 px-5">No theatres playing on this date.</p>
          ) : (
            <div className="px-5">
              {uniqueTheatres.map((theatre, idx) => (
                <TheatreItem 
                  key={idx} 
                  {...theatre} 
                  onClick={() => navigate('/booking/schedule', { state: { theatre, selectedDate, movie: selectedMovie } })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectTheatrePage;

