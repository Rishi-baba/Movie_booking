import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovies } from '../../features/movie/movieSlice';
import { getTheatres } from '../../features/theatre/theatreSlice';
import MovieCard from '../../components/mobile/MovieCard';
import TheatreItem from '../../components/mobile/TheatreItem';
import { getImageUrl } from '../../utils/helpers';
import { MovieCardSkeleton, ListSkeleton } from '../../components/common/Skeletons';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Now Showing');

  const { movies, currentPage, totalPages, isLoading: isMoviesLoading } = useSelector((state) => state.movie);
  const { theatres, isLoading: isTheatresLoading } = useSelector((state) => state.theatre);

  useEffect(() => {
    dispatch(getMovies({ status: activeTab, page: 1, limit: 5 }));
  }, [dispatch, activeTab]);

  useEffect(() => {
    dispatch(getTheatres());
  }, [dispatch]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      dispatch(getMovies({ status: activeTab, page: currentPage + 1, limit: 5 }));
    }
  };

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % movies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies]);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col pb-6 overflow-x-hidden overflow-y-auto">
      {/* Top Banner Hero Slider */}
      <div className="relative w-full h-[220px] bg-gray-900 overflow-hidden shrink-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
        <div className="absolute top-10 right-4 p-2 cursor-pointer z-20">
          <Search color="white" size={24} />
        </div>
        
        {isMoviesLoading && movies.length === 0 ? (
          <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
             {/* Empty pulse container instead of loading text */}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div 
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeHeroIndex * 100}%)` }}
            >
              {movies.map((movie) => (
                <div key={movie._id} className="w-full h-full flex-shrink-0 relative">
                  <img 
                    src={movie.banner?.url ? getImageUrl(movie.banner) : getImageUrl(movie.poster)} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-8 left-6 z-20 pointer-events-none">
                    <h2 className="text-white text-[24px] font-bold leading-tight drop-shadow-lg max-w-[300px] truncate">
                      {movie.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-0 w-full flex justify-center space-x-2 z-20">
              {movies.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeHeroIndex === idx ? 'w-6 bg-primary' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No movies available.</div>
        )}
      </div>

      <div className="px-[25px] mt-6">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-4">
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('Now Showing')}
              className={`pb-2 text-[13px] font-semibold transition-all ${activeTab === 'Now Showing' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Now Showing
            </button>
            <button 
              onClick={() => setActiveTab('Coming Soon')}
              className={`pb-2 text-[13px] font-semibold transition-all ${activeTab === 'Coming Soon' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Coming Soon
            </button>
          </div>
          <button className="text-primary text-[12px] font-medium pb-2">View All</button>
        </div>

        {/* Movies List Horizontal Scroll */}
        <div className="flex overflow-x-auto pb-4 pt-2 hide-scrollbar -mx-[25px] px-[25px] snap-x items-center">
          {isMoviesLoading && movies.length === 0 ? (
            <>
              <MovieCardSkeleton />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
            </>
          ) : movies.length > 0 ? (
            <>
              {movies.map((movie, index) => (
                <div key={movie._id} className={`snap-start ${index === 0 ? 'pl-2' : ''}`}>
                  <MovieCard 
                    title={movie.title}
                    genre={movie.genre?.join(', ')}
                    rating={movie.rating || "0.0"}
                    image={getImageUrl(movie.poster)}
                    onClick={() => navigate(`/movies/${movie._id}`)}
                  />
                </div>
              ))}
              
              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="snap-start flex-shrink-0 w-[106px] h-[230px] mr-4 flex flex-col items-center justify-center">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isMoviesLoading}
                    className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 active:scale-95 transition-transform"
                  >
                    {isMoviesLoading ? '...' : '+'}
                  </button>
                  <span className="text-[12px] text-gray-500 font-medium text-center">Load More</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">No movies available.</div>
          )}
        </div>

        {/* Theatres Section */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">Movie Theatres</h2>
            <button className="text-primary text-[12px] font-medium">View All</button>
          </div>
          
          <div className="flex flex-col -mx-5">
            {isTheatresLoading ? (
              <ListSkeleton items={3} />
            ) : theatres.length > 0 ? (
              <div className="px-5">
                {theatres.map(theatre => (
                  <TheatreItem 
                    key={theatre._id}
                    name={theatre.name}
                    location={theatre.location}
                    price={`₹${theatre.basePrice}`}
                    logo={getImageUrl(theatre.logo) || 'https://cdn-icons-png.flaticon.com/512/2809/2809636.png'}
                    onClick={() => navigate(`/theatres/${theatre._id}`, { state: { theatre } })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 px-5">No theatres found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

