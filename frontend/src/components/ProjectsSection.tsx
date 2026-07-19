import { useState, useEffect, useRef } from 'react';
import { ProjectCard } from './ProjectCard';

const PROJECTS = [
  { title: "Skyline Heights", location: "Kokapet, Hyderabad", type: "3 & 4 BHK", price: "₹98 Lakhs+", badge: "RERA", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRnnUnQ2LVhOvCm-oAbKuUr-Gr5Wtey6M7sX6C8OerN104VkPEGoy6YFYf5YxqfBNbSmKIYnJ4Hw8kOqjaHsU13SoY6eN_fYMlCOmsQkxf8tLq2kZesHfi9Lv-7aObJyrnQ-AYrgT981lTP3eSRdogY_lstCaE31SW5o-h7KqVYjw7-jVsvBrGR2reFo70pxfMTmzxYSVEMwP7-obANpkQdklEnOuCRuc6VaddVitytWo0AT3uf1QuMcTOsqX3hAETS1Lc5l0iqefr" },
  { title: "Green Valley Villas", location: "Narsingi, Hyderabad", type: "4 & 5 BHK", price: "₹3.85 Cr+", badge: "RERA", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5j5K45cfTKuoCmrnLo0XVrx80QyVL-gTslNNeD6vCR3jim7zt3VPkCeK9Jwy7Mue9wbgO8okGBudtL0MEURGvV17LI-TMm1dHYM9mwupIBPuojfSt9tZbfFgx-FXdFf04Ij-KNHm_qRaZGBk3pYDkrHXBKEmSEDw-F8zSTg_5fz18v6tzbGje6xRV_lJ7Pi1_girTetgEUGyh511FAXCy-z5HWrIpGZIHDn1LkK1L9ayfjXhgqtpXrEIEGWXdWrW5HfehFJ6lZAEr" },
  { title: "Urban One", location: "Financial District", type: "3 BHK Smart", price: "₹1.45 Cr+", badge: "RERA", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXWUUfR_hoQWkG1ZNw0fuDhWMk4_5pCs3J7_d2DsnoVFn6alX0u_k8ppixv7jzuGD6uigv14ttfz0PEm0sYxeRWw_1QmMIpZomCyTJ1eofeA0YSZaROPpixPj-LrXwHdLn1_C2hs_XOm9XoxiudDXUtbGpO-7H3S71mAFAExyKomYqLLiVbWKQQiafvmUhq5T25TFG3RnrM9Rr5eKz7Sc9fFsQvmH-GoAmScmsUf2RUTMwaJTLx2wjkqKMSeD70p247UUn8BFvFMtu" },
  { title: "Lake View Greens", location: "Tellapur, Hyderabad", type: "2 & 3 BHK", price: "₹82 Lakhs+", badge: "RERA", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHxJA4zFZfuKtlowk4x50olwGvZbYYcmkTlX91jpUW8y-ftPXFHzFZ9CSNIQQOZy1c2vf-Z44Wvxx8TKn8TDNxuGa2_Vyt7dtoBWwkL5R6qCWr5DvUFDu37RetNaSqxBE8UDZUk-xCZ1ijWR0pPckxzy-tobkEy3iuJo6dyzHGB7wqKFMRL7IsuBvKYJLVoNFgwHiYHSXQ1L3HygrmgaAel8h7S-shqnYA2sVhawsjG5uLqMbpcdnVdMVnNzh-Zrsyg59q8GOaNjvY" },
  { title: "The Summit Commercial", location: "HITEC City", type: "Premium Office", price: "₹5.2 Cr+", badge: "NEW", image: "/project-5.png" },
  { title: "Serenity Plots", location: "Mokila", type: "Villa Plots (300 Sq.Yd)", price: "₹1.2 Cr+", badge: "RERA", image: "/project-6.png" },
  { title: "Crown Penthouses", location: "Banjara Hills", type: "5 BHK Penthouse", price: "₹12.5 Cr+", badge: "SOLD OUT", image: "/project-7.png" },
  { title: "Neo Studios", location: "Gachibowli", type: "1 RK Studio", price: "₹45 Lakhs+", badge: "HOT", image: "/project-8.png" },
  { title: "Eco Gardens", location: "Kompally", type: "Eco-Friendly 3 BHK", price: "₹1.1 Cr+", badge: "GREEN", image: "/project-9.png" },
  { title: "Riverfront Elite", location: "Gandipet", type: "Luxury Villas", price: "₹6.5 Cr+", badge: "RERA", image: "/project-10.png" },
  { title: "Industrial Lofts", location: "Madhapur", type: "Urban Loft Spaces", price: "₹2.2 Cr+", badge: "NEW", image: "/project-11.png" },
  { title: "Oakwood Estates", location: "Appa Junction", type: "Suburban Homes", price: "₹3.1 Cr+", badge: "PRE-LAUNCH", image: "/project-12.png" },
];

export function ProjectsSection({
  onBookSiteVisit,
  isPopupOpen,
  showAllProjects,
  setShowAllProjects
}: {
  onBookSiteVisit?: () => void;
  isPopupOpen?: boolean;
  showAllProjects: boolean;
  setShowAllProjects: (show: boolean) => void;
}) {
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
      className="py-section-gap-mobile lg:py-section-gap-desktop max-w-[1440px] mx-auto px-6 md:px-grid-margin opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
      id="projects"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="space-y-2">
          <span className="font-label-sm text-tertiary uppercase tracking-widest">Featured Projects</span>
          <h2 className="font-headline-lg text-primary">Our Premium Projects</h2>
        </div>
        <button
          className="font-label-sm text-primary flex items-center gap-2 hover:gap-4 transition-all"
          onClick={() => {
            setShowAllProjects(!showAllProjects);
          }}
        >
          {showAllProjects ? 'View Less' : 'View All Projects'} <span className={`material-symbols-outlined text-[18px] transition-transform ${showAllProjects ? '-rotate-180' : ''}`}>arrow_right_alt</span>
        </button>
      </div>

      {showAllProjects ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter transition-all duration-500">
          {PROJECTS.map((p, i) => <ProjectCard key={i} {...p} onBookSiteVisit={onBookSiteVisit} />)}
        </div>
      ) : (
        <div className="overflow-hidden relative w-full pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className="flex gap-4 md:gap-gutter w-max hover:[animation-play-state:paused] active:[animation-play-state:paused]"
            style={{
              animation: 'marqueeScroll 45s linear infinite',
              animationPlayState: isPopupOpen ? 'paused' : undefined
            }}
          >
            {[...PROJECTS, ...PROJECTS].map((p, i) => (
              <div
                key={i}
                className="w-[200px] md:w-[350px] shrink-0"
              >
                <ProjectCard {...p} onBookSiteVisit={onBookSiteVisit} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

