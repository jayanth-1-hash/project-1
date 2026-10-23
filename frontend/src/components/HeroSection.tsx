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

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin relative z-10 w-full py-12 sm:py-16 text-center">
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
          <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-4 w-full max-w-md mx-auto">
            <button
              onClick={() => onBookSiteVisit ? onBookSiteVisit() : document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-zoom-in-1 w-full sm:flex-1 bg-primary-fixed text-on-primary-fixed px-4 sm:px-6 py-3 rounded-xl font-label-sm uppercase tracking-wider flex justify-center items-center gap-2 group transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-xl active:scale-95 active:bg-primary active:text-white duration-300 text-xs sm:text-sm min-h-[46px]">
              <span>Book Site Visit</span>
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] transition-transform group-hover:translate-x-1">arrow_right_alt</span>
            </button>
            <button
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-zoom-in-2 w-full sm:flex-1 border border-white/40 text-white px-4 sm:px-6 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:bg-white/10 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-xl backdrop-blur-sm active:scale-95 active:bg-white/20 duration-300 text-xs sm:text-sm min-h-[46px]">
              <span>Explore Projects</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 w-full max-w-lg mx-auto">
            <div className="animate-zoom-in-3">
              <div className="flex flex-col items-center justify-center gap-1 group cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px] sm:text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                <span className="text-[10px] sm:text-xs text-white/90 text-center font-medium leading-tight">Trusted Developers</span>
              </div>
            </div>
            <div className="animate-zoom-in-4">
              <div className="flex flex-col items-center justify-center gap-1 group cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px] sm:text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>approval_delegation</span>
                <span className="text-[10px] sm:text-xs text-white/90 text-center font-medium leading-tight">RERA Approved</span>
              </div>
            </div>
            <div className="animate-zoom-in-5">
              <div className="flex flex-col items-center justify-center gap-1 group cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px] sm:text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                <span className="text-[10px] sm:text-xs text-white/90 text-center font-medium leading-tight">Prime Locations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
