import React, { useState, useEffect } from 'react';
import { Heart, Star, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getMovieById } from '../../features/movie/movieSlice';
import { getImageUrl } from '../../utils/helpers';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedFormat, setSelectedFormat] = useState('2D');

  const { selectedMovie, isLoading } = useSelector((state) => state.movie);

  useEffect(() => {
    if (id) {
      dispatch(getMovieById(id));
    }
  }, [dispatch, id]);

  const cast = [
    {
      name: 'Jason Statham',
      role: 'Jonas Taylor',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Jing Wu',
      role: 'Jiuming Zhang',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Shuya Sophia Cai',
      role: 'Meiying',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    }
  ];

  if (isLoading || !selectedMovie) {
    return <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB]">Loading...</div>;
  }

  const bannerImage = selectedMovie?.banner?.url ? getImageUrl(selectedMovie.banner) : getImageUrl(selectedMovie?.poster);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB] relative pb-[80px] overflow-x-hidden overflow-y-auto">
      
      {/* Scrollable Container for BOTH Poster and Content */}
      <div className="flex-1 w-full pb-8">
        
        {/* Top Cover Image */}
        <div className="relative w-full h-[220px] bg-gray-900 shrink-0">
          <img 
            src={bannerImage || "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80"} 
            alt={selectedMovie.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>
          
          {/* Header Actions */}
          <div className="absolute top-10 left-5 flex items-center cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
            <span className="text-white text-[15px] font-semibold tracking-wide shadow-sm drop-shadow-md">Close</span>
          </div>
          <div 
            className="absolute top-10 right-5 cursor-pointer active:scale-95 transition-transform"
            onClick={() => toast.info('Favorites feature is coming soon!', { icon: '✨' })}
          >
            <Heart color="white" size={24} className="drop-shadow-md" />
          </div>
        </div>

        <div className="px-5 pt-6">
        {/* Header Title Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="pr-4">
            <h1 className="text-[20px] font-bold text-gray-900 leading-snug mb-1">{selectedMovie.title}</h1>
            <p className="text-[13px] text-gray-500">{selectedMovie.genre?.join(', ')}</p>
          </div>
          <div className="flex items-center space-x-2 pt-1 flex-shrink-0">
            <span className="border border-gray-400 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{selectedMovie.certificate || 'PG-13'}</span>
            <div className="flex items-center space-x-1 text-gray-900">
              <Star size={15} className="fill-gray-900" />
              <span className="text-[15px] font-bold">{selectedMovie.rating || '8.5'}</span>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <p className="text-[14px] text-[#64748b] leading-relaxed mb-6">
          {selectedMovie.description}
        </p>

        {/* Format Selection */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Format Available</h2>
          <div className="flex space-x-3">
            {(selectedMovie.formats || ['2D', '3D']).map(fmt => (
              <button 
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded text-[13px] font-semibold transition-colors border ${selectedFormat === fmt ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-primary'}`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Release Date */}
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Release Date</h2>
          <p className="text-[14px] text-[#64748b]">
            {selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '10 June 2026'}
          </p>
        </div>

        {/* Cast */}
        <div className="mb-8">
          <h2 className="text-[15px] font-bold text-gray-900 mb-4">Cast</h2>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar -mx-5 px-5">
            {(() => {
              let normalizedCast = cast; // default mock cast
              if (selectedMovie.cast && selectedMovie.cast.length > 0) {
                if (typeof selectedMovie.cast[0] === 'string') {
                  try {
                    const joined = selectedMovie.cast.join(',');
                    let parsed;
                    try { parsed = JSON.parse(joined); } catch (e) { parsed = JSON.parse(selectedMovie.cast[0]); }
                    if (Array.isArray(parsed)) normalizedCast = parsed;
                    else normalizedCast = selectedMovie.cast.map(c => ({ name: c, role: 'Actor', image: '' }));
                  } catch (e) {
                    normalizedCast = selectedMovie.cast.map(c => ({ name: c, role: 'Actor', image: '' }));
                  }
                } else if (typeof selectedMovie.cast[0] === 'object') {
                  // Check if it's corrupted by the old backend bug
                  if (selectedMovie.cast[0].name && selectedMovie.cast[0].name.trim().startsWith('[')) {
                    try {
                      const joined = selectedMovie.cast.map(c => c.name).join(',');
                      const parsed = JSON.parse(joined);
                      if (Array.isArray(parsed)) normalizedCast = parsed;
                      else normalizedCast = selectedMovie.cast;
                    } catch (e) {
                      normalizedCast = selectedMovie.cast;
                    }
                  } else {
                    normalizedCast = selectedMovie.cast;
                  }
                }
              }

              return normalizedCast.map((actor, idx) => {
                const nameStr = actor.name || (typeof actor === 'string' ? actor : 'Unknown');
                const roleStr = actor.role || '';
                return (
                  <div key={idx} className="flex items-center space-x-3 flex-shrink-0 w-[200px]">
                    <img src={actor.image || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=150&q=80'} alt={nameStr} className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-medium text-gray-900 leading-tight mb-0.5 truncate">{nameStr}</span>
                      {roleStr && <span className="text-[12px] text-[#64748b] leading-tight truncate">{roleStr}</span>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate('/booking/theatre')}
          className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-[15px] shadow-sm active:scale-95 transition-transform"
        >
          Get Tickets
        </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
