import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { navigateTo } from '../utils/navigation';
import { BrandLogo } from './BrandLogo';

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
    <footer className="bg-primary text-on-primary py-8 sm:py-12 border-t border-primary-container/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-gutter">
          <div className="space-y-3 md:space-y-6">
            <BrandLogo size="md" variant="light" showTagline={true} />
            <p className="text-primary-fixed-dim/80 text-xs sm:text-[10px] md:text-sm max-w-xs leading-relaxed">
              Defining luxury living in the city of pearls. Our mission is to provide the highest standard of living through architectural excellence and sustainable urban planning.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-gutter md:col-span-2">
            <div className="space-y-2 md:space-y-6">
              <h4 className="font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed font-bold">Quick Links</h4>
              <ul className="space-y-2 text-xs md:text-sm">
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#home">Home</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#projects">Projects</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#collections">Collections</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1" href="#about">About Us</a></li>
                <li><a className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1 font-semibold" href="/admin">Admin Portal</a></li>
              </ul>
            </div>
            <div className="space-y-2 md:space-y-6">
              <h4 className="font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed font-bold">Legal & Compliance</h4>
              <ul className="space-y-2 text-xs md:text-sm">
                <li>
                  <button 
                    onClick={() => navigateTo('/privacy-policy')}
                    className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1 text-left"
                  >
                    Privacy Policy (DPDPA 2023)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('/terms-of-service')}
                    className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1 text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('/rera-compliance')}
                    className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1 text-left"
                  >
                    RERA Compliance (TS-RERA)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo('/contact-us')}
                    className="text-primary-fixed-dim/80 hover:text-primary-fixed active:text-primary-fixed transition-all hover:translate-x-1 active:translate-x-1 inline-block touch-manipulation py-1 text-left"
                  >
                    Contact Us & Grievance Desk
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-2 md:space-y-6">
            <h4 className="font-label-sm text-[10px] md:text-xs uppercase tracking-[0.2em] text-tertiary-fixed font-bold">Site Visit Hotline</h4>
            <div className="bg-primary-container p-4 md:p-6 rounded-[16px] md:rounded-[20px] border border-primary-fixed/10">
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <span className="material-symbols-outlined text-tertiary-fixed text-[18px] md:text-[24px]">phone_in_talk</span>
                <span className="font-bold text-base md:text-xl">+91 91234 56789</span>
              </div>
              <p className="text-xs md:text-xs opacity-70">Mon - Sat: 10:00 AM - 7:00 PM</p>
              <button 
                onClick={handleCallbackRequest}
                disabled={status === 'sending' || status === 'sent'}
                className="w-full mt-3 md:mt-4 bg-tertiary-fixed text-on-tertiary-fixed py-3 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-70 transition-all hover:bg-tertiary-fixed/90 min-h-[44px]"
              >
                {resolveButtonText()}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-16 pt-4 md:pt-8 border-t border-primary-container/30 flex flex-col md:flex-row justify-between items-center gap-3 text-[9px] md:text-xs opacity-70">
          <div className="text-center md:text-left space-y-0.5">
            <p>© 2024–2026 Hyderabad Homes Pvt. Ltd. All Rights Reserved.</p>
            <p className="text-[10px] text-tertiary-fixed/80">TSRERA Agent Reg No: A02400000412 • CIN: U70109TG2020PTC145892</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-[10px]">
            <p>Constitution of India & DPDPA Compliant</p>
            <p>ISO 9001:2015 Certified</p>
            <p>Financial District, Hyderabad</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
