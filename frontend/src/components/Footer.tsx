import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface FooterProps {
  onRequestCallBack?: () => void;
}

export function Footer({ onRequestCallBack }: FooterProps) {
  const { isRegistered, userName, userPhone } = useUser();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleCallbackRequest = async () => {
    if (!isRegistered) {
      if (onRequestCallBack) onRequestCallBack();
      return;
    }
    
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: userName, 
          phone: userPhone, 
          interest: 'Call Back Requested',
          budget: 'Not specified',
          visitDate: 'Not specified',
          message: 'Requested a callback from the footer hotline.' 
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const resolveButtonText = () => {
    if (status === 'sending') return 'Requesting...';
    if (status === 'sent') return '✓ Request Sent!';
    if (status === 'error') return 'Error. Try again';
    return 'Request Callback';
  };

  return (
    <footer className="bg-primary text-on-primary py-6 md:py-12 border-t border-primary-container/50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-grid-margin">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-gutter">
          <div className="space-y-2 md:space-y-6">
            <span className="font-headline-md text-base md:text-2xl text-primary-fixed block">Hyderabad Homes</span>
            <p className="text-primary-fixed-dim/80 text-[10px] md:text-sm max-w-xs leading-relaxed">
              Defining luxury living in the city of pearls. Our mission is to provide the highest standard of living through architectural excellence and sustainable urban planning.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-gutter md:col-span-2">
            <div className="space-y-2 md:space-y-6">
              <h4 className="font-label-sm text-[9px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Quick Links</h4>
              <ul className="space-y-1.5 md:space-y-3 text-[10px] md:text-sm">
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#home">Home</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#projects">Projects</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#collections">Collections</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#about">About Us</a></li>
              </ul>
            </div>
            <div className="space-y-2 md:space-y-6">
              <h4 className="font-label-sm text-[9px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Information</h4>
              <ul className="space-y-1.5 md:space-y-3 text-[10px] md:text-sm">
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#contact">Privacy Policy</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#contact">Terms of Service</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#contact">RERA Compliance</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-2 md:space-y-6">
            <h4 className="font-label-sm text-[9px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed">Site Visit Hotline</h4>
            <div className="bg-primary-container p-3 md:p-6 rounded-[12px] md:rounded-[20px] border border-primary-fixed/10">
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <span className="material-symbols-outlined text-tertiary-fixed text-[16px] md:text-[24px]">phone_in_talk</span>
                <span className="font-bold text-base md:text-xl">+91 91234 56789</span>
              </div>
              <p className="text-[9px] md:text-xs opacity-60">Mon - Sat: 10:00 AM - 7:00 PM</p>
              <button 
                onClick={handleCallbackRequest}
                disabled={status === 'sending' || status === 'sent'}
                className="w-full mt-2 md:mt-4 bg-tertiary-fixed text-on-tertiary-fixed py-2 md:py-3 rounded-[8px] md:rounded-[12px] text-[9px] md:text-xs font-bold uppercase tracking-wider disabled:opacity-70 transition-all hover:bg-tertiary-fixed/90"
              >
                {resolveButtonText()}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-16 pt-4 md:pt-8 border-t border-primary-container/30 flex flex-col md:flex-row justify-between items-center gap-3 text-[9px] md:text-xs opacity-60">
          <p className="text-center md:text-left">© 2024 Hyderabad Homes Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            <p>Designed with <span className="text-error">❤</span> in Hyderabad</p>
            <p>ISO 9001:2015 Certified</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
