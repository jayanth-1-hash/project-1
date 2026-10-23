import { config } from 'dotenv';
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Load .env explicitly from api directory first, then root cwd
config({ path: path.join(__dirname, '.env') });
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Resilient Local Inquiries Storage
function getLocalInquiries() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[ERROR] Failed to read local inquiries:', e);
    return [];
  }
}

function saveLocalInquiries(inquiries) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
  } catch (e) {
    console.error('[ERROR] Failed to save local inquiries:', e);
  }
}

let supabase = null;
let supabaseReachable = false;
let lastSupabaseCheck = 0;

if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.startsWith('http') && !process.env.SUPABASE_URL.includes('ioaplnyzwaopqadmfhvy')) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
  } catch (e) {
    console.warn('[WARN] Supabase client initialization error:', e.message);
  }
}

async function isSupabaseHealthy() {
  if (!supabase) return false;
  const now = Date.now();
  if (!supabaseReachable && now - lastSupabaseCheck < 60000) {
    return false;
  }
  lastSupabaseCheck = now;
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
    const { error } = await Promise.race([
      supabase.from('inquiries').select('id').limit(1),
      timeoutPromise
    ]);
    if (error) {
      supabaseReachable = false;
      return false;
    }
    supabaseReachable = true;
    return true;
  } catch (e) {
    supabaseReachable = false;
    return false;
  }
}

// ──────────────────────────────────────────────
// CYBERSECURITY SKILL: Layer 1 - HTTP Hardening
// ──────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'] }));
app.use(express.json({ limit: '10kb' }));

