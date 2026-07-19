import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface SiteVisitPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiteVisitPopup({ isOpen, onClose }: SiteVisitPopupProps) {
  const { isRegistered, userName, registerUser } = useUser();
  const [formData, setFormData] = useState({ name: '', phone: '', visitDate: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'duplicate' | 'existing'>('idle');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [show, setShow] = useState(false);

  // Smooth entry/exit animation
  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setShow(false), 300); // Wait for exit animation
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, interest: 'Site Visit Booking' }),
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
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setFormData({ name: '', phone: '', visitDate: '' });
        }, 3000);
      } else if (res.status === 409) {
        setStatus('duplicate');
        registerUser(registeredName, formData.phone);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const resolveButtonText = () => {
    if (status === 'sending') return 'Booking...';
    if (status === 'sent') return '✓ Request Received!';
    if (status === 'existing') return '✓ Booking Updated';
    return 'Confirm Booking';
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={`relative w-full max-w-md bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] shadow-[0px_30px_60px_rgba(0,0,0,0.3)] transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95 opacity-0'}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-variant text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] md:text-[20px]">close</span>
        </button>

        <div className="space-y-1.5 md:space-y-2 mb-6 md:mb-8">
          <span className="font-label-sm text-[9px] md:text-xs text-tertiary uppercase tracking-widest block text-center">Exclusive Access</span>
          <h2 className="font-headline-sm text-lg md:text-2xl text-primary text-center">Book Your Site Visit</h2>
          <p className="text-on-surface-variant text-[10px] md:text-sm text-center">Schedule a personalized tour of our premium properties.</p>
        </div>

        {isRegistered ? (
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-primary mb-2">Welcome back, {userName}!</h3>
            <p className="text-on-surface-variant text-sm mb-6">We already have your details on file. Our team will contact you shortly to schedule your personalized tour.</p>
            <button onClick={onClose} className="w-full bg-tertiary text-on-tertiary py-3 md:py-4 mt-2 rounded-[10px] md:rounded-[14px] font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-md active:scale-[0.98]">
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-3 md:space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1 md:space-y-1.5">
              <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Full Name</label>
              <input className="w-full bg-surface border-none rounded-[10px] md:rounded-[12px] p-2.5 md:p-3.5 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" placeholder="John Doe" type="text" pattern="[A-Za-z\s]{3,50}" title="Name must contain only alphabets and spaces (min 3 characters)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Phone Number</label>
              <input className="w-full bg-surface border-none rounded-[10px] md:rounded-[12px] p-2.5 md:p-3.5 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" placeholder="9000000000" type="tel" pattern="[0-9]{10}" title="Must be exactly 10 digits" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <label className="font-label-sm text-on-surface-variant uppercase text-[9px] md:text-xs">Preferred Date</label>
              <input className="w-full bg-surface border-none rounded-[10px] md:rounded-[12px] p-2.5 md:p-3.5 text-[10px] md:text-sm focus:ring-2 focus:ring-primary/20" type="date" value={formData.visitDate} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })} required />
            </div>

            <button type="submit" disabled={status === 'sending' || status === 'sent'} className="w-full bg-tertiary text-on-tertiary py-3 md:py-4 mt-2 rounded-[10px] md:rounded-[14px] font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-md active:scale-[0.98] disabled:opacity-50">
              {resolveButtonText()}
            </button>
            {status === 'error' && <p className="text-error text-[10px] md:text-xs text-center mt-2">Something went wrong. Please try again.</p>}
            {status === 'duplicate' && <p className="text-error text-[10px] md:text-xs text-center mt-2 font-bold">You are already registered.</p>}
            {status === 'existing' && <p className="text-primary text-[10px] md:text-xs text-center mt-2 font-bold">{welcomeMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
