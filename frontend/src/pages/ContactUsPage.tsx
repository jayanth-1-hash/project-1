import { useState, useEffect } from 'react';
import { PROJECTS, getShortProjectName } from '../data/projects';
import { navigateTo } from '../utils/navigation';
import { useUser } from '../contexts/UserContext';
import { BrandLogo } from '../components/BrandLogo';

export function ContactUsPage() {
  const { userName, userPhone, registerUser } = useUser();
  const [formData, setFormData] = useState({
    name: userName || '',
    phone: userPhone || '',
    projectTitle: PROJECTS[0].title,
    preferredDate: '',
    timeSlot: '10:00 AM - 12:00 PM',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [ticketRef, setTicketRef] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Contact Us & Statutory Grievance Desk • Hyderabad Homes';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setStatus('sending');
    const ref = `HH-INQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          visitDate: formData.preferredDate || 'Not specified',
          timeSlot: formData.timeSlot,
          interest: `Direct Portal Contact: [${formData.projectTitle}]`,
          projectTitle: formData.projectTitle,
          message: `Inquiry Ref: ${ref} | Project: [${formData.projectTitle}] | Preferred Time: ${formData.timeSlot} | Message: ${formData.message || 'General legal & advisory inquiry'}`
        })
      });

      if (res.ok) {
        registerUser(formData.name, formData.phone);
        setTicketRef(ref);
        setStatus('sent');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1E2522] flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* ─── TOP NAVBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-tertiary bg-surface-container/60 hover:bg-surface-container px-3.5 py-2 rounded-xl transition-all border border-outline-variant/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Home</span>
            </button>
            <div className="h-6 w-px bg-outline-variant/30 hidden sm:block" />
            <div className="hidden sm:flex items-center">
              <BrandLogo size="sm" variant="dark" showTagline={false} />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full text-[10px] hidden sm:flex items-center gap-1 border border-emerald-300">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Official Advisory HQ</span>
            </span>
          </div>
        </div>
      </header>

      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Corporate Headquarters & Grievance Redressal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Contact Hyderabad Homes
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Connect with our Senior Real Estate Advisory Officers, schedule guided property site inspections, or submit statutory consumer inquiries under the Indian regulatory framework.
          </p>
          <div className="text-[11px] text-white/60 pt-2 flex items-center gap-4 flex-wrap">
            <span>CIN: U70109TG2020PTC145892</span>
            <span>•</span>
            <span>TSRERA Agent Reg: A02400000412</span>
            <span>•</span>
            <span>Operating Hours: Mon - Sat: 9:30 AM - 7:00 PM IST</span>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-14 space-y-10 sm:space-y-12 leading-relaxed text-xs sm:text-sm">
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
            </div>
            <div>
              <h3 className="font-bold text-primary text-sm">Registered Corporate Office</h3>
              <p className="text-on-surface-variant text-xs mt-1">
                Level 14, One West Building, Financial District, Gachibowli, Hyderabad, Telangana - 500032, India.
              </p>
            </div>
            <div className="text-[11px] text-tertiary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>Opp. Waverock & US Consulate</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">phone_in_talk</span>
            </div>
            <div>
              <h3 className="font-bold text-primary text-sm">Site Visit & Advisory Hotline</h3>
              <p className="text-on-surface-variant text-xs mt-1">
                Direct phone consultations, VIP chauffeur pickup coordination, and price sheet inquiries.
              </p>
            </div>
            <div className="space-y-1 pt-1 text-xs">
              <a href="tel:+919123456789" className="font-bold text-emerald-800 hover:underline block font-mono">
                +91 91234 56789
              </a>
              <a href="tel:+914048927800" className="text-on-surface-variant hover:underline block font-mono">
                +91 40 4892 7800 (Boardline)
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
            </div>
            <div>
              <h3 className="font-bold text-primary text-sm">Official Electronic Desks</h3>
              <p className="text-on-surface-variant text-xs mt-1">
                Statutory communications, NRI investment desk, and official developer inquiries.
              </p>
            </div>
            <div className="space-y-1 pt-1 text-xs">
              <a href="mailto:advisory@hyderabadhomes.com" className="font-bold text-primary hover:underline block">
                advisory@hyderabadhomes.com
              </a>
              <a href="mailto:grievance@hyderabadhomes.com" className="text-emerald-800 hover:underline block">
                grievance@hyderabadhomes.com
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Contact & Advisory Form */}
        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm p-6 sm:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1.5">
              <span className="font-label-sm text-[10px] uppercase tracking-widest text-tertiary font-bold">
                Fast-Track Advisory Response
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Send an Inquiry or Schedule a Tour
              </h2>
              <p className="text-xs text-on-surface-variant">
                Our Senior Property Specialist will respond within 30 minutes with official RERA dossiers and price breakdowns.
              </p>
            </div>

            {status === 'sent' ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <h3 className="text-base font-bold text-emerald-950">Inquiry Docket Registered</h3>
                <p className="text-xs text-emerald-900">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry reference is <span className="font-mono font-bold">{ticketRef}</span>. A Senior Relationship Manager will connect with you via +91 {formData.phone} shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-primary uppercase">Select Project of Interest</label>
                  <select
                    value={formData.projectTitle}
                    onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs font-medium text-primary focus:outline-none focus:border-primary min-h-[44px]"
                  >
                    {(['Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'] as const).map(cat => (
                      <optgroup key={cat} label={`── ${cat} ──`}>
                        {PROJECTS.filter(p => p.category === cat).map(p => (
                          <option key={p.id} value={p.title}>
                            {getShortProjectName(p)} • {p.price.split('-')[0].trim()}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Varma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      pattern="(\+91)?[0-9]{10}"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase">Preferred Date (Optional)</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase">Preferred Time Slot</label>
                    <select
                      value={formData.timeSlot}
                      onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:outline-none focus:border-primary min-h-[44px]"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning)</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Noon)</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-primary uppercase">Special Inquiries or Cab Address (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Requesting price sheet and layout floor plan, cab pickup from Jubilee Hills"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-base sm:text-xs focus:outline-none focus:border-primary min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-primary hover:bg-tertiary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 min-h-[48px]"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{status === 'sending' ? 'Submitting Inquiry...' : 'Submit Advisory Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ─── STATUTORY GRIEVANCE REDRESSAL OFFICER ────────────────────── */}
        <section className="bg-emerald-50/70 border border-emerald-200/80 p-6 sm:p-7 rounded-3xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2 border-b border-emerald-200/60 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Statutory Redressal Mechanism • Rule 3(2), IT Rules 2021
              </span>
              <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                Official Grievance Redressal Officer
              </h3>
            </div>
            <span className="bg-emerald-200/80 text-emerald-950 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
              DPDPA 2023 Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-950">
            <div>
              <p className="font-bold text-sm">Mr. K. Sreenivasulu, Advocate</p>
              <p className="text-[11px] text-emerald-800">Chief Compliance & Consumer Grievance Officer</p>
              <p className="mt-2 text-xs">
                Hyderabad Homes Legal Department, Level 14, One West, Financial District, Hyderabad - 500032.
              </p>
            </div>
            <div className="space-y-1.5">
              <div><strong>Grievance Email:</strong> grievance@hyderabadhomes.com</div>
              <div><strong>Direct Telephone:</strong> +91 40 4892 7800</div>
              <div><strong>Desk Hours:</strong> Monday through Friday, 10:00 AM to 5:00 PM IST</div>
              <div><strong>Statutory Timeline:</strong> Acknowledgment within 24 hours; final redressal within 15 to 30 days.</div>
            </div>
          </div>
        </section>

        {/* Legal Link Footer Switcher */}
        <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('/privacy-policy')} className="hover:text-primary font-semibold">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => navigateTo('/terms-of-service')} className="hover:text-primary font-semibold">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navigateTo('/rera-compliance')} className="hover:text-primary font-semibold">RERA Compliance</button>
          </div>
          <p>© 2024–2026 Hyderabad Homes Pvt. Ltd. All Rights Reserved.</p>
        </div>
      </main>
    </div>
  );
}