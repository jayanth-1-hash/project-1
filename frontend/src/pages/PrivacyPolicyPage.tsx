import { useEffect } from 'react';
import { navigateTo } from '../utils/navigation';
import { BrandLogo } from '../components/BrandLogo';

export function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy • Hyderabad Homes Legal & Compliance';
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1E2522] flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* ─── LUXURY TOP NAVBAR ────────────────────────────────────────────── */}
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

          {/* Quick Legal Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px] hidden md:flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>DPDPA 2023 & IT Act Compliant</span>
            </span>
            <button
              onClick={() => navigateTo('/terms-of-service')}
              className="text-on-surface-variant hover:text-primary px-2.5 py-1.5 font-semibold text-xs transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo('/rera-compliance')}
              className="text-on-surface-variant hover:text-primary px-2.5 py-1.5 font-semibold text-xs transition-colors"
            >
              RERA Compliance
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
            <span className="material-symbols-outlined text-[16px]">policy</span>
            <span>Statutory Privacy Charter</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy & Data Protection Charter
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Governed under the Digital Personal Data Protection Act, 2023 (DPDPA 2023), Information Technology Act, 2000 (Section 43A), and Article 21 of the Constitution of India.
          </p>
          <div className="text-[11px] text-white/60 pt-2 flex items-center gap-4 flex-wrap">
            <span>Effective Date: 1st January 2024</span>
            <span>•</span>
            <span>Last Updated: 22nd October 2026</span>
            <span>•</span>
            <span>Jurisdiction: Hyderabad, Telangana, India</span>
          </div>
        </div>
      </section>

      {/* ─── MAIN LEGAL DOCUMENT BODY ────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-14 space-y-8 sm:space-y-10 leading-relaxed text-xs sm:text-sm text-on-surface">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">01.</span>
            <span>Constitutional & Legislative Framework</span>
          </h2>
          <p>
            Hyderabad Homes Pvt. Ltd. ("Hyderabad Homes", "We", "Our", or "Company") is deeply committed to upholding your constitutional right to privacy as guaranteed under <strong>Article 21 of the Constitution of India</strong> and affirmed by the Hon'ble Supreme Court of India in <em>Justice K.S. Puttaswamy (Retd.) v. Union of India (2017)</em>.
          </p>
          <p>
            This Privacy Policy strictly adheres to the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>, the <strong>Information Technology Act, 2000 (IT Act)</strong>, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Real Estate (Regulation and Development) Act, 2016 (RERA).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">02.</span>
            <span>Data Fiduciary Identity & Scope</span>
          </h2>
          <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 space-y-1.5 text-xs">
            <div><strong>Entity Name:</strong> Hyderabad Homes Real Estate Advisory Private Limited</div>
            <div><strong>Corporate Identity Number (CIN):</strong> U70109TG2020PTC145892</div>
            <div><strong>TSRERA Registration Certificate:</strong> A02400000412</div>
            <div><strong>Registered Office:</strong> Level 14, One West Building, Financial District, Gachibowli, Hyderabad, Telangana - 500032, India</div>
            <div><strong>Official Email:</strong> privacy@hyderabadhomes.com</div>
          </div>
          <p>
            This policy applies to all visitors, buyers, NRI investors, channel partners, and users accessing our portal (www.hyderabadhomes.com), our mobile web applications, customer care hotlines, and site visit coordination services.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">03.</span>
            <span>Information We Collect (Digital Personal Data)</span>
          </h2>
          <p>We only collect personal data necessary for facilitating genuine real estate transactions and site visits:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Identity & Contact Data:</strong> Full legal name, verified mobile phone number, WhatsApp contact handle, and email address.</li>
            <li><strong>Property Interest Data:</strong> Selected project categories (Towers, Apartments, Villas, Houses, Ventures), preferred unit configuration (3 BHK, 4 BHK, Villa), and target budget bracket.</li>
            <li><strong>Site Visit Logistics Data:</strong> Preferred visit date, 2-hour VIP time slot, pickup/drop location for complimentary chauffeur travel, and customer special requests.</li>
            <li><strong>Technical & Telemetry Data:</strong> IP address, device type, browser fingerprint, operating system, and timestamp logs captured in accordance with Indian cybersecurity guidelines (CERT-In mandates).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">04.</span>
            <span>Lawful Purpose & Specific Consent (Section 6, DPDPA 2023)</span>
          </h2>
          <p>
            Under Section 6 of the Digital Personal Data Protection Act, 2023, your personal data is processed strictly on the basis of your explicit, informed, and affirmative consent for specified lawful purposes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <span className="font-bold text-primary text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                Site Tour Facilitation
              </span>
              <p className="text-[11px] text-on-surface-variant">To schedule guided VIP site visits, allocate vehicle chauffeuring, and adhere to our strict 2-leads-per-slot capacity limit.</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <span className="font-bold text-primary text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                RERA Advisory Disclosures
              </span>
              <p className="text-[11px] text-on-surface-variant">To share verified TS-RERA sanction certificates, floor layouts, price sheets, and bank approval sanctions.</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <span className="font-bold text-primary text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                Statutory Regulatory Filing
              </span>
              <p className="text-[11px] text-on-surface-variant">To maintain verified lead manifests mandated under Telangana State Real Estate Regulatory Authority regulations.</p>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <span className="font-bold text-primary text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                Zero Spam & No Sale of Data
              </span>
              <p className="text-[11px] text-on-surface-variant">We NEVER sell, lease, rent, or trade your personal information to third-party telemarketers or external advertising networks.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">05.</span>
            <span>Your Statutory Rights as a Data Principal (DPDPA 2023)</span>
          </h2>
          <p>As a Data Principal under Indian law, you are entitled to exercise the following enforceable rights:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Right to Access Information (Section 11):</strong> You may request a complete summary of your personal data processed by us and the identity of developers with whom it has been shared.</li>
            <li><strong>Right to Correction & Erasure (Section 12):</strong> You may request correction of inaccurate phone numbers, names, or the permanent deletion of your site visit inquiry records from our database.</li>
            <li><strong>Right to Grievance Redressal (Section 13):</strong> You have the right to swift resolution of any privacy complaint by our designated Grievance Officer within 30 days.</li>
            <li><strong>Right to Nominate (Section 14):</strong> You may nominate an individual who, in the event of death or incapacity, shall exercise your rights.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">06.</span>
            <span>Reasonable Security Practices (Section 43A, IT Act)</span>
          </h2>
          <p>
            We implement comprehensive technical and organizational security controls compliant with ISO/IEC 27001 standards. All booking inquiries, contact phone numbers, and communication channels are protected by AES-256 bit encryption at rest and TLS 1.3 encryption in transit. Administrative access to the Hyderabad Homes Command Center is restricted via multi-factor authentication and strict authorization barriers.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">07.</span>
            <span>Statutory Grievance Redressal Officer (IT Rules, 2021)</span>
          </h2>
          <p>
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the DPDPA 2023, the details of our Grievance Redressal Officer are published below:
          </p>
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 sm:p-5 rounded-2xl space-y-2 text-xs text-emerald-950">
            <div className="font-bold text-emerald-900 text-sm">Mr. K. Sreenivasulu, Advocate & Compliance Officer</div>
            <div><strong>Designation:</strong> Chief Data Protection & Grievance Redressal Officer</div>
            <div><strong>Office:</strong> Hyderabad Homes Corporate Legal Cell, Level 14, One West, Financial District, Hyderabad - 500032</div>
            <div><strong>Direct Grievance Desk:</strong> +91 40 4892 7800 (Mon-Fri, 10:00 AM - 5:00 PM IST)</div>
            <div><strong>Email:</strong> grievance@hyderabadhomes.com</div>
            <p className="text-[11px] text-emerald-800 pt-1">
              All grievances submitted will be acknowledged within 24 hours with an official ticket reference and redressed within 15 to 30 statutory days.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">08.</span>
            <span>Governing Law & Jurisdiction</span>
          </h2>
          <p>
            This Privacy Policy shall be governed by, and construed in accordance with, the laws of the Republic of India. Any legal action or dispute arising out of or relating to this policy shall be subject to the exclusive jurisdiction of the competent Courts at <strong>Hyderabad, Telangana, India</strong>.
          </p>
        </section>

        {/* Bottom Navigation CTAs */}
        <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigateTo('/terms-of-service')}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-tertiary transition-colors"
          >
            <span>Proceed to Terms of Service</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            onClick={() => navigateTo('/contact-us')}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-tertiary transition-all"
          >
            <span>Contact Legal Team</span>
            <span className="material-symbols-outlined text-[16px]">mail</span>
          </button>
        </div>
      </main>
    </div>
  );
}