import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { PROJECTS, getShortProjectName, type Project } from '../data/projects';

export function ContactSection() {
  const { userName, registerUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    projectTitle: PROJECTS[0].title,
    budget: '₹1.5 Cr - ₹3 Cr',
    visitDate: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'duplicate' | 'existing'>('idle');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [lastSubmission, setLastSubmission] = useState<{
    refId: string;
    name: string;
    phone: string;
    project: Project;
    visitDate: string;
    budget: string;
    message?: string;
  } | null>(null);

  const sectionRef = useRef<HTMLElement>(null);

  // Find project object
  const currentProject: Project =
    PROJECTS.find(p => p.title.toLowerCase() === formData.projectTitle.toLowerCase() || p.id === formData.projectTitle) ||
    PROJECTS[0];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const refId = 'HH-INQ' + Math.floor(1000 + Math.random() * 9000);
    const clientName = formData.name.trim() || userName || 'Valued Client';
    const clientPhone = formData.phone.trim();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          phone: clientPhone || '0000000000',
          interest: `Project Inquiry: ${currentProject.title}`,
          projectTitle: currentProject.title,
          projectImage: currentProject.image,
          projectId: currentProject.id,
          budget: formData.budget,
          visitDate: formData.visitDate || 'Not specified',
          message: `[Ref: ${refId}] Interested in ${currentProject.title} (${currentProject.category}) | Budget: ${formData.budget}${formData.message ? ` | Notes: ${formData.message}` : ''}`
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const registeredName = data.user?.name || clientName;
        if (clientPhone) {
          registerUser(registeredName, clientPhone);
        }

        setLastSubmission({
          refId,
          name: registeredName,
          phone: clientPhone,
          project: currentProject,
          visitDate: formData.visitDate,
          budget: formData.budget,
          message: formData.message
        });

        if (data.existing) {
          setWelcomeMessage(data.message || 'Your inquiry details have been refreshed.');
          setStatus('existing');
        } else {
          setStatus('sent');
        }
      } else if (res.status === 409) {
        setStatus('duplicate');
        if (clientPhone) registerUser(clientName, clientPhone);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const isConfirmed = (status === 'sent' || status === 'existing') && lastSubmission;

  return (
    <section
      ref={sectionRef}
      className="py-section-gap-mobile lg:py-section-gap-desktop max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
      id="contact"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Column: Office info & Map */}
        <div className="space-y-8 md:space-y-10">
          <div className="space-y-2 md:space-y-3">
            <span className="font-label-sm text-[10px] md:text-xs text-tertiary uppercase tracking-widest font-bold">Get In Touch</span>
            <h2 className="font-headline-lg text-2xl md:text-4xl text-primary font-bold leading-tight">
              We're Here to Help You Find Your Next Property
            </h2>
            <p className="text-on-surface-variant text-xs md:text-sm">
              Schedule a personalized walkthrough or consult with our advisory team regarding RERA approvals and investment outlooks.
            </p>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div className="flex gap-4 md:gap-5 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px] md:text-[24px]">location_on</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm md:text-base text-primary">Corporate Office</h4>
                <p className="text-xs md:text-sm text-on-surface-variant">#2-293/82/A/1130, Road No. 36,<br />Jubilee Hills, Hyderabad - 500033</p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-5 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px] md:text-[24px]">call</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm md:text-base text-primary">Direct Concierge</h4>
                <p className="text-xs md:text-sm text-on-surface-variant">+91 91234 56789</p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-5 items-start">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px] md:text-[24px]">mail</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm md:text-base text-primary">Email Inquiries</h4>
                <p className="text-xs md:text-sm text-on-surface-variant">concierge@hyderabadhomes.com</p>
              </div>
            </div>
          </div>

          <div className="h-[200px] lg:h-[230px] rounded-[20px] overflow-hidden shadow-inner border border-outline-variant/40">
            <iframe
              className="w-full h-full border-none"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3263057193565!2d78.40131491533038!3d17.444093888044703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9166f2c01991%3A0xe54d580af6235b0b!2sJubilee%20Hills%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1688537000000!5m2!1sen!2sin"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            />
          </div>
        </div>

        {/* Right Column: Contact Form with Live Project Preview & Confirmation Receipt */}
        <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-[24px] md:rounded-[36px] shadow-[0px_20px_50px_rgba(0,48,32,0.08)] border border-surface-container">
          {isConfirmed ? (
            /* 🌟 Confirmed Inquiry Details with Real Project Photo 🌟 */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">verified</span>
                </div>
                <span className="font-label-sm text-xs text-emerald-700 font-bold uppercase tracking-widest block">
                  Inquiry Registered
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-primary">
                  {lastSubmission.project.title}
                </h3>
                <p className="text-on-surface-variant text-xs sm:text-sm">
                  {status === 'existing'
                    ? (welcomeMessage || 'Your inquiry profile has been updated.')
                    : 'Our senior relationship advisor will connect with you within 15 minutes.'}
                </p>
              </div>

              {/* Project Card with Authentic Real Photo */}
              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="relative h-44 sm:h-48 w-full bg-surface-variant overflow-hidden">
                  <img
                    src={lastSubmission.project.image}
                    alt={lastSubmission.project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = lastSubmission.project.fallbackImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/95 text-primary font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                      {lastSubmission.project.category}
                    </span>
                    <span className="bg-primary text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                      {lastSubmission.project.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-tertiary-fixed font-mono block">
                      TS-RERA: {lastSubmission.project.rera}
                    </span>
                    <h4 className="font-bold text-base sm:text-lg leading-tight">
                      {lastSubmission.project.title}
                    </h4>
                    <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px] text-tertiary-fixed">location_on</span>
                      {lastSubmission.project.location}
                    </p>
                  </div>
                </div>

                {/* Details summary */}
                <div className="p-4 space-y-3 bg-white">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                      <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Applicant Name</span>
                      <span className="font-bold text-primary truncate block">{lastSubmission.name}</span>
                    </div>
                    <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                      <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Phone Number</span>
                      <span className="font-bold text-primary truncate block">+91 {lastSubmission.phone || 'On File'}</span>
                    </div>
                    <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                      <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Selected Budget</span>
                      <span className="font-bold text-emerald-700 truncate block">{lastSubmission.budget}</span>
                    </div>
                    <div className="bg-surface p-2.5 rounded-xl border border-outline-variant/20">
                      <span className="text-[9px] text-on-surface-variant uppercase font-medium block">Inquiry Ref</span>
                      <span className="font-mono font-bold text-primary truncate block">#{lastSubmission.refId}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-[11px] text-emerald-950 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0 mt-0.5">support_agent</span>
                    <p className="leading-relaxed">
                      A dedicated advisor specializing in <strong>{lastSubmission.project.location.split(',')[0]}</strong> has been assigned to your request.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStatus('idle');
                  setLastSubmission(null);
                  setFormData({
                    name: '',
                    phone: '',
                    projectTitle: PROJECTS[0].title,
                    budget: '₹1.5 Cr - ₹3 Cr',
                    visitDate: '',
                    message: ''
                  });
                }}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                Inquire for Another Property
              </button>
            </div>
          ) : (
            /* Contact Form with Live Selection Preview */
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-tertiary block">
                  Fast-Track Advisory
                </span>
                <h3 className="text-xl font-bold text-primary">Inquire About Any Property</h3>
              </div>

              {/* Project Selector Dropdown */}
              <div className="space-y-1">
                <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">real_estate_agent</span>
                  Select Project of Interest
                </label>
                <select
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl p-3 text-base sm:text-xs font-medium text-primary focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                >
                  {(['Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'] as const).map((cat) => (
                    <optgroup key={cat} label={`── ${cat} ──`}>
                      {PROJECTS.filter((p) => p.category === cat).map((p) => (
                        <option key={p.id} value={p.title}>
                          {getShortProjectName(p)} • {p.price.split('-')[0].trim()}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* 🌟 Dynamic Project Preview Card 🌟 */}
              <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-2xl p-2.5 sm:p-3 flex gap-3 items-center shadow-sm">
                <div className="relative w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-surface-variant">
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
                    <span className="bg-primary/10 text-primary text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
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
                    <span className="material-symbols-outlined text-[12px] text-tertiary shrink-0">location_on</span>
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

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold">Full Name</label>
                  <input
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
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
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold">Phone Number</label>
                  <input
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                    placeholder="9876543210"
                    type="tel"
                    pattern="(\+91)?[0-9]{10}"
                    title="Must be a 10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Budget & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold">Target Budget</label>
                  <select
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option>₹25L - ₹75 Lakhs</option>
                    <option>₹75L - ₹1.5 Cr</option>
                    <option>₹1.5 Cr - ₹3 Cr</option>
                    <option>₹3 Cr - ₹5 Cr</option>
                    <option>₹5 Cr+</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold">Preferred Visit Date (Optional)</label>
                  <input
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase font-bold">Message / Specific Requirements (Optional)</label>
                <textarea
                  className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                  placeholder="e.g. Inquiring for corner plot / high-floor lake facing unit..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {status === 'sending' ? 'Sending Inquiry...' : `Submit Inquiry for ${currentProject.title.split(' ')[0]}`}
              </button>

              {status === 'error' && (
                <p className="text-error text-xs text-center font-medium mt-2">
                  Something went wrong. Please verify your phone number and try again.
                </p>
              )}
              {status === 'duplicate' && (
                <p className="text-primary text-xs text-center font-bold">
                  You are already registered! Our advisor will call your registered phone shortly.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
