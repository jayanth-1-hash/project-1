import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timerRef.current) clearInterval(timerRef.current);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          timerRef.current = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              if (timerRef.current) clearInterval(timerRef.current);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setCount(0);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [target]);

  return (
    <div ref={ref} className="text-2xl sm:text-3xl md:text-4xl font-display-lg text-primary">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

function StatBlock({ target, suffix, label }: { target: number, suffix: string, label: string }) {
  const [hoverKey, setHoverKey] = useState(0);
  return (
    <div
      className="space-y-1 group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:bg-primary/5 p-4 -m-4 rounded-[20px]"
      onMouseEnter={() => setHoverKey(k => k + 1)}
    >
      <AnimatedCounter key={hoverKey} target={target} suffix={suffix} />
      <div className="font-label-sm text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-primary transition-colors duration-300">{label}</div>
    </div>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px 100px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-section-gap-mobile md:py-section-gap-desktop max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
      id="about"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Image with floating badge */}
        <div className="relative group">
          <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02]">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/about_us_trust.png"
              alt="Luxury residential entrance"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 sm:-bottom-6 sm:-right-6 bg-surface/90 backdrop-blur-2xl border border-outline/20 p-4 sm:px-6 sm:py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-20 flex items-center gap-4 animate-bounce-slow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl sm:text-[28px]">workspace_premium</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display-lg text-on-surface tracking-tight">13</span>
                <span className="text-xl sm:text-2xl text-primary font-bold">+</span>
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant mt-0.5 font-medium leading-tight">Years of<br />Legacy</div>
            </div>
          </div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/5 rounded-full -z-10 animate-pulse"></div>
        </div>

        {/* Text content */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <span className="font-label-sm text-[10px] md:text-xs text-tertiary uppercase tracking-widest">Building Trust Since 2011</span>
            <h2 className="font-headline-lg text-2xl md:text-4xl text-primary leading-tight">Hyderabad Homes is a trusted real estate brand committed to excellence.</h2>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant">
              We don't just build structures; we create communities that enrich lifestyles and build long-term relationships. Our team brings together decades of expertise to deliver projects that stand the test of time.
            </p>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 gap-8">
            <StatBlock target={42} suffix="+" label="Completed Projects" />
            <StatBlock target={12500} suffix="+" label="Happy Families" />
            <StatBlock target={150} suffix="+" label="Dedicated Experts" />
            <StatBlock target={100} suffix="%" label="Transparent Process" />
          </div>

          {/* Amenities with hover effects */}
          <div className="pt-2 md:pt-4">
            <h4 className="font-label-sm text-[10px] md:text-xs text-primary uppercase tracking-widest mb-4 md:mb-6">Our Core Amenities</h4>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: 'pool', label: 'Infinite Pool' },
                { icon: 'fitness_center', label: 'World-class Gym' },
                { icon: 'sports_tennis', label: 'Sports Arena' },
                { icon: 'park', label: 'Organic Parks' },
              ].map((amenity) => (
                <div key={amenity.icon} className="flex items-center gap-2 md:gap-3 group/amenity cursor-pointer transition-all duration-300 hover:-translate-y-1 active:-translate-y-1 touch-manipulation">
                  <span className="material-symbols-outlined text-primary p-1.5 md:p-2 bg-primary/5 rounded-full transition-all duration-500 ease-out group-hover/amenity:bg-primary group-hover/amenity:text-white group-hover/amenity:scale-110 group-hover/amenity:rotate-12 group-hover/amenity:shadow-lg group-active/amenity:bg-primary group-active/amenity:text-white group-active/amenity:scale-110 group-active/amenity:rotate-12 group-active/amenity:shadow-lg text-[18px] md:text-[24px]">
                    {amenity.icon}
                  </span>
                  <span className="text-xs md:text-sm font-medium transition-all duration-300 group-hover/amenity:translate-x-1 group-hover/amenity:text-primary group-active/amenity:translate-x-1 group-active/amenity:text-primary">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Custom animation keyframe */}
        <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
