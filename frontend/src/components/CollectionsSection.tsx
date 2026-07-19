import { useEffect, useRef } from 'react';
import { CollectionCard } from './CollectionCard';

export function CollectionsSection({ onDoubleClickCollection }: { onDoubleClickCollection?: () => void }) {
  const collections = [
    {
      title: "Premium Apartments",
      subtitle: "Refined urban living in the heart of the city.",
      className: "col-span-1 md:col-span-3 h-[160px] md:h-auto",
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
      ]
    },
    {
      title: "Luxury Villas",
      subtitle: "Spacious estates for ultimate privacy and comfort.",
      className: "col-span-1 md:col-span-3 h-[160px] md:h-auto",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
      ]
    },
    {
      title: "Open Plots",
      className: "col-span-1 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
      ]
    },
    {
      title: "Commercial Spaces",
      className: "col-span-1 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
      ]
    },
    {
      title: "Weekend Homes",
      className: "col-span-2 md:col-span-2 h-[160px] md:h-auto",
      images: [
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80"
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
      <div className="max-w-[1440px] mx-auto px-6 md:px-grid-margin">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label-sm text-tertiary uppercase tracking-widest">Collections</span>
          <h2 className="font-headline-lg text-primary">Explore Our Property Collections</h2>
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
