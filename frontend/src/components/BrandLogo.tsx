import React from 'react';
import { navigateTo } from '../utils/navigation';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'auto';
  isScrolled?: boolean;
  showText?: boolean;
  showTagline?: boolean;
  clickable?: boolean;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  variant = 'auto',
  isScrolled = false,
  showText = true,
  showTagline = false,
  clickable = true,
  className = ''
}: BrandLogoProps) {
  // Proportional sizing configuration
  const sizeMap = {
    xs: { box: 32, text: 'text-xs', sub: 'text-[8px]', gap: 'gap-2' },
    sm: { box: 38, text: 'text-sm sm:text-base', sub: 'text-[8.5px]', gap: 'gap-2.5' },
    md: { box: 46, text: 'text-base sm:text-lg', sub: 'text-[9.5px]', gap: 'gap-3' },
    lg: { box: 56, text: 'text-xl sm:text-2xl', sub: 'text-[11px]', gap: 'gap-3.5' },
    xl: { box: 76, text: 'text-2xl sm:text-3xl', sub: 'text-xs', gap: 'gap-4' },
    '2xl': { box: 104, text: 'text-3xl sm:text-4xl', sub: 'text-sm', gap: 'gap-5' },
  };

  const { box, text, sub, gap } = sizeMap[size];

  // Contrast handling
  const isDarkText = variant === 'dark' || (variant === 'auto' && isScrolled);
  const titleColor = isDarkText ? 'text-[#062417]' : 'text-white';
  const taglineColor = isDarkText ? 'text-[#966C1E]' : 'text-[#E5B55A]';

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigateTo('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center ${gap} select-none ${
        clickable ? 'cursor-pointer group' : ''
      } ${className}`}
      title="Hyderabad Homes - Defining Telangana Luxury"
    >
      {/* ─── OFFICIAL 3D GOLDEN CREST MEDALLION ─── */}
      <div
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: box, height: box }}
      >
        {/* Ambient Golden Glow on Hover */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500/30 via-emerald-500/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* The Exact Official Circular Medallion */}
        <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-amber-300/40 shadow-[0_4px_14px_rgba(0,0,0,0.35)] bg-[#04140D]">
          <img
            src="/logo.png"
            alt="Hyderabad Homes Luxury Crest"
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
            onError={(e) => {
              // Fallback to jpg if png not supported
              const target = e.currentTarget;
              if (!target.src.endsWith('logo.jpg')) {
                target.src = '/logo.jpg';
              }
            }}
          />
        </div>
      </div>

      {/* ─── LUXURY TYPOGRAPHIC WORDMARK ─── */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif tracking-[0.04em] font-black ${text} ${titleColor} transition-colors duration-300 leading-tight truncate drop-shadow-xs`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HYDERABAD HOMES
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-sans uppercase tracking-[0.26em] font-bold ${sub} ${taglineColor} transition-colors duration-300 leading-none mt-1`}
            >
              Luxury Real Estate • TS-RERA
            </span>
          )}
        </div>
      )}
    </div>
  );
}
