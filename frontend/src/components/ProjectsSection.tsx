import { useState, useEffect, useRef, useMemo } from 'react';
import { PROJECTS, CATEGORIES, type CategoryType } from '../data/projects';
import { ProjectCard } from './ProjectCard';
import { navigateTo } from '../utils/navigation';

export function ProjectsSection({
  onBookSiteVisit,
  isPopupOpen,
  showAllProjects,
  setShowAllProjects
}: {
  onBookSiteVisit?: (projectName?: string) => void;
  isPopupOpen?: boolean;
  showAllProjects: boolean;
  setShowAllProjects: (show: boolean) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [isTappedPaused, setIsTappedPaused] = useState(false);

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

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return PROJECTS;
    return PROJECTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: PROJECTS.length };
    PROJECTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const shouldPause = isPopupOpen || isTappedPaused;

  return (
    <section
      ref={sectionRef}
      className="py-section-gap-mobile lg:py-section-gap-desktop max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
      id="projects"
    >
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4 sm:gap-6">
        <div className="space-y-2">
          <span className="font-label-sm text-tertiary uppercase tracking-widest font-bold text-[10px] sm:text-xs">
            Portfolio of Distinction • 20 Real-Time Projects
          </span>
          <h2 className="font-headline-lg text-primary text-2xl sm:text-4xl font-bold">
            Our Premium Landmark Projects
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm max-w-2xl">
            Explore curated high-rise towers, gated luxury apartments, Spanish-themed villas, independent estates, and HMDA/DTCP plotted ventures across Hyderabad.
          </p>
        </div>

        <button
          className="font-label-sm text-primary flex items-center gap-2 hover:gap-3 transition-all font-bold px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-variant border border-outline-variant/30 shrink-0 text-xs sm:text-sm shadow-sm active:scale-95 min-h-[42px]"
          onClick={() => {
            setShowAllProjects(!showAllProjects);
          }}
        >
          {showAllProjects ? 'Show Showcase Carousel' : `View All ${PROJECTS.length} Projects Grid`}
          <span className={`material-symbols-outlined text-[18px] transition-transform ${showAllProjects ? '-rotate-180' : ''}`}>
            arrow_right_alt
          </span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                isSelected
                  ? 'bg-primary text-white shadow-md scale-[1.02]'
                  : 'bg-white text-on-surface-variant hover:bg-surface hover:text-primary border border-outline-variant/30'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {categoryCounts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid or Continuous Marquee */}
      {showAllProjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 transition-all duration-500">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onSelectProject={(proj) => navigateTo(`/project/${proj.id}`)}
              onBookSiteVisit={onBookSiteVisit}
            />
          ))}
        </div>
      ) : (
        <div className="relative w-full pb-6 pt-1">
          {/* Carousel Top Info Bar */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[14px] text-tertiary">touch_app</span>
                <span>Tap any card to freeze • Click 'View More' for full project dossier</span>
              </span>
              {isTappedPaused && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                  <span>Motion Paused</span>
                </span>
              )}
            </div>

            <button
              onClick={() => setShowAllProjects(true)}
              className="text-primary font-bold hover:underline flex items-center gap-1 text-xs ml-auto"
            >
              <span>Switch to Grid View</span>
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
            </button>
          </div>

          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          
          <div 
            className="overflow-hidden w-full rounded-2xl cursor-pointer"
            onClick={() => setIsTappedPaused(prev => !prev)}
            onTouchStart={() => setIsTappedPaused(true)}
          >
            <div
              ref={carouselTrackRef}
              className="flex gap-4 sm:gap-5 w-max hover:[animation-play-state:paused] active:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
              style={{
                animation: 'marqueeScroll 160s linear infinite',
                animationPlayState: shouldPause ? 'paused' : 'running'
              }}
            >
              {[...filteredProjects, ...filteredProjects].map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  className="w-[270px] sm:w-[300px] md:w-[320px] shrink-0"
                >
                  <ProjectCard
                    project={p}
                    onSelectProject={(proj) => navigateTo(`/project/${proj.id}`)}
                    onBookSiteVisit={onBookSiteVisit}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
