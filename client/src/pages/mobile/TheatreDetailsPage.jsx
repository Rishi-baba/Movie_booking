import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedMovieSync } from '../../features/movie/movieSlice';
import api from '../../utils/api';
import MovieCard from '../../components/mobile/MovieCard';
import { getImageUrl } from '../../utils/helpers';

const TheatreDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theatre } = location.state || {};

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!theatre) {
      navigate('/');
      return;
    }

    const fetchShows = async () => {
      try {
        const response = await api.get(`/shows?theatreId=${theatre._id}`);
        setShows(response.data);
        if (response.data.length > 0) {
          setSelectedDate(response.data[0].date);
        }
      } catch (error) {
        console.error('Error fetching shows for theatre', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [theatre, navigate]);

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

  // Extract unique movies for the selected date
  const showsForDate = shows.filter(s => s.date === selectedDate);
  const uniqueMovies = [];
  const movieMap = new Map();
  showsForDate.forEach(show => {
    if (!movieMap.has(show.movieId._id)) {
      movieMap.set(show.movieId._id, true);
      uniqueMovies.push(show.movieId);
    }
  });

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB]">Loading movies...</div>;
  }

  const handleMovieSelect = (movie) => {
    dispatch(setSelectedMovieSync(movie));
    navigate('/booking/schedule', { state: { theatre, selectedDate, movie } });
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-[80px] overflow-x-hidden overflow-y-auto">
      {/* Blurred Header */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <img 
          src={theatre?.logo ? getImageUrl(theatre.logo) : "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
          alt={theatre?.name} 
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

        {/* Theatre Info */}
        <div className="absolute bottom-6 left-6">
          <h1 className="text-white text-[20px] font-bold leading-tight mb-1">{theatre?.name}</h1>
          <p className="text-gray-300 text-[12px]">{theatre?.location}</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
          <div className="w-1/3 h-full bg-primary rounded-full"></div>
        </div>

        <h2 className="text-[18px] font-bold text-gray-900 mb-4">Select Movie</h2>

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

        {/* Movies List */}
        <div className="flex flex-col space-y-4 pb-4">
          {uniqueMovies.length === 0 && !loading ? (
            <p className="text-sm text-gray-500">No movies playing on this date.</p>
          ) : (
            uniqueMovies.map((movie) => (
              <MovieCard 
                key={movie._id}
                title={movie.title}
                genre={movie.genre?.join(', ')}
                rating={movie.rating || "0.0"}
                image={getImageUrl(movie.poster)}
                onClick={() => handleMovieSelect(movie)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TheatreDetailsPage;

