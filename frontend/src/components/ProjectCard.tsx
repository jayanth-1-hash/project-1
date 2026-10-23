import type { Project } from '../data/projects';
import { navigateTo } from '../utils/navigation';

interface ProjectCardProps {
  project: Project;
  onSelectProject?: (project: Project) => void;
  onBookSiteVisit?: (projectName?: string) => void;
}

export function ProjectCard({ project, onSelectProject }: ProjectCardProps) {
  const { 
    id,
    title, 
    location, 
    type, 
    price, 
    badge, 
    category, 
    image, 
    fallbackImage, 
    sqft, 
    rera, 
    possession,
    amenities 
  } = project;

  const handleCardClick = () => {
    if (onSelectProject) {
      onSelectProject(project);
    } else {
      navigateTo(`/project/${id}`);
    }
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo(`/project/${id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-[20px] md:rounded-[24px] shadow-[0px_8px_24px_rgba(21,71,52,0.06)] overflow-hidden group hover:shadow-[0px_20px_40px_rgba(21,71,52,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full border border-outline-variant/30 cursor-pointer select-none"
    >
      {/* Real Architecture Image Container */}
      <div className="h-44 sm:h-48 md:h-52 relative overflow-hidden bg-surface-container shrink-0">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
          src={image} 
          alt={title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <div className="bg-white/95 backdrop-blur-md text-primary px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm border border-outline-variant/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-tertiary">category</span>
            <span>{category}</span>
          </div>

          {/* Status Badge */}
          <div className="bg-primary/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-md">
            {badge}
          </div>
        </div>

        {/* Bottom Overlay: Possession & Price */}
        <div className="absolute inset-x-0 bottom-0 pt-8 pb-2.5 px-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end justify-between text-white pointer-events-none">
          <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
            <span className="material-symbols-outlined text-[13px] text-tertiary-fixed">event_available</span>
            <span className="truncate">{possession}</span>
          </div>
          <div className="bg-emerald-600/95 text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
            {price.split('-')[0].trim()}
          </div>
        </div>
      </div>

      {/* Relevant Information Body */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          {/* Title & Location */}
          <div>
            <h3 className="font-headline-md text-sm sm:text-base text-primary font-bold line-clamp-1 group-hover:text-tertiary transition-colors">
              {title}
            </h3>
            <p className="text-on-surface-variant text-[11px] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-tertiary shrink-0">location_on</span> 
              <span className="truncate">{location}</span>
            </p>
          </div>

          {/* Specifications Pills */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div className="bg-surface px-2.5 py-1 rounded-lg border border-outline-variant/20 flex items-center gap-1 text-[10px] sm:text-[11px] text-on-surface font-medium truncate">
              <span className="material-symbols-outlined text-[13px] text-primary shrink-0">straighten</span>
              <span className="truncate">{sqft}</span>
            </div>
            <div className="bg-surface px-2.5 py-1 rounded-lg border border-outline-variant/20 flex items-center gap-1 text-[10px] sm:text-[11px] text-on-surface font-medium truncate">
              <span className="material-symbols-outlined text-[13px] text-primary shrink-0">bed</span>
              <span className="truncate">{type}</span>
            </div>
          </div>

          {/* Highlights & RERA */}
          <div className="flex items-center justify-between text-[10px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
            <span className="truncate text-primary/80 font-medium max-w-[58%]">
              ✓ {amenities[0]}
            </span>
            <span className="font-mono text-[9px] text-on-surface-variant/70 shrink-0">
              {rera.replace('P0240000', 'RERA #')}
            </span>
          </div>
        </div>

        {/* Single Action Button: Sleek, Elegant "View More" */}
        <div className="pt-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={handleViewMore}
            className="w-full bg-primary hover:bg-tertiary text-white hover:text-white py-2.5 px-4 rounded-xl font-label-sm text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 shadow-sm active:scale-95 group/btn min-h-[44px]"
            title={`View full researched details of ${title}`}
          >
            <span>View More</span>
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover/btn:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
