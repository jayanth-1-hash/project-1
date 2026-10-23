import { useState, useMemo, useEffect } from 'react';
import { PROJECTS, type Project } from '../data/projects';
import { navigateTo } from '../utils/navigation';
import { BrandLogo } from './BrandLogo';

export interface RawInquiry {
  id: string;
  name: string;
  phone: string;
  interest: string;
  budget: string;
  visitDate: string;
  message: string;
  createdAt: string;
  projectTitle?: string;
  projectImage?: string;
  projectId?: string;
  status?: string;
  bookingRef?: string;
  timeSlot?: string;
  unitInterest?: string;
  pickupRequired?: string;
  clientNotes?: string;
  adminNotes?: string;
}

export interface DetailedLead {
  raw: RawInquiry;
  project: Project;
  bookingRef: string;
  timeSlot: string;
  timeSlotCategory: 'Morning' | 'Noon' | 'Afternoon' | 'Evening';
  unitAccommodation: string;
  pickupRequired: boolean;
  budgetDisplay: string;
  emiEstimate: string;
  clientNotes: string;
  adminNotes: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'converted' | 'closed';
  formattedCreatedDate: string;
  formattedVisitDate: string;
}

export function AdminDashboard() {
  const [inquiries, setInquiries] = useState<RawInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Search & Multi-Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('All');
  const [selectedPickup, setSelectedPickup] = useState<string>('All');

  // Lead Modal & Preview
  const [previewLead, setPreviewLead] = useState<DetailedLead | null>(null);

  // Custom Delete Confirmation Modal State
  const [leadToDelete, setLeadToDelete] = useState<DetailedLead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Time Slot Capacity Matrix Modal State
  const [showCapacityMatrix, setShowCapacityMatrix] = useState<boolean>(false);

  // Active Admin Note Edit State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  // Set document title
  useEffect(() => {
    document.title = 'Hyderabad Homes Admin Dashboard';
  }, []);

  // Auto-fetch on mount if password was previously cached in session
  useEffect(() => {
    const cached = sessionStorage.getItem('admin_auth_pass');
    if (cached) {
      setPassword(cached);
      fetchInquiries(cached);
    }
  }, []);

  const fetchInquiries = async (authPassword = password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${authPassword}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid administrative password.');
        throw new Error('Failed to fetch inquiries. Ensure backend server is running on port 3001.');
      }
      const data = await res.json();
      const sortedInquiries = (data.inquiries || []).sort((a: RawInquiry, b: RawInquiry) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInquiries(sortedInquiries);
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth_pass', authPassword);
    } catch (err: any) {
      setError(err.message || 'Error loading inquiries.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth_pass');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Helper to reliably resolve project info
  const resolveProject = (inq: RawInquiry): Project => {
    if (inq.projectId) {
      const byId = PROJECTS.find(p => p.id.toLowerCase() === inq.projectId!.toLowerCase());
      if (byId) return byId;
    }
    if (inq.projectTitle) {
      const byTitle = PROJECTS.find(p => p.title.toLowerCase() === inq.projectTitle!.toLowerCase());
      if (byTitle) return byTitle;
    }

    const combined = `${inq.message || ''} ${inq.interest || ''}`.toLowerCase();
    for (const p of PROJECTS) {
      if (combined.includes(p.title.toLowerCase())) return p;
    }

    const bracketMatch = inq.message?.match(/\[(.*?)\]/);
    if (bracketMatch && bracketMatch[1]) {
      const raw = bracketMatch[1].toLowerCase();
      const found = PROJECTS.find(p => p.title.toLowerCase().includes(raw) || raw.includes(p.title.toLowerCase()));
      if (found) return found;
    }

    for (const cat of ['Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'] as const) {
      if (combined.includes(cat.toLowerCase())) {
        const byCat = PROJECTS.find(p => p.category === cat);
        if (byCat) return byCat;
      }
    }

    return PROJECTS[0];
  };

  // Standard slot normalizer
  const normalizeSlot = (rawTime: string) => {
    if (!rawTime) return '10:00 AM - 12:00 PM';
    const s = rawTime.toLowerCase();
    if (s.includes('10:00') || s.includes('11:00') || s.includes('morning') || s.includes('10 am')) {
      return '10:00 AM - 12:00 PM';
    }
    if (s.includes('12:00') || s.includes('01:00') || s.includes('1:00') || s.includes('noon') || s.includes('12 pm')) {
      return '12:00 PM - 02:00 PM';
    }
    if (s.includes('02:00') || s.includes('03:00') || s.includes('2:00') || s.includes('afternoon') || s.includes('2 pm')) {
      return '02:00 PM - 04:00 PM';
    }
    if (s.includes('04:00') || s.includes('05:00') || s.includes('06:00') || s.includes('evening') || s.includes('4 pm')) {
      return '04:00 PM - 06:00 PM';
    }
    return rawTime;
  };

  // Helper: Inactive leads (closed, converted, cancelled) release their site visit slot back to available!
  const isLeadSlotActive = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    return !['closed', 'converted', 'cancelled', 'canceled'].includes(s);
  };

  // Deeply parse and separate every inquiry into discrete fields
  const parseDetailedLead = (inq: RawInquiry): DetailedLead => {
    const project = resolveProject(inq);
    const msg = inq.message || '';

    const extractField = (pattern: RegExp) => {
      const m = msg.match(pattern);
      return m ? m[1].trim() : '';
    };

    // 1. Booking Reference
    const bookingRef = inq.bookingRef || extractField(/Booking Ref:\s*([^\s|]+)/i) || `VIP-${inq.id.replace('inq_', '').slice(-5).toUpperCase()}`;

    // 2. Time Slot
    const rawTime = inq.timeSlot || extractField(/Preferred Time:\s*([^|]+)/i) || '10:00 AM - 12:00 PM';
    const normalizedTime = normalizeSlot(rawTime);
    let timeSlotCategory: DetailedLead['timeSlotCategory'] = 'Morning';
    if (normalizedTime.includes('12:00 PM')) {
      timeSlotCategory = 'Noon';
    } else if (normalizedTime.includes('02:00 PM')) {
      timeSlotCategory = 'Afternoon';
    } else if (normalizedTime.includes('04:00 PM')) {
      timeSlotCategory = 'Evening';
    }

    // 3. Accommodation / Unit Allocation
    const extractedUnit = extractField(/Unit Interest:\s*\[?([^\]|]+)\]?/i);
    const unitAccommodation = inq.unitInterest || extractedUnit || project.configurations[0]?.name || project.type;

    // 4. Transportation / Cab Allocation
    const rawPickup = inq.pickupRequired || extractField(/Cab Pick & Drop:\s*([^|]+)/i);
    const pickupRequired = rawPickup
      ? rawPickup.toLowerCase().includes('yes') || rawPickup.toLowerCase().includes('requested')
      : msg.toLowerCase().includes('cab') || msg.toLowerCase().includes('pick');

    // 5. Budget Allocation
    let budgetDisplay = project.price;
    if (inq.budget && inq.budget !== 'Not specified' && inq.budget.trim() !== '') {
      budgetDisplay = inq.budget;
    }

    // 6. EMI Estimate
    const emiEstimate = project.priceBreakdown?.emiStarting || '₹85,000 / mo';

    // 7. Client Notes
    const clientNotes = inq.clientNotes || extractField(/(?:Notes|Special Note):\s*([^|]+)/i) || (
      !msg.includes('|') && !msg.startsWith('Booking Ref:') ? msg : ''
    );

    // 8. Lead Status
    const status = (inq.status as DetailedLead['status']) || 'new';

    // 9. Dates formatting
    const formattedCreatedDate = new Date(inq.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    let formattedVisitDate = inq.visitDate || 'To be coordinated';
    if (inq.visitDate && inq.visitDate !== 'Not specified') {
      try {
        const d = new Date(inq.visitDate + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          formattedVisitDate = d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch {
        formattedVisitDate = inq.visitDate;
      }
    }

    return {
      raw: inq,
      project,
      bookingRef,
      timeSlot: normalizedTime,
      timeSlotCategory,
      unitAccommodation,
      pickupRequired,
      budgetDisplay,
      emiEstimate,
      clientNotes,
      adminNotes: inq.adminNotes || '',
      status,
      formattedCreatedDate,
      formattedVisitDate
    };
  };

  // All parsed leads
  const parsedLeads: DetailedLead[] = useMemo(() => {
    return inquiries.map(parseDetailedLead);
  }, [inquiries]);

  // Compute Time Slot Capacity Map (Max 2 leads per slot for each visitDate)
  // Closed / Converted / Cancelled leads release their slots back to available!
  const slotOccupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    parsedLeads.forEach(lead => {
      if (isLeadSlotActive(lead.status) && lead.raw.visitDate && lead.raw.visitDate !== 'Not specified') {
        const key = `${lead.raw.visitDate}__${lead.timeSlot}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [parsedLeads]);

  // Capacity Matrix by Date
  const capacityMatrixByDate = useMemo(() => {
    const datesMap = new Map<string, DetailedLead[]>();
    parsedLeads.forEach(lead => {
      if (lead.raw.visitDate && lead.raw.visitDate !== 'Not specified') {
        const list = datesMap.get(lead.raw.visitDate) || [];
        list.push(lead);
        datesMap.set(lead.raw.visitDate, list);
      }
    });

    return Array.from(datesMap.entries()).map(([date, dateLeads]) => {
      const slots = [
        '10:00 AM - 12:00 PM',
        '12:00 PM - 02:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM'
      ].map(slot => {
        const matchingAll = dateLeads.filter(l => l.timeSlot === slot);
        const matchingActive = matchingAll.filter(l => isLeadSlotActive(l.status));
        return {
          slot,
          booked: matchingActive.length,
          limit: 2,
          isFull: matchingActive.length >= 2,
          leads: matchingActive,
          allLeads: matchingAll,
          releasedCount: matchingAll.length - matchingActive.length
        };
      });

      const totalActiveBooked = dateLeads.filter(l => isLeadSlotActive(l.status)).length;

      return {
        date,
        formattedDate: dateLeads[0]?.formattedVisitDate || date,
        slots,
        totalBooked: totalActiveBooked
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [parsedLeads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return parsedLeads.filter(lead => {
      if (selectedCategory !== 'All' && lead.project.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'All' && lead.status !== selectedStatus) {
        return false;
      }
      if (selectedTimeSlot !== 'All' && lead.timeSlotCategory !== selectedTimeSlot) {
        return false;
      }
      if (selectedPickup === 'Yes' && !lead.pickupRequired) return false;
      if (selectedPickup === 'No' && lead.pickupRequired) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          lead.raw.name.toLowerCase().includes(q) ||
          lead.raw.phone.includes(q) ||
          lead.project.title.toLowerCase().includes(q) ||
          lead.project.location.toLowerCase().includes(q) ||
          lead.unitAccommodation.toLowerCase().includes(q) ||
          lead.bookingRef.toLowerCase().includes(q) ||
          lead.timeSlot.toLowerCase().includes(q) ||
          lead.clientNotes.toLowerCase().includes(q) ||
          lead.adminNotes.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [parsedLeads, selectedCategory, selectedStatus, selectedTimeSlot, selectedPickup, searchTerm]);

  // Update lead status
  const handleUpdateStatus = async (id: string, newStatus: DetailedLead['status']) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      }
    } catch {
      alert('Failed to update status on server.');
    }
  };

  // Update admin notes
  const handleSaveAdminNote = async (id: string, noteText: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ adminNotes: noteText })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, adminNotes: noteText } : inq));
        setEditingNoteId(null);
      }
    } catch {
      alert('Failed to save note on server.');
    }
  };

  // Confirm delete lead (with custom modal)
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setDeletingId(leadToDelete.raw.id);
    try {
      const res = await fetch(`/api/inquiries/${leadToDelete.raw.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== leadToDelete.raw.id));
        if (previewLead?.raw.id === leadToDelete.raw.id) setPreviewLead(null);
        setLeadToDelete(null);
      } else {
        alert('Failed to delete lead from server.');
      }
    } catch {
      alert('Network error while deleting lead.');
    } finally {
      setDeletingId(null);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      'Booking Ref',
      'Customer Name',
      'Phone Number',
      'Lead Status',
      'Project Title',
      'Project Category',
      'RERA Number',
      'Visit Date',
      'Time Slot',
      'Time Slot Category',
      'Slot Capacity Status',
      'Unit Accommodation',
      'Cab Pick & Drop Arranged',
      'Budget Guide',
      'Estimated EMI',
      'Client Notes',
      'Admin Internal Remarks',
      'Inquiry Created At'
    ];

    const rows = filteredLeads.map(l => {
      const key = `${l.raw.visitDate}__${l.timeSlot}`;
      const count = slotOccupancyMap.get(key) || 1;
      const capacityStatus = count >= 2 ? '2/2 FULL' : `${count}/2 Available`;

      return [
        `"${l.bookingRef}"`,
        `"${l.raw.name.replace(/"/g, '""')}"`,
        `"${l.raw.phone}"`,
        `"${l.status.toUpperCase()}"`,
        `"${l.project.title.replace(/"/g, '""')}"`,
        `"${l.project.category}"`,
        `"${l.project.rera}"`,
        `"${l.formattedVisitDate}"`,
        `"${l.timeSlot}"`,
        `"${l.timeSlotCategory}"`,
        `"${capacityStatus}"`,
        `"${l.unitAccommodation.replace(/"/g, '""')}"`,
        `"${l.pickupRequired ? 'YES' : 'NO'}"`,
        `"${l.budgetDisplay.replace(/"/g, '""')}"`,
        `"${l.emiEstimate}"`,
        `"${l.clientNotes.replace(/"/g, '""')}"`,
        `"${l.adminNotes.replace(/"/g, '""')}"`,
        `"${l.formattedCreatedDate}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hyderabad_Homes_Leads_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C1511] text-white flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
        <div className="w-full max-w-md bg-[#131F1A] p-8 rounded-3xl border border-white/10 shadow-[0px_24px_64px_rgba(0,0,0,0.6)] space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center pb-1">
              <BrandLogo size="lg" showText={false} clickable={false} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                Executive CRM Portal
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                Hyderabad Homes Admin Dashboard
              </h1>
            </div>
            <p className="text-xs text-white/60">
              Administrative command center for customer bookings, 2-leads time slot capacity, and property dispatch.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  key
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (default: admin123)"
                  className="w-full bg-[#0A120E] border border-white/15 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-white focus:outline-none transition-all placeholder:text-white/30"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="w-full text-center text-xs text-emerald-400/80 hover:text-emerald-400 font-semibold pt-2 block"
            >
              ← Return to Hyderabad Homes Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED EXECUTIVE DASHBOARD ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#1E2522] selection:bg-emerald-600 selection:text-white">
      {/* ─── TOP EXECUTIVE COMMAND BAR ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0F1C16] text-white border-b border-white/10 shadow-md">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-18 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <BrandLogo size="xs" showText={false} clickable={false} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-white truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                    Hyderabad Homes Admin Dashboard
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    2 Leads/Slot Active
                  </span>
                </div>
                <p className="text-[10px] text-white/60 hidden sm:block">
                  Lead Intelligence • Time Slot Dispatch (Max 2 Leads/Slot) • Accommodation Allocations
                </p>
              </div>
            </div>

            {/* Mobile Exit Shortcut */}
            <button
              onClick={handleLogout}
              className="md:hidden bg-red-500/20 text-red-300 text-xs font-bold p-1.5 rounded-lg border border-red-500/30 flex items-center gap-1 shrink-0 active:scale-95"
              title="Lock Admin Session"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden xl:flex items-center gap-6 border-x border-white/10 px-6 text-xs text-white/80">
            <div>
              <span className="text-[9px] uppercase font-bold text-white/50 block">Total Pipeline</span>
              <span className="text-sm font-bold text-emerald-400">{inquiries.length} Active Leads</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[9px] uppercase font-bold text-white/50 block">Capacity Full Slots</span>
              <span className="text-sm font-bold text-purple-300">
                {Array.from(slotOccupancyMap.values()).filter(c => c >= 2).length} Slots (2/2 FULL)
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[9px] uppercase font-bold text-white/50 block">Cab Pickups</span>
              <span className="text-sm font-bold text-teal-300">
                {parsedLeads.filter(l => l.pickupRequired).length} Arranged
              </span>
            </div>
          </div>

          {/* Control Actions (Touch-Friendly Responsive Row) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
            <button
              onClick={() => setShowCapacityMatrix(true)}
              className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all border border-emerald-500/40 flex items-center gap-1 shrink-0 active:scale-95"
              title="Inspect 2-leads limit time slot calendar"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">calendar_view_week</span>
              <span>Slots Matrix</span>
            </button>

            <button
              onClick={() => fetchInquiries()}
              className="bg-white/10 hover:bg-white/15 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1 shrink-0 active:scale-95"
              title="Refresh all inquiries"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0 active:scale-95"
              title="Download CSV report"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">download</span>
              <span>CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all border border-white/10 hidden sm:flex items-center gap-1.5 shrink-0"
              title="Print Daily Schedule"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print</span>
            </button>

            <button
              onClick={() => navigateTo('/')}
              className="bg-white/10 hover:bg-white/15 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">open_in_new</span>
              <span>Live Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:flex bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-red-500/30 items-center gap-1 shrink-0"
              title="Lock Admin Session"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CRM CONTAINER ──────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* ─── 5 STRATEGIC METRICS & TIME SLOT CAPACITY CARDS ─────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* Card 1: Total Captured Leads */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Leads</span>
              <span className="material-symbols-outlined text-[20px] text-primary">groups</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {inquiries.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>● {parsedLeads.filter(l => l.status === 'new').length} newly arrived</span>
            </div>
          </div>

          {/* Card 2: Time Slots & 2-Lead Capacity */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[10px] uppercase font-bold tracking-wider">Slot Capacity (2 Max)</span>
              <span className="material-symbols-outlined text-[20px] text-amber-600">lock_clock</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {Array.from(slotOccupancyMap.values()).filter(c => c >= 2).length} Full
            </div>
            <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 flex-wrap">
              <span className="bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                🔒 2/2 Full Slots
              </span>
              <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                🟢 Available Slots
              </span>
            </div>
          </div>

          {/* Card 3: Accommodation Breakdown */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[10px] uppercase font-bold tracking-wider">Accommodations</span>
              <span className="material-symbols-outlined text-[20px] text-teal-600">apartment</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {new Set(parsedLeads.map(l => l.project.category)).size} Categories
            </div>
            <div className="text-[10px] text-on-surface-variant truncate font-medium">
              Towers, Villas, Apartments, Estates
            </div>
          </div>

          {/* Card 4: VIP Cab Logistics */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[10px] uppercase font-bold tracking-wider">Cab Logistics</span>
              <span className="material-symbols-outlined text-[20px] text-emerald-600">local_taxi</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {parsedLeads.filter(l => l.pickupRequired).length}
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold">
              Free AC Pick & Drop Assigned
            </div>
          </div>

          {/* Card 5: Pipeline Budget Value */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[10px] uppercase font-bold tracking-wider">Pipeline Capital</span>
              <span className="material-symbols-outlined text-[20px] text-purple-600">payments</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              ₹38.5 Cr+
            </div>
            <div className="text-[11px] text-purple-700 font-semibold">
              Premium Property Interest
            </div>
          </div>

        </section>

        {/* ─── MULTI-FILTER & SEARCH CONTROLLER ──────────────────────────────── */}
        <section className="bg-white p-4 sm:p-5 rounded-3xl border border-outline-variant/30 shadow-xs space-y-4">
          {/* Top Search & View Switcher */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by client name, phone number, project, unit accommodation, time slot, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary text-base sm:text-sm text-primary transition-all placeholder:text-on-surface-variant/50 min-h-[44px]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 bg-surface p-1 rounded-xl border border-outline-variant/30 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  viewMode === 'cards'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                <span>Dossier Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  viewMode === 'table'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span>Data Matrix</span>
              </button>
            </div>
          </div>

          {/* Filter Pills & Dropdowns Row */}
          <div className="space-y-2.5 pt-2 border-t border-outline-variant/20">
            {/* Category Filter Pills (Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mr-1 shrink-0">
                Category:
              </span>
              {['All', 'Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 min-h-[32px] ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown Filters (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 items-center">
              {/* Time Slot Filter */}
              <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 shrink-0">
                  Slot:
                </span>
                <select
                  value={selectedTimeSlot}
                  onChange={e => setSelectedTimeSlot(e.target.value)}
                  className="bg-transparent text-xs font-semibold py-1 rounded-lg focus:outline-none text-primary w-full"
                >
                  <option value="All">All Time Slots</option>
                  <option value="Morning">Morning (10 AM - 12 PM)</option>
                  <option value="Noon">Noon (12 PM - 02 PM)</option>
                  <option value="Afternoon">Afternoon (02 PM - 04 PM)</option>
                  <option value="Evening">Evening (04 PM - 06 PM)</option>
                </select>
              </div>

              {/* Cab Transport Filter */}
              <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 shrink-0">
                  Cab:
                </span>
                <select
                  value={selectedPickup}
                  onChange={e => setSelectedPickup(e.target.value)}
                  className="bg-transparent text-xs font-semibold py-1 rounded-lg focus:outline-none text-primary w-full"
                >
                  <option value="All">All Transport</option>
                  <option value="Yes">🚕 Cab Arranged</option>
                  <option value="No">🚗 Self-Drive</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 shrink-0">
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-xs font-semibold py-1 rounded-lg focus:outline-none text-primary w-full"
                >
                  <option value="All">All Pipeline</option>
                  <option value="new">🟡 New Lead</option>
                  <option value="contacted">🔵 Contacted</option>
                  <option value="scheduled">🟢 Visit Scheduled</option>
                  <option value="completed">🟣 Visit Completed</option>
                  <option value="converted">⭐ Converted</option>
                  <option value="closed">⚪ Closed</option>
                </select>
              </div>
            </div>

            {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedTimeSlot !== 'All' || selectedPickup !== 'All') && (
              <div className="text-right pt-1">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedTimeSlot('All');
                    setSelectedPickup('All');
                  }}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── LEADS DISPLAY: DOSSIER CARDS OR DATA MATRIX ────────────────────── */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 text-center space-y-3">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block mx-auto">
              inbox
            </span>
            <h3 className="text-base font-bold text-primary">No Matching Leads Found</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              No inquiries match your current category, time slot, or keyword criteria. Reset filters to inspect all leads.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSelectedTimeSlot('All');
                setSelectedPickup('All');
              }}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ═══════════════════════════════════════════════════════════════════
             MODE 1: EXECUTIVE DOSSIER CARDS (SEPARATED VISUAL COMPARTMENTS)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            {filteredLeads.map((lead) => {
              const leadSlotKey = `${lead.raw.visitDate}__${lead.timeSlot}`;
              const slotBookedCount = slotOccupancyMap.get(leadSlotKey) || 1;
              const isSlotFull = slotBookedCount >= 2;

              return (
                <div
                  key={lead.raw.id}
                  className="bg-white rounded-3xl border border-outline-variant/30 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* ── CARD TOP BAR: CLIENT HEADER & STATUS ── */}
                  <div className="p-3.5 sm:p-5 bg-gradient-to-r from-surface to-white border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm shrink-0">
                        {lead.raw.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-primary truncate max-w-[180px] xs:max-w-none">{lead.raw.name}</h3>
                          <span className="font-mono text-[9px] sm:text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md">
                            {lead.bookingRef}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-on-surface-variant mt-0.5 flex-wrap">
                          <a
                            href={`tel:${lead.raw.phone}`}
                            className="font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px] sm:text-[14px]">call</span>
                            <span>{lead.raw.phone}</span>
                          </a>
                          <span className="text-outline-variant">•</span>
                          <span className="text-[10px] sm:text-[11px] text-on-surface-variant/80 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] sm:text-[13px]">schedule</span>
                            <span>{lead.formattedCreatedDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown Controller & Sleek Delete Button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/15 shrink-0">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.raw.id, e.target.value as any)}
                        className={`flex-1 sm:flex-none text-xs font-bold px-2.5 py-2 sm:py-1.5 rounded-xl border focus:outline-none transition-all min-h-[38px] ${
                          lead.status === 'new'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : lead.status === 'contacted'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : lead.status === 'scheduled'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : lead.status === 'completed'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : lead.status === 'converted'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-surface text-on-surface-variant border-outline-variant/30'
                        }`}
                      >
                        <option value="new">🟡 New Lead</option>
                        <option value="contacted">🔵 Contacted</option>
                        <option value="scheduled">🟢 Visit Scheduled</option>
                        <option value="completed">🟣 Visit Completed</option>
                        <option value="converted">⭐ Converted</option>
                        <option value="closed">⚪ Closed</option>
                      </select>

                      {/* Redesigned Modern Delete Button */}
                      <button
                        type="button"
                        onClick={() => setLeadToDelete(lead)}
                        className="px-2.5 py-2 sm:py-1.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs hover:shadow-xs group/del min-h-[38px] shrink-0"
                        title="Delete this customer lead"
                      >
                        <span className="material-symbols-outlined text-[16px] text-red-500 group-hover/del:text-red-700 transition-colors">
                          delete
                        </span>
                        <span className="inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* ── CARD BODY: 4 SEPARATED COMPARTMENTS ── */}
                  <div className="p-4 sm:p-5 space-y-4 flex-1">
                    
                    {/* COMPARTMENT 1: REAL PROPERTY & PHOTO */}
                    <div
                      onClick={() => setPreviewLead(lead)}
                      className="p-3 rounded-2xl bg-surface border border-outline-variant/30 hover:border-primary/40 transition-all flex gap-3.5 items-center cursor-pointer group"
                    >
                      <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-xs">
                        <img
                          src={lead.project.image}
                          alt={lead.project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = lead.project.fallbackImage;
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                          {lead.project.category}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {lead.project.badge}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant">
                            RERA: {lead.project.rera}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-primary truncate group-hover:text-tertiary transition-colors">
                          {lead.project.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[13px] text-tertiary shrink-0">location_on</span>
                          <span>{lead.project.location}</span>
                        </p>
                        <div className="text-xs font-bold text-emerald-700">
                          Guide: {lead.project.price}
                        </div>
                      </div>
                    </div>

                    {/* COMPARTMENT 2: SEPARATED TIME SLOT & SCHEDULING (PROMINENT + 2 LEADS LIMIT CAPACITY) */}
                    <div className="p-3.5 rounded-2xl bg-[#F0F7F4] border border-emerald-200/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-emerald-700">calendar_month</span>
                          <span>Site Visit Appointment & Time Slot</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {lead.timeSlotCategory} Window
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {/* Visit Date */}
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-on-surface-variant/70 block">Scheduled Date</span>
                          <span className="text-xs font-bold text-primary block mt-0.5">{lead.formattedVisitDate}</span>
                        </div>

                        {/* Precise Time Slot Pill */}
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-on-surface-variant/70 block">Time Slot</span>
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">alarm</span>
                            <span>{lead.timeSlot}</span>
                          </span>
                        </div>
                      </div>

                      {/* 🌟 2-LEADS CAPACITY LIMIT INDICATOR 🌟 */}
                      {lead.raw.visitDate && lead.raw.visitDate !== 'Not specified' && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
                          <span className="text-[10px] text-on-surface-variant font-medium">Slot Capacity:</span>
                          {!isLeadSlotActive(lead.status) ? (
                            <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-2xs">
                              <span className="material-symbols-outlined text-[13px] text-slate-600">check_circle</span>
                              <span>Slot Released ({lead.status === 'converted' ? 'Converted' : 'Closed'})</span>
                            </span>
                          ) : isSlotFull ? (
                            <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-2xs">
                              <span className="material-symbols-outlined text-[13px] text-purple-700">lock</span>
                              <span>2/2 Leads FULL (Capacity Reached)</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-emerald-700">check_circle</span>
                              <span>{slotBookedCount}/2 Leads Booked ({2 - slotBookedCount} Slot Available)</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Transportation Allocation Tag */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-[11px] text-on-surface-variant font-medium">Logistics Allocation:</span>
                        {lead.pickupRequired ? (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">local_taxi</span>
                            <span>Free AC Cab Pick & Drop: Arranged</span>
                          </span>
                        ) : (
                          <span className="bg-surface text-on-surface-variant border border-outline-variant/30 px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">directions_car</span>
                            <span>Self-Drive / Client Direct Arrival</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* COMPARTMENT 3: ACCOMMODATION ALLOCATION & BUDGET SEPARATED */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Accommodation / Unit Requested */}
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">bed</span>
                          <span>Accommodation Unit</span>
                        </span>
                        <span className="text-xs font-bold text-primary block truncate">
                          {lead.unitAccommodation}
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">
                          Footprint: {lead.project.sqft}
                        </span>
                      </div>

                      {/* Financial / Budget Guide */}
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-emerald-700">payments</span>
                          <span>Budget Readiness</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-800 block truncate">
                          {lead.budgetDisplay}
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">
                          Estimated EMI: {lead.emiEstimate}
                        </span>
                      </div>
                    </div>

                    {/* COMPARTMENT 4: CLIENT NOTES / SPECIAL REQUESTS */}
                    {lead.clientNotes && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-950 space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">sticky_note_2</span>
                          <span>Client Special Instructions</span>
                        </span>
                        <p className="italic text-[11px] leading-relaxed">
                          "{lead.clientNotes}"
                        </p>
                      </div>
                    )}

                    {/* COMPARTMENT 5: INTERNAL ADMIN REMARKS (CLICK-TO-EDIT) */}
                    <div className="p-3 rounded-xl bg-surface border border-outline-variant/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">edit_note</span>
                          <span>Internal Sales Remarks</span>
                        </span>
                        {editingNoteId !== lead.raw.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(lead.raw.id);
                              setTempNoteText(lead.adminNotes);
                            }}
                            className="text-[10px] text-primary font-bold hover:underline"
                          >
                            {lead.adminNotes ? 'Edit Note' : '+ Add Note'}
                          </button>
                        )}
                      </div>

                      {editingNoteId === lead.raw.id ? (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            rows={2}
                            value={tempNoteText}
                            onChange={e => setTempNoteText(e.target.value)}
                            placeholder="Add internal remarks (e.g. called client, requested floor plans, follow up tomorrow)..."
                            className="w-full p-2 text-xs rounded-lg border border-outline-variant/40 bg-white focus:outline-none focus:border-primary"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-1 text-[11px] text-on-surface-variant hover:text-primary font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAdminNote(lead.raw.id, tempNoteText)}
                              className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg shadow-xs"
                            >
                              Save Remark
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant">
                          {lead.adminNotes || <span className="italic text-on-surface-variant/60">No internal remarks added yet. Click above to add notes.</span>}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* ── CARD BOTTOM ACTIONS: WHATSAPP, CALL, FULL DOSSIER ── */}
                  <div className="p-3 sm:p-4 bg-surface/70 border-t border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Direct WhatsApp Action */}
                      <a
                        href={`https://wa.me/91${lead.raw.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${lead.raw.name}, greetings from Hyderabad Homes! This is regarding your VIP Site Visit for ${lead.project.title} (${lead.unitAccommodation}) scheduled for ${lead.formattedVisitDate} at ${lead.timeSlot}. Our senior advisor will be coordinating your visit.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 min-h-[42px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>WhatsApp</span>
                      </a>

                      {/* Direct Call Action */}
                      <a
                        href={`tel:${lead.raw.phone}`}
                        className="flex-1 sm:flex-none bg-white hover:bg-surface text-primary border border-outline-variant/30 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span>Call</span>
                      </a>
                    </div>

                    {/* View Complete Dossier */}
                    <button
                      type="button"
                      onClick={() => setPreviewLead(lead)}
                      className="text-xs font-bold text-primary hover:text-tertiary flex items-center justify-center gap-1 transition-colors px-3 py-2 rounded-xl border border-outline-variant/20 sm:border-none bg-surface sm:bg-transparent min-h-[38px] sm:min-h-0"
                    >
                      <span>Full Dossier</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             MODE 2: HIGH-DENSITY DATA MATRIX (TABLE FORMAT)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-xs overflow-hidden">
            <div className="md:hidden bg-amber-50 px-4 py-2.5 text-amber-900 text-xs font-medium border-b border-amber-200/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0">info</span>
              <span>Swipe table horizontally to inspect all columns, or switch to 'Dossier Cards'.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-[11px] uppercase font-bold">
                    <th className="p-4">Customer Lead</th>
                    <th className="p-4">Interested Project & Photo</th>
                    <th className="p-4">Time Slot (Max 2) & Date</th>
                    <th className="p-4">Accommodation & Sizing</th>
                    <th className="p-4">Budget & EMI</th>
                    <th className="p-4">Status & Pipeline</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredLeads.map((lead) => {
                    const leadSlotKey = `${lead.raw.visitDate}__${lead.timeSlot}`;
                    const slotBookedCount = slotOccupancyMap.get(leadSlotKey) || 1;
                    const isSlotFull = slotBookedCount >= 2;

                    return (
                      <tr key={lead.raw.id} className="hover:bg-surface/50 transition-colors">
                        {/* Customer Info */}
                        <td className="p-4 align-top w-56">
                          <div className="font-bold text-primary text-sm">{lead.raw.name}</div>
                          <div className="text-xs font-mono text-emerald-800 font-bold mt-0.5">
                            <a href={`tel:${lead.raw.phone}`} className="hover:underline">{lead.raw.phone}</a>
                          </div>
                          <div className="text-[10px] text-on-surface-variant mt-1.5">
                            Ref: <span className="font-mono font-bold text-primary">{lead.bookingRef}</span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant/70">
                            {lead.formattedCreatedDate}
                          </div>
                        </td>

                        {/* Project Photo & Title */}
                        <td className="p-4 align-top w-72">
                          <div
                            onClick={() => setPreviewLead(lead)}
                            className="flex gap-2.5 items-center cursor-pointer group"
                          >
                            <img
                              src={lead.project.image}
                              alt={lead.project.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-outline-variant/30 shadow-xs group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = lead.project.fallbackImage;
                              }}
                            />
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                                {lead.project.category}
                              </span>
                              <h4 className="text-xs font-bold text-primary truncate group-hover:text-tertiary transition-colors mt-0.5">
                                {lead.project.title}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant truncate">
                                {lead.project.location}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Scheduled Time Slot & Visit Date */}
                        <td className="p-4 align-top w-56 space-y-1">
                          <div className="font-bold text-primary text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">calendar_month</span>
                            <span>{lead.formattedVisitDate}</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                            ⏰ {lead.timeSlot}
                          </div>
                          <div>
                            {!isLeadSlotActive(lead.status) ? (
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-1.5 py-0.2 rounded block w-max">
                                ⚪ Released ({lead.status})
                              </span>
                            ) : isSlotFull ? (
                              <span className="text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded block w-max">
                                🔒 2/2 FULL
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-emerald-800 block">
                                🟢 {slotBookedCount}/2 Booked ({2 - slotBookedCount} Avail)
                              </span>
                            )}
                          </div>
                          <div>
                            {lead.pickupRequired ? (
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                🚕 Cab Arranged
                              </span>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant block">
                                🚗 Self-Drive
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Accommodation / Unit Allocation */}
                        <td className="p-4 align-top w-52 space-y-0.5">
                          <div className="font-bold text-primary text-xs">
                            {lead.unitAccommodation}
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            Footprint: {lead.project.sqft}
                          </div>
                          <div className="text-[10px] text-on-surface-variant/80">
                            100% Vastu Compliant
                          </div>
                        </td>

                        {/* Budget & Readiness */}
                        <td className="p-4 align-top w-44 space-y-0.5">
                          <div className="font-bold text-emerald-800 text-xs">
                            {lead.budgetDisplay}
                          </div>
                          <div className="text-[10px] text-on-surface-variant">
                            EMI: {lead.emiEstimate}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-4 align-top w-40">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.raw.id, e.target.value as any)}
                            className="w-full text-xs font-bold p-1.5 rounded-lg border border-outline-variant/30 bg-surface focus:outline-none"
                          >
                            <option value="new">🟡 New Lead</option>
                            <option value="contacted">🔵 Contacted</option>
                            <option value="scheduled">🟢 Visit Scheduled</option>
                            <option value="completed">🟣 Visit Completed</option>
                            <option value="converted">⭐ Converted</option>
                            <option value="closed">⚪ Closed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-top text-center space-x-1.5 whitespace-nowrap">
                          <a
                            href={`https://wa.me/91${lead.raw.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hi ${lead.raw.name}, this is Hyderabad Homes regarding your visit to ${lead.project.title} on ${lead.formattedVisitDate} at ${lead.timeSlot}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block p-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-colors"
                            title="WhatsApp Client"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setPreviewLead(lead)}
                            className="p-1.5 bg-surface hover:bg-surface-variant text-primary rounded-lg transition-colors"
                            title="View Full Dossier"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          {/* Redesigned Modern Delete Button in Table */}
                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ─── SLIDE-OUT / POPUP: DETAILED LEAD DOSSIER MODAL ────────────────── */}
      {previewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewLead(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] overflow-y-auto flex flex-col animate-scaleUp">
            {/* Modal Header Image */}
            <div className="relative h-48 sm:h-72 w-full bg-black shrink-0">
              <img
                src={previewLead.project.image}
                alt={previewLead.project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = previewLead.project.fallbackImage;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPreviewLead(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors z-20"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2">
                <span className="bg-white text-primary text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-1 rounded-full shadow">
                  {previewLead.project.category}
                </span>
                <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-1 rounded-full shadow">
                  {previewLead.project.badge}
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 text-white space-y-1">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono text-emerald-300">
                  TS RERA: {previewLead.project.rera}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold truncate">
                  {previewLead.project.title}
                </h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">location_on</span>
                  <span className="truncate">{previewLead.project.location}</span>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
              {/* Customer Contact Strip */}
              <div className="p-4 rounded-2xl bg-surface border border-outline-variant/30 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Client Name</span>
                  <div className="text-base font-bold text-primary">{previewLead.raw.name}</div>
                  <div className="text-xs font-mono font-bold text-emerald-800">{previewLead.raw.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Booking Ref</span>
                  <div className="font-mono text-xs font-bold text-primary bg-white px-2 py-1 rounded-lg border border-outline-variant/30">
                    {previewLead.bookingRef}
                  </div>
                </div>
              </div>

              {/* Time Slot & Visit Dispatch */}
              <div className="p-4 rounded-2xl bg-[#EAF5F0] border border-emerald-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">schedule</span>
                  <span>Confirmed Appointment Dispatch (2 Leads Limit / Slot)</span>
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Visit Date</span>
                    <span className="text-sm font-bold text-primary mt-0.5 block">{previewLead.formattedVisitDate}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Assigned Time Slot</span>
                    <span className="text-sm font-bold text-emerald-800 mt-0.5 block">{previewLead.timeSlot}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Transportation:</span>
                  <span className="font-bold text-emerald-800">
                    {previewLead.pickupRequired ? '🚕 Free AC Cab Pick & Drop Arranged' : '🚗 Self-Drive / Direct Arrival'}
                  </span>
                </div>
              </div>

              {/* Accommodation & Pricing Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Accommodation</span>
                  <span className="text-xs font-bold text-primary block">{previewLead.unitAccommodation}</span>
                  <span className="text-[10px] text-on-surface-variant block">Footprint: {previewLead.project.sqft}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface border border-outline-variant/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 block">Pricing Guide</span>
                  <span className="text-xs font-bold text-emerald-800 block">{previewLead.budgetDisplay}</span>
                  <span className="text-[10px] text-on-surface-variant block">Starting EMI: {previewLead.emiEstimate}</span>
                </div>
              </div>

              {/* Client Notes */}
              {previewLead.clientNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block">Customer Note</span>
                  <p className="italic">"{previewLead.clientNotes}"</p>
                </div>
              )}

              {/* Direct Actions in Modal */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <a
                  href={`https://wa.me/91${previewLead.raw.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${previewLead.raw.name}, this is Hyderabad Homes regarding your visit to ${previewLead.project.title} on ${previewLead.formattedVisitDate} at ${previewLead.timeSlot}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>WhatsApp Client</span>
                </a>

                <a
                  href={`tel:${previewLead.raw.phone}`}
                  className="flex-1 bg-primary hover:bg-tertiary text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>Call {previewLead.raw.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM IN-APP DELETE CONFIRMATION MODAL ───────────────────────── */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setLeadToDelete(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl z-10 space-y-4 sm:space-y-5 animate-scaleUp">
            {/* Header with Danger Shield */}
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[24px] sm:text-[28px]">delete_forever</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-primary">Delete Customer Lead?</h3>
                <p className="text-xs text-on-surface-variant">This lead will be permanently deleted from the database.</p>
              </div>
            </div>

            {/* Lead Brief Preview Box */}
            <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Customer:</span>
                <span className="font-bold text-primary">{leadToDelete.raw.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Phone:</span>
                <span className="font-mono font-bold text-emerald-800">{leadToDelete.raw.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Booking Ref:</span>
                <span className="font-mono font-bold text-primary">{leadToDelete.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Interested Project:</span>
                <span className="font-semibold text-primary truncate max-w-[180px] sm:max-w-[200px]">{leadToDelete.project.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Scheduled Visit:</span>
                <span className="font-bold text-emerald-800">{leadToDelete.formattedVisitDate} • {leadToDelete.timeSlot}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/40 text-xs font-bold text-primary hover:bg-surface transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{deletingId ? 'Deleting...' : 'Yes, Delete Lead'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TIME SLOT CAPACITY MATRIX MODAL ──────────────────────────────── */}
      {showCapacityMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowCapacityMatrix(false)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-4 sm:p-7 shadow-2xl z-10 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3 sm:pb-4 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-primary">Time Slot Capacity Matrix</h3>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant">
                    Strict capacity: Max 2 client visits per slot per calendar date.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCapacityMatrix(false)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-variant text-on-surface flex items-center justify-center transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Matrix Content */}
            {capacityMatrixByDate.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-xs">
                No site visits scheduled yet.
              </div>
            ) : (
              <div className="space-y-4">
                {capacityMatrixByDate.map((dateGroup) => (
                  <div key={dateGroup.date} className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">event</span>
                        <span>{dateGroup.formattedDate}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant">({dateGroup.date})</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {dateGroup.totalBooked} Total Visits Scheduled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {dateGroup.slots.map((s) => (
                        <div
                          key={s.slot}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            s.isFull
                              ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                              : s.booked === 1
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-white border-outline-variant/20 text-on-surface-variant'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] block">{s.slot}</span>
                            {s.isFull ? (
                              <span className="bg-purple-600 text-white font-bold text-[8px] px-1.5 py-0.2 rounded-full uppercase">
                                2/2 FULL
                              </span>
                            ) : (
                              <span className="bg-emerald-600 text-white font-bold text-[8px] px-1.5 py-0.2 rounded-full">
                                {s.booked}/2 Booked
                              </span>
                            )}
                          </div>

                          {s.leads.length > 0 ? (
                            <div className="space-y-1 pt-1 border-t border-black/5">
                              {s.leads.map(leadItem => (
                                <div key={leadItem.raw.id} className="text-[10px] font-semibold flex items-center justify-between">
                                  <span className="truncate max-w-[100px]">{leadItem.raw.name}</span>
                                  <span className="font-mono text-[9px] text-primary">{leadItem.bookingRef}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] italic text-on-surface-variant/60 pt-0.5">
                              2 Slots Open
                            </p>
                          )}
                          {(s as any).releasedCount > 0 && (
                            <div className="text-[9px] text-slate-500 font-medium pt-1 flex items-center gap-1 border-t border-black/5">
                              <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                              <span>{(s as any).releasedCount} slot{(s as any).releasedCount > 1 ? 's' : ''} freed (closed/converted)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowCapacityMatrix(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl min-h-[44px] shadow-sm"
              >
                Close Matrix View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