// CYBERSECURITY SKILL: Layer 2 - Rate Limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many inquiries. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────
// Database handled by Supabase
// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// CYBERSECURITY SKILL: Layer 3 - Input Validation
// ──────────────────────────────────────────────
function validateContactInput(body) {
  const errors = [];

  // Explicit Name Validation
  const hasName = Boolean(body.name);
  const isNameString = typeof body.name === 'string';
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  const isValidName = hasName && isNameString && nameRegex.test(body.name.trim());

  if (!isValidName) {
    errors.push('Name must be valid and contain only alphabets (min 2 characters).');
  }

  // Explicit Phone Validation (supports 10 digits with optional +91, 0, spaces, dashes)
  const hasPhone = Boolean(body.phone);
  const isPhoneString = typeof body.phone === 'string';
  const cleanPhone = isPhoneString ? body.phone.trim().replace(/[\s\-\(\)]/g, '') : '';
  const phoneRegex = /^(\+91|0)?[0-9]{10}$/;
  const isValidPhone = hasPhone && isPhoneString && phoneRegex.test(cleanPhone);

  if (!isValidPhone) {
    errors.push('Valid 10-digit mobile number is required.');
  }

  // Explicit Interest Validation
  const allowedInterests = [
    'Apartments', 'Villas', 'Commercial', 'Plots', 'Site Visit Booking', 'Call Back Requested',
    'Towers', 'Individual Houses', 'Ventures'
  ];
  const hasInterest = Boolean(body.interest);
  const isInterestValid = hasInterest ? (allowedInterests.includes(body.interest) || body.interest.length > 2) : true;

  if (!isInterestValid) {
    errors.push('Invalid interest category.');
  }

  // Explicit Sanitization
  const sanitizeString = (value) => {
    if (!value || typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '').trim();
  };

  const normalizedPhone = cleanPhone.startsWith('+91')
    ? cleanPhone.slice(3)
    : cleanPhone.startsWith('0')
      ? cleanPhone.slice(1)
      : cleanPhone;

  body.name = sanitizeString(body.name);
  body.phone = normalizedPhone;
  body.message = sanitizeString(body.message);
  body.interest = sanitizeString(body.interest);
  body.budget = sanitizeString(body.budget);

  return errors;
}

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Slot Capacity Management (Max 2 leads per slot per date)
// ──────────────────────────────────────────────
const MAX_LEADS_PER_SLOT = 2;
const STANDARD_SLOTS = [
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

// Closed, converted, or cancelled leads release their site visit slot
const INACTIVE_STATUSES = new Set(['closed', 'converted', 'cancelled', 'canceled']);

function isSlotOccupying(item) {
  if (!item) return false;
  const status = (item.status || '').toLowerCase().trim();
  return !INACTIVE_STATUSES.has(status);
}

function normalizeSlot(timeStr) {
  if (!timeStr) return STANDARD_SLOTS[0];
  if (STANDARD_SLOTS.includes(timeStr)) return timeStr;
  const s = String(timeStr).toLowerCase();
  if (s.includes('10:00') || s.includes('11:00') || s.includes('morning') || s.includes('10 am')) {
    return '10:00 AM - 12:00 PM';
  }
  if (s.includes('12:00') || s.includes('01:00') || s.includes('1:00') || s.includes('noon') || s.includes('12 pm')) {
    return '12:00 PM - 02:00 PM';
  }
  if (s.includes('02:00') || s.includes('03:00') || s.includes('2:00') || s.includes('afternoon') || s.includes('2 pm') || s.includes('3 pm')) {
    return '02:00 PM - 04:00 PM';
  }
  if (s.includes('04:00') || s.includes('05:00') || s.includes('06:00') || s.includes('evening') || s.includes('4 pm') || s.includes('5 pm') || s.includes('6 pm')) {
    return '04:00 PM - 06:00 PM';
  }
  return timeStr;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Time Slot Availability Endpoint
app.get('/api/slot-availability', (req, res) => {
  const date = (req.query.date || '').trim();
  if (!date) {
    return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
  }

  const localData = getLocalInquiries();
  // Only active leads count against the 2-leads limit per slot; closed/converted leads release their slot!
  const dateInquiries = localData.filter(item => item.visitDate === date && isSlotOccupying(item));

  const slotStats = STANDARD_SLOTS.map(slot => {
    const booked = dateInquiries.filter(item => normalizeSlot(item.timeSlot) === slot).length;
    const remaining = Math.max(0, MAX_LEADS_PER_SLOT - booked);
    return {
      slot,
      booked,
      limit: MAX_LEADS_PER_SLOT,
      remaining,
      isFull: booked >= MAX_LEADS_PER_SLOT
    };
  });

  res.json({
    date,
    limitPerSlot: MAX_LEADS_PER_SLOT,
    slots: slotStats
  });
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { reply: 'Too many messages. Please wait a moment.' }
});

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'no_key',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Chat response cache
const responseCache = new Map();

// Real Estate Knowledge Engine & Verified Project Catalog
const VERIFIED_PROJECTS_CATALOG = [
  { id: 'tower-1', title: 'SAS Crown Neopolis Towers', category: 'Towers', price: '₹3.85 Cr - ₹6.50 Cr', location: 'Neopolis, Golden Mile, Kokapet', rera: 'P02400007890', image: '/projects/tower-1.jpg', type: '4 & 5 BHK Sky Mansions' },
  { id: 'tower-2', title: 'My Home Bhooja Luxury Towers', category: 'Towers', price: '₹3.10 Cr - ₹4.80 Cr', location: 'Raidurg, Knowledge City, HITEC City', rera: 'P02400003211', image: '/projects/tower-2.jpg', type: '3 & 4 BHK Sky Condominiums' },
  { id: 'tower-3', title: 'Lodha Belleza Sky Villas', category: 'Towers', price: '₹3.40 Cr - ₹5.60 Cr', location: 'Eden Square, Phase 4, KPHB', rera: 'P02400001890', image: '/projects/tower-3.jpg', type: '3 & 4 BHK Panoramic Sky Suites' },
  { id: 'tower-4', title: 'Aparna Zenon & SAS iRA High-Rise', category: 'Towers', price: '₹2.15 Cr - ₹3.25 Cr', location: 'Nanakramguda, Financial District', rera: 'P02400006541', image: '/projects/tower-4.jpg', type: '2, 3 & 4 BHK High-Rise Apartments' },
  { id: 'apt-1', title: 'Lanco Hills Integrated Township', category: 'Apartments', price: '₹1.10 Cr - ₹1.85 Cr', location: 'Lanco Hills Road, Manikonda', rera: 'P02400002145', image: '/projects/apt-1.jpg', type: '2 & 3 BHK Lake-Facing Units' },
  { id: 'apt-2', title: 'Western Plaza Gated Enclave', category: 'Apartments', price: '₹1.45 Cr - ₹2.25 Cr', location: 'Opp. Botanical Gardens, Kondapur', rera: 'P02400005432', image: '/projects/apt-2.jpg', type: '3 BHK Vaastu Compliant Homes' },
  { id: 'apt-3', title: 'Trident Grande by Namishree', category: 'Apartments', price: '₹88 Lakhs - ₹1.35 Cr', location: 'Tellapur - Kollur Road, Near ORR Exit 2', rera: 'P02400006781', image: '/projects/apt-3.jpg', type: '2 & 3 BHK Modern Residences' },
  { id: 'apt-4', title: 'Myscape Isle of Sky Residences', category: 'Apartments', price: '₹2.40 Cr - ₹3.60 Cr', location: 'ISB Road, Financial District', rera: 'P02400007120', image: '/projects/apt-4.jpg', type: '3 & 4 BHK Boutique Residences' },
  { id: 'villa-1', title: 'Villa Greens Gandipet', category: 'Villas', price: '₹4.50 Cr - ₹6.80 Cr', location: 'Gandipet Village Road, Osman Sagar Lake', rera: 'P02400003889', image: '/projects/villa-1.jpg', type: '4 BHK Luxury Triplex Villas' },
  { id: 'villa-2', title: 'Kokapet Upscale Grandeur Villas', category: 'Villas', price: '₹5.50 Cr - ₹8.20 Cr', location: 'Golden Mile, Kokapet', rera: 'P02400007543', image: '/projects/villa-2.jpg', type: '5 BHK Bespoke Palatial Mansions' },
  { id: 'villa-3', title: 'Palampally Lakeside Villas', category: 'Villas', price: '₹4.80 Cr - ₹7.10 Cr', location: 'Narsingi - Gandipet Main Road', rera: 'P02400006211', image: '/projects/villa-3.jpg', type: '4 & 5 BHK Lakeview Eco-Villas' },
  { id: 'villa-4', title: 'Aparna Elixir Luxury Villas', category: 'Villas', price: '₹4.90 Cr - ₹7.25 Cr', location: 'Puppalguda - Gandipet Expressway, Narsingi', rera: 'P02400004910', image: '/projects/villa-4.jpg', type: '4 BHK Spanish-Themed Villas' },
  { id: 'house-1', title: 'Jubilee Hills & Film Nagar Estate', category: 'Individual Houses', price: '₹14.50 Cr', location: 'Film Nagar Hills - Jubilee Hills Rd 36', rera: 'GHMC Sanctioned', image: '/projects/house-1.jpg', type: '6 BHK Ultra-Luxury Private Villa Estate' },
  { id: 'house-2', title: 'Puppalguda Standalone Royal Duplex', category: 'Individual Houses', price: '₹2.85 Cr', location: 'Puppalguda - Hydershakote Main Road', rera: 'GHMC Sanctioned', image: '/projects/house-2.jpg', type: '4 BHK Independent Duplex Villa' },
  { id: 'house-3', title: 'Miyapur Greenview Independent House', category: 'Individual Houses', price: '₹2.15 Cr', location: 'BK Enclave, Near Sentia School, Miyapur', rera: 'GHMC Sanctioned', image: '/projects/house-3.jpg', type: '3 BHK North-East Independent Residence' },
  { id: 'house-4', title: 'Nizampet Prime Duplex Homestead', category: 'Individual Houses', price: '₹1.75 Cr - ₹2.25 Cr', location: 'Nizampet Village Road, Near KPHB Metro', rera: 'GHMC Sanctioned', image: '/projects/house-4.jpg', type: '3 & 4 BHK Gated Standalone Duplex' },
  { id: 'venture-1', title: 'Moinabad Eco Greens Farm & Villa Plots', category: 'Ventures', price: '₹28 Lakhs - ₹55 Lakhs', location: 'Chevella Road, Moinabad', rera: 'P02400002198', image: '/projects/venture-1.jpg', type: '200 - 600 Sq.Yds Plotted Community' },
  { id: 'venture-2', title: 'Neopolis Kokapet Growth Corridor Plots', category: 'Ventures', price: '₹85 Lakhs - ₹2.10 Cr', location: 'Golden Mile, Neopolis, Kokapet', rera: 'P02400004521', image: '/projects/venture-2.jpg', type: '300 - 800 Sq.Yds Commercial/Residential Plots' },
  { id: 'venture-3', title: 'Manikonda Panorama Plotted Enclave', category: 'Ventures', price: '₹45 Lakhs - ₹90 Lakhs', location: 'Puppalguda - Manikonda Hilltop Corridor', rera: 'P02400003411', image: '/projects/venture-3.jpg', type: '167 - 400 Sq.Yds Plotted Enclave' },
  { id: 'venture-4', title: 'Hyderabad View Gated Plotted Venture', category: 'Ventures', price: '₹38 Lakhs - ₹78 Lakhs', location: 'Shankarpally - Mokila Growth Zone', rera: 'P02400005722', image: '/projects/venture-4.jpg', type: '220 - 500 Sq.Yds DTCP/TS-RERA Villa Plots' }
];

const SYSTEM_PROMPT_REAL_ESTATE = `You are the Senior Real Estate Advisory Concierge for Hyderabad Homes (hyderabadhomes.com).
Your objective is to provide elite, accurate, engaging, and professional guidance in the helpful, structured conversational style of ChatGPT.

### CORE GROUNDING & WEBSITE DATA:
1. **Verified Project Portfolio**:
${VERIFIED_PROJECTS_CATALOG.map(p => `• **${p.title}** (${p.category})
  - Landing Page: [View ${p.title}](/project/${p.id})
  - Price: ${p.price} | Type: ${p.type}
  - Location: ${p.location} | RERA: ${p.rera}
  - Image: ![${p.title}](${p.image})`).join('\n\n')}

2. **Complimentary VIP Site Visit Dispatch**:
- 4 Daily Slots: 10:00 AM - 12:00 PM (Morning), 12:00 PM - 02:00 PM (Noon), 02:00 PM - 04:00 PM (Afternoon), 04:00 PM - 06:00 PM (Evening).
- Strict Capacity Limit: Maximum 2 confirmed leads per time slot to guarantee private relationship manager attention.
- Chauffeured AC car pickup from anywhere in Greater Hyderabad.

3. **Statutory & Legal Credentials**:
- Telangana State Real Estate Regulatory Authority (TS-RERA) Registered Agency: Reg No. **A02400000412**.
- All projects strictly comply with 70% escrow accounts, carpet area standardization, and 5-year structural defect warranties (Section 14(3), RERA Act 2016).
- Digital Personal Data Protection Act (DPDPA 2023) compliant.

4. **Direct Advisory Hotline**:
- Phone: +91 91234 56789 | Email: advisory@hyderabadhomes.com
- Corporate HQ: Level 14, One West Building, Financial District, Gachibowli, Hyderabad - 500032.

### BUDGET-BASED SEARCH INTELLIGENCE:
When the user mentions any budget (e.g. "budget 1 Cr", "under 1.5 Cr", "between 2 and 3 Cr", "luxury 5 Cr+"):
1. Immediately filter and display 2 to 3 ideal properties matching their exact budget.
2. For each project, show its bold title, exact pricing, location, and ALWAYS embed its image: ![Project Title](/projects/filename.jpg).
3. Inform the user that they can tap or click on any property image to open its full landing page and layout plans directly!

### CHATGPT-STYLE RESPONSE GUIDELINES:
- **Tone**: Warm, welcoming, authoritative, and concise.
- **Visuals & Links**: Whenever mentioning or recommending a project, ALWAYS include its clickable landing page link: [View Project Title](/project/id) and its exact image card: ![Project Title](/projects/filename.jpg).
- **Interactive Navigation**: Explicitly let the user know they can tap or click on any project image or link to open its full landing page, floor plans, and TS-RERA disclosures immediately.
- **Structure**: Use markdown bolding (**name**), bullet points (•), and appropriate emojis (🏢, 📍, 💰, 📅, ✨).
- **Call to Action**: Encourage scheduling a private site visit or booking directly on the website.`;

function getKnowledgeBaseResponse(query) {
  const q = query.toLowerCase();

  // Find if asking about a specific project
  const matchedProject = VERIFIED_PROJECTS_CATALOG.find(p => 
    q.includes(p.title.toLowerCase()) || 
    q.includes(p.id) ||
    p.title.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w))
  );

  if (matchedProject) {
    return `### **${matchedProject.title}** ✨\n\n![${matchedProject.title}](${matchedProject.image})\n\n[👉 View Full Landing Page & Floor Plans](/project/${matchedProject.id})\n\nHere are the verified specifications for this landmark development:\n• 💰 **Price Range:** ${matchedProject.price}\n• 📍 **Location:** ${matchedProject.location}\n• 🏢 **Category & Type:** ${matchedProject.category} • ${matchedProject.type}\n• 🛡️ **TS-RERA Registration:** \`${matchedProject.rera}\`\n\nWould you like to schedule a **complimentary chauffeured site visit**? We have 4 daily inspection slots available (max 2 confirmed leads per slot).`;
  }

  // ─── BUDGET-BASED MATCHING ENGINE ───────────────────────────
  const hasBudgetWord = q.includes('budget') || q.includes('price') || q.includes('cost') || q.includes('under') || q.includes('around') || q.includes('between') || q.includes('lakh') || q.includes('cr') || q.includes('crore');

  if (hasBudgetWord) {
    // Under 1 Cr / 50-80 Lakhs
    if (q.includes('under 1') || q.includes('under 50') || q.includes('50 lakh') || q.includes('75 lakh') || q.includes('80 lakh') || q.includes('1 crore') || q.includes('1 cr') || q.includes('88 lakh') || q.includes('below 1')) {
      return `### **Best Properties Under ₹1.50 Crore** 💰\n\nHere are top verified landmark developments tailored to your budget *(💡 Click any image to open its full landing page)*:\n\n1. **Trident Grande by Namishree**\n• 💰 **Price:** ₹88 Lakhs - ₹1.35 Cr\n• 🏢 **Type:** 2 & 3 BHK Modern Residences\n• 📍 **Location:** Tellapur - Kollur Road, Near ORR Exit 2\n• 🛡️ **TS-RERA:** \`P02400006781\`\n![Trident Grande by Namishree](/projects/apt-3.jpg)\n\n2. **Lanco Hills Integrated Township**\n• 💰 **Price:** ₹1.10 Cr - ₹1.85 Cr\n• 🏢 **Type:** 2 & 3 BHK Lake-Facing Units\n• 📍 **Location:** Lanco Hills Road, Manikonda\n• 🛡️ **TS-RERA:** \`P02400002145\`\n![Lanco Hills Integrated Township](/projects/apt-1.jpg)\n\n3. **Moinabad Eco Greens Villa Plots**\n• 💰 **Price:** ₹28 Lakhs - ₹55 Lakhs\n• 🌳 **Type:** 200 - 600 Sq.Yds Plotted Community\n• 📍 **Location:** Chevella Road, Moinabad\n• 🛡️ **TS-RERA:** \`P02400002198\`\n![Moinabad Eco Greens Farm & Villa Plots](/projects/venture-1.jpg)\n\nWould you like to reserve a **chauffeured VIP site visit** to any of these locations?`;
    }

    // 1.5 Cr to 3.0 Cr
    if (q.includes('1.5') || q.includes('2 cr') || q.includes('2 crore') || q.includes('2.5') || q.includes('3 cr') || q.includes('3 crore') || q.includes('under 3')) {
      return `### **Best Properties in ₹1.50 Cr – ₹3.00 Cr Budget** 💰\n\nHere are our prime curated homes in this bracket *(💡 Click any image to view full landing page and floor plans)*:\n\n1. **Aparna Zenon & SAS iRA High-Rise**\n• 💰 **Price:** ₹2.15 Cr - ₹3.25 Cr\n• 🏢 **Type:** 2, 3 & 4 BHK High-Rise Apartments\n• 📍 **Location:** Nanakramguda, Financial District\n• 🛡️ **TS-RERA:** \`P02400006541\`\n![Aparna Zenon & SAS iRA High-Rise](/projects/tower-4.jpg)\n\n2. **Puppalguda Standalone Royal Duplex**\n• 💰 **Price:** ₹2.85 Cr\n• 🏡 **Type:** 4 BHK Independent Duplex Villa\n• 📍 **Location:** Puppalguda - Hydershakote Main Road\n• 🛡️ **Sanction:** \`GHMC Sanctioned\`\n![Puppalguda Standalone Royal Duplex](/projects/house-2.jpg)\n\n3. **Myscape Isle of Sky Residences**\n• 💰 **Price:** ₹2.40 Cr - ₹3.60 Cr\n• 🏢 **Type:** 3 & 4 BHK Boutique Residences\n• 📍 **Location:** ISB Road, Financial District\n• 🛡️ **TS-RERA:** \`P02400007120\`\n![Myscape Isle of Sky Residences](/projects/apt-4.jpg)\n\nWould you like to book an inspection tour? Call **+91 91234 56789** or choose a slot directly on the portal.`;
    }

    // 3.0 Cr to 5.0 Cr+
    if (q.includes('3.5') || q.includes('4 cr') || q.includes('4 crore') || q.includes('4.5') || q.includes('5 cr') || q.includes('5 crore') || q.includes('luxury') || q.includes('villa')) {
      return `### **Luxury Homes in ₹3.00 Cr – ₹6.50 Cr+ Budget** 👑\n\nHere are our flagship ultra-luxury estates and sky villas *(💡 Click any image to explore full landing page)*:\n\n1. **SAS Crown Neopolis Towers**\n• 💰 **Price:** ₹3.85 Cr - ₹6.50 Cr\n• 🏙️ **Type:** 4 & 5 BHK Sky Mansions\n• 📍 **Location:** Neopolis, Golden Mile, Kokapet\n• 🛡️ **TS-RERA:** \`P02400007890\`\n![SAS Crown Neopolis Towers](/projects/tower-1.jpg)\n\n2. **Villa Greens Gandipet**\n• 💰 **Price:** ₹4.50 Cr - ₹6.80 Cr\n• 🏡 **Type:** 4 BHK Luxury Triplex Villas with Lake Views\n• 📍 **Location:** Gandipet Village Road, Osman Sagar Lake\n• 🛡️ **TS-RERA:** \`P02400003889\`\n![Villa Greens Gandipet](/projects/villa-1.jpg)\n\n3. **My Home Bhooja Luxury Towers**\n• 💰 **Price:** ₹3.10 Cr - ₹4.80 Cr\n• 🏙️ **Type:** 3 & 4 BHK Sky Condominiums\n• 📍 **Location:** Raidurg, Knowledge City, HITEC City\n• 🛡️ **TS-RERA:** \`P02400003211\`\n![My Home Bhooja Luxury Towers](/projects/tower-2.jpg)\n\n4. **Kokapet Upscale Grandeur Villas**\n• 💰 **Price:** ₹5.50 Cr - ₹8.20 Cr\n• 🏡 **Type:** 5 BHK Bespoke Palatial Mansions\n• 📍 **Location:** Golden Mile, Kokapet\n• 🛡️ **TS-RERA:** \`P02400007543\`\n![Kokapet Upscale Grandeur Villas](/projects/villa-2.jpg)\n\nComplimentary VIP chauffeured cab pickup is available for private walkthroughs!`;
    }
  }

  // Project listing / ongoing projects
  if (q.includes('project') || q.includes('ongoing') || q.includes('list') || q.includes('properties') || q.includes('what do you have')) {
    return `### **Featured Landmark Developments** 🏢\n\nHere are top highlighted projects from our 20-development portfolio:\n\n1. **SAS Crown Neopolis Towers** (Kokapet • ₹3.85 Cr+)\n![SAS Crown](/projects/tower-1.jpg)\n\n2. **Villa Greens Gandipet** (Gandipet Lake • ₹4.50 Cr+)\n![Villa Greens](/projects/villa-1.jpg)\n\n3. **Trident Grande by Namishree** (Tellapur • ₹88 Lakhs+)\n![Trident Grande](/projects/apt-3.jpg)\n\n4. **Neopolis Growth Corridor Plots** (Kokapet • ₹85 Lakhs+)\n![Neopolis Plots](/projects/venture-2.jpg)\n\nAll projects are **TS-RERA registered** with legal due diligence completed. How can I assist your property search today?`;
  }

  // Site visit / booking / slot inquiries
  if (q.includes('visit') || q.includes('book') || q.includes('schedule') || q.includes('tour') || q.includes('slot') || q.includes('cab')) {
    return `### **Complimentary VIP Site Visit Dispatch** 🚗\n\nExperience personalized property walkthroughs with our senior relationship managers. We provide complimentary chauffeured AC pickup across Hyderabad.\n\n📅 **Available Inspection Slots (Daily):**\n• **10:00 AM – 12:00 PM** (Morning Tour)\n• **12:00 PM – 02:00 PM** (Noon Tour)\n• **02:00 PM – 04:00 PM** (Afternoon Tour)\n• **04:00 PM – 06:00 PM** (Sunset Inspection)\n\n⚠️ *Strict Capacity Rule: To ensure dedicated attention, each slot is capped at a strict maximum of 2 confirmed leads.*\n\nYou can reserve your preferred date and slot on our interactive booking calendar!`;
  }

  // Contact / Phone / Office inquiries
  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('office') || q.includes('address')) {
    return `### **Hyderabad Homes Advisory Headquarters** 📞\n\n• 📱 **Direct Advisory Hotline:** [+91 91234 56789](tel:+919123456789)\n• 📧 **Official Email:** [advisory@hyderabadhomes.com](mailto:advisory@hyderabadhomes.com)\n• 🏢 **Registered Corporate Office:** Level 14, One West Building, Financial District, Gachibowli, Hyderabad - 500032 (Opp. US Consulate & Waverock)\n• ⏰ **Advisory Hours:** Monday through Saturday, 9:30 AM – 7:00 PM IST`;
  }

  // RERA / Legal inquiries
  if (q.includes('rera') || q.includes('legal') || q.includes('approval') || q.includes('escrow') || q.includes('complian')) {
    return `### **TS-RERA Compliance & Consumer Safeguards** 🛡️\n\nHyderabad Homes is an authorized **Telangana State RERA Registered Agency (Reg: A02400000412)**.\n\nEvery project in our portfolio adheres strictly to statutory mandates:\n• **70% Escrow Account Safeguard:** All funds are locked in scheduled bank escrow accounts dedicated solely to project construction.\n• **RERA Carpet Area Pricing:** Zero arbitrary super-built-up inflation.\n• **5-Year Structural Defect Warranty:** Promoters are legally bound to rectify structural defects free of charge within 30 days under Section 14(3).`;
  }

  // Generic greeting / general assistant
  return `### **Welcome to Hyderabad Homes!** 👋\n\nI am your AI Real Estate Concierge. I can help you with:\n\n• 🏢 **Explore 20 Landmark Projects** with verified pricing and photos\n• 🚗 **Schedule a VIP Site Visit** (4 daily slots with chauffeured pickup)\n• 🛡️ **TS-RERA Legal Verification** & title clearance checks\n• 📞 **Direct Advisory Connect** at +91 91234 56789\n\nWhich location or property type (Apartments, Villas, Towers, or Plots) are you interested in today?`;
}

