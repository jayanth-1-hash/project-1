import { useState, useEffect } from 'react';

interface BrandPreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export function BrandPreloader({
  onComplete,
  minDurationMs = 1100
}: BrandPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [stageText, setStageText] = useState('01 / CURATING 20 LANDMARK DEVELOPMENTS');

  useEffect(() => {
    // Lock body scroll while preloader is active
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startTime;
      const rawPct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));

      setProgress(rawPct);

      if (rawPct < 28) {
        setStageText('01 / CURATING 20 LANDMARK DEVELOPMENTS');
      } else if (rawPct < 62) {
        setStageText('02 / VERIFYING TS-RERA STATUTORY CLEARANCES');
      } else if (rawPct < 90) {
        setStageText('03 / SYNCHRONIZING VIP CHAUFFEURED DISPATCH');
      } else {
        setStageText('04 / HYDERABAD HOMES PRIVATE CLIENT ACCESS');
      }

      if (rawPct < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Complete sequence
        setTimeout(() => {
          setIsLoaded(true);
          document.body.style.overflow = '';
          if (onComplete) onComplete();

          // Fully remove from DOM after smooth transition
          setTimeout(() => {
            setIsHidden(true);
          }, 600);
        }, 120);
      }
    };

    const animFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animFrame);
      document.body.style.overflow = '';
    };
  }, [minDurationMs, onComplete]);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#04100A] text-white flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isLoaded ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* ─── LUXURY BACKGROUND AURORA & SUBTLE GRID ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(229,181,90,0.16)_0%,rgba(6,30,19,0.55)_50%,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#FFF2D1_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Decorative Outer Hairline Frame */}
      <div className="absolute inset-4 sm:inset-8 border border-amber-300/10 rounded-3xl pointer-events-none" />

      {/* ─── CENTERPIECE LUXURY PRESENTATION ─── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm sm:max-w-md w-full">
        
        {/* Animated Official Emblem with Ambient Ring & Shimmer */}
        <div className="relative mb-6 sm:mb-8 group">
          {/* Ambient Glow Halo */}
          <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-amber-500/25 via-emerald-500/20 to-transparent blur-2xl animate-pulse" />

          {/* Rotating Subtle Celestial Orbit Halo */}
          <div
            className="absolute -inset-4 rounded-full border border-amber-300/20 border-dashed animate-spin pointer-events-none"
            style={{ animationDuration: '18s' }}
          />

          {/* The Exact Official Circular Medallion */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-amber-300/50 shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#04140D]">
            <img
              src="/logo.png"
              alt="Hyderabad Homes Luxury Crest"
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />

            {/* Sweeping Light Gleam on Image */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none transition-transform duration-100"
              style={{
                transform: `translateX(${progress * 2.4 - 120}%)`
              }}
            />
          </div>
        </div>

        {/* Brand Headline Typography */}
        <h1 
          className="text-2xl sm:text-3xl font-black tracking-[0.06em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D9] via-[#E5B55A] to-[#FCE7B0]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          HYDERABAD HOMES
        </h1>

        <div className="flex items-center gap-2 mt-1 mb-7">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/40" />
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold text-amber-200/90 font-sans">
            Private Client Real Estate
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/40" />
        </div>

        {/* High-Precision Metallic Progress Bar */}
        <div className="w-full space-y-3">
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#C99234] via-[#FFF2D1] to-[#E5B55A] rounded-full transition-all duration-100 relative shadow-[0_0_12px_rgba(255,242,209,0.85)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
            <span className="text-[10px] tracking-wider text-amber-200/80 font-sans truncate mr-2 font-medium">
              {stageText}
            </span>
            <span className="font-bold text-amber-300 shrink-0 font-mono tracking-wider">
              {progress < 10 ? `0${progress}` : progress}%
            </span>
          </div>
        </div>

        {/* Skip Option */}
        <button
          onClick={() => {
            setIsLoaded(true);
            document.body.style.overflow = '';
            setTimeout(() => setIsHidden(true), 400);
          }}
          className="mt-8 text-[10px] uppercase tracking-widest text-white/35 hover:text-white/80 transition-colors py-1 px-3 rounded-full hover:bg-white/5 active:scale-95"
        >
          Enter Site ➔
        </button>
      </div>

      {/* Statutory Regulatory Clearance Badge */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-white/30 tracking-widest uppercase font-sans font-medium">
        TS-RERA Agent Reg: A02400000412 • Fiduciary Luxury Advisory
      </div>
    </div>
  );
}
