import { useEffect, useRef } from 'react';
import { CollectionCard } from './CollectionCard';

export function CollectionsSection({ onDoubleClickCollection }: { onDoubleClickCollection?: () => void }) {
  const collections = [
    {
      title: "Premium Apartments",
      subtitle: "Refined urban living in the heart of the city.",
      className: "col-span-1 md:col-span-3 h-[160px] md:h-auto",
      images: [
        "/project-5.png",
        "/project-6.png",
        "/project-7.png"
      ]
    },
    {
      title: "Luxury Villas",
      subtitle: "Spacious estates for ultimate privacy and comfort.",
      className: "col-span-1 md:col-span-3 h-[160px] md:h-auto",
      images: [
        "/project-8.png",
        "/project-9.png",
        "/project-10.png"
      ]
    },
    {
      title: "Open Plots",
      className: "col-span-1 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "/open_plot_1.png",
        "/open_plot_2.png",
        "/open_plot_3.png"
      ]
    },
    {
      title: "Commercial Spaces",
      className: "col-span-1 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "/commercial_1.png",
        "/commercial_2.png",
        "/commercial_3.png"
      ]
    },
    {
      title: "Weekend Homes",
      className: "col-span-2 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "/project-9.png",
        "/project-10.png",
        "/project-11.png"
      ]
    }
  ];

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
      className="py-section-gap-mobile lg:py-section-gap-desktop bg-surface-container-low opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0" 
      id="collections"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin">
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <span className="font-label-sm text-tertiary uppercase tracking-widest text-[10px] sm:text-xs font-bold">Collections</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-primary font-bold">Explore Our Property Collections</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 md:h-[600px]">
          {collections.map((col, idx) => (
            <CollectionCard key={idx} {...col} onDoubleClick={onDoubleClickCollection} />
          ))}
        </div>
      </div>
    </section>
  );
}
