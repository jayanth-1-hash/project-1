import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CollectionsSection } from './components/CollectionsSection';
import { AboutSection } from './components/AboutSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { SiteVisitPopup } from './components/SiteVisitPopup';
import { BrandLogo } from './components/BrandLogo';
import { BrandPreloader } from './components/BrandPreloader';
import { navigateTo } from './utils/navigation';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProjectForVisit, setSelectedProjectForVisit] = useState<string>('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  const handleOpenSiteVisit = (projectName?: string) => {
    if (projectName) {
      setSelectedProjectForVisit(projectName);
    }
    setIsPopupOpen(true);
  };

  // Auto-open popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPopupOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Handle transparent to solid header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        // Become solid right before the projects section hits the top of the viewport
        setIsScrolled(window.scrollY > projectsSection.offsetTop - 80);
      } else {
        setIsScrolled(window.scrollY > 800);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Spy for active nav link
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Give components a moment to render before observing
    setTimeout(() => {
      ['home', 'projects', 'collections', 'about', 'contact'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);


  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'collections', label: 'Collections' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact', isRoute: true, path: '/contact-us' },
    { id: 'rera', label: 'TS-RERA Compliance', isRoute: true, path: '/rera-compliance' },
  ];

  return (
    <div className="min-h-screen bg-surface relative">
      {/* ─── LUXURY HIGH-SPEED BRAND PRELOADER ─── */}
      <BrandPreloader minDurationMs={1100} />

      {/* TopNavBar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/95 backdrop-blur-md shadow-sm border-b border-outline-variant/30 py-2 sm:py-2' : 'bg-transparent py-3 sm:py-4'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-grid-margin max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <BrandLogo size="md" isScrolled={isScrolled} showTagline={false} />
            <span className={`hidden lg:inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
              isScrolled 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-white/10 text-emerald-300 border-white/20 backdrop-blur-sm'
            }`}>
              <span className="material-symbols-outlined text-[12px]">verified</span>
              <span>TS-RERA Registered</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.isRoute && link.path) {
                    navigateTo(link.path);
                  } else if (link.id === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`font-body-md transition-all duration-300 relative pb-1 group ${activeSection === link.id
                  ? (isScrolled ? 'text-primary font-bold' : 'text-white font-bold')
                  : (isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-white/80 hover:text-white')
                  }`}
              >
                {link.label}
                {/* Active and hover underline */}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ${activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                    } ${isScrolled ? 'bg-primary' : 'bg-white'}`}
                ></span>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={() => handleOpenSiteVisit()} 
              className="bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed px-2.5 sm:px-6 py-1 sm:py-2.5 rounded-lg sm:rounded-xl font-label-sm uppercase tracking-wide sm:tracking-wider transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-xs sm:shadow-md hover:shadow-lg active:scale-[0.98] text-[10px] sm:text-xs min-h-[30px] sm:min-h-[40px]"
              title="Book VIP Site Visit"
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[18px]">calendar_month</span>
              <span>Book Visit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        <div id="home"><HeroSection onBookSiteVisit={() => handleOpenSiteVisit()} /></div>
        <div id="projects">
          <ProjectsSection
            onBookSiteVisit={handleOpenSiteVisit}
            isPopupOpen={isPopupOpen}
            showAllProjects={showAllProjects}
            setShowAllProjects={setShowAllProjects}
          />
        </div>
        <div id="collections">
          <CollectionsSection onDoubleClickCollection={() => {
            setShowAllProjects(true);
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </div>
        <div id="about"><AboutSection /></div>
        <TestimonialsSection />
        <div id="contact"><ContactSection /></div>
      </main>

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/95 backdrop-blur-lg border-t border-outline-variant/30 z-[60] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { id: 'home', icon: 'home', label: 'Home' },
            { id: 'projects', icon: 'apartment', label: 'Projects' },
            { id: 'collections', icon: 'grid_view', label: 'Collections' },
            { id: 'about', icon: 'info', label: 'About' },
            { id: 'contact', icon: 'mail', label: 'Contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'home') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeSection === item.id ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
              <span className="material-symbols-outlined text-[24px] mb-1" style={{ fontVariationSettings: activeSection === item.id ? '"FILL" 1' : '"FILL" 0' }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <Footer onRequestCallBack={() => handleOpenSiteVisit()} />

      <SiteVisitPopup 
        isOpen={isPopupOpen} 
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedProjectForVisit('');
        }} 
        initialProject={selectedProjectForVisit}
      />
    </div>
  );
}

export default App;
