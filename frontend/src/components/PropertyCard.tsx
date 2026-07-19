import { useState, useRef, type MouseEvent } from 'react';
import { ChevronRight } from 'lucide-react';

interface PropertyCardProps {
  title: string;
  location: string;
  price: string;
  specs: { beds: number; baths: number; sqft: string };
  images: string[];
}

export function PropertyCard({ title, location, price, specs, images }: PropertyCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, width } = cardRef.current.getBoundingClientRect();
    const relativeX = e.clientX - left;
    const segmentWidth = width / images.length;
    let newIndex = Math.floor(relativeX / segmentWidth);
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= images.length) newIndex = images.length - 1;
    setActiveImageIndex(newIndex);
  };

  const handleMouseLeave = () => {
    setActiveImageIndex(0);
  };

  return (
    <div 
      ref={cardRef}
      className="group relative flex flex-col bg-surface border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-sand transition-colors duration-500"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
    >
      <div className="relative h-64 w-full overflow-hidden">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${title} - Image ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${index === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            aria-hidden={index !== activeImageIndex}
          />
        ))}
        
        {/* Indicators */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {images.map((_, idx) => (
            <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-6 bg-sand' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{location}</p>
        
        <div className="flex gap-4 text-xs text-gray-300 mb-6">
          <span>{specs.beds} Beds</span>
          <span>{specs.baths} Baths</span>
          <span>{specs.sqft}</span>
        </div>
        
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-800">
          <span className="text-sand font-medium">{price}</span>
          <button className="text-white group-hover:text-sand transition-colors" aria-label="View Details">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
