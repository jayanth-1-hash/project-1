import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { PROJECTS, getShortProjectName, type Project } from '../data/projects';

interface SiteVisitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: string;
}

interface ConfirmedBooking {
  refId: string;
  projectName: string;
  visitorName: string;
  phone: string;
  visitDate: string;
  timeSlot?: string;
  message?: string;
  project: Project;
}

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

export function SiteVisitPopup({ isOpen, onClose, initialProject }: SiteVisitPopupProps) {
  const { isRegistered, userName, registerUser } = useUser();
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    visitDate: getTomorrowDate(), 
    message: '' 
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(STANDARD_SLOTS[0]);
  const [slotAvailability, setSlotAvailability] = useState<Array<{ slot: string; booked: number; limit: number; remaining: number; isFull: boolean }>>([]);
  const [slotWarning, setSlotWarning] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState(initialProject || PROJECTS[0].title);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'duplicate' | 'existing'>('idle');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [show, setShow] = useState(false);

  // Live Slot Availability Check (2 leads limit per slot)
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

  // Check slots when popup opens
  useEffect(() => {
    if (isOpen && formData.visitDate) {
      checkSlotForDate(formData.visitDate, selectedTimeSlot);
    }
  }, [isOpen]);

  // Reactive date change handler: clears stale warnings immediately and checks new date availability
  const handleDateChange = (newDate: string) => {
    setFormData(prev => ({ ...prev, visitDate: newDate }));
    setSlotWarning('');
    if (newDate) {
      checkSlotForDate(newDate, selectedTimeSlot);
    }
  };

  // Reactive time slot change handler
  const handleTimeSlotChange = (newSlot: string) => {
    setSelectedTimeSlot(newSlot);
    const found = slotAvailability.find(s => s.slot === newSlot);
    if (found && found.isFull) {
      setSlotWarning('The slots are filled, please select another slot.');
    } else {
      setSlotWarning('');
    }
  };

  const currentSlotInfo = slotAvailability.find(s => s.slot === selectedTimeSlot);
  const isCurrentSlotFull = !loadingSlots && Boolean(currentSlotInfo?.isFull);

  // Helper to find project
  const findProject = (query: string): Project => {
    if (!query) return PROJECTS[0];
    const match =
      PROJECTS.find(p => p.title.toLowerCase() === query.toLowerCase() || p.id === query) ||
      PROJECTS.find(p => p.title.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(p.title.toLowerCase())) ||
      PROJECTS[0];
    return match;
  };

  const currentProject = findProject(selectedProjectTitle);

  // Sync initial project when opened
  useEffect(() => {
    if (initialProject) {
      const matched = findProject(initialProject);
      setSelectedProjectTitle(matched.title);
    }
  }, [initialProject, isOpen]);

  // Smooth entry/exit animation
  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        setShow(false);
        // Reset confirmation state on exit after transition
        setStatus('idle');
        setConfirmedBooking(null);
      }, 300);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentSlotFull) {
      setSlotWarning('The slots are filled, please select another slot.');
      return;
    }

    setStatus('sending');
    setSlotWarning('');

    const bookingRef = 'HH-V' + Math.floor(1000 + Math.random() * 9000);
    const visitorName = formData.name.trim() || userName || 'Valued Client';
    const visitorPhone = formData.phone.trim();
    const tourDate = formData.visitDate;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visitorName,
          phone: visitorPhone || '0000000000',
          visitDate: tourDate,
          timeSlot: selectedTimeSlot,
          interest: `Site Visit: ${currentProject.category}`,
          projectTitle: currentProject.title,
          projectImage: currentProject.image,
          projectId: currentProject.id,
          message: `Booking Ref: ${bookingRef} | Project: [${currentProject.title}] (${currentProject.location}) | Preferred Date: ${tourDate} | Preferred Time: ${selectedTimeSlot}${formData.message ? ` | Notes: ${formData.message}` : ''}`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const registeredName = data.user?.name || visitorName;
        if (visitorPhone) {
          registerUser(registeredName, visitorPhone);
        }

        const confirmed: ConfirmedBooking = {
          refId: bookingRef,
          projectName: currentProject.title,
          visitorName: registeredName,
          phone: visitorPhone,
          visitDate: tourDate,
          timeSlot: selectedTimeSlot,
          message: formData.message,
          project: currentProject
        };
        setConfirmedBooking(confirmed);

        if (data.existing) {
          setWelcomeMessage(data.message || 'VIP visit record updated successfully.');
          setStatus('existing');
        } else {
          setStatus('sent');
        }
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        if (data.slotFull) {
          setSlotWarning(data.message || 'The slots are filled, please select another slot.');
          setStatus('idle');
        } else {
          setStatus('duplicate');
          if (visitorPhone) registerUser(visitorName, visitorPhone);
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date to be coordinated';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const isConfirmed = (status === 'sent' || status === 'existing') && confirmedBooking;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center px-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-lg bg-white p-5 sm:p-7 md:p-8 rounded-[24px] md:rounded-[32px] shadow-[0px_30px_60px_rgba(0,0,0,0.35)] transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95 opacity-0'} max-h-[92vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-variant text-on-surface-variant transition-colors z-10"
          aria-label="Close form"
        >
          <span className="material-symbols-outlined text-[16px] md:text-[20px]">close</span>
        </button>

        {/* ─────────────────────────────────────────────────────────────
            VIEW 1: CONFIRMATION RECEIPT (After User Fills Form)
           ───────────────────────────────────────────────────────────── */}
        {isConfirmed ? (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Success Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[30px] md:text-[36px]">verified</span>
              </div>
              <span className="font-label-sm text-[10px] sm:text-xs text-emerald-700 font-bold uppercase tracking-widest block">
                VIP Site Visit Confirmed
              </span>
              <h2 className="font-headline-sm text-xl sm:text-2xl text-primary font-bold">
                {confirmedBooking.projectName}
              </h2>
              <p className="text-on-surface-variant text-xs sm:text-sm max-w-sm mx-auto">
                {status === 'existing'
                  ? (welcomeMessage || 'Your visit booking has been updated.')
                  : 'Your guided VIP property tour has been scheduled successfully.'}
              </p>
            </div>

            {/* Project Showcase Card with Authentic Real Photo */}
            <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="relative h-44 sm:h-52 w-full bg-surface-variant overflow-hidden">
                <img
                  src={confirmedBooking.project.image}
                  alt={confirmedBooking.project.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = confirmedBooking.project.fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="bg-white/95 backdrop-blur-md text-primary font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                    {confirmedBooking.project.category}
                  </span>
                  <span className="bg-primary text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                    {confirmedBooking.project.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] text-tertiary-fixed font-mono uppercase tracking-wider block">
                    TS-RERA: {confirmedBooking.project.rera}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg leading-tight drop-shadow-md">
                    {confirmedBooking.project.title}
                  </h3>
                  <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5 drop-shadow">
                    <span className="material-symbols-outlined text-[14px] text-tertiary-fixed shrink-0">location_on</span>
                    {confirmedBooking.project.location}
                  </p>
                </div>
              </div>

              {/* Key Specs Bar */}
              <div className="p-3 bg-surface-container-low/70 grid grid-cols-3 gap-2 border-b border-outline-variant/20 text-center">
                <div>
                  <span className="text-[9px] uppercase text-on-surface-variant block font-medium">Price</span>
                  <span className="text-xs font-bold text-emerald-700 block truncate">{confirmedBooking.project.price}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-on-surface-variant block font-medium">Configuration</span>
                  <span className="text-xs font-bold text-primary block truncate">{confirmedBooking.project.type}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-on-surface-variant block font-medium">Possession</span>
                  <span className="text-xs font-bold text-primary block truncate">{confirmedBooking.project.possession}</span>
                </div>
              </div>

              {/* Booking Pass Details */}
              <div className="p-4 space-y-3 bg-white">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Visitor Name</span>
                    <span className="font-bold text-primary truncate block text-xs sm:text-sm">
                      {confirmedBooking.visitorName}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Phone Number</span>
                    <span className="font-bold text-primary truncate block text-xs sm:text-sm">
                      +91 {confirmedBooking.phone || 'On file'}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Scheduled Date</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs sm:text-sm truncate">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {formatDate(confirmedBooking.visitDate)}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Pass Reference</span>
                    <span className="font-mono font-bold text-primary text-xs sm:text-sm">
                      #{confirmedBooking.refId}
                    </span>
                  </div>
                </div>

                {confirmedBooking.message && (
                  <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20 text-xs">
                    <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Special Requests</span>
                    <p className="text-on-surface text-xs italic mt-0.5">"{confirmedBooking.message}"</p>
                  </div>
                )}

                {/* VIP Perks */}
                <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 text-[11px] text-emerald-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700">directions_car</span>
                    <span>Complimentary AC Chauffeur Cab Pickup Included</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-emerald-900/85 pl-6">
                    Our Senior Property Specialist will call you within 30 minutes to confirm your pickup address and share the detailed project brochure & site plan.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setStatus('idle');
                  setConfirmedBooking(null);
                  setFormData({ name: '', phone: '', visitDate: '', message: '' });
                }}
                className="flex-1 py-3 border border-outline-variant/50 rounded-xl text-xs font-bold text-primary hover:bg-surface transition-colors"
              >
                Schedule Another Visit
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              VIEW 2: BOOKING FORM WITH REAL-TIME PROJECT PREVIEW
             ───────────────────────────────────────────────────────────── */
          <div>
            <div className="space-y-1.5 mb-4 text-center">
              <span className="font-label-sm text-[9px] md:text-xs text-tertiary uppercase tracking-widest block font-bold">
                VIP Guided Tour
              </span>
              <h2 className="font-headline-sm text-lg md:text-2xl text-primary font-bold">
                Schedule a Site Visit
              </h2>
              <p className="text-on-surface-variant text-xs md:text-sm">
                Experience Hyderabad’s landmark real estate firsthand with complimentary chauffeur pickup.
              </p>
            </div>

            {/* Registered User Welcome Banner */}
            {isRegistered && (
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 mb-4 text-center">
                <span className="text-xs font-bold text-primary block">
                  Welcome back, {userName}!
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  Your contact details are saved. Select your tour date and project below.
                </p>
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {/* Project Selector Dropdown */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px] text-primary">apartment</span>
                  Select Landmark Project ({PROJECTS.length} Available)
                </label>
                <select
                  value={currentProject.title}
                  onChange={(e) => setSelectedProjectTitle(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/40 rounded-[10px] md:rounded-[12px] p-2.5 text-base sm:text-xs font-medium text-primary focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                  required
                >
                  {(['Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'] as const).map((cat) => (
                    <optgroup key={cat} label={`── ${cat} (${PROJECTS.filter(p => p.category === cat).length}) ──`}>
                      {PROJECTS.filter((p) => p.category === cat).map((p) => (
                        <option key={p.id} value={p.title}>
                          {getShortProjectName(p)} • {p.price.split('-')[0].trim()}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* 🌟 Dynamic Project Preview Card (Image + Specs of Interested Project) 🌟 */}
              <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-2xl p-2.5 sm:p-3 flex gap-3 items-center shadow-sm">
                <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-variant">
                  <img
                    src={currentProject.image}
                    alt={currentProject.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = currentProject.fallbackImage;
                    }}
                  />
                  <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                    {currentProject.category}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {currentProject.badge}
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-mono">
                      RERA: {currentProject.rera}
                    </span>
                  </div>
                  <h4 className="font-bold text-primary text-xs sm:text-sm truncate">
                    {currentProject.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[13px] text-tertiary shrink-0">location_on</span>
                    {currentProject.location}
                  </p>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs font-bold text-emerald-700">
                      {currentProject.price}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/80 font-medium truncate max-w-[120px]">
                      {currentProject.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visitor Details (Only required if not registered) */}
              {!isRegistered && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Your Full Name</label>
                    <input
                      className="w-full bg-surface border border-outline-variant/30 rounded-[10px] p-2.5 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                      placeholder="e.g. Ramesh Varma"
                      type="text"
                      pattern="[A-Za-z\s]{3,50}"
                      title="Name must contain only alphabets and spaces (min 3 characters)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Mobile Number</label>
                    <input
                      className="w-full bg-surface border border-outline-variant/30 rounded-[10px] p-2.5 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                      placeholder="9876543210"
                      type="tel"
                      pattern="(\+91)?[0-9]{10}"
                      title="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Tour Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs flex items-center justify-between">
                    <span>Preferred Date</span>
                    <span className="text-tertiary text-[9px] lowercase font-normal">reschedule free</span>
                  </label>
                  <input
                    className="w-full bg-surface border border-outline-variant/30 rounded-[10px] p-2.5 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.visitDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs flex items-center justify-between">
                    <span>Time Slot</span>
                    <span className="text-tertiary text-[9px] lowercase font-bold">max 2 leads/slot</span>
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => handleTimeSlotChange(e.target.value)}
                    className={`w-full bg-surface border rounded-[10px] p-2.5 text-base sm:text-xs focus:ring-2 min-h-[44px] ${
                      isCurrentSlotFull
                        ? 'border-red-500 bg-red-50/70 text-red-900 font-bold focus:ring-red-300'
                        : 'border-outline-variant/30 text-primary focus:ring-primary/20'
                    }`}
                  >
                    {STANDARD_SLOTS.map((slot) => {
                      const info = slotAvailability.find(s => s.slot === slot);
                      const isFull = Boolean(info?.isFull);
                      return (
                        <option key={slot} value={slot}>
                          {slot} {isFull ? '• (FULL - 2/2 🔒)' : info ? `• (${info.remaining}/2 Left)` : ''}
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

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Special Requests / Pickup Address (Optional)</label>
                <input
                  className="w-full bg-surface border border-outline-variant/30 rounded-[10px] p-2.5 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                  placeholder="e.g. Need cab pickup from Gachibowli, prefer weekend morning"
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={status === 'sending' || loadingSlots || isCurrentSlotFull}
                className="w-full bg-tertiary text-on-tertiary py-3.5 px-4 rounded-[12px] font-label-sm text-xs md:text-sm uppercase tracking-wider font-bold hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 min-h-[46px]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCurrentSlotFull ? 'block' : 'verified'}
                </span>
                {status === 'sending'
                  ? 'Scheduling Your Visit...'
                  : loadingSlots
                  ? 'Checking Slot Availability...'
                  : isCurrentSlotFull
                  ? 'Slot Filled • Please Select Another Slot'
                  : `Confirm VIP Visit for ${currentProject.title.split(' ')[0]}`}
              </button>

              {status === 'error' && (
                <p className="text-error text-xs text-center mt-2 font-medium">
                  Something went wrong. Please check your phone number and try again.
                </p>
              )}
              {status === 'duplicate' && (
                <p className="text-primary text-xs text-center mt-2 font-bold">
                  You are already registered! Our concierge is assigning your relationship manager.
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