// Chatbot endpoint with trained meta/llama-3.2-11b-vision-instruct + Zero Downtime Fallback
app.post('/api/chat', chatLimiter, async (req, res) => {
  const userMsg = req.body.message || '';
  const normalizedMsg = userMsg.trim().toLowerCase();

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  if (responseCache.has(normalizedMsg)) {
    console.log(`[CACHE HIT] ${normalizedMsg}`);
    res.write(responseCache.get(normalizedMsg));
    return res.end();
  }

  let streamedAny = false;
  let fullResponse = '';

  // 1. Invoke meta/llama-3.2-11b-vision-instruct on NVIDIA NIM
  const targetModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
  const hasKey = process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.startsWith('nvapi-');

  if (hasKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7-second fail-fast timeout

      const stream = await openai.chat.completions.create({
        model: targetModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_REAL_ESTATE },
          { role: 'user', content: userMsg }
        ],
        temperature: 0.4,
        max_tokens: 450,
        stream: true
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          streamedAny = true;
          fullResponse += content;
          res.write(content);
        }
      }

      if (streamedAny && fullResponse.trim().length > 10) {
        responseCache.set(normalizedMsg, fullResponse);
        return res.end();
      }
    } catch (apiError) {
      console.warn(`[WARN] NVIDIA NIM call (${targetModel}) delayed/skipped, invoking Knowledge Engine:`, apiError.message);
    }
  }

  // 2. Resilient Real Estate Knowledge Base Streamer (Zero Downtime Guarantee)
  const kbAnswer = getKnowledgeBaseResponse(userMsg);
  fullResponse = kbAnswer;
  responseCache.set(normalizedMsg, fullResponse);

  // Stream in realistic word bursts (20ms per token) for fluid typing animation
  const tokens = kbAnswer.split(/(\s+)/);
  for (let i = 0; i < tokens.length; i++) {
    res.write(tokens[i]);
    await new Promise(r => setTimeout(r, 16));
  }
  res.end();
});

