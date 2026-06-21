import React from 'react';
import { Star } from 'lucide-react';

const MovieCard = ({ title, genre, rating, image, onClick }) => {
  return (
    <div onClick={onClick} className="flex-shrink-0 w-[106px] h-[230px] mr-4 cursor-pointer group flex flex-col">
      <div className="relative w-full h-[172px] rounded-xl overflow-hidden mb-2 shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute bottom-2 right-2 bg-[#0f172a]/80 backdrop-blur-sm px-2 py-1 rounded flex items-center text-white text-[10px] font-semibold">
          <Star size={10} className="mr-1 fill-white" />
          {rating}
        </div>
      </div>
      <h3 className="text-[13px] font-bold text-gray-900 leading-tight truncate">{title}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">{genre}</p>
    </div>
  );
};

export default MovieCard;
