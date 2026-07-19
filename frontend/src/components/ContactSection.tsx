import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';

export function ContactSection() {
  const { isRegistered, userName, registerUser } = useUser();
  const [formData, setFormData] = useState({ name: '', phone: '', interest: 'Apartments', budget: '₹75L - ₹1.5 Cr', visitDate: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'duplicate' | 'existing'>('idle');
  const [welcomeMessage, setWelcomeMessage] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        const registeredName = data.user?.name || formData.name;
        registerUser(registeredName, formData.phone);
        if (data.existing) {
          setWelcomeMessage(data.message);
          setStatus('existing');
        } else {
          setStatus('sent');
        }
        setFormData({ name: '', phone: '', interest: 'Apartments', budget: '₹75L - ₹1.5 Cr', visitDate: '', message: '' });
      } else if (res.status === 409) {
        setStatus('duplicate');
        registerUser(formData.name, formData.phone);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const resolveButtonText = () => {
    if (status === 'sending') return 'Sending...';
    if (status === 'sent') return '✓ Inquiry Sent!';
    if (status === 'existing') return '✓ Data Updated';
    return 'Send Inquiry';
  };

  return (
    <section
      ref={sectionRef}
      className="py-section-gap-mobile lg:py-section-gap-desktop max-w-[1440px] mx-auto px-6 md:px-grid-margin opacity-0 translate-y-10 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0"
      id="contact"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <div className="space-y-12">
          <div className="space-y-2 md:space-y-4">
            <span className="font-label-sm text-[10px] md:text-xs text-tertiary uppercase tracking-widest">Get In Touch</span>
            <h2 className="font-headline-lg text-2xl md:text-4xl text-primary leading-tight">We're Here to Help You Find Your Legacy</h2>
          </div>
          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0"><span className="material-symbols-outlined text-[20px] md:text-[24px]">location_on</span></div>
              <div className="space-y-1"><h4 className="font-bold text-sm md:text-base text-primary">Corporate Office</h4><p className="text-xs md:text-sm text-on-surface-variant">#2-293/82/A/1130, Road No. 36,<br />Jubilee Hills, Hyderabad - 500033</p></div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0"><span className="material-symbols-outlined text-[20px] md:text-[24px]">call</span></div>
              <div className="space-y-1"><h4 className="font-bold text-sm md:text-base text-primary">Direct Contact</h4><p className="text-xs md:text-sm text-on-surface-variant">+91 91234 56789</p></div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shrink-0"><span className="material-symbols-outlined text-[20px] md:text-[24px]">mail</span></div>
              <div className="space-y-1"><h4 className="font-bold text-sm md:text-base text-primary">Email Inquiries</h4><p className="text-xs md:text-sm text-on-surface-variant">concierge@hyderabadhomes.com</p></div>
            </div>
          </div>
          <div className="h-[200px] lg:h-[250px] rounded-[20px] overflow-hidden shadow-inner grayscale contrast-125 border border-outline-variant">
            <iframe className="w-full h-full border-none" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.827222661234!2d78.3908533751656!3d17.42010398347344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb914666666667%3A0x6666666666666666!2sPlot%20No.%2036%2C%20Road%20No.%2045%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1715850000000!5m2!1sen!2sin" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office Location"></iframe>
          </div>
        </div>

        <div className="bg-white p-4 md:p-8 lg:p-12 rounded-[20px] md:rounded-[40px] shadow-[0px_20px_50px_rgba(0,48,32,0.08)] border border-surface-container">
          {isRegistered ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-primary mb-4">Welcome back, {userName}!</h3>
              <p className="text-on-surface-variant text-base">We already have your details on file. If you have any new inquiries, please use our chatbot or call our direct line!</p>
            </div>
          ) : (
            <form className="space-y-3 md:space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1 md:space-y-2">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Full Name</label>
                  <input className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" placeholder="John Doe" type="text" pattern="[A-Za-z\s]{3,50}" title="Name must contain only alphabets and spaces (min 3 characters)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Phone Number</label>
                  <input className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" placeholder="9000000000" type="tel" pattern="[0-9]{10}" title="Must be exactly 10 digits" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1 md:space-y-2">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Interest In</label>
                  <select className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })}>
                    <option>Apartments</option><option>Villas</option><option>Commercial</option><option>Plots</option>
                  </select>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Budget Range</label>
                  <select className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })}>
                    <option>₹75L - ₹1.5 Cr</option><option>₹1.5 Cr - ₹3 Cr</option><option>₹3 Cr - ₹5 Cr</option><option>₹5 Cr+</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Preferred Visit Date</label>
                <input className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" type="date" value={formData.visitDate} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })} />
              </div>
              <div className="space-y-1 md:space-y-2">
                <label className="font-label-sm text-[9px] md:text-xs text-on-surface-variant uppercase">Message (Optional)</label>
                <textarea className="w-full bg-surface border-none rounded-[8px] md:rounded-[12px] p-2.5 md:p-4 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20 h-24 md:h-32 resize-none" placeholder="Tell us what you're looking for..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
              </div>
              <button type="submit" disabled={status === 'sending' || status === 'sent'} className="w-full bg-primary text-white py-3 md:py-4 mt-2 rounded-[10px] md:rounded-[12px] font-bold text-xs md:text-sm hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                {resolveButtonText()}
              </button>
              {status === 'error' && <p className="text-error text-xs md:text-sm text-center font-medium mt-2">Something went wrong. Please try again.</p>}
              {status === 'duplicate' && <p className="text-error text-xs md:text-sm text-center font-bold">You are already registered.</p>}
              {status === 'existing' && <p className="text-primary text-xs md:text-sm text-center font-bold">{welcomeMessage}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
