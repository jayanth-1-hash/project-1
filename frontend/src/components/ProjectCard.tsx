export function ProjectCard({ title, location, type, price, badge, image, onBookSiteVisit }: {
  title: string;
  location: string;
  type: string;
  price: string;
  badge: string;
  image: string;
  onBookSiteVisit?: () => void;
}) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0px_10px_30px_rgba(21,71,52,0.05)] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="h-32 md:h-64 relative overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={image} alt={title} />
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-primary text-on-primary px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{badge}</div>
      </div>
      <div className="p-3 md:p-6 space-y-2 md:space-y-4">
        <div>
          <h3 className="font-headline-md text-base md:text-[20px] text-primary">{title}</h3>
          <p className="text-on-surface-variant text-xs md:text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] md:text-[14px]">location_on</span> <span className="truncate">{location}</span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0">
          <div className="flex items-center gap-1 md:gap-2 text-on-surface-variant text-xs md:text-sm">
            <span className="material-symbols-outlined text-[14px] md:text-[16px]">apartment</span> {type}
          </div>
          <div className="font-bold text-primary text-sm md:text-base">{price}</div>
        </div>
        <button
          onClick={onBookSiteVisit}
          className="w-full border border-primary text-primary py-2 md:py-3 rounded-[10px] md:rounded-[14px] font-label-sm text-xs md:text-sm hover:bg-primary hover:text-on-primary transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
