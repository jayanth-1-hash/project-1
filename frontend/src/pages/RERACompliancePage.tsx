import { useEffect } from 'react';
import { PROJECTS } from '../data/projects';
import { navigateTo } from '../utils/navigation';
import { BrandLogo } from '../components/BrandLogo';

export function RERACompliancePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'RERA Compliance & Statutory Disclosures • Hyderabad Homes';
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
            <a
              href="https://rera.telangana.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold px-3 py-1.5 rounded-full text-[10px] hidden sm:flex items-center gap-1 transition-all border border-emerald-300"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              <span>Official TSRERA Portal</span>
            </a>
            <button
              onClick={() => navigateTo('/privacy-policy')}
              className="text-on-surface-variant hover:text-primary px-2.5 py-1.5 font-semibold text-xs transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo('/contact-us')}
              className="text-on-surface-variant hover:text-primary px-2.5 py-1.5 font-semibold text-xs transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Telangana State RERA Statutory Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            RERA Compliance & Consumer Protection Charter
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Statutory disclosures in strict compliance with the Real Estate (Regulation and Development) Act, 2016 (RERA Act) and the Telangana State Real Estate Regulatory Authority (TSRERA) Rules.
          </p>
          <div className="text-[11px] text-white/60 pt-2 flex items-center gap-4 flex-wrap">
            <span>RERA Act, 2016 Section 11(2) Disclosure</span>
            <span>•</span>
            <span>TSRERA Agent Registration: A02400000412</span>
            <span>•</span>
            <span>20 Verified Landmark Projects</span>
          </div>
        </div>
      </section>

      {/* ─── MAIN STATUTORY CONTENT ─────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-14 space-y-8 sm:space-y-10 leading-relaxed text-xs sm:text-sm text-on-surface">
        
        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">01.</span>
            <span>Preamble & Statutory Commitment</span>
          </h2>
          <p>
            The Real Estate (Regulation and Development) Act, 2016 was enacted by the Parliament of India to protect the interests of consumers in the real estate sector and establish an adjudicating mechanism for speedy dispute redressal.
          </p>
          <p>
            Hyderabad Homes operates under strict compliance with <strong>Section 9 and Section 10 of the RERA Act, 2016</strong>. As an authorized TSRERA Registered Agent (Registration No: <strong>A02400000412</strong>), we strictly market, showcase, and advise on projects that possess valid TSRERA sanction registrations or sanctioned municipal layout approvals.
          </p>
        </section>

        {/* Section 2: Statutory Agent Obligations */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">02.</span>
            <span>Agent Code of Conduct (Section 10, RERA Act 2016)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-1.5">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">fact_check</span>
                Section 10(a) Compliance
              </span>
              <p className="text-[11px] text-on-surface-variant">
                We do not facilitate the sale of any plot, apartment, or building in a real estate project without obtaining and verifying its authentic RERA registration number.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-1.5">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">menu_book</span>
                Section 10(b) Record Keeping
              </span>
              <p className="text-[11px] text-on-surface-variant">
                We maintain complete books of account, customer lead manifests, visit logs, and transaction disclosures accessible to statutory regulators.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-1.5">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">block</span>
                Section 10(c) Anti-Misleading Practice
              </span>
              <p className="text-[11px] text-on-surface-variant">
                We do not engage in any unfair trade practices, misleading price banners, or make false representations regarding developer amenities or approval status.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-1.5">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">lock</span>
                Section 10(d) Document Delivery
              </span>
              <p className="text-[11px] text-on-surface-variant">
                We facilitate the timely delivery of all sanctioned plans, floor blueprints, title extracts, and TSRERA agreements to prospective allottees.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Essential Homebuyer Rights */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">03.</span>
            <span>Crucial Homebuyer Rights Guaranteed by RERA</span>
          </h2>
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <strong className="text-primary block text-xs">1. 70% Separate Escrow Account Safeguard [Section 4(2)(l)(D)]</strong>
              <p className="text-[11px] text-on-surface-variant">
                70% of all funds collected from homebuyers must be deposited by the developer into a dedicated schedule bank escrow account, usable strictly for the land and construction cost of that specific project.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <strong className="text-primary block text-xs">2. Standardization of RERA Carpet Area [Section 2(k)]</strong>
              <p className="text-[11px] text-on-surface-variant">
                Developers must price units on exact "Carpet Area" (net usable floor area excluding external walls, service shafts, and exclusive balconies) preventing arbitrary super built-up inflation.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <strong className="text-primary block text-xs">3. Five-Year Structural Defect Liability [Section 14(3)]</strong>
              <p className="text-[11px] text-on-surface-variant">
                In case of any structural defect or poor workmanship brought to the developer's notice within 5 years from possession date, the developer must rectify the defect free of charge within 30 days.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
              <strong className="text-primary block text-xs">4. Right to Refund with Statutory Interest on Delay [Section 18]</strong>
              <p className="text-[11px] text-on-surface-variant">
                If the promoter fails to deliver possession according to the registered Agreement for Sale, the homebuyer has the absolute legal right to withdraw with full refund plus State Bank of India MCLR + 2% interest.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: 🌟 COMPREHENSIVE DIRECTORY OF 20 RERA REGISTRATIONS 🌟 */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
              <span className="text-tertiary font-mono">04.</span>
              <span>Official Registry of 20 Featured Landmark Projects</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1.5">
              In compliance with Section 11(2) of RERA Act 2016, below is the verified registry of all 20 featured developments with their Telangana State RERA / Municipal Sanction identifiers:
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-tertiary font-medium mt-2 sm:hidden bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <span className="material-symbols-outlined text-[15px]">swipe</span>
              <span>Swipe horizontally to view full RERA numbers & developer details</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] sm:text-[11px] uppercase text-on-surface-variant font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">Project Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Developer</th>
                  <th className="p-3">TS-RERA Registration No.</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">Possession</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {PROJECTS.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-tertiary">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="p-3 font-bold text-primary whitespace-nowrap">
                      <button
                        onClick={() => navigateTo(`/project/${proj.id}`)}
                        className="hover:text-tertiary hover:underline text-left"
                      >
                        {proj.title}
                      </button>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {proj.category}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface-variant whitespace-nowrap">{proj.developer}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      <span className="bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        {proj.rera}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface-variant max-w-[150px] truncate">{proj.location.split(',')[0]}</td>
                    <td className="p-3 text-right font-medium whitespace-nowrap text-primary">{proj.possession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-on-surface-variant/80 italic">
            * Prospective buyers can verify project filings, approved master plans, bank escrow details, and promoter disclosures directly on the official Telangana State RERA portal (<a href="https://rera.telangana.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">rera.telangana.gov.in</a>).
          </p>
        </section>

        {/* Section 5: Statutory Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
            <span className="text-tertiary font-mono">05.</span>
            <span>Statutory Advertising & RERA Disclaimer</span>
          </h2>
          <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 space-y-2 text-xs text-on-surface-variant">
            <p>
              <strong>General Disclaimer:</strong> This portal (www.hyderabadhomes.com) is an authorized real estate facilitation platform operated by Hyderabad Homes Pvt. Ltd., holding TS-RERA Agent Registration Certificate No: A02400000412.
            </p>
            <p>
              The images, artistic perspectives, 3D floor walkthroughs, and conceptual layouts shown are for illustration purposes only and do not constitute an offer, contract, or warranty. Final deliverables, common amenities, specifications, and layout plans are governed strictly by the TS-RERA registered Agreement for Sale executed between the developer and the homebuyer.
            </p>
          </div>
        </section>

        {/* Bottom Navigation CTAs */}
        <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigateTo('/contact-us')}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-tertiary transition-colors"
          >
            <span>Questions on RERA? Contact Our Compliance Desk</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-tertiary transition-all"
          >
            <span>Explore RERA Approved Projects</span>
            <span className="material-symbols-outlined text-[16px]">apartment</span>
          </button>
        </div>
      </main>
    </div>
  );
}