// Submit contact inquiry
const handleContactInquiry = async (req, res) => {
  const errors = validateContactInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { phone, name, interest, budget, visitDate, message, projectTitle, projectImage, projectId } = req.body;
  const now = new Date().toISOString();
  let savedToSupabase = false;

  // Try Supabase first if healthy
  if (await isSupabaseHealthy()) {
    try {
      const { data: existingUser, error: queryError } = await supabase
        .from('inquiries')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (!queryError) {
        if (existingUser) {
          const { error: updateError } = await supabase
            .from('inquiries')
            .update({
              name,
              interest: interest || 'Apartments',
              budget: budget || 'Not specified',
              visitDate: visitDate || 'Not specified',
              message: message || ''
            })
            .eq('id', existingUser.id);

          if (!updateError) savedToSupabase = true;
        } else {
          const { data, error: insertError } = await supabase
            .from('inquiries')
            .insert([{
              name,
              phone,
              interest: interest || 'Apartments',
              budget: budget || 'Not specified',
              visitDate: visitDate || 'Not specified',
              message: message || ''
            }])
            .select();

          if (!insertError && data && data.length > 0) savedToSupabase = true;
        }
      }
    } catch (sbErr) {
      console.warn('[WARN] Supabase operation failed, using local storage fallback:', sbErr.message);
    }
  }

  // Extract and separate fields for deep lead intelligence
  const extractField = (str, pattern) => {
    if (!str) return '';
    const m = str.match(pattern);
    return m ? m[1].trim() : '';
  };

  const parsedBookingRef = req.body.bookingRef || extractField(message, /Booking Ref:\s*([^\s|]+)/i) || `VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const parsedTimeSlot = req.body.timeSlot || extractField(message, /Preferred Time:\s*([^|]+)/i) || '10:00 AM - 12:00 PM';
  const normalizedRequestedSlot = normalizeSlot(parsedTimeSlot);
  const parsedUnitInterest = req.body.unitInterest || extractField(message, /Unit Interest:\s*\[?([^\]|]+)\]?/i) || '';
  const parsedPickup = req.body.pickupRequired !== undefined
    ? (req.body.pickupRequired ? 'Yes (Requested)' : 'No (Self Drive)')
    : (extractField(message, /Cab Pick & Drop:\s*([^|]+)/i) || (message?.toLowerCase().includes('cab') ? 'Yes (Requested)' : 'No (Self Drive)'));
  const parsedNotes = req.body.notes || extractField(message, /(?:Notes|Special Note):\s*([^|]+)/i) || '';

  // Enforce Max 2 Leads per Time Slot for any given visitDate (only counting active leads; closed/converted release slots)
  if (visitDate && visitDate !== 'Not specified') {
    const currentData = getLocalInquiries();
    const existingSlotCount = currentData.filter(item =>
      item.visitDate === visitDate &&
      normalizeSlot(item.timeSlot) === normalizedRequestedSlot &&
      item.phone !== phone &&
      isSlotOccupying(item)
    ).length;

    if (existingSlotCount >= MAX_LEADS_PER_SLOT) {
      console.warn(`[SLOT FULL] Blocked: Date ${visitDate}, Slot ${normalizedRequestedSlot} already has ${existingSlotCount} active leads.`);
      return res.status(409).json({
        error: 'Slot full',
        slotFull: true,
        message: 'The slots are filled, please select another slot.'
      });
    }
  }

  // Always update local JSON dataset as well for guaranteed persistence
  try {
    const localData = getLocalInquiries();
    const existingIndex = localData.findIndex(item => item.phone === phone);

    if (existingIndex !== -1) {
      localData[existingIndex] = {
        ...localData[existingIndex],
        name,
        interest: interest || localData[existingIndex].interest || 'Apartments',
        budget: budget || localData[existingIndex].budget || 'Not specified',
        visitDate: visitDate || localData[existingIndex].visitDate || 'Not specified',
        timeSlot: parsedTimeSlot || localData[existingIndex].timeSlot || '10:00 AM - 12:00 PM',
        unitInterest: parsedUnitInterest || localData[existingIndex].unitInterest || '',
        pickupRequired: parsedPickup || localData[existingIndex].pickupRequired || 'No (Self Drive)',
        bookingRef: parsedBookingRef || localData[existingIndex].bookingRef,
        clientNotes: parsedNotes || localData[existingIndex].clientNotes || '',
        message: message !== undefined ? message : (localData[existingIndex].message || ''),
        projectTitle: projectTitle || localData[existingIndex].projectTitle || '',
        projectImage: projectImage || localData[existingIndex].projectImage || '',
        projectId: projectId || localData[existingIndex].projectId || '',
        updatedAt: now
      };
      saveLocalInquiries(localData);

      console.log(`[UPDATE INQUIRY] ID: ${localData[existingIndex].id} for ${name} (${phone}) [Supabase: ${savedToSupabase ? 'Synced' : 'Local Storage'}]`);
      return res.status(200).json({
        success: true,
        existing: true,
        user: { name },
        message: `Welcome back, ${name}! Your details have been updated.`
      });
    } else {
      const newId = 'inq_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      const newInquiry = {
        id: newId,
        name,
        phone,
        interest: interest || 'Apartments',
        budget: budget || 'Not specified',
        visitDate: visitDate || 'Not specified',
        timeSlot: parsedTimeSlot,
        unitInterest: parsedUnitInterest,
        pickupRequired: parsedPickup,
        bookingRef: parsedBookingRef,
        clientNotes: parsedNotes,
        adminNotes: '',
        message: message || '',
        projectTitle: projectTitle || '',
        projectImage: projectImage || '',
        projectId: projectId || '',
        createdAt: now,
        status: 'new'
      };
      localData.unshift(newInquiry);
      saveLocalInquiries(localData);

      console.log(`[NEW INQUIRY] ID: ${newId} for ${name} (${phone}) [Supabase: ${savedToSupabase ? 'Synced' : 'Local Storage'}]`);
      return res.status(201).json({ success: true, id: newId });
    }
  } catch (err) {
    console.error('[ERROR] Failed to save inquiry:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

app.post('/api/contact', contactLimiter, handleContactInquiry);
app.post('/api/inquiries', contactLimiter, handleContactInquiry);

// ──────────────────────────────────────────────
// Admin Authentication Middleware
// ──────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin123').replace(/^["']|["']$/g, '').trim();

  // Multi-password support: configured password, default 'admin123', and 'jayanth@#123'
  const validPasswords = new Set([
    configuredPassword,
    'admin123',
    'jayanth@#123'
  ]);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Missing authorization token.' });
  }

  const token = authHeader.slice(7).trim();
  if (!validPasswords.has(token)) {
    return res.status(401).json({ error: 'Unauthorized access. Invalid admin password.' });
  }

  next();
};

// Get all inquiries (protected admin endpoint)
app.get('/api/inquiries', requireAdmin, async (_req, res) => {
  try {
    if (await isSupabaseHealthy()) {
      const { data, error } = await supabase.from('inquiries').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }));
        return res.json({ count: formatted.length, inquiries: formatted });
      }
    }
  } catch (err) {
    console.warn('[WARN] Supabase fetch failed, falling back to local file:', err.message);
  }

  // Reliable local fallback
  const localData = getLocalInquiries();
  const formatted = localData.map(item => ({
    ...item,
    createdAt: item.createdAt || item.created_at || new Date().toISOString()
  }));
  res.json({ count: formatted.length, inquiries: formatted });
});

// Update an inquiry (status, notes, etc.)
app.patch('/api/inquiries/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  try {
    const localData = getLocalInquiries();
    const index = localData.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    localData[index] = {
      ...localData[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveLocalInquiries(localData);

    console.log(`[UPDATE INQUIRY] Successfully updated ${id}`, updates);
    res.status(200).json({ success: true, inquiry: localData[index] });
  } catch (err) {
    console.error('[ERROR] Failed to update inquiry:', err);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Delete an inquiry (protected admin endpoint)
app.delete('/api/inquiries/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (supabase) {
      await supabase.from('inquiries').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('[WARN] Supabase delete failed:', err.message);
  }

  try {
    const localData = getLocalInquiries();
    const filtered = localData.filter(item => String(item.id) !== String(id));
    saveLocalInquiries(filtered);

    console.log(`[DELETE INQUIRY] Successfully deleted ${id}`);
    res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error('[ERROR] Failed to delete inquiry locally:', err);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// Properties data API (20 Landmark Hyderabad Projects)
app.get('/api/properties', (_req, res) => {
  res.json({
    total: 20,
    categories: ['Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'],
    projects: [
      // Towers
      { id: 'tower-1', title: 'SAS Crown Neopolis Towers', category: 'Towers', location: 'Neopolis, Golden Mile, Kokapet', type: '4 & 5 BHK Sky Mansions', price: '₹3.85 Cr - ₹6.50 Cr', sqft: '3,800 - 5,800 sq.ft', status: 'New Launch', rera: 'P02400007890' },
      { id: 'tower-2', title: 'My Home Bhooja Luxury Towers', category: 'Towers', location: 'Raidurg, Knowledge City, HITEC City', type: '3 & 4 BHK High-Rise Residences', price: '₹3.10 Cr - ₹4.80 Cr', sqft: '2,650 - 4,070 sq.ft', status: 'Ready to Move', rera: 'P02400003211' },
      { id: 'tower-3', title: 'Lodha Belleza Sky Villas', category: 'Towers', location: 'KPHB - HITEC City Link Road', type: '4 & 5 BHK Duplex Sky Villas', price: '₹3.40 Cr - ₹5.60 Cr', sqft: '3,500 - 5,200 sq.ft', status: 'Exclusive', rera: 'P02400001890' },
      { id: 'tower-4', title: 'Aparna Zenon & SAS iRA High-Rise', category: 'Towers', location: 'Nanakramguda, Financial District', type: '3 & 4 BHK Smart Towers', price: '₹2.15 Cr - ₹3.25 Cr', sqft: '2,150 - 3,100 sq.ft', status: 'Under Construction', rera: 'P02400006541' },
      
      // Apartments
      { id: 'apt-1', title: 'Lanco Hills Integrated Township', category: 'Apartments', location: 'Manikonda - Gachibowli Corridor', type: '2.5 & 3 BHK Luxury Residences', price: '₹1.10 Cr - ₹1.85 Cr', sqft: '1,550 - 2,450 sq.ft', status: 'Ready to Move', rera: 'P02400002145' },
      { id: 'apt-2', title: 'Western Plaza Gated Enclave', category: 'Apartments', location: 'Kondapur - HITEC City Extension', type: '3 & 4 BHK Modern Apartments', price: '₹1.45 Cr - ₹2.25 Cr', sqft: '1,800 - 2,850 sq.ft', status: 'Ready to Move', rera: 'P02400005432' },
      { id: 'apt-3', title: 'Trident Grande by Namishree', category: 'Apartments', location: 'Tellapur - Gachibowli Extension', type: '2 & 3 BHK Premium Units', price: '₹88 Lakhs - ₹1.35 Cr', sqft: '1,320 - 1,980 sq.ft', status: 'Under Construction', rera: 'P02400006781' },
      { id: 'apt-4', title: 'Myscape Isle of Sky Residences', category: 'Apartments', location: 'Financial District, Gachibowli', type: '3 & 4 BHK Boutique Living', price: '₹2.40 Cr - ₹3.60 Cr', sqft: '2,350 - 3,450 sq.ft', status: 'RERA Approved', rera: 'P02400007120' },

      // Villas
      { id: 'villa-1', title: 'Villa Greens Gandipet', category: 'Villas', location: 'Gandipet - Osman Sagar, Hyderabad', type: '4 & 5 BHK Triplex Spanish Villas', price: '₹4.50 Cr - ₹6.80 Cr', sqft: '4,200 - 5,600 sq.ft', status: 'Ready to Move', rera: 'P02400003889' },
      { id: 'villa-2', title: 'Kokapet Upscale Grandeur Villas', category: 'Villas', location: 'Golden Mile, Kokapet, Hyderabad', type: '4 BHK Luxury Triplex Villas', price: '₹5.50 Cr - ₹8.20 Cr', sqft: '4,600 - 6,200 sq.ft', status: 'Exclusive', rera: 'P02400007543' },
      { id: 'villa-3', title: 'Palampally Lakeside Villas', category: 'Villas', location: 'Narsingi - Gandipet Main Road', type: '4 & 5 BHK Waterfront Villas', price: '₹4.80 Cr - ₹7.10 Cr', sqft: '4,400 - 5,800 sq.ft', status: 'Ready to Move', rera: 'P02400006211' },
      { id: 'villa-4', title: 'Aparna Elixir Luxury Villas', category: 'Villas', location: 'Gandipet - Narsingi Corridor', type: '4 & 5 BHK Signature Triplex', price: '₹4.90 Cr - ₹7.25 Cr', sqft: '4,500 - 5,900 sq.ft', status: 'Exclusive', rera: 'P02400004910' },

      // Individual Houses
      { id: 'house-1', title: 'Jubilee Hills & Film Nagar Estate', category: 'Individual Houses', location: 'Film Nagar Hills - Jubilee Hills Rd 36', type: '5 BHK Independent Royal Duplex', price: '₹14.50 Cr', sqft: '6,500 sq.ft (450 Sq.Yd Plot)', status: 'Ready to Move', rera: 'GHMC Approved' },
      { id: 'house-2', title: 'Puppalguda Standalone Royal Duplex', category: 'Individual Houses', location: 'Puppalguda - Hydershakote Main Road', type: '4 BHK Independent Triplex House', price: '₹2.85 Cr', sqft: '3,200 sq.ft (200 Sq.Yd Plot)', status: 'Ready to Move', rera: 'GHMC Approved' },
      { id: 'house-3', title: 'Miyapur Greenview Independent House', category: 'Individual Houses', location: 'Near Sentia Global School, Miyapur', type: '4 BHK Independent Duplex House', price: '₹2.15 Cr', sqft: '2,850 sq.ft (220 Sq.Yd Plot)', status: 'New Launch', rera: 'GHMC Approved' },
      { id: 'house-4', title: 'Nizampet Prime Duplex Homestead', category: 'Individual Houses', location: 'Nizampet, Near KPHB Metro Corridor', type: '3 & 4 BHK Independent Duplex', price: '₹1.75 Cr - ₹2.25 Cr', sqft: '2,600 - 3,100 sq.ft', status: 'Under Construction', rera: 'GHMC Approved' },

      // Ventures
      { id: 'venture-1', title: 'Moinabad Eco Greens Farm & Villa Plots', category: 'Ventures', location: 'Chevella Road, Moinabad, Hyderabad', type: 'HMDA / DTCP Compliant Farm Plots', price: '₹28 Lakhs - ₹55 Lakhs', sqft: '250 - 600 Sq.Yards', status: 'Immediate Registration', rera: 'P02400002198' },
      { id: 'venture-2', title: 'Neopolis Kokapet Growth Corridor Plots', category: 'Ventures', location: 'Golden Mile, Neopolis, Kokapet', type: 'HMDA Commercial & Residential Plots', price: '₹85 Lakhs - ₹2.10 Cr', sqft: '300 - 800 Sq.Yards', status: 'Immediate Registration', rera: 'P02400004521' },
      { id: 'venture-3', title: 'Manikonda Panorama Plotted Enclave', category: 'Ventures', location: 'Puppalguda - Manikonda Hilltop Corridor', type: 'Premium Villa Plots', price: '₹45 Lakhs - ₹90 Lakhs', sqft: '200 - 450 Sq.Yards', status: 'Ready for Construction', rera: 'P02400003411' },
      { id: 'venture-4', title: 'Hyderabad View Gated Plotted Venture', category: 'Ventures', location: 'Shankarpally - Mokila Growth Zone', type: 'Gated Resort & Villa Plots', price: '₹38 Lakhs - ₹78 Lakhs', sqft: '220 - 500 Sq.Yards', status: 'Ready for Construction', rera: 'P02400005722' }
    ],
  });
});

// ──────────────────────────────────────────────
// Start Server (or export for Vercel Serverless)
// ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  🏠 Hyderabad Homes API Server`);
    console.log(`  ➜ Local: http://localhost:${PORT}`);
    console.log(`  ➜ Health: http://localhost:${PORT}/api/health`);
    console.log(`  ➜ Inquiries: http://localhost:${PORT}/api/inquiries\n`);
  });
}

export default app;
