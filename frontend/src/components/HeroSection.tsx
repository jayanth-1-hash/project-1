export function HeroSection({ onBookSiteVisit }: { onBookSiteVisit?: () => void }) {
  return (
    <section className="relative min-h-[100svh] lg:min-h-[921px] flex items-center overflow-hidden bg-primary">
      {/* Video Background (Replacing the Stitch static image as requested) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay matching Stitch UI (Deep Forest Green at 60% opacity) */}
        <div className="absolute inset-0 bg-[#154734]/60 mix-blend-multiply"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-grid-margin relative z-10 w-full py-16 text-center">
        <style>{`
          @keyframes fadeUpDelay {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes zoomInDelay {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-up-delay {
            opacity: 0;
            animation: fadeUpDelay 0.8s ease-out 0.7s forwards;
          }
          .animate-zoom-in-1 {
            opacity: 0;
            animation: zoomInDelay 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.1s forwards;
          }
          .animate-zoom-in-2 {
            opacity: 0;
            animation: zoomInDelay 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.25s forwards;
          }
          .animate-zoom-in-3 {
            opacity: 0;
            animation: zoomInDelay 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.4s forwards;
          }
          .animate-zoom-in-4 {
            opacity: 0;
            animation: zoomInDelay 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.55s forwards;
          }
          .animate-zoom-in-5 {
            opacity: 0;
            animation: zoomInDelay 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.7s forwards;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="space-y-4 max-w-4xl mx-auto animate-fade-up-delay">
            <span className="font-label-sm text-[10px] md:text-xs text-tertiary-fixed uppercase tracking-[0.2em] block">
              Premium Homes. Prime Locations.
            </span>
            <h1 className="font-display-lg text-3xl md:text-5xl text-white leading-tight">
              Find Your <br /><span className="italic font-light">Perfect Property</span> <br />in Hyderabad
            </h1>
            <p className="font-body-md text-sm md:font-body-lg text-white/90 max-w-2xl mx-auto px-4">
              Helping families discover premium homes, villas, apartments and investment opportunities across Hyderabad's most sought-after neighborhoods.
            </p>
          </div>
          <div className="flex flex-row justify-center gap-2 md:gap-4 w-full max-w-md mx-auto">
            <button
              onClick={() => onBookSiteVisit ? onBookSiteVisit() : document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-zoom-in-1 flex-1 bg-primary-fixed text-on-primary-fixed px-2 md:px-6 py-2.5 md:py-3 rounded-[10px] md:rounded-[12px] font-label-sm uppercase tracking-wider md:tracking-widest flex justify-center items-center gap-1 md:gap-2 group transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-xl active:scale-95 active:bg-primary active:text-white duration-300 text-[10px] md:text-sm">
              Book Site Visit
              <span className="material-symbols-outlined text-[14px] md:text-[18px] transition-transform group-hover:translate-x-1">arrow_right_alt</span>
            </button>
            <button
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-zoom-in-2 flex-1 border border-white/40 text-white px-2 md:px-6 py-2.5 md:py-3 rounded-[10px] md:rounded-[12px] font-label-sm uppercase tracking-wider md:tracking-widest hover:bg-white/10 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-xl backdrop-blur-sm active:scale-95 active:bg-white/20 duration-300 text-[10px] md:text-sm">
              Explore Projects
            </button>
          </div>
          <div className="flex flex-wrap justify-center md:flex-nowrap md:justify-between items-start md:items-center gap-4 md:gap-8 pt-8 w-full max-w-lg mx-auto">
            <div className="animate-zoom-in-3 flex-1 min-w-[100px]">
              <div className="flex flex-col md:flex-row items-center justify-start gap-1 md:gap-2 group cursor-pointer p-1 md:p-2 -m-2 rounded-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-white/20">
                <span className="material-symbols-outlined text-tertiary-fixed-dim transition-all duration-300 group-hover:scale-110 group-hover:text-white group-active:text-white drop-shadow-md text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                <span className="font-label-sm text-[10px] sm:text-xs md:text-sm text-white/80 transition-all duration-300 group-hover:text-white group-active:text-white md:group-hover:translate-x-1 text-center md:text-left leading-tight">Trusted Developers</span>
              </div>
            </div>
            <div className="animate-zoom-in-4 flex-1 min-w-[100px]">
              <div className="flex flex-col md:flex-row items-center justify-start gap-1 md:gap-2 group cursor-pointer p-1 md:p-2 -m-2 rounded-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-white/20">
                <span className="material-symbols-outlined text-tertiary-fixed-dim transition-all duration-300 group-hover:scale-110 group-hover:text-white group-active:text-white drop-shadow-md text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>approval_delegation</span>
                <span className="font-label-sm text-[10px] sm:text-xs md:text-sm text-white/80 transition-all duration-300 group-hover:text-white group-active:text-white md:group-hover:translate-x-1 text-center md:text-left leading-tight">RERA Approved</span>
              </div>
            </div>
            <div className="animate-zoom-in-5 flex-1 min-w-[100px]">
              <div className="flex flex-col md:flex-row items-center justify-start gap-1 md:gap-2 group cursor-pointer p-1 md:p-2 -m-2 rounded-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-white/20">
                <span className="material-symbols-outlined text-tertiary-fixed-dim transition-all duration-300 group-hover:scale-110 group-hover:text-white group-active:text-white drop-shadow-md text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                <span className="font-label-sm text-[10px] sm:text-xs md:text-sm text-white/80 transition-all duration-300 group-hover:text-white group-active:text-white md:group-hover:translate-x-1 text-center md:text-left leading-tight">Prime Locations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
