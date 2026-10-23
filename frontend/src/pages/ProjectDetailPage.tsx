import { useState, useEffect, useMemo } from 'react';
import { PROJECTS } from '../data/projects';
import { navigateTo } from '../utils/navigation';
import { useUser } from '../contexts/UserContext';
import { Footer } from '../components/Footer';
import { BrandLogo } from '../components/BrandLogo';

interface ProjectDetailPageProps {
  identifier: string; // id or slug
}

interface ConfirmedBooking {
  refId: string;
  projectName: string;
  visitorName: string;
  phone: string;
  visitDate: string;
  timeSlot: string;
  pickupRequired: boolean;
}

export function ProjectDetailPage({ identifier }: ProjectDetailPageProps) {
  const { registerUser } = useUser();

  // Find project by id or slug
  const project = useMemo(() => {
    const cleanId = (identifier || '').toLowerCase().trim();
    return (
      PROJECTS.find(p => p.id.toLowerCase() === cleanId) ||
      PROJECTS.find(p => p.slug.toLowerCase() === cleanId) ||
      PROJECTS.find(p => p.title.toLowerCase().includes(cleanId)) ||
      PROJECTS[0]
    );
  }, [identifier]);

  // Related projects in the same category
  const relatedProjects = useMemo(() => {
    return PROJECTS.filter(p => p.category === project.category && p.id !== project.id).slice(0, 4);
  }, [project]);

  // Booking form state
  const STANDARD_SLOTS = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitDate, setVisitDate] = useState(getTomorrowDate);
  const [timeSlot, setTimeSlot] = useState(STANDARD_SLOTS[0]);
  const [slotAvailability, setSlotAvailability] = useState<Array<{ slot: string; booked: number; limit: number; remaining: number; isFull: boolean }>>([]);
  const [slotWarning, setSlotWarning] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>(project.configurations[0]?.name || '');
  const [pickupRequired, setPickupRequired] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<ConfirmedBooking | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'amenities' | 'specs' | 'location' | 'approvals'>('overview');
  const [imageError, setImageError] = useState(false);

  // Live Slot Availability Check (2 leads limit per time slot)
  const checkSlotForDate = (date: string, slotToCheck: string) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlotWarning('');
    fetch(`/api/slot-availability?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if (data.slots && Array.isArray(data.slots)) {
          setSlotAvailability(data.slots);
          const found = data.slots.find((s: any) => s.slot === slotToCheck);
          if (found && found.isFull) {
            setSlotWarning('The slots are filled, please select another slot.');
          } else {
            setSlotWarning('');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  };

  // Initial slot check on mount
  useEffect(() => {
    checkSlotForDate(visitDate, timeSlot);
  }, []);

  // Reactive date changer: immediately clears stale warnings and checks new date availability
  const handleDateChange = (newDate: string) => {
    setVisitDate(newDate);
    setSlotWarning('');
    if (newDate) {
      checkSlotForDate(newDate, timeSlot);
    }
  };

  // Reactive time slot changer: immediately verifies new slot
  const handleTimeSlotChange = (newSlot: string) => {
    setTimeSlot(newSlot);
    const found = slotAvailability.find(s => s.slot === newSlot);
    if (found && found.isFull) {
      setSlotWarning('The slots are filled, please select another slot.');
    } else {
      setSlotWarning('');
    }
  };

  const currentSlotInfo = slotAvailability.find(s => s.slot === timeSlot);
  const isCurrentSlotFull = !loadingSlots && Boolean(currentSlotInfo?.isFull);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImageError(false);
    setBookingConfirmed(null);
  }, [project.id]);

  // Handle VIP Visit Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) return;

    if (isCurrentSlotFull) {
      setSlotWarning('The slots are filled, please select another slot.');
      return;
    }

    setSubmitting(true);
    setSlotWarning('');
    const bookingRef = `VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const chosenDate = visitDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visitorName,
          phone: visitorPhone,
          visitDate: chosenDate,
          timeSlot,
          interest: `VIP Site Visit: ${project.category} - ${project.title}`,
          projectTitle: project.title,
          projectImage: project.image,
          projectId: project.id,
          message: `Booking Ref: ${bookingRef} | Project: [${project.title}] | Unit Interest: [${selectedUnit || 'All Configurations'}] | Preferred Time: ${timeSlot} | Cab Pick & Drop: ${pickupRequired ? 'Yes (Requested)' : 'No (Self Drive)'} ${notes ? `| Special Note: ${notes}` : ''}`
        }),
      });

      if (res.ok) {
        registerUser(visitorName, visitorPhone);
        setBookingConfirmed({
          refId: bookingRef,
          projectName: project.title,
          visitorName,
          phone: visitorPhone,
          visitDate: chosenDate,
          timeSlot,
          pickupRequired
        });
      } else if (res.status === 409) {
        const errData = await res.json().catch(() => ({}));
        setSlotWarning(errData.message || 'The slots are filled, please select another slot.');
      } else {
        registerUser(visitorName, visitorPhone);
        setBookingConfirmed({
          refId: bookingRef,
          projectName: project.title,
          visitorName,
          phone: visitorPhone,
          visitDate: chosenDate,
          timeSlot,
          pickupRequired
        });
      }
    } catch {
      registerUser(visitorName, visitorPhone);
      setBookingConfirmed({
        refId: bookingRef,
        projectName: project.title,
        visitorName,
        phone: visitorPhone,
        visitDate: chosenDate,
        timeSlot,
        pickupRequired
      });
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1E2522] flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* ─── LUXURY TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between">
          {/* Back & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-tertiary bg-surface-container/60 hover:bg-surface-container px-3.5 py-2 rounded-xl transition-all border border-outline-variant/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Projects</span>
            </button>
            <div className="h-6 w-px bg-outline-variant/30 hidden sm:block" />
            <div className="hidden md:flex items-center">
              <BrandLogo size="sm" variant="dark" showTagline={false} />
            </div>
          </div>

          {/* Center Title Pill (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface rounded-full border border-outline-variant/20 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-[15px] text-tertiary">domain</span>
            <span className="truncate max-w-xs font-semibold text-primary">{project.title}</span>
            <span className="text-outline-variant">•</span>
            <span className="text-emerald-700 font-bold">{project.price.split('-')[0].trim()}</span>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('book-visit-section')}
              className="bg-primary hover:bg-tertiary text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl transition-all shadow-xs sm:shadow-sm active:scale-95 flex items-center gap-1 sm:gap-1.5 min-h-[30px] sm:min-h-[38px]"
              title="Schedule Site Visit"
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[16px]">calendar_month</span>
              <span className="hidden sm:inline">Book Site Visit</span>
              <span className="sm:hidden">Book Visit</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="bg-surface border-b border-outline-variant/20 py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
          <button onClick={() => navigateTo('/')} className="hover:text-primary transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigateTo('/')} className="hover:text-primary transition-colors">Projects</button>
          <span>/</span>
          <span className="text-tertiary font-semibold">{project.category}</span>
          <span>/</span>
          <span className="text-primary font-bold truncate max-w-xs">{project.title}</span>
        </div>
      </div>

      {/* ─── HERO SHOWCASE SECTION ────────────────────────────────────────── */}
      <section className="relative bg-black text-white">
        <div className="relative h-[360px] sm:h-[460px] lg:h-[540px] w-full overflow-hidden">
          <img
            src={imageError ? project.fallbackImage : project.image}
            alt={project.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-[0.88]"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
          
          {/* Top Floating Badges */}
          <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-6 lg:inset-x-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-tertiary">verified</span>
                {project.category}
              </span>
              <span className="bg-emerald-600/95 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                {project.badge}
              </span>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded-full">
              TS RERA: {project.rera}
            </div>
          </div>

          {/* Bottom Hero Banner Content */}
          <div className="absolute bottom-6 sm:bottom-8 inset-x-4 sm:inset-x-6 lg:inset-x-10 max-w-[1440px] mx-auto">
            <div className="max-w-4xl space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-tertiary-fixed font-semibold tracking-wide">
                <span className="material-symbols-outlined text-[18px]">engineering</span>
                <span>Crafted by {project.developer}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                {project.title}
              </h1>
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium">
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed shrink-0">location_on</span>
                <span>{project.location}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ─── QUICK SPECIFICATION RIBBON ─────────────────────────────────── */}
        <div className="bg-[#15231D] border-t border-white/10 py-4 sm:py-5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="border-r border-white/10 pr-2 last:border-none">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Investment Range</span>
              <span className="text-base sm:text-xl font-extrabold text-white mt-0.5 block">{project.price}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{project.priceBreakdown.pricePerUnit}</span>
            </div>

            <div className="border-r border-white/10 pr-2 last:border-none">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Configuration</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{project.type}</span>
              <span className="text-[11px] text-white/70">{project.configurations.length} Layout Plans</span>
            </div>

            <div className="border-r border-white/10 pr-2 last:border-none">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Super Built-up Area</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{project.sqft}</span>
              <span className="text-[11px] text-white/70">100% Vastu Compliant</span>
            </div>

            <div className="border-r border-white/10 pr-2 last:border-none hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Handover Timeline</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{project.possession}</span>
              <span className="text-[11px] text-amber-300">Phase 1 On Schedule</span>
            </div>

            <div className="pr-2 hidden lg:block">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Loan EMI Starting</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{project.priceBreakdown.emiStarting}</span>
              <span className="text-[11px] text-white/70">SBI & HDFC Pre-Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STICKY NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="sticky top-18 z-40 bg-white border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: 'article' },
            { id: 'units', label: 'Floor Plans & Pricing', icon: 'floor' },
            { id: 'amenities', label: 'Amenities', icon: 'pool' },
            { id: 'specs', label: 'Specifications', icon: 'construction' },
            { id: 'location', label: 'Location & Connectivity', icon: 'map' },
            { id: 'approvals', label: 'Approvals & Bank Loans', icon: 'account_balance' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                scrollToSection(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => scrollToSection('book-visit-section')}
            className="ml-auto px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-tertiary text-on-tertiary hover:bg-tertiary-container hover:text-on-tertiary-container transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">event_available</span>
            <span>Reserve Visit</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER (2-COL ON DESKTOP) ────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 flex-1 w-full pb-24 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Comprehensive Researched Dossier (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. ARCHITECTURAL STORY & OVERVIEW */}
            <section id="overview" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">history_edu</span>
                <span>Architectural Vision & Narrative</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                About {project.title}
              </h2>
              
              <div className="prose prose-sm max-w-none text-[#33423A] space-y-4 leading-relaxed">
                {project.overview.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-sm sm:text-base leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Key Highlights Quick Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-outline-variant/20">
                <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Developer</span>
                  <span className="text-xs sm:text-sm font-bold text-primary mt-1 block truncate">{project.developer}</span>
                </div>
                <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Category</span>
                  <span className="text-xs sm:text-sm font-bold text-primary mt-1 block">{project.category}</span>
                </div>
                <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Status</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-1 block">{project.badge}</span>
                </div>
                <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Possession</span>
                  <span className="text-xs sm:text-sm font-bold text-primary mt-1 block">{project.possession}</span>
                </div>
              </div>
            </section>

            {/* 2. FLOOR PLANS & CONFIGURATIONS */}
            <section id="units" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">schema</span>
                    <span>Floor Plans & Unit Sizing</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                    Available Configurations
                  </h2>
                </div>
                <span className="text-xs text-on-surface-variant bg-surface px-3 py-1 rounded-full border border-outline-variant/20">
                  {project.configurations.length} Architect-Crafted Options
                </span>
              </div>

              {/* Units Table / Grid */}
              <div className="space-y-3">
                {project.configurations.map((config, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all bg-surface/50 hover:bg-white hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-primary">{config.name}</span>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {config.facing} Facing
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-on-surface-variant flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-tertiary">straighten</span>
                          <span>{config.size}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-tertiary">bathtub</span>
                          <span>{config.bathrooms}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-tertiary">balcony</span>
                          <span>{config.balcony}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase text-on-surface-variant/70 block">Price Guide</span>
                        <span className="text-base sm:text-lg font-bold text-primary block">{config.price}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnit(config.name);
                          scrollToSection('book-visit-section');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-tertiary text-white transition-all shadow-xs active:scale-95 flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>Select Plan</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. LIFESTYLE AMENITIES */}
            <section id="amenities" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                <span>World-Class Living Standards</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Signature Amenities & Club Facilities
              </h2>

              {project.amenitiesCategorized ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {Object.entries(project.amenitiesCategorized).map(([categoryName, items]) => (
                    <div key={categoryName} className="p-4 sm:p-5 rounded-2xl bg-surface border border-outline-variant/20 space-y-3">
                      <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary" />
                        <span>{categoryName}</span>
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm text-on-surface flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0 mt-0.5">check_circle</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.amenities.map((amenity, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface border border-outline-variant/20 flex items-center gap-2 text-xs sm:text-sm text-primary font-medium">
                      <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0">check_circle</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. MASTER CONSTRUCTION SPECIFICATIONS */}
            <section id="specs" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">build</span>
                <span>Engineering & Finish Standards</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Master Technical Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {Object.entries(project.specifications).map(([sectionTitle, specList]) => (
                  <div key={sectionTitle} className="p-4 sm:p-5 rounded-2xl bg-surface border border-outline-variant/20 space-y-2.5">
                    <h3 className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
                      <span>{sectionTitle}</span>
                    </h3>
                    <ul className="space-y-1.5 pt-1">
                      {specList.map((spec, i) => (
                        <li key={i} className="text-xs sm:text-sm text-on-surface-variant flex items-start gap-2">
                          <span className="text-tertiary font-bold">•</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. LOCATION & CONNECTIVITY */}
            <section id="location" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Strategic Geographic Advantages</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">
                  Location & Travel Distance
                </h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.title + ' ' + project.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:text-tertiary flex items-center gap-1 transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                </a>
              </div>

              {/* Connectivity Points Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-outline-variant/30 text-on-surface-variant text-[11px] uppercase font-bold">
                      <th className="py-3 px-4">Key Transit Landmark</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4">Drive Time</th>
                      <th className="py-3 px-4 text-right">Route Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {project.connectivity.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">pin_drop</span>
                          <span>{item.landmark}</span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface font-medium">{item.distance}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">{item.travelTime}</td>
                        <td className="py-3.5 px-4 text-right text-on-surface-variant text-[11px]">Direct Arterial Road</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. STATUTORY APPROVALS & BANK PARTNERS */}
            <section id="approvals" className="bg-white p-6 sm:p-8 rounded-[24px] border border-outline-variant/30 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Due Diligence & Institutional Sanctions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Statutory Approvals & Home Loan Partners
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Clearances */}
                <div className="p-5 rounded-2xl bg-surface border border-outline-variant/20 space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">shield</span>
                    <span>Legal Clearances & NOCs</span>
                  </h3>
                  <div className="space-y-2">
                    {project.legalApprovals.map((approval, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        <span>{approval}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-Approved Banks */}
                <div className="p-5 rounded-2xl bg-surface border border-outline-variant/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
                      <span>Approved Home Loan Partners</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                      Fast-Track Loans
                    </span>
                  </div>
                  <div className="space-y-2">
                    {project.bankPartners.map((bank, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                        <span>{bank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky VIP Booking & Specialist Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            
            {/* VIP VISIT RESERVATION FORM */}
            <div id="book-visit-section" className="bg-white p-6 sm:p-7 rounded-[28px] border border-outline-variant/40 shadow-[0px_12px_32px_rgba(21,71,52,0.08)]">
              <div className="space-y-2 border-b border-outline-variant/20 pb-4 mb-5">
                <span className="inline-block bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Instant Confirmation
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-primary">
                  Book VIP Site Visit
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Complimentary AC cab pick & drop + personalized walkthrough with senior architectural advisor.
                </p>
              </div>

              {bookingConfirmed ? (
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2 text-center">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 block mx-auto">
                      check_circle
                    </span>
                    <h4 className="font-bold text-base">VIP Site Visit Confirmed!</h4>
                    <p className="text-xs text-emerald-800">
                      Your visit pass for <strong>{project.title}</strong> has been issued.
                    </p>
                    <div className="font-mono text-xs bg-white py-1 px-3 rounded-lg border border-emerald-300 inline-block font-bold">
                      {bookingConfirmed.refId}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-surface p-4 rounded-xl border border-outline-variant/20">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Guest Name:</span>
                      <span className="font-bold text-primary">{bookingConfirmed.visitorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Phone:</span>
                      <span className="font-bold text-primary">{bookingConfirmed.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Visit Date:</span>
                      <span className="font-bold text-primary">{bookingConfirmed.visitDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Time Slot:</span>
                      <span className="font-bold text-primary">{bookingConfirmed.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Cab Pick & Drop:</span>
                      <span className="font-bold text-emerald-700">{bookingConfirmed.pickupRequired ? 'Arranged' : 'Self-Drive'}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center text-xs text-emerald-950 space-y-0.5">
                    <span className="font-bold flex items-center justify-center gap-1 text-emerald-900">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Site Visit Pass Reserved Successfully</span>
                    </span>
                    <span className="text-[11px] text-emerald-800/80 block">Our Senior Property Specialist will arrive with your guided tour portfolio.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingConfirmed(null)}
                    className="w-full text-center text-xs text-on-surface-variant hover:text-primary font-semibold py-1"
                  >
                    Modify or Book Another Visit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-primary uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sridhar Rao"
                      value={visitorName}
                      onChange={e => setVisitorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 text-base sm:text-xs focus:outline-none focus:border-primary transition-all bg-surface/40 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary uppercase tracking-wide mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98765 43210"
                      value={visitorPhone}
                      onChange={e => setVisitorPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 text-base sm:text-xs focus:outline-none focus:border-primary transition-all bg-surface/40 min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-primary uppercase tracking-wide mb-1">
                        Visit Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={visitDate}
                        onChange={e => handleDateChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-base sm:text-xs focus:outline-none focus:border-primary transition-all bg-surface/40 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-primary uppercase tracking-wide">
                          Time Slot (Max 2 Leads)
                        </label>
                        <span className="text-[10px] text-tertiary font-bold">2 Visits Max</span>
                      </div>
                      <select
                        value={timeSlot}
                        onChange={e => handleTimeSlotChange(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-base sm:text-xs focus:outline-none transition-all min-h-[44px] ${
                          isCurrentSlotFull
                            ? 'border-red-500 bg-red-50/80 text-red-900 font-bold focus:border-red-600'
                            : 'border-outline-variant/30 text-primary bg-surface/40 focus:border-primary'
                        }`}
                      >
                        {STANDARD_SLOTS.map((slot) => {
                          const info = slotAvailability.find(s => s.slot === slot);
                          const isFull = Boolean(info?.isFull);
                          return (
                            <option key={slot} value={slot}>
                              {slot} {isFull ? '• (FULL - 2/2 Booked 🔒)' : info ? `• (${info.remaining}/2 Available)` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Slot Full Alert Warning */}
                  {slotWarning && (
                    <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2 shadow-xs">
                      <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">warning</span>
                      <span className="font-bold">{slotWarning}</span>
                    </div>
                  )}

                  {project.configurations.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-primary uppercase tracking-wide mb-1">
                        Interested Unit Configuration
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={e => setSelectedUnit(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-base sm:text-xs focus:outline-none focus:border-primary transition-all bg-surface/40 min-h-[44px]"
                      >
                        {project.configurations.map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name} ({c.size}) - {c.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-outline-variant/20">
                    <input
                      type="checkbox"
                      id="pickupCheck"
                      checked={pickupRequired}
                      onChange={e => setPickupRequired(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="pickupCheck" className="text-xs font-semibold text-primary cursor-pointer select-none">
                      Include Free AC Cab Pick & Drop Service
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary uppercase tracking-wide mb-1">
                      Notes or Special Request (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Interested in high-rise floor with sunrise view"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 text-xs focus:outline-none focus:border-primary transition-all bg-surface/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || loadingSlots || isCurrentSlotFull}
                    className="w-full bg-primary hover:bg-tertiary text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span>Validating Slot Capacity...</span>
                    ) : loadingSlots ? (
                      <span>Updating Slot Availability...</span>
                    ) : isCurrentSlotFull ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        <span>Slot Filled • Please Select Another Slot</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Confirm VIP Site Visit</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant/70">
                    No spam. Protected under the Indian DPDPA 2023 &{' '}
                    <button
                      type="button"
                      onClick={() => navigateTo('/privacy-policy')}
                      className="underline hover:text-primary font-semibold"
                    >
                      Hyderabad Homes Privacy Policy
                    </button>
                    .
                  </p>
                </form>
              )}
            </div>

            {/* ADVISOR DIRECT CARD */}
            <div className="bg-surface p-5 sm:p-6 rounded-[24px] border border-outline-variant/30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  LE
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">LuxeEstate Relationship Desk</h4>
                  <span className="text-[11px] text-emerald-700 font-semibold block">● Online & Available Now</span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect directly with our dedicated real estate portfolio managers for official master floor plan PDFs, live unit inventory, and customized payment schedules.
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => scrollToSection('book-visit-section')}
                  className="w-full bg-primary hover:bg-tertiary text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  <span>Request Official Portfolio & Site Tour</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── RELATED LANDMARK PROPERTIES ──────────────────────────────────── */}
        {relatedProjects.length > 0 && (
          <section className="mt-16 sm:mt-20 pt-12 border-t border-outline-variant/30 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
                  Explore More In {project.category}
                </span>
                <h3 className="text-xl sm:text-3xl font-bold text-primary mt-1">
                  Similar Premium Properties
                </h3>
              </div>
              <button
                onClick={() => navigateTo('/')}
                className="text-xs sm:text-sm font-bold text-primary hover:text-tertiary flex items-center gap-1 transition-all"
              >
                <span>Browse All 20 Projects</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProjects.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => navigateTo(`/project/${rel.id}`)}
                  className="bg-white rounded-[20px] overflow-hidden border border-outline-variant/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className="h-40 relative overflow-hidden bg-surface-container">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      onError={e => {
                        (e.target as HTMLImageElement).src = rel.fallbackImage;
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-white/95 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {rel.category}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {rel.price.split('-')[0].trim()}
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-primary line-clamp-1 group-hover:text-tertiary transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        {rel.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant border-t border-outline-variant/20 pt-2">
                      <span>{rel.sqft}</span>
                      <span className="font-bold text-primary group-hover:text-tertiary flex items-center gap-0.5">
                        View Dossier
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <Footer />

      {/* ─── MOBILE STICKY BOOKING BOTTOM BAR ───────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 px-4 py-3 z-40 flex items-center justify-between gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block truncate">Price Guide</span>
          <span className="text-sm font-extrabold text-emerald-800 truncate block">{project.price.split('-')[0].trim()}</span>
        </div>
        <button
          onClick={() => scrollToSection('book-visit-section')}
          className="flex-1 max-w-[220px] bg-primary hover:bg-tertiary text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          <span>Book VIP Visit</span>
        </button>
      </div>
    </div>
  );
}
