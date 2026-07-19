import { useState, useRef, useEffect, type MouseEvent } from 'react';

interface CollectionCardProps {
  title: string;
  subtitle?: string;
  images: string[];
  className?: string;
  onDoubleClick?: () => void;
}

export function CollectionCard({ title, subtitle, images, className = "", onDoubleClick }: CollectionCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTapRef = useRef<number>(0);

  // Auto-cycle images when mouse is hovering OR if it's on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if ((isHovered || isMobile) && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 2000); // slightly slower on mobile to not be too overwhelming
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // On desktop, leaving resets it. On mobile, we don't reset because there's no hover leave
    if (window.innerWidth >= 768) {
      setActiveImageIndex(0);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const { left, width } = cardRef.current.getBoundingClientRect();
    const relativeX = e.clientX - left;
    const segmentWidth = width / images.length;
    let newIndex = Math.floor(relativeX / segmentWidth);
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= images.length) newIndex = images.length - 1;
    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 1200);
    }
  };

  const handleTouchStart = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // It's a double tap!
      if (onDoubleClick) onDoubleClick();
    } else {
      // Single tap: cycle to next image manually
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }
    lastTapRef.current = now;
  };

  return (
    <div
      ref={cardRef}
      className={`relative group overflow-hidden rounded-[24px] cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(21,71,52,0.4)] hover:ring-2 hover:ring-tertiary-fixed hover:z-10 select-none touch-pan-y ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={onDoubleClick}
      onTouchStart={handleTouchStart}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`${title} - Image ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${index === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent z-20 pointer-events-none"></div>

      <div className="absolute bottom-3 md:bottom-8 left-3 md:left-8 text-white z-30 pointer-events-none space-y-1 md:space-y-2 pr-3 md:pr-8">
        <h3 className="font-headline-md text-sm sm:text-base leading-tight md:text-[32px]">{title}</h3>
        {subtitle && <p className="font-body-md text-[10px] sm:text-xs md:text-base opacity-80 line-clamp-2 md:line-clamp-none">{subtitle}</p>}
        <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-4">
          <span className="material-symbols-outlined text-[14px] md:text-[24px] transition-transform group-hover:translate-x-2">arrow_forward</span>
          {/* Slideshow Indicators */}
          <div className="flex gap-1 md:gap-1.5">
            {images.map((_, idx) => (
              <div key={idx} className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-4 md:w-8 bg-tertiary-fixed' : 'w-1.5 md:w-2 bg-white/50'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

