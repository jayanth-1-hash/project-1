import { useEffect } from 'react';
import type { Project } from '../data/projects';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSiteVisit: (projectTitle: string) => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose, onBookSiteVisit }: ProjectDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl md:max-w-2xl bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-outline-variant/30">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md active:scale-95"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Hero Image & Badges */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0 bg-surface-container">
          <img 
            src={project.image} 
            alt={project.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = project.fallbackImage;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          
          {/* Top category & status pills */}
          <div className="absolute top-3.5 left-3.5 flex gap-1.5 flex-wrap">
            <span className="bg-white/95 backdrop-blur-md text-primary font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
              {project.category}
            </span>
            <span className="bg-primary text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
              {project.badge}
            </span>
          </div>

          {/* Bottom Title & Location */}
          <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
            <span className="text-[10px] text-tertiary-fixed font-mono uppercase tracking-wider block">
              TS-RERA: {project.rera}
            </span>
            <h2 className="text-lg sm:text-2xl font-headline-lg font-bold leading-tight drop-shadow-md">
              {project.title}
            </h2>
            <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5 drop-shadow">
              <span className="material-symbols-outlined text-[14px] text-tertiary-fixed shrink-0">location_on</span>
              {project.location}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-surface border border-outline-variant/30 text-center">
            <div className="p-1">
              <span className="text-[9px] text-on-surface-variant block uppercase font-medium">Pricing</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 block truncate">{project.price}</span>
            </div>
            <div className="p-1">
              <span className="text-[9px] text-on-surface-variant block uppercase font-medium">Configuration</span>
              <span className="text-xs sm:text-sm font-bold text-primary block truncate">{project.type}</span>
            </div>
            <div className="p-1">
              <span className="text-[9px] text-on-surface-variant block uppercase font-medium">Super Built-up Area</span>
              <span className="text-xs sm:text-sm font-bold text-primary block truncate">{project.sqft}</span>
            </div>
            <div className="p-1">
              <span className="text-[9px] text-on-surface-variant block uppercase font-medium">Possession</span>
              <span className="text-xs sm:text-sm font-bold text-primary block truncate">{project.possession}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Project Overview</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Key Amenities */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Key Highlights & Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-on-surface bg-surface px-3 py-2 rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">verified</span>
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RERA and Compliance info */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/20">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <span className="material-symbols-outlined text-[15px] text-primary">policy</span>
              Statutory Authority Reference:
            </span>
            <span className="font-bold text-primary text-[11px] font-mono">{project.rera}</span>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                onClose();
                onBookSiteVisit(project.title);
              }}
              className="w-full bg-tertiary text-on-tertiary py-3 px-5 rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              Book VIP Site Visit
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
