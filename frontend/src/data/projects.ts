export interface UnitConfig {
  name: string;
  size: string;
  facing: string;
  bathrooms: string;
  balcony: string;
  price: string;
}

export interface ConnectivityPoint {
  landmark: string;
  distance: string;
  travelTime: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: 'Towers' | 'Apartments' | 'Villas' | 'Individual Houses' | 'Ventures';
  location: string;
  developer: string;
  type: string;
  price: string;
  sqft: string;
  badge: 'RERA APPROVED' | 'READY TO MOVE' | 'UNDER CONSTRUCTION' | 'NEW LAUNCH' | 'PRE-LAUNCH' | 'HMDA APPROVED' | 'DTCP APPROVED' | 'EXCLUSIVE';
  image: string;
  fallbackImage: string;
  rera: string;
  possession: string;
  description: string;
  overview: string;
  priceBreakdown: {
    startingPrice: string;
    pricePerUnit: string;
    emiStarting: string;
  };
  configurations: UnitConfig[];
  specifications: Record<string, string[]>;
  amenities: string[];
  amenitiesCategorized?: Record<string, string[]>;
  connectivity: ConnectivityPoint[];
  legalApprovals: string[];
  bankPartners: string[];
}

export const CATEGORIES = ['All', 'Towers', 'Apartments', 'Villas', 'Individual Houses', 'Ventures'] as const;
export type CategoryType = typeof CATEGORIES[number];

// Short, punchy project names for clean mobile & desktop dropdowns
export const SHORT_PROJECT_NAMES: Record<string, string> = {
  'tower-1': 'SAS Crown',
  'tower-2': 'My Home Bhooja',
  'tower-3': 'Aparna Sarovar Zenith',
  'tower-4': 'Jayabheri The Peak',
  'apt-1': 'Aparna CyberLife',
  'apt-2': 'My Home Avatar',
  'apt-3': 'Rajapushpa Atria',
  'apt-4': 'Candeur Landmark',
  'apt-5': 'Prestige High Fields',
  'villa-1': 'Boulder Hills Villas',
  'villa-2': 'Ramky Tranquillas',
  'villa-3': 'Fortune Butterfly Villas',
  'house-1': 'Jubilee Hills Bungalow',
  'house-2': 'Banjara Hills Residence',
  'house-3': 'Madhapur Villa-House',
  'house-4': 'Gachibowli Villa',
  'plot-1': 'SMR Urban Meadows',
  'plot-2': 'Aero County Plots',
  'plot-3': 'Pharma City Acres',
  'plot-4': 'Subishi Infra Springs'
};

export function getShortProjectName(p: { id?: string; title: string }): string {
  if (p.id && SHORT_PROJECT_NAMES[p.id]) return SHORT_PROJECT_NAMES[p.id];
  // Title-based lookup fallback
  const foundEntry = Object.entries(SHORT_PROJECT_NAMES).find(([, short]) => {
    return p.title.toLowerCase().includes(short.toLowerCase());
  });
  if (foundEntry) return foundEntry[1];
  return p.title.split(' - ')[0].split('•')[0].trim();
}

export const PROJECTS: Project[] = [
  // ─── TOWERS (Real Hyderabad Skyscrapers & High-Rises) ──────────────────────
  {
    id: 'tower-1',
    slug: 'sas-crown-neopolis-towers',
    title: 'SAS Crown Neopolis Towers',
    category: 'Towers',
    location: 'Neopolis, Golden Mile, Kokapet, Hyderabad - 500075',
    developer: 'SAS Infra Group',
    type: '4 & 5 BHK Sky Mansions',
    price: '₹3.85 Cr - ₹6.50 Cr',
    sqft: '3,800 - 5,800 sq.ft',
    badge: 'NEW LAUNCH',
    image: '/projects/tower-1.jpg',
    fallbackImage: '/projects/tower-2.jpg',
    rera: 'P02400007890',
    possession: 'Dec 2027',
    description: 'Iconic 58-storey residential skyscraper overlooking Gandipet Lake — the tallest luxury tower in South India with a 75,000 sq.ft Sky Club.',
    overview: 'Rising 235 meters above the Golden Mile in Neopolis Kokapet, SAS Crown stands as South India’s tallest and most luxurious residential skyscraper. Designed by world-renowned structural engineers and interior architects, each floor features only 2 to 3 palatial Sky Mansions with 12-foot floor-to-ceiling heights, private biometric elevators, and panoramic 270-degree vistas across Osman Sagar Lake and the Financial District skyline.',
    priceBreakdown: {
      startingPrice: '₹3.85 Cr',
      pricePerUnit: '₹9,800 - ₹11,200 / sq.ft',
      emiStarting: '₹2.65 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Grand Sky Mansion', size: '3,800 sq.ft', facing: 'East / North', bathrooms: '4 + Maid', balcony: 'Double Deck', price: '₹3.85 Cr' },
      { name: '4.5 BHK Lakeview Suite', size: '4,650 sq.ft', facing: 'Lake Facing (West)', bathrooms: '5 + Maid', balcony: 'Triple Deck', price: '₹4.90 Cr' },
      { name: '5 BHK Presidential Penthouse', size: '5,800 sq.ft', facing: 'Corner 270° Panoramic', bathrooms: '6 + 2 Maid', balcony: 'Private Cantilever Terrace', price: '₹6.50 Cr' }
    ],
    specifications: {
      'Structure & Walls': ['RCC Framed Shear-Wall Structure designed for Seismic Zone-II', 'High-Grade Concrete with Thermal Insulation Blocks'],
      'Flooring & Dado': ['Italian Botticino Marble in Living, Dining & Foyer', 'Engineered Hardwood Flooring in Master Suite', 'Anti-Skid Spanish Ceramic Tiles on Decks'],
      'Doors & Windows': ['8-Foot High Teak Wood Main Door with Digital Biometric Lock', 'Schüco Double-Glazed Sound-Insulated Aluminum Windows'],
      'Kitchen & Utilities': ['Provisions for Centralized Gas Piping & Modular German Kitchen', 'Separate Wet & Dry Utility Area with Maid Quarters'],
      'Sanitary & Plumbing': ['Grohe & Kohler Concealed Wall-Hung Fixtures', 'Hydro-Pneumatic Pressurized Water Supply System'],
      'Electrical & Automation': ['Integrated Smart Home IoT Automation for Lighting, AC & Curtains', '100% DG Power Backup including Air Conditioning']
    },
    amenities: ['Sky Lounge at 55th Floor', 'Private High-Speed Elevators', 'Cantilever Infinity Pool', 'Triple-Height Grand Lobby', 'Helipad Access', 'Olympic Badminton Courts'],
    amenitiesCategorized: {
      'Clubhouse & Leisure': ['75,000 sq.ft Sky Club Luxe at 55th Floor', 'Cantilever Glass Infinity Pool', 'Private Cigar & Wine Tasting Lounge', 'Private 40-Seater Dolby Atmos Preview Theater'],
      'Health & Fitness': ['State-of-the-Art Technogym Fitness Center', 'Temperature-Controlled Indoor Lap Pool', 'Steam, Sauna & Hydrotherapy Spa Suites', 'Squash & Badminton Arenas'],
      'Work & Conveniences': ['Business Executive Suites & Coworking Pods', 'Concierge Desk & 24/7 Valet Service', 'EV High-Speed Charging Bays at Every Parking Slot']
    },
    connectivity: [
      { landmark: 'Outer Ring Road (Kokapet Exit 1)', distance: '0.8 km', travelTime: '2 mins' },
      { landmark: 'Financial District (Waverock / US Consulate)', distance: '4.5 km', travelTime: '7 mins' },
      { landmark: 'HITEC City Cyber Towers', distance: '10.2 km', travelTime: '15 mins' },
      { landmark: 'Rajiv Gandhi International Airport (RGIA)', distance: '26.0 km', travelTime: '22 mins via ORR' }
    ],
    legalApprovals: ['TS-RERA Registered (P02400007890)', 'HMDA Final Layout Sanctioned', 'AAI (Airports Authority) Height Clearance Approved', 'Fire NOC & Environmental Clearance Compliant'],
    bankPartners: ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
  },
  {
    id: 'tower-2',
    slug: 'my-home-bhooja-luxury-towers',
    title: 'My Home Bhooja Luxury Towers',
    category: 'Towers',
    location: 'Raidurg, Knowledge City, HITEC City, Hyderabad - 500081',
    developer: 'My Home Group',
    type: '3 & 4 BHK High-Rise Residences',
    price: '₹3.10 Cr - ₹4.80 Cr',
    sqft: '2,650 - 4,070 sq.ft',
    badge: 'READY TO MOVE',
    image: '/projects/tower-2.jpg',
    fallbackImage: '/projects/tower-1.jpg',
    rera: 'P02400003211',
    possession: 'Ready to Move',
    description: 'Premier 36-floor luxury high-rise development in HITEC City with panoramic views of the Durgam Cheruvu cable bridge and financial hub.',
    overview: 'Spanning 18 sprawling acres in the nucleus of HITEC City Knowledge City, My Home Bhooja represents the benchmark of elite residential living in Hyderabad. Comprising 7 majestic towers rising 36 storeys high, Bhooja is enveloped by the Bio-Diversity Park and Durgam Cheruvu Lake, offering unparalleled walk-to-work convenience to Salesforce, Novartis, Microsoft, and Google campuses.',
    priceBreakdown: {
      startingPrice: '₹3.10 Cr',
      pricePerUnit: '₹11,500 - ₹12,800 / sq.ft',
      emiStarting: '₹2.15 Lakhs / month'
    },
    configurations: [
      { name: '3 BHK Luxury Suite', size: '2,650 sq.ft', facing: 'East', bathrooms: '3 + Powder', balcony: '2 Spacious Balconies', price: '₹3.10 Cr' },
      { name: '4 BHK Grand Residence', size: '3,430 sq.ft', facing: 'North / East', bathrooms: '4 + Maid', balcony: 'Skyline Terrace', price: '₹3.95 Cr' },
      { name: '4 BHK Lakeview Sky Villa', size: '4,070 sq.ft', facing: 'West (Durgam Cheruvu View)', bathrooms: '5 + Maid', balcony: 'Double Deck', price: '₹4.80 Cr' }
    ],
    specifications: {
      'Structure & Walls': ['Earthquake Resistant RCC Framed Structure with Aluminium Formwork', 'Solid Cement Concrete Blocks'],
      'Flooring & Dado': ['Imported Marble in Foyer, Living, Dining & Family Lounge', 'Wooden Laminated Flooring in All Bedrooms'],
      'Doors & Windows': ['Manufactured Teak Wood Veneered Doors with Melamine Finish', 'High-End UPVC Sliding Doors with Tinted Float Glass'],
      'Sanitary & Plumbing': ['Villeroy & Boch / TOTO Sanitary Ware', 'Hansgrohe Diverters with Thermostatic Control'],
      'Electrical': ['Legrand / Schneider Modular Switches with Fire-Retardant Copper Wiring', '100% Power Backup with Auto-Changeover']
    },
    amenities: ['78,000 sq.ft Club Luxe', 'Heated Indoor Lap Pool', 'Helipad Access', 'Concierge & Valet Service', 'Cricket Practice Nets', 'Tennis & Squash Courts'],
    amenitiesCategorized: {
      'Clubhouse & Leisure': ['78,000 sq.ft Grand Club Luxe', 'Billiards, Cards Room & Bowling Alley', 'Multipurpose Banquet Hall with Dining Lawn', 'Library & Reading Lounge'],
      'Health & Fitness': ['Temperature Controlled All-Weather Swimming Pool', 'Fully Equipped Aerobics & Yoga Studio', '2 Tennis Courts, 2 Squash Courts & Basketball Arena'],
      'Campus Lifestyle': ['On-Campus Supermarket & Medical Clinic', '4-Tier Automated Security with CCTV Surveillance', 'Landscaped Central Courtyard with Fountains']
    },
    connectivity: [
      { landmark: 'IKEA Hyderabad & Knowledge City', distance: '0.5 km', travelTime: '2 mins' },
      { landmark: 'Raidurg Metro Station', distance: '1.2 km', travelTime: '4 mins' },
      { landmark: 'Durgam Cheruvu Cable Bridge', distance: '2.0 km', travelTime: '5 mins' },
      { landmark: 'Gachibowli Flyover / ORR', distance: '3.5 km', travelTime: '8 mins' }
    ],
    legalApprovals: ['TS-RERA Certified (P02400003211)', 'GHMC Occupancy Certificate (OC) Received', 'Clear Marketable Title with Legal Scrutiny'],
    bankPartners: ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Kotak Mahindra Bank']
  },
  {
    id: 'tower-3',
    slug: 'lodha-belleza-sky-villas',
    title: 'Lodha Belleza Sky Villas',
    category: 'Towers',
    location: 'Eden Square, Phase 4, KPHB - HITEC City Link Road, Hyderabad - 500072',
    developer: 'Lodha Group (Macrotech Developers)',
    type: '4 & 5 BHK Duplex Sky Villas',
    price: '₹3.40 Cr - ₹5.60 Cr',
    sqft: '3,500 - 5,200 sq.ft',
    badge: 'EXCLUSIVE',
    image: '/projects/tower-3.jpg',
    fallbackImage: '/projects/tower-4.jpg',
    rera: 'P02400001890',
    possession: 'Ready to Move',
    description: 'Ultra-exclusive 40-storey California-style sky villas featuring private sundecks, double-height living rooms, and private plunge pools.',
    overview: 'Lodha Belleza brings California’s celebrated luxury lifestyle to the skies of West Hyderabad. Featuring soaring 40-storey residential towers with only 2 private duplex residences per floor, each sky villa boasts 22-foot double-height living spaces, private open-air plunge pools on personal sundecks, and private elevator lobbies, offering uncompromised privacy and palatial grandeur.',
    priceBreakdown: {
      startingPrice: '₹3.40 Cr',
      pricePerUnit: '₹9,500 - ₹10,800 / sq.ft',
      emiStarting: '₹2.35 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Duplex Sky Villa', size: '3,500 sq.ft', facing: 'North / East', bathrooms: '4 + Maid', balcony: 'Private Sundeck with Pool', price: '₹3.40 Cr' },
      { name: '4.5 BHK Panoramic Sky Villa', size: '4,400 sq.ft', facing: 'Corner 3-Sided Open', bathrooms: '5 + Maid', balcony: 'Wrap-Around Balcony', price: '₹4.50 Cr' },
      { name: '5 BHK Grand Presidential Duplex', size: '5,200 sq.ft', facing: 'East', bathrooms: '6 + 2 Maid', balcony: 'Double Deck Sky Patio', price: '₹5.60 Cr' }
    ],
    specifications: {
      'Structure & Living': ['Double-Height 22-Foot Living Room Ceiling with Floor-to-Ceiling Glazing', 'Heavy Duty Sound-Proof Sliding Glass Partitions'],
      'Flooring': ['Imported Greek Thassos White Marble in Public Living Areas', 'Pergo Wooden Parquet Flooring in Bedrooms'],
      'Private Plunge Pool': ['Personal Rooftop/Deck Plunge Pool with Mosaic Glass Tiling and Jacuzzi Jets'],
      'Bathroom Fittings': ['Duravit Sanitary Ware & Dornbracht Chrome Fittings', 'Enclosed Glass Shower Cubicles with Rain Showers']
    },
    amenities: ['Private Plunge Pool on Deck', 'Double-Height Living Rooms', 'Cigar & Wine Tasting Lounge', 'Private Elevators', 'Clubhouse with Spa', 'Helipad'],
    amenitiesCategorized: {
      'Private Indulgences': ['Private Plunge Pool on Deck for Every Villa', 'Private Elevator with Direct Access to Residence Foyer', 'Double-Height 22-ft Living Room'],
      'Club Belleza': ['50,000 sq.ft Club Belleza with Heated Swimming Pool', 'World-Class Spa with Hydrotherapy and Jacuzzi', 'Private Screening Theater with Recliner Seating'],
      'Sports & Recreation': ['Tennis Courts, Squash Court & Indoor Badminton Court', 'Kids Adventure Playground and Water Play Zone']
    },
    connectivity: [
      { landmark: 'HITEC City Phase 2 & Cyber Towers', distance: '3.8 km', travelTime: '8 mins' },
      { landmark: 'KPHB Metro Station', distance: '1.5 km', travelTime: '4 mins' },
      { landmark: 'Forum Sujana Mall & Inorbit Mall', distance: '2.5 km', travelTime: '6 mins' },
      { landmark: 'Gachibowli Financial Hub', distance: '7.5 km', travelTime: '14 mins' }
    ],
    legalApprovals: ['TS-RERA Registered (P02400001890)', 'GHMC Occupancy Certificate Approved', 'Clear Title Deeded Freehold Property'],
    bankPartners: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Standard Chartered']
  },
  {
    id: 'tower-4',
    slug: 'aparna-zenon-sas-ira-high-rise',
    title: 'Aparna Zenon & SAS iRA High-Rise',
    category: 'Towers',
    location: 'Nanakramguda, Financial District, Hyderabad - 500032',
    developer: 'Aparna Constructions & Estates / SAS Infra',
    type: '3 & 4 BHK Smart Towers',
    price: '₹2.15 Cr - ₹3.25 Cr',
    sqft: '2,150 - 3,100 sq.ft',
    badge: 'UNDER CONSTRUCTION',
    image: '/projects/tower-4.jpg',
    fallbackImage: '/projects/tower-2.jpg',
    rera: 'P02400006541',
    possession: 'Nov 2026',
    description: 'State-of-the-art 33-floor high-rise towers in the core of Hyderabad’s Financial District with integrated IoT smart home automation.',
    overview: 'Positioned right at the epicenter of Hyderabad’s Financial District across 30.15 lush acres, Aparna Zenon features 14 residential towers rising 33 storeys. Engineered with integrated IoT smart home automation, 80% open landscaped area, and an expansive 86,000 sq.ft clubhouse, Zenon offers signal-free connectivity to Waverock, Google, Amazon, and the US Consulate.',
    priceBreakdown: {
      startingPrice: '₹2.15 Cr',
      pricePerUnit: '₹8,800 - ₹9,900 / sq.ft',
      emiStarting: '₹1.55 Lakhs / month'
    },
    configurations: [
      { name: '3 BHK Smart Residence', size: '2,150 sq.ft', facing: 'East', bathrooms: '3', balcony: '1 Deck', price: '₹2.15 Cr' },
      { name: '3.5 BHK Sky Suite', size: '2,580 sq.ft', facing: 'North / East', bathrooms: '3 + Maid', balcony: '2 Decks', price: '₹2.55 Cr' },
      { name: '4 BHK Elite High-Rise', size: '3,100 sq.ft', facing: 'Corner Facing', bathrooms: '4 + Maid', balcony: 'Panoramic Deck', price: '₹3.25 Cr' }
    ],
    specifications: {
      'Smart Living': ['Pre-Fitted Smart Home Automation for Lighting, AC & Security', 'Keyless Digital Door Locks with Mobile App Remote Unlocking'],
      'Flooring': ['800x1600mm Glazed Vitrified Tiles in Living, Dining & Bedrooms', 'Anti-Skid Vitrified Tiles in Bathrooms and Utilities'],
      'Green Building': ['IGBC Gold Certified Green Building', 'Sewage Treatment Plant with Water Recycling for Landscaping', 'Solar Powered Common Areas']
    },
    amenities: ['IoT Automation Fitted', '100% EV Charging Bays', 'Olympic Size Swimming Pool', 'Squash & Badminton Arenas', '86,000 sq.ft Clubhouse', 'Sky Jogging Track'],
    amenitiesCategorized: {
      'Clubhouse & Sports': ['86,000 sq.ft Mega Clubhouse with Banquet Facilities', 'Olympic-Length 50m Swimming Pool & Kids Splash Pool', '4 Indoor Badminton Courts & 2 Squash Courts'],
      'Greenery & Wellness': ['Acupressure Walkways & Herbal Gardens', 'Open-Air Amphitheater with Screening Screen', 'Elderly Relaxation Pergolas'],
      'Safety & Infrastructure': ['100% Dedicated EV Charging Infrastructure', 'Centralized Gas Piping with Metered Connection', '3-Tier Security with Boom Barriers & RFID Tagging']
    },
    connectivity: [
      { landmark: 'Waverock & US Consulate', distance: '1.0 km', travelTime: '3 mins' },
      { landmark: 'Continental Hospitals', distance: '1.8 km', travelTime: '4 mins' },
      { landmark: 'Gachibowli Stadium', distance: '3.5 km', travelTime: '7 mins' },
      { landmark: 'Outer Ring Road Nanakramguda Junction', distance: '1.2 km', travelTime: '3 mins' }
    ],
    legalApprovals: ['TS-RERA Approved (P02400006541)', 'HMDA Sanctioned Building Plans', 'Environmental & Airport Clearances Validated'],
    bankPartners: ['SBI Home Loans', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank']
  },

  // ─── APARTMENTS (Real Hyderabad Gated Communities) ─────────────────────────
  {
    id: 'apt-1',
    slug: 'lanco-hills-integrated-township',
    title: 'Lanco Hills Integrated Township',
    category: 'Apartments',
    location: 'Lanco Hills Road, Manikonda, Gachibowli Corridor, Hyderabad - 500089',
    developer: 'Lanco Infratech / Lanco Hills',
    type: '2.5 & 3 BHK Luxury Residences',
    price: '₹1.10 Cr - ₹1.85 Cr',
    sqft: '1,550 - 2,450 sq.ft',
    badge: 'READY TO MOVE',
    image: '/projects/apt-1.jpg',
    fallbackImage: '/projects/apt-2.jpg',
    rera: 'P02400002145',
    possession: 'Ready to Move',
    description: 'Sprawling 70-acre integrated gated township featuring 30-floor residential towers, internal shopping malls, school, and scenic hill views.',
    overview: 'Lanco Hills is one of South India’s largest and most complete integrated gated townships, spread over 70 picturesque acres in the Manikonda-Gachibowli corridor. Featuring 12 residential towers rising 30 floors, the township houses its own shopping mall, multiplex cinema, international pre-school, departmental stores, and the monumental 150,000 sq.ft Club Royale.',
    priceBreakdown: {
      startingPrice: '₹1.10 Cr',
      pricePerUnit: '₹6,800 - ₹7,600 / sq.ft',
      emiStarting: '₹78,000 / month'
    },
    configurations: [
      { name: '2.5 BHK Compact Family', size: '1,550 sq.ft', facing: 'East', bathrooms: '2', balcony: '1 Balcony', price: '₹1.10 Cr' },
      { name: '3 BHK Comfort Home', size: '1,980 sq.ft', facing: 'North / East', bathrooms: '3', balcony: '2 Balconies', price: '₹1.45 Cr' },
      { name: '3 BHK Hillview Grand', size: '2,450 sq.ft', facing: 'Scenic Rocky Hill View', bathrooms: '3 + Maid', balcony: 'Double Deck', price: '₹1.85 Cr' }
    ],
    specifications: {
      'Structure': ['Earthquake Resistant RCC Sheared Frame', '6-inch Solid Block Masonry'],
      'Flooring': ['Vitrified Tiles (800x800mm) in Living, Dining & Kitchen', 'Anti-skid Ceramic Tiles in Bathrooms'],
      'Doors': ['Teak Wood Main Door with Brass Hardware', 'Flush Doors with Enamel Paint for Bedrooms']
    },
    amenities: ['150,000 sq.ft Mega Clubhouse', 'Olympic Swimming Pool', 'Walking Trails & Parks', 'Supermarket & Pharmacy Inside', 'Multiplex Cinema on Campus', 'School Inside'],
    amenitiesCategorized: {
      'Township Amenities': ['150,000 sq.ft Mega Club Royale', 'Internal Shopping Mall with 5-Screen Multiplex', 'Apollo Pharmacy & Ratnadeep Supermarket on Campus', 'International Pre-School on Campus'],
      'Sports & Recreation': ['Olympic-Sized Outdoor Swimming Pool with Sun Loungers', 'Cricket Practice Pitch with Floodlights', 'Indoor Badminton Courts & Table Tennis Saloon'],
      'Nature & Outdoors': ['Landscaped Walking & Jogging Trails around Natural Rock Formations', 'Dedicated Senior Citizen Park with Shaded Benches']
    },
    connectivity: [
      { landmark: 'Gachibowli Main Junction', distance: '4.0 km', travelTime: '8 mins' },
      { landmark: 'Financial District', distance: '6.5 km', travelTime: '12 mins' },
      { landmark: 'Inorbit Mall Madhapur', distance: '7.5 km', travelTime: '15 mins' },
      { landmark: 'Delhi Public School Khajaguda', distance: '3.2 km', travelTime: '6 mins' }
    ],
    legalApprovals: ['TS-RERA Registered (P02400002145)', 'HMDA Approved Master Township Plan', 'Occupancy Certificate (OC) Issued'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Bank of Baroda']
  },
  {
    id: 'apt-2',
    slug: 'western-plaza-gated-enclave',
    title: 'Western Plaza Gated Enclave',
    category: 'Apartments',
    location: 'Opp. Botanical Gardens, Hafeezpet - Kondapur Road, Hyderabad - 500084',
    developer: 'Western Construction',
    type: '3 & 4 BHK Modern Apartments',
    price: '₹1.45 Cr - ₹2.25 Cr',
    sqft: '1,800 - 2,850 sq.ft',
    badge: 'RERA APPROVED',
    image: '/projects/apt-2.jpg',
    fallbackImage: '/projects/apt-1.jpg',
    rera: 'P02400005432',
    possession: 'Ready to Move',
    description: 'Well-established gated community spread over 7 acres with 80% landscaped open area, right next to the Botanical Garden tech corridor.',
    overview: 'Western Plaza is an established, high-demand gated residential community situated in Kondapur opposite Hyderabad’s Botanical Gardens. Spread across 7 acres with 80% dedicated to verdant open spaces, Western Plaza provides serene suburban quietude within walking distance of Google, Sarath City Capital Mall, and the HITEC City IT artery.',
    priceBreakdown: {
      startingPrice: '₹1.45 Cr',
      pricePerUnit: '₹7,800 - ₹8,500 / sq.ft',
      emiStarting: '₹1.05 Lakhs / month'
    },
    configurations: [
      { name: '3 BHK Premium Apartment', size: '1,800 sq.ft', facing: 'East', bathrooms: '3', balcony: '2 Balconies', price: '₹1.45 Cr' },
      { name: '3.5 BHK Spacious Unit', size: '2,250 sq.ft', facing: 'North', bathrooms: '3 + Study', balcony: '2 Balconies', price: '₹1.80 Cr' },
      { name: '4 BHK Executive Corner Unit', size: '2,850 sq.ft', facing: 'Garden Facing Corner', bathrooms: '4 + Maid', balcony: '3 Balconies', price: '₹2.25 Cr' }
    ],
    specifications: {
      'Structure': ['RCC Framed Structure designed to withstand Wind & Seismic Loads'],
      'Flooring': ['Double Charged Vitrified Tiles in Living, Dining & Bedrooms', 'Wooden Finish Vitrified Tiles in Master Bedroom'],
      'Windows': ['UPVC Sliding Windows with Mosquito Mesh & Granite Cill']
    },
    amenities: ['4-Tier Security Network', 'Cricket Practice Nets', 'Children Creche & Activity Zone', 'Senior Citizens Pavilion', 'Clubhouse with Gym', 'Swimming Pool'],
    amenitiesCategorized: {
      'Clubhouse Facilities': ['Modern Clubhouse with Fully Equipped Gymnasium', 'Swimming Pool with Separate Toddlers Splash Pool', 'Multipurpose Banquet Hall & Party Lawn'],
      'Outdoor Sports': ['Cricket Practice Nets with Bowling Machine', 'Badminton Court & Half Basketball Court', 'Skating Rink for Children'],
      'Security & Comfort': ['4-Tier Round-the-Clock Security with Intercom to Reception', 'Water Softener & Reverse Osmosis Drinking Water System']
    },
    connectivity: [
      { landmark: 'Sarath City Capital Mall', distance: '1.2 km', travelTime: '3 mins' },
      { landmark: 'Botanical Gardens', distance: '0.6 km', travelTime: '2 mins' },
      { landmark: 'HITEC City Cyber Towers', distance: '3.5 km', travelTime: '8 mins' },
      { landmark: 'KIMS Hospital Kondapur', distance: '1.8 km', travelTime: '4 mins' }
    ],
    legalApprovals: ['TS-RERA Approved (P02400005432)', 'GHMC Sanctioned Layout', 'Clear Legal Scrutiny & Freehold Ownership'],
    bankPartners: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Canara Bank']
  },
  {
    id: 'apt-3',
    slug: 'trident-grande-by-namishree',
    title: 'Trident Grande by Namishree',
    category: 'Apartments',
    location: 'Tellapur - Kollur Road, Near ORR Exit 2, Hyderabad - 502032',
    developer: 'Namishree Infrastructure',
    type: '2 & 3 BHK Premium Units',
    price: '₹88 Lakhs - ₹1.35 Cr',
    sqft: '1,320 - 1,980 sq.ft',
    badge: 'UNDER CONSTRUCTION',
    image: '/projects/apt-3.jpg',
    fallbackImage: '/projects/apt-4.jpg',
    rera: 'P02400006781',
    possession: 'March 2027',
    description: 'Rapidly appreciating high-rise gated community with direct signal-free access to the Outer Ring Road and Neopolis IT zone.',
    overview: 'Strategically located in Tellapur near Kollur and Neopolis Kokapet, Trident Grande by Namishree is an ultra-modern 28-storey gated high-rise enclave. Surrounded by tranquil lake reserves and educational institutions, it offers high capital appreciation and quick connectivity via the 100-ft Tellapur-Gachibowli arterial expressway.',
    priceBreakdown: {
      startingPrice: '₹88 Lakhs',
      pricePerUnit: '₹6,400 - ₹7,100 / sq.ft',
      emiStarting: '₹62,000 / month'
    },
    configurations: [
      { name: '2 BHK Smart Apartment', size: '1,320 sq.ft', facing: 'East', bathrooms: '2', balcony: '1 Balcony', price: '₹88 Lakhs' },
      { name: '2.5 BHK Family Unit', size: '1,560 sq.ft', facing: 'North / East', bathrooms: '2 + Study', balcony: '2 Balconies', price: '₹1.08 Cr' },
      { name: '3 BHK Lakeview Suite', size: '1,980 sq.ft', facing: 'Lake Facing', bathrooms: '3', balcony: '2 Balconies', price: '₹1.35 Cr' }
    ],
    specifications: {
      'Structure': ['Advanced Mivan Aluminium Formwork Monolithic Concrete Structure'],
      'Finishing': ['Premium Acrylic Emulsion Paint over Smooth Gypsum Plastering', 'Anti-fungal Exterior Emulsion Weather-Proof Coating'],
      'Electrical': ['Concealed Fire-Resistant Copper Wiring with Modular Switches', 'Provisions for AC in All Bedrooms & Inverter Connection']
    },
    amenities: ['Lakeview Promenade', 'Co-Working Business Lounges', 'Amphitheatre', 'Solar Power for Common Areas', 'Swimming Pool', 'EV Charging Points'],
    amenitiesCategorized: {
      'Lifestyle & Leisure': ['Elevated Lakeview Promenade & Sunrise Deck', 'Rooftop Co-Working Lounge with High-Speed Fiber Internet', 'Open-Air Amphitheater for Community Movie Nights'],
      'Fitness & Sports': ['Lap Pool with Poolside Cabanas', 'Air-Conditioned Fitness Gym & Crossfit Zone', 'Table Tennis & Billiards Room'],
      'Eco Features': ['Solar Power Panels for Common Area Lighting', 'Rainwater Harvesting Pits & Organic Waste Converter']
    },
    connectivity: [
      { landmark: 'Outer Ring Road (Exit 2 Kollur/Tellapur)', distance: '1.5 km', travelTime: '3 mins' },
      { landmark: 'Neopolis Kokapet IT Hub', distance: '7.0 km', travelTime: '10 mins' },
      { landmark: 'Gachibowli Financial District', distance: '11.0 km', travelTime: '15 mins' },
      { landmark: 'Manthan International School', distance: '2.0 km', travelTime: '4 mins' }
    ],
    legalApprovals: ['TS-RERA Registered (P02400006781)', 'HMDA Approved Layout & Height Clearances', '100% Vastu Approved Master Architecture'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Union Bank of India']
  },
  {
    id: 'apt-4',
    slug: 'myscape-isle-of-sky-residences',
    title: 'Myscape Isle of Sky Residences',
    category: 'Apartments',
    location: 'ISB Road, Financial District, Gachibowli, Hyderabad - 500032',
    developer: 'Myscape Properties',
    type: '3 & 4 BHK Boutique Living',
    price: '₹2.40 Cr - ₹3.60 Cr',
    sqft: '2,350 - 3,450 sq.ft',
    badge: 'RERA APPROVED',
    image: '/projects/apt-4.jpg',
    fallbackImage: '/projects/apt-2.jpg',
    rera: 'P02400007120',
    possession: 'Jan 2027',
    description: 'Boutique architectural masterpiece with suspended sky gardens, zero shared walls, and maximum natural illumination.',
    overview: 'Myscape Isle of Sky is a signature boutique residential tower situated on ISB Road in the Financial District. Designed around the concept of floating sky villas, the development features zero common walls between residences, suspended green sky gardens on alternate floors, and high-performance acoustic glass facades, creating a quiet private sanctuary right in the heart of Gachibowli.',
    priceBreakdown: {
      startingPrice: '₹2.40 Cr',
      pricePerUnit: '₹9,800 - ₹10,800 / sq.ft',
      emiStarting: '₹1.70 Lakhs / month'
    },
    configurations: [
      { name: '3 BHK Sky Garden Residence', size: '2,350 sq.ft', facing: 'East', bathrooms: '3', balcony: 'Suspended Sky Terrace', price: '₹2.40 Cr' },
      { name: '3.5 BHK Executive Suite', size: '2,850 sq.ft', facing: 'North / East', bathrooms: '3 + Powder + Maid', balcony: 'Double Deck', price: '₹2.95 Cr' },
      { name: '4 BHK Signature Sky Villa', size: '3,450 sq.ft', facing: 'Corner 3-Side Open', bathrooms: '4 + Maid', balcony: 'Triple Garden Deck', price: '₹3.60 Cr' }
    ],
    specifications: {
      'Acoustic Design': ['Double Glazed Acoustically Insulated Façade Glass', 'Zero Common Walls ensuring Total Acoustic Privacy'],
      'Air & Light': ['Cross Ventilation engineered for Maximum Natural Illumination & Airflow'],
      'Finishes': ['Italian Marble Flooring in Living and Master Foyer', 'Automated Smart Door Locks & Video Entry Phone']
    },
    amenities: ['Suspended Sky Gardens', 'Private Lift Lobby', 'Infinity Edge Rooftop Pool', 'Acoustic Sound Insulation', 'Wellness Spa', 'Concierge Service'],
    amenitiesCategorized: {
      'Signature Features': ['Suspended Sky Gardens on Alternate Levels', 'Private Elevators Opening into Dedicated Resident Foyers', 'Rooftop Infinity Edge Lap Pool Overlooking Financial District'],
      'Club Amenities': ['Wellness Spa & Hydrotherapy Jacuzzi Suites', 'High-Tech Cardiovascular Gym & Pilates Studio', 'Private Business Meeting Lounge with Boardroom'],
      'Security': ['Biometric Keypad Access & 24/7 Monitored CCTV Surveillance', 'Dedicated Concierge Desk in Triple-Height Grand Lobby']
    },
    connectivity: [
      { landmark: 'Indian School of Business (ISB)', distance: '0.8 km', travelTime: '2 mins' },
      { landmark: 'Microsoft & Infosys Campus', distance: '1.5 km', travelTime: '3 mins' },
      { landmark: 'Wipro Circle Gachibowli', distance: '1.2 km', travelTime: '3 mins' },
      { landmark: 'Outer Ring Road Financial District Toll', distance: '1.8 km', travelTime: '4 mins' }
    ],
    legalApprovals: ['TS-RERA Certified (P02400007120)', 'HMDA High-Rise Permission Approved', 'Environmental Impact Clearance Granted'],
    bankPartners: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Kotak Mahindra Bank']
  },

  // ─── VILLAS (Real Hyderabad Gated Villa Communities) ───────────────────────
  {
    id: 'villa-1',
    slug: 'villa-greens-gandipet',
    title: 'Villa Greens Gandipet',
    category: 'Villas',
    location: 'Gandipet Village Road, Osman Sagar Lake, Hyderabad - 500075',
    developer: 'Villa Greens / GHR Infra',
    type: '4 & 5 BHK Triplex Spanish Villas',
    price: '₹4.50 Cr - ₹6.80 Cr',
    sqft: '4,200 - 5,600 sq.ft',
    badge: 'READY TO MOVE',
    image: '/projects/villa-1.jpg',
    fallbackImage: '/projects/villa-2.jpg',
    rera: 'P02400003889',
    possession: 'Ready to Move',
    description: 'Sprawling Spanish-themed gated triplex villas near Gandipet lake with private manicured lawns, terrace gazebos, and elevator provision.',
    overview: 'Villa Greens in Gandipet is an idyllic gated community of Spanish-inspired luxury triplex villas nestled beside Osman Sagar Lake. Crafted with terracotta-toned roof tiles, arched verandas, and expansive private manicured lawns, each villa features home elevator shafts, private rooftop gazebos, and bespoke Italian marble interiors just 10 minutes from the Financial District.',
    priceBreakdown: {
      startingPrice: '₹4.50 Cr',
      pricePerUnit: '₹10,500 - ₹12,000 / sq.ft',
      emiStarting: '₹3.20 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Triplex Spanish Villa', size: '4,200 sq.ft (350 Sq.Yd Plot)', facing: 'East', bathrooms: '4 + Maid', balcony: 'Terrace Gazebo + Lawn', price: '₹4.50 Cr' },
      { name: '4.5 BHK Lakeview Triplex', size: '4,850 sq.ft (420 Sq.Yd Plot)', facing: 'North / East', bathrooms: '5 + Maid', balcony: 'Front & Rear Gardens', price: '₹5.50 Cr' },
      { name: '5 BHK Grand Presidential Villa', size: '5,600 sq.ft (500 Sq.Yd Plot)', facing: 'Corner 3-Side Open', bathrooms: '6 + 2 Maid', balcony: 'Private Roof Garden + Jacuzzi Deck', price: '₹6.80 Cr' }
    ],
    specifications: {
      'Structure': ['Framed RCC Structure with Red Brick Masonry & Waterproofing'],
      'Flooring': ['Italian Botticino Marble in Formal Living & Dining', 'Solid Teak Wood Parquet Flooring in Master Bedroom'],
      'Elevator': ['Provision for Hydraulic 4-Passenger Home Elevator Shaft'],
      'Electrical': ['100% DG Generator Backup for All Lighting, ACs & Home Automation']
    },
    amenities: ['Private Manicured Lawn', 'Provision for Home Elevator', 'Clubhouse with Tennis Courts', '100% DG Power Backup', 'Lakeside Jogging Track', 'Swimming Pool'],
    amenitiesCategorized: {
      'Villa Features': ['Private Front Landscaped Lawn & Backyard Barbecue Area', 'Dedicated Provision for Hydraulic Personal Elevator', 'Private Terrace Pergola with Wooden Decking'],
      'Gated Amenities': ['Grand Clubhouse with Swimming Pool & Kids Pool', '2 Floodlit Tennis Courts & Half Basketball Court', 'Indoor Squash Court & Air-Conditioned Billiards Saloon'],
      'Infrastructure': ['Underground Power, Water & Fiber Optic Lines', 'Compound Wall with Solar Powered Security Fencing']
    },
    connectivity: [
      { landmark: 'Osman Sagar (Gandipet) Lake & Park', distance: '1.0 km', travelTime: '2 mins' },
      { landmark: 'Kokapet Golden Mile / Neopolis', distance: '4.5 km', travelTime: '7 mins' },
      { landmark: 'Financial District Gachibowli', distance: '8.5 km', travelTime: '12 mins' },
      { landmark: 'CBIT & Chaitanya Bharathi Campus', distance: '2.5 km', travelTime: '5 mins' }
    ],
    legalApprovals: ['TS-RERA Approved (P02400003889)', 'HMDA Final Gated Villa Layout Sanction', 'Clear Freehold Ownership with Individual Patta'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
  },
  {
    id: 'villa-2',
    slug: 'kokapet-upscale-grandeur-villas',
    title: 'Kokapet Upscale Grandeur Villas',
    category: 'Villas',
    location: 'Golden Mile, Kokapet, Hyderabad - 500075',
    developer: 'Exclusive Kokapet Enclave Developers',
    type: '4 BHK Luxury Triplex Villas',
    price: '₹5.50 Cr - ₹8.20 Cr',
    sqft: '4,600 - 6,200 sq.ft',
    badge: 'EXCLUSIVE',
    image: '/projects/villa-2.jpg',
    fallbackImage: '/projects/villa-1.jpg',
    rera: 'P02400007543',
    possession: 'Dec 2026',
    description: 'High-net-worth gated villa community in the Golden Mile of Kokapet with customized Italian marble flooring and private courtyards.',
    overview: 'Situated directly in the Golden Mile of Kokapet—Hyderabad’s most valuable residential micro-market—Kokapet Upscale Grandeur Villas offer ultra-luxury triplex residences designed for high-net-worth families. With double-height 20-foot living rooms, private heated plunge pools, customized internal courtyards, and home cinema rooms, this gated enclave combines privacy with unmatched status.',
    priceBreakdown: {
      startingPrice: '₹5.50 Cr',
      pricePerUnit: '₹11,800 - ₹13,200 / sq.ft',
      emiStarting: '₹3.90 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Royal Triplex Villa', size: '4,600 sq.ft (400 Sq.Yd Plot)', facing: 'East', bathrooms: '4 + Maid', balcony: 'Courtyard + Rooftop Deck', price: '₹5.50 Cr' },
      { name: '4.5 BHK Signature Villa with Pool', size: '5,300 sq.ft (500 Sq.Yd Plot)', facing: 'North / East', bathrooms: '5 + Maid', balcony: 'Private Pool Deck', price: '₹6.80 Cr' },
      { name: '5 BHK Sovereign Estate Villa', size: '6,200 sq.ft (650 Sq.Yd Plot)', facing: 'Corner 3-Sided Open', bathrooms: '6 + 2 Maid', balcony: 'Double Sky Deck + Jacuzzi', price: '₹8.20 Cr' }
    ],
    specifications: {
      'Interior Architecture': ['Double-Height Living Hall with 20-ft Clear Height', 'Central Courtyard Atrium with Skylight'],
      'Flooring': ['Bespoke Italian Statuario & Botticino Marble', 'Hardwood Decking around Plunge Pool Area'],
      'Automation': ['Complete Lutron/Control4 Home Automation System', 'Motorized Curtains, Smart Locks & Climate Control']
    },
    amenities: ['Private Plunge Pool', 'Double-Height Living Hall', 'Terrace Barbecue Garden', 'Underground Utility Cabling', 'Clubhouse with Gym', 'Squash Court'],
    amenitiesCategorized: {
      'Private Luxuries': ['Private Heated Plunge Pool with Mosaic Glass Tiling', 'Double-Height Living Hall with Floating Glass Staircase', 'Terrace BBQ Kitchen & Pergola Seating Area'],
      'Community Amenities': ['Clubhouse with Heated Indoor Swimming Pool & Sauna', 'Air-Conditioned Squash Court & Gymnasium', 'Private Library and Business Meeting Suite'],
      'Safety': ['Underground Utility Ducting for Electricity, Water & Fiber', '24/7 Guarded Entry Arch with Biometric Scanning']
    },
    connectivity: [
      { landmark: 'Outer Ring Road (ORR Kokapet Interchange)', distance: '1.2 km', travelTime: '3 mins' },
      { landmark: 'Neopolis High-Street & SEZ', distance: '1.8 km', travelTime: '4 mins' },
      { landmark: 'Financial District Gachibowli', distance: '5.2 km', travelTime: '8 mins' },
      { landmark: 'Rockwell International School', distance: '2.0 km', travelTime: '4 mins' }
    ],
    legalApprovals: ['TS-RERA Registered (P02400007543)', 'HMDA Clear Sanction Letter', 'Bank Loan Approvals in Place'],
    bankPartners: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Kotak Mahindra Bank']
  },
  {
    id: 'villa-3',
    slug: 'palampally-lakeside-villas',
    title: 'Palampally Lakeside Villas',
    category: 'Villas',
    location: 'Narsingi - Gandipet Main Road, Hyderabad - 500075',
    developer: 'Palampally Infrastructure',
    type: '4 & 5 BHK Waterfront Villas',
    price: '₹4.80 Cr - ₹7.10 Cr',
    sqft: '4,400 - 5,800 sq.ft',
    badge: 'RERA APPROVED',
    image: '/projects/villa-3.jpg',
    fallbackImage: '/projects/villa-4.jpg',
    rera: 'P02400006211',
    possession: 'Ready to Move',
    description: 'Scenic waterfront gated villa estate situated along the Narsingi-Gandipet corridor with private lawns and luxury clubhouse access.',
    overview: 'Palampally Lakeside Villas is a tranquil waterfront gated villa community located along the sought-after Narsingi-Gandipet corridor. Overlooking a scenic lake, the community offers wide 40-foot tree-lined internal roads, personal home elevators, waterfront gazebo viewing pavilions, and direct connectivity to the Narsingi ORR junction.',
    priceBreakdown: {
      startingPrice: '₹4.80 Cr',
      pricePerUnit: '₹10,800 - ₹12,200 / sq.ft',
      emiStarting: '₹3.40 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Waterfront Triplex', size: '4,400 sq.ft (380 Sq.Yd Plot)', facing: 'Lakeview East', bathrooms: '4 + Maid', balcony: 'Lakeside Patio', price: '₹4.80 Cr' },
      { name: '4.5 BHK Premium Lake Villa', size: '5,100 sq.ft (450 Sq.Yd Plot)', facing: 'North / East', bathrooms: '5 + Maid', balcony: 'Wrap-Around Deck', price: '₹5.90 Cr' },
      { name: '5 BHK Grand Waterfront Estate', size: '5,800 sq.ft (550 Sq.Yd Plot)', facing: 'Direct Waterfront Corner', bathrooms: '6 + 2 Maid', balcony: 'Private Terrace + Gazebo', price: '₹7.10 Cr' }
    ],
    specifications: {
      'Structure': ['Framed RCC Structure with Solid Aerocon Autoclaved Blocks'],
      'Flooring': ['Italian Marble in Foyer, Living & Dining', 'Laminated Hardwood Flooring in Master Suites'],
      'Finishes': ['Teak Wood Main Door with Brass Hardware', 'Sound-Insulated Double Glazed UPVC Windows']
    },
    amenities: ['Waterfront Gazebo', 'Personalized Security Station', 'Infinity Lap Pool', 'Steam & Sauna Rooms', '30,000 sq.ft Clubhouse', 'Tennis Courts'],
    amenitiesCategorized: {
      'Waterfront Features': ['Private Lakefront Gazebo and Sunrise Wooden Deck', 'Lakeside Tree-Lined Jogging and Bicycle Track', 'Landscaped Water Cascades and Fountains'],
      'Clubhouse Amenities': ['30,000 sq.ft Grand Clubhouse with Panoramic Lake View', 'Infinity Edge Lap Pool with Underwater Lighting', 'Steam, Sauna & Massage Treatment Rooms'],
      'Infrastructure': ['Dedicated Solar Power System for Common Utilities', 'Underground Stormwater Drainage and Rainwater Harvesting']
    },
    connectivity: [
      { landmark: 'Narsingi ORR Junction (Exit 18)', distance: '2.5 km', travelTime: '4 mins' },
      { landmark: 'Financial District Gachibowli', distance: '6.0 km', travelTime: '10 mins' },
      { landmark: 'Kokapet Golden Mile', distance: '4.0 km', travelTime: '7 mins' },
      { landmark: 'Glendale Academy International School', distance: '3.5 km', travelTime: '6 mins' }
    ],
    legalApprovals: ['TS-RERA Certified (P02400006211)', 'HMDA Sanctioned Layout Plan', 'Occupancy Certificate Received'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
  },
  {
    id: 'villa-4',
    slug: 'aparna-elixir-luxury-villas',
    title: 'Aparna Elixir Luxury Villas',
    category: 'Villas',
    location: 'Puppalguda - Gandipet Expressway, Narsingi, Hyderabad - 500089',
    developer: 'Aparna Constructions & Estates',
    type: '4 & 5 BHK Signature Triplex',
    price: '₹4.90 Cr - ₹7.25 Cr',
    sqft: '4,500 - 5,900 sq.ft',
    badge: 'EXCLUSIVE',
    image: '/projects/villa-4.jpg',
    fallbackImage: '/projects/villa-1.jpg',
    rera: 'P02400004910',
    possession: 'Ready to Move',
    description: 'World-class gated community of ultra-luxury triplex villas nestled in lush greenery near Gandipet lake with sprawling clubhouse, tennis courts, and 100% Vastu.',
    overview: 'Aparna Elixir is a masterfully planned gated villa community of signature triplex villas situated on the Puppalguda-Gandipet expressway. Spread across lush green landscapes with wide 40-foot and 50-foot avenues, Elixir features an opulent 35,000 sq.ft clubhouse, clay tennis courts, reflexology parks, and 100% Vastu-compliant architecture just 8 minutes from Financial District.',
    priceBreakdown: {
      startingPrice: '₹4.90 Cr',
      pricePerUnit: '₹10,900 - ₹12,300 / sq.ft',
      emiStarting: '₹3.50 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Signature Triplex', size: '4,500 sq.ft (400 Sq.Yd Plot)', facing: 'East', bathrooms: '4 + Maid', balcony: 'Private Lawn + Terrace', price: '₹4.90 Cr' },
      { name: '4.5 BHK Grand Triplex', size: '5,200 sq.ft (480 Sq.Yd Plot)', facing: 'North / East', bathrooms: '5 + Maid', balcony: 'Front Garden + Deck', price: '₹6.10 Cr' },
      { name: '5 BHK Sovereign Triplex Villa', size: '5,900 sq.ft (600 Sq.Yd Plot)', facing: 'Corner 3-Sided Open', bathrooms: '6 + 2 Maid', balcony: 'Double Deck + Gazebo', price: '₹7.25 Cr' }
    ],
    specifications: {
      'Structure': ['RCC Framed Structure with First-Class Red Brick Work'],
      'Flooring': ['Italian Botticino Marble in Foyer, Living, Dining & Staircase', 'Engineered Wooden Flooring in Master Bedroom'],
      'Electrical': ['100% DG Backup with Acoustic Enclosure & Auto Transfer Switch']
    },
    amenities: ['Exclusive 35,000 sq.ft Clubhouse', 'Private Landscaped Lawn', 'Tennis & Badminton Courts', 'Solar Water Heating & DG Backup', 'Swimming Pool', 'Spa'],
    amenitiesCategorized: {
      'Club Elixir': ['35,000 sq.ft Grand Clubhouse with Swimming Pool', 'Gymnasium, Aerobics & Yoga Hall', 'Billiards & Table Tennis Lounges', 'Multipurpose Banquet Hall with Party Lawn'],
      'Outdoor Sports': ['Lawn Tennis Court with Synthetic Turf', 'Badminton Court & Half Basketball Arena', 'Children Tot-Lot Playground with Soft Flooring'],
      'Security': ['24/7 Security with Smart Boom Barriers & CCTV Network', 'Solar Powered Boundary Fencing around Perimeter']
    },
    connectivity: [
      { landmark: 'Wipro Circle & Financial District', distance: '5.5 km', travelTime: '8 mins' },
      { landmark: 'Puppalguda - Manikonda Commercial Hub', distance: '2.5 km', travelTime: '4 mins' },
      { landmark: 'Outer Ring Road Narsingi Exit', distance: '2.0 km', travelTime: '3 mins' },
      { landmark: 'Oakridge International School', distance: '4.5 km', travelTime: '7 mins' }
    ],
    legalApprovals: ['TS-RERA Approved (P02400004910)', 'HMDA Final Sanctioned Layout', 'Occupancy Certificate Received'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank']
  },

  // ─── INDIVIDUAL HOUSES (Independent Standalone Homes) ─────────────────────
  {
    id: 'house-1',
    slug: 'jubilee-hills-film-nagar-estate',
    title: 'Jubilee Hills & Film Nagar Estate',
    category: 'Individual Houses',
    location: 'Film Nagar Hills - Jubilee Hills Rd 36, Hyderabad - 500033',
    developer: 'Bespoke Architectural Build',
    type: '5 BHK Independent Royal Duplex',
    price: '₹14.50 Cr',
    sqft: '6,500 sq.ft (450 Sq.Yd Plot)',
    badge: 'READY TO MOVE',
    image: '/projects/house-1.jpg',
    fallbackImage: '/projects/villa-1.jpg',
    rera: 'GHMC Approved',
    possession: 'Immediate Handover',
    description: 'Ultra-prestigious standalone residence in Hyderabad’s most exclusive hillside enclave overlooking Film Nagar and KBR Park with private driveway and servant quarters.',
    overview: 'Standing proudly on an elevated hillside plot in Hyderabad’s legendary Jubilee Hills - Film Nagar enclave, this private standalone mansion represents the pinnacle of old-money luxury. With 6,500 square feet of built-up area on a 450 sq.yd plot, this residence features an imported private Otis passenger elevator, a custom 7.1 Dolby Atmos acoustic home theater, 4 covered car parks, and staff quarters.',
    priceBreakdown: {
      startingPrice: '₹14.50 Cr',
      pricePerUnit: '₹22,300 / sq.ft on 450 Sq.Yds',
      emiStarting: '₹10.20 Lakhs / month'
    },
    configurations: [
      { name: '5 BHK Royal Hillside Mansion', size: '6,500 sq.ft (450 Sq.Yd Plot)', facing: 'East Facing Vastu Compliant', bathrooms: '6 + 2 Staff Quarters', balcony: 'Skyline Terrace + Courtyard', price: '₹14.50 Cr' }
    ],
    specifications: {
      'Structure & Private Elevator': ['Heavy RCC Column Frame with Wire-Cut Brick Walls', 'Private Hydraulic Otis Glass Passenger Elevator Serving All Levels'],
      'Flooring & Woodwork': ['Italian Statuario White Marble Throughout Main Levels', '100% Solid Burma Teak Wood Doors & Window Paneling'],
      'Entertainment': ['Acoustically Treated 10-Seater Home Theater with 7.1 Dolby Atmos Surround System'],
      'Security & Power': ['Smart Video Door Intercom, 16 CCTV Cameras with Mobile Remote Access', '30 kVA Silent Kirloskar Generator with 100% House Backup']
    },
    amenities: ['Dedicated Servant Quarters', 'Private Elevator Installed', 'Home Theater Room (7.1 Dolby)', '4 Covered Car Parks', 'Rooftop Lounge', 'Manjeera Water'],
    amenitiesCategorized: {
      'Private Estate Amenities': ['Private Hydraulic Glass Elevator Serving All Floors', '10-Seater Home Theater with 7.1 Dolby Atmos Soundproofing', 'Private Landscaped Terrace Lounge with City Skyline Views', '4 Dedicated Covered Parking Bays with Automatic Gate'],
      'Utilities': ['Dual Dedicated Water Supply: Manjeera Municipality + Deep Borewell', '30 kVA Silent Auto-Start Diesel Generator Backup']
    },
    connectivity: [
      { landmark: 'Jubilee Hills Road No. 36 High Street', distance: '0.8 km', travelTime: '2 mins' },
      { landmark: 'KBR National Park Gate', distance: '1.5 km', travelTime: '4 mins' },
      { landmark: 'Apollo Hospital Jubilee Hills', distance: '2.0 km', travelTime: '5 mins' },
      { landmark: 'HITEC City Durgam Cheruvu Bridge', distance: '4.5 km', travelTime: '8 mins' }
    ],
    legalApprovals: ['GHMC Approved Building Permission (Clear Title)', 'Registered Municipal Door Number Allocated', 'Freehold Mutation Complete with 30-Year Encumbrance Free Certificate'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank']
  },
  {
    id: 'house-2',
    slug: 'puppalguda-standalone-royal-duplex',
    title: 'Puppalguda Standalone Royal Duplex',
    category: 'Individual Houses',
    location: 'Puppalguda - Hydershakote Main Road, Hyderabad - 500089',
    developer: 'Royal Crest Builders',
    type: '4 BHK Independent Triplex House',
    price: '₹2.85 Cr',
    sqft: '3,200 sq.ft (200 Sq.Yd Plot)',
    badge: 'READY TO MOVE',
    image: '/projects/house-2.jpg',
    fallbackImage: '/projects/villa-2.jpg',
    rera: 'GHMC Approved',
    possession: 'Ready to Move',
    description: 'Standalone luxury independent home with dual covered car parking, Italian marble flooring, spacious private terrace, and modular German kitchen.',
    overview: 'This newly completed standalone 4 BHK triplex home is located on the Puppalguda-Hydershakote corridor, just 5 minutes from Financial District. Built on a 200 sq.yd freehold plot with 3,200 sq.ft of luxurious built-up area, the residence offers dual covered car parking, an open rooftop gazebo, a German modular kitchen with Hafele fittings, and abundant municipal Manjeera water.',
    priceBreakdown: {
      startingPrice: '₹2.85 Cr',
      pricePerUnit: '₹8,900 / sq.ft on 200 Sq.Yds',
      emiStarting: '₹2.00 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Triplex Standalone Residence', size: '3,200 sq.ft (200 Sq.Yd Plot)', facing: 'North / East', bathrooms: '4 + 1 Powder', balcony: 'Front Balcony + Roof Terrace', price: '₹2.85 Cr' }
    ],
    specifications: {
      'Structure': ['Framed RCC Structure with High-Quality Red Clay Bricks'],
      'Flooring': ['Italian Botticino Marble in Living & Dining', 'Wood Laminate Flooring in Master Suite'],
      'Kitchen': ['Modular German Kitchen with Soft-Close Drawers & Granite Countertops'],
      'Water Supply': ['Separate Underground Sump for Municipal Manjeera Water + Dedicated Borewell']
    },
    amenities: ['Modular German Kitchen', 'Dual Car Covered Port', 'Rooftop Party Gazebo', 'Borewell & Manjeera Water', 'CCTV Security', 'Solar Water Heating'],
    amenitiesCategorized: {
      'Features': ['Modular German Kitchen with Built-in Chimney & Hob', 'Dual Car Covered Port with Automated Rolling Shutter', 'Rooftop Party Gazebo with Outdoor Seating & Bar Counter'],
      'Infrastructure': ['Borewell + Municipal Manjeera Water Connection', 'Solar Water Heating System (300 LPD) Installed on Terrace']
    },
    connectivity: [
      { landmark: 'Financial District Gachibowli', distance: '4.5 km', travelTime: '7 mins' },
      { landmark: 'Puppalguda Junction', distance: '1.2 km', travelTime: '3 mins' },
      { landmark: 'Narsingi ORR Toll Plaza', distance: '3.0 km', travelTime: '5 mins' },
      { landmark: 'Delhi Public School Hyderabad', distance: '3.5 km', travelTime: '6 mins' }
    ],
    legalApprovals: ['GHMC Approved Building Plan (G+2 Floors)', 'Mutation Complete with Non-Agricultural Assessment', 'Bank Loan Approved'],
    bankPartners: ['SBI', 'HDFC Bank', 'ICICI Bank', 'LIC Housing Finance']
  },
  {
    id: 'house-3',
    slug: 'miyapur-greenview-independent-house',
    title: 'Miyapur Greenview Independent House',
    category: 'Individual Houses',
    location: 'BK Enclave, Near Sentia Global School, Miyapur, Hyderabad - 500049',
    developer: 'Nivriti Homes & Builders',
    type: '4 BHK Independent Duplex House',
    price: '₹2.15 Cr',
    sqft: '2,850 sq.ft (220 Sq.Yd Plot)',
    badge: 'NEW LAUNCH',
    image: '/projects/house-3.jpg',
    fallbackImage: '/projects/apt-2.jpg',
    rera: 'GHMC Approved',
    possession: 'April 2027',
    description: 'Serene independent duplex home in a premier residential colony with expansive terrace, private garden, and walking access to top international schools.',
    overview: 'Located in the peaceful, tree-lined residential enclave of BK Enclave in Miyapur, this independent 4 BHK duplex home sits on a 220 sq.yd freehold plot. Featuring private front garden lawns, spacious balconies, a dedicated puja room, and solar water heating, it is ideal for families seeking independent home living near top international schools and the Miyapur Metro terminal.',
    priceBreakdown: {
      startingPrice: '₹2.15 Cr',
      pricePerUnit: '₹7,540 / sq.ft on 220 Sq.Yds',
      emiStarting: '₹1.50 Lakhs / month'
    },
    configurations: [
      { name: '4 BHK Independent Duplex Home', size: '2,850 sq.ft (220 Sq.Yd Plot)', facing: 'East Facing 100% Vastu', bathrooms: '4', balcony: '2 Balconies + Private Lawn', price: '₹2.15 Cr' }
    ],
    specifications: {
      'Structure': ['RCC Column & Beam Structure with Aerocon Insulated Blocks'],
      'Woodwork': ['Indian Teak Wood Main Door & Frames with Designer Carving'],
      'Flooring': ['Glazed Vitrified Tiles (1200x600mm) in All Living Spaces']
    },
    amenities: ['Private Backyard Lawn', 'Solar Water Heating', 'Vastu Compliant Floorplan', 'CCTV Security Fitted', 'Covered Car Parking', 'Rainwater Harvesting'],
    amenitiesCategorized: {
      'Home Highlights': ['Private Landscaped Backyard Lawn & Flowering Trees', 'Solar Water Heating System (200 Liters)', '100% Vastu Compliant East-Facing Design'],
      'Security & Neighborhood': ['Integrated CCTV Surveillance System with 4 Cameras', 'Gated Colony Security with Controlled Entry Barrier']
    },
    connectivity: [
      { landmark: 'Sentia Global School', distance: '0.4 km', travelTime: '2 mins walk' },
      { landmark: 'Miyapur Metro Station Terminal', distance: '2.5 km', travelTime: '5 mins' },
      { landmark: 'NH-65 Mumbai Highway', distance: '1.8 km', travelTime: '4 mins' },
      { landmark: 'HITEC City Cyber Towers', distance: '9.0 km', travelTime: '18 mins' }
    ],
    legalApprovals: ['GHMC Sanctioned Residential Building Plan', 'Clear Marketable Ownership Deed', 'Bank Loan Approvals Active'],
    bankPartners: ['SBI Home Loans', 'HDFC Bank', 'Canara Bank', 'Bank of Baroda']
  },
  {
    id: 'house-4',
    slug: 'nizampet-prime-duplex-homestead',
    title: 'Nizampet Prime Duplex Homestead',
    category: 'Individual Houses',
    location: 'Nizampet Village Road, Near KPHB Metro, Hyderabad - 500090',
    developer: 'Homestead Landmark Builders',
    type: '3 & 4 BHK Independent Duplex',
    price: '₹1.75 Cr - ₹2.25 Cr',
    sqft: '2,600 - 3,100 sq.ft',
    badge: 'UNDER CONSTRUCTION',
    image: '/projects/house-4.jpg',
    fallbackImage: '/projects/apt-1.jpg',
    rera: 'GHMC Approved',
    possession: 'Oct 2026',
    description: 'Centrally positioned individual duplex home with high ceilings, teak wood doors, rainwater harvesting, and minutes away from metro and shopping.',
    overview: 'Centrally positioned in the bustling residential neighborhood of Nizampet, this modern individual duplex residence offers seamless connectivity to KPHB Colony, JNTU, and the Hyderabad Metro. With high 11-foot ceilings, teak wood doors, rainwater harvesting pits, and dedicated puja and study rooms, it combines city accessibility with standalone privacy.',
    priceBreakdown: {
      startingPrice: '₹1.75 Cr',
      pricePerUnit: '₹6,730 - ₹7,250 / sq.ft on 180 - 220 Sq.Yds',
      emiStarting: '₹1.25 Lakhs / month'
    },
    configurations: [
      { name: '3 BHK Independent Duplex', size: '2,600 sq.ft (180 Sq.Yd Plot)', facing: 'East', bathrooms: '3', balcony: '2 Balconies', price: '₹1.75 Cr' },
      { name: '4 BHK Grand Independent Duplex', size: '3,100 sq.ft (220 Sq.Yd Plot)', facing: 'North / East', bathrooms: '4 + Study', balcony: 'Terrace Patio', price: '₹2.25 Cr' }
    ],
    specifications: {
      'Structure': ['RCC Framed Structure with First Quality Cement Blocks'],
      'Doors': ['Teak Wood Main Door Frame with Decorative Mouldings'],
      'Plumbing': ['Astral CPVC Pipes with Jaguar Sanitary Fittings']
    },
    amenities: ['Walking Distance to Metro', 'Teak Wood Finishing', 'Rainwater Harvesting Pit', 'Dedicated Puja & Study Rooms', 'Covered Car Parking', 'Borewell Water'],
    amenitiesCategorized: {
      'Features': ['Teak Wood Main Door & Frames with Polished Finish', 'Dedicated Puja Room Designed as per Traditional Vastu', 'Rainwater Harvesting Recharge Pit'],
      'Location Benefits': ['Minutes Away from KPHB Colony Commercial Hub', 'Proximity to Forum Sujana Mall & Cinepolis']
    },
    connectivity: [
      { landmark: 'KPHB Colony Metro Station', distance: '2.0 km', travelTime: '5 mins' },
      { landmark: 'JNTU University Campus', distance: '2.8 km', travelTime: '6 mins' },
      { landmark: 'Forum Sujana Mall', distance: '3.5 km', travelTime: '8 mins' },
      { landmark: 'HITEC City Wave Rock Hub', distance: '8.5 km', travelTime: '16 mins' }
    ],
    legalApprovals: ['GHMC Approved Building Plan', 'Freehold Individual Plot Registration', 'SBI & HDFC Pre-Approved'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'Union Bank of India']
  },

  // ─── VENTURES (Real Hyderabad HMDA / DTCP Plotted Layouts) ─────────────────
  {
    id: 'venture-1',
    slug: 'moinabad-eco-greens-farm-villa-plots',
    title: 'Moinabad Eco Greens Farm & Villa Plots',
    category: 'Ventures',
    location: 'Chevella Road, Moinabad, Hyderabad - 501504',
    developer: 'Scope Farms / Green Horizon Estates',
    type: 'HMDA / DTCP Compliant Farm Plots',
    price: '₹28 Lakhs - ₹55 Lakhs',
    sqft: '250 - 600 Sq.Yards',
    badge: 'HMDA APPROVED',
    image: '/projects/venture-1.jpg',
    fallbackImage: '/projects/venture-4.jpg',
    rera: 'P02400002198',
    possession: 'Immediate Registration',
    description: 'Fully developed gated plotted layout with 40-ft and 60-ft blacktop roads, curbstones, avenue plantation, and crystal-clear spot registration.',
    overview: 'Moinabad Eco Greens is a fully developed, HMDA and DTCP compliant gated plotted layout nestled in the pollution-free green belt of Moinabad, Chevella Road. Surrounded by prestigious farmhouses and resorts, this 45-acre venture features 40-foot and 60-foot blacktop roads with curbstones, underground drainage, electricity with streetlights, and demarcation stones for every plot.',
    priceBreakdown: {
      startingPrice: '₹28 Lakhs',
      pricePerUnit: '₹11,200 - ₹12,500 / Sq.Yard',
      emiStarting: '₹20,000 / month'
    },
    configurations: [
      { name: 'Standard Villa Plot', size: '250 Sq.Yards', facing: 'East / North', bathrooms: 'N/A', balcony: 'Ready for Construction', price: '₹28 Lakhs' },
      { name: 'Executive Corner Plot', size: '400 Sq.Yards', facing: 'North-East Corner', bathrooms: 'N/A', balcony: 'Double Road Facing', price: '₹46 Lakhs' },
      { name: 'Estate Farmhouse Plot', size: '600 Sq.Yards', facing: 'East', bathrooms: 'N/A', balcony: 'Avenue Facing', price: '₹55 Lakhs' }
    ],
    specifications: {
      'Road Infrastructure': ['40-Foot and 60-Foot Wide Blacktop Bitumen Roads with Concrete Curbstones'],
      'Utilities': ['Underground Drainage System & Central Overhead Water Storage Tank', 'Electricity Network with Transformers & LED Streetlights'],
      'Security & Boundary': ['Chain-Link Compound Wall for Entire Layout with 24/7 Security Gate']
    },
    amenities: ['100% Clear Title & Spot Registration', 'Blacktop Roads with Curbstones', 'Avenue Tree Plantation', 'Gated Arch with Security', 'Underground Drainage', 'Overhead Water Tank'],
    amenitiesCategorized: {
      'Layout Infrastructure': ['40-ft & 60-ft Wide Blacktop Roads with Curbstones', 'Overhead Water Storage Tank with Dedicated Pipeline to Every Plot', 'Underground Drainage Network & Stormwater Lines'],
      'Greenery & Farm Living': ['Designer Avenue Tree Plantation with Drip Irrigation', 'Children Play Park & Walking Track with Pergolas'],
      'Security & Legal': ['Grand Entrance Arch with 24/7 Security Booth & Boom Barriers', '100% Clear Title with Immediate Spot Sub-Registrar Registration']
    },
    connectivity: [
      { landmark: 'Moinabad Town & Police Station', distance: '2.5 km', travelTime: '4 mins' },
      { landmark: 'Chevella Highway (NH-163)', distance: '0.5 km', travelTime: '1 min' },
      { landmark: 'Chilkur Balaji Temple', distance: '8.0 km', travelTime: '12 mins' },
      { landmark: 'Outer Ring Road (Appa Junction / TSPA)', distance: '16.0 km', travelTime: '18 mins' }
    ],
    legalApprovals: ['HMDA / DTCP Final Sanctioned Layout', 'TS-RERA Registered (P02400002198)', '100% Clear Marketable Title Free from Litigation'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'Canara Bank', 'Andhra Bank / Union Bank']
  },
  {
    id: 'venture-2',
    slug: 'neopolis-kokapet-growth-corridor-plots',
    title: 'Neopolis Kokapet Growth Corridor Plots',
    category: 'Ventures',
    location: 'Golden Mile, Neopolis, Kokapet, Hyderabad - 500075',
    developer: 'Neopolis Master Infrastructure Developers',
    type: 'HMDA Commercial & Residential Plots',
    price: '₹85 Lakhs - ₹2.10 Cr',
    sqft: '300 - 800 Sq.Yards',
    badge: 'HMDA APPROVED',
    image: '/projects/venture-2.jpg',
    fallbackImage: '/projects/venture-4.jpg',
    rera: 'P02400004521',
    possession: 'Immediate Registration',
    description: 'High-appreciation plots in Hyderabad’s marquee commercial & residential corridor with 100-ft master plan road connectivity, underground electricity, and water lines.',
    overview: 'Located in the marquee growth corridor of Neopolis Kokapet—home to India’s most expensive land auctions—these high-value commercial and residential plots offer an unrivaled investment opportunity. With direct access to 100-foot and 120-foot master plan roads, underground multi-utility tunnels, and immediate construction sanctions, this plotted enclave represents the pinnacle of commercial & residential appreciation.',
    priceBreakdown: {
      startingPrice: '₹85 Lakhs',
      pricePerUnit: '₹28,000 - ₹35,000 / Sq.Yard',
      emiStarting: '₹60,000 / month'
    },
    configurations: [
      { name: 'Premium Residential Plot', size: '300 Sq.Yards', facing: 'East', bathrooms: 'N/A', balcony: 'Ready for G+5 Construction', price: '₹85 Lakhs' },
      { name: 'Commercial Corridor Plot', size: '500 Sq.Yards', facing: '100-ft Road Facing', bathrooms: 'N/A', balcony: 'High Commercial Footfall', price: '₹1.45 Cr' },
      { name: 'Mega Mixed-Use Corner Plot', size: '800 Sq.Yards', facing: 'Corner Double Road', bathrooms: 'N/A', balcony: 'Unrestricted Height Clearance', price: '₹2.10 Cr' }
    ],
    specifications: {
      'Master Roads': ['100-Foot Wide Master Plan Asphalt Roads with Curbed Paved Walkways'],
      'Multi-Utility Tunnel': ['Underground Ducting for 33kV Power Lines, Fiber Optics & Potable Water'],
      'Commercial Viability': ['Permissible for High-End Boutique Offices, Clinics, Retail & Luxury Residences']
    },
    amenities: ['100-Ft Master Plan Road Direct Access', 'Underground Utilities & Drainage', 'LED Street Lighting', 'Ready for Immediate Construction', '24/7 Security CCTV', 'Clear Title'],
    amenitiesCategorized: {
      'Infrastructure': ['100-Foot Master Plan Arterial Road Connectivity', 'Underground Multi-Utility Cabling & High-Pressure Water Supply', 'Smart LED Streetlights with Solar Auxiliary'],
      'Investment Strengths': ['Directly Adjacent to Mega MNC Towers in Neopolis', 'Highest Historical Capital Appreciation in Telangana Real Estate']
    },
    connectivity: [
      { landmark: 'Neopolis High-Street Hub', distance: '0.5 km', travelTime: '1 min' },
      { landmark: 'ORR Kokapet Junction', distance: '1.2 km', travelTime: '3 mins' },
      { landmark: 'Financial District Nanakramguda', distance: '4.8 km', travelTime: '7 mins' },
      { landmark: 'Gachibowli Stadium', distance: '7.5 km', travelTime: '12 mins' }
    ],
    legalApprovals: ['HMDA Master Plan Sanctioned Layout', 'TS-RERA Certified (P02400004521)', 'No-Objection Certificates from AAI & Fire Department'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank']
  },
  {
    id: 'venture-3',
    slug: 'manikonda-panorama-plotted-enclave',
    title: 'Manikonda Panorama Plotted Enclave',
    category: 'Ventures',
    location: 'Puppalguda - Manikonda Hilltop Corridor, Hyderabad - 500089',
    developer: 'Panorama Urban Land Developers',
    type: 'Premium Villa Plots',
    price: '₹45 Lakhs - ₹90 Lakhs',
    sqft: '200 - 450 Sq.Yards',
    badge: 'HMDA APPROVED',
    image: '/projects/venture-3.jpg',
    fallbackImage: '/projects/venture-4.jpg',
    rera: 'P02400003411',
    possession: 'Ready for Construction',
    description: 'Elevated residential plots offering breathtaking views of the HITEC City & Financial District skyline with compound wall, electricity, and water overhead tank.',
    overview: 'Occupying an elevated ridge overlooking the Puppalguda-Manikonda valley, Manikonda Panorama Plotted Enclave offers rare freehold residential plots with dramatic views of the HITEC City and Financial District skyline. Fully approved by HMDA, this gated layout features perimeter compound walls, a dedicated overhead reservoir, and ready construction sanctions.',
    priceBreakdown: {
      startingPrice: '₹45 Lakhs',
      pricePerUnit: '₹20,000 - ₹24,000 / Sq.Yard',
      emiStarting: '₹32,000 / month'
    },
    configurations: [
      { name: 'Compact Villa Plot', size: '200 Sq.Yards', facing: 'East Facing', bathrooms: 'N/A', balcony: 'Ready for Triplex Build', price: '₹45 Lakhs' },
      { name: 'Panoramic Hillside Plot', size: '320 Sq.Yards', facing: 'North / East', bathrooms: 'N/A', balcony: 'Skyline Facing', price: '₹68 Lakhs' },
      { name: 'Grand Estate Villa Plot', size: '450 Sq.Yards', facing: 'Corner 3-Sided Open', bathrooms: 'N/A', balcony: 'Prime Position', price: '₹90 Lakhs' }
    ],
    specifications: {
      'Topography': ['Elevated Natural Rock Ridge with Natural Drainage Slopes'],
      'Layout Features': ['40-Foot BT Roads with Cement Paver Footpaths', 'Central Overhead Water Reservoir with Automated Pumping']
    },
    amenities: ['Overhead Water Storage Tank', 'Compound Wall for Entire Layout', 'Bank Loan Approved (HDFC, SBI)', 'Curbed Walkways & Avenue Trees', '24/7 Security', 'Spot Registration'],
    amenitiesCategorized: {
      'Site Amenities': ['Perimeter Boundary Wall with Gated Security Entry', 'Overhead Water Tank with Pressurized Pipelines', 'Designer LED Streetlights on All Internal Avenues'],
      'Financial Clearances': ['Bank Loan Approved by SBI, HDFC & ICICI', 'Immediate Sub-Registrar Spot Registration']
    },
    connectivity: [
      { landmark: 'Manikonda Main Road Commercial Market', distance: '1.0 km', travelTime: '3 mins' },
      { landmark: 'Puppalguda - Narsingi Arterial Road', distance: '1.5 km', travelTime: '4 mins' },
      { landmark: 'Financial District Wipro Circle', distance: '5.0 km', travelTime: '9 mins' },
      { landmark: 'Durgam Cheruvu Cable Bridge', distance: '6.5 km', travelTime: '12 mins' }
    ],
    legalApprovals: ['HMDA Approved Residential Layout', 'TS-RERA Certified (P02400003411)', 'Clear Title Encumbrance Certificate for 35 Years'],
    bankPartners: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Federal Bank']
  },
  {
    id: 'venture-4',
    slug: 'hyderabad-view-gated-plotted-venture',
    title: 'Hyderabad View Gated Plotted Venture',
    category: 'Ventures',
    location: 'Shankarpally - Mokila Growth Zone, Hyderabad - 501203',
    developer: 'Greenview Habitats & Land Developers',
    type: 'Gated Resort & Villa Plots',
    price: '₹38 Lakhs - ₹78 Lakhs',
    sqft: '220 - 500 Sq.Yards',
    badge: 'DTCP APPROVED',
    image: '/projects/venture-4.jpg',
    fallbackImage: '/projects/venture-1.jpg',
    rera: 'P02400005722',
    possession: 'Ready for Construction',
    description: 'Scenic residential plotted venture with demarcated plots, fruit tree avenues, gated entry with 24/7 security guard, and children play park.',
    overview: 'Hyderabad View Gated Plotted Venture is an eco-centric residential plotted paradise in the booming Shankarpally-Mokila growth belt. Characterized by lush organic fruit tree avenues (mango, guava, chiku), curbed blacktop roads, a resort clubhouse with swimming pool, and children’s play gardens, this DTCP-approved layout offers peaceful weekend farmhouse living with high suburban growth potential.',
    priceBreakdown: {
      startingPrice: '₹38 Lakhs',
      pricePerUnit: '₹14,500 - ₹16,500 / Sq.Yard',
      emiStarting: '₹27,000 / month'
    },
    configurations: [
      { name: 'Eco Villa Plot', size: '220 Sq.Yards', facing: 'East', bathrooms: 'N/A', balcony: 'Ready for Construction', price: '₹38 Lakhs' },
      { name: 'Orchard Garden Plot', size: '350 Sq.Yards', facing: 'North / East', bathrooms: 'N/A', balcony: 'Fruit Tree Bordered', price: '₹55 Lakhs' },
      { name: 'Resort Living Corner Plot', size: '500 Sq.Yards', facing: 'Corner Plot', bathrooms: 'N/A', balcony: 'Clubhouse Adjacent', price: '₹78 Lakhs' }
    ],
    specifications: {
      'Layout Design': ['DTCP Approved Layout with 40-ft and 50-ft Bitumen Blacktop Roads'],
      'Avenue Plantation': ['Organic Fruit-Bearing Trees (Mango, Sapota, Guava) along Every Plot Boundary'],
      'Water & Drainage': ['Dedicated Underground Water Sump & Rainwater Harvesting System']
    },
    amenities: ['Fruit Tree Plantation Along Roads', 'Children Play Park & Walking Track', '24/7 Security Guard & CCTV', '100% Clear Title with RERA', 'Resort Clubhouse', 'Swimming Pool'],
    amenitiesCategorized: {
      'Eco & Farm Amenities': ['Fruit Tree Plantation (Mango, Guava, Sapota) along All Avenues', 'Resort Clubhouse with Family Swimming Pool and Cottages', 'Children Themed Adventure Park & Walking Promenade'],
      'Security & Utilities': ['24/7 Gated Security Guard Cabin with CCTV Monitoring', 'Round-the-Clock Water & Electricity Connections']
    },
    connectivity: [
      { landmark: 'Shankarpally Railway Station & Town', distance: '3.0 km', travelTime: '5 mins' },
      { landmark: 'Mokila Residential Villa Belt', distance: '6.0 km', travelTime: '8 mins' },
      { landmark: 'ICFAI University Campus', distance: '4.5 km', travelTime: '6 mins' },
      { landmark: 'Outer Ring Road (Muthangi / Patancheru Exit)', distance: '14.0 km', travelTime: '18 mins' }
    ],
    legalApprovals: ['DTCP Approved Gated Layout', 'TS-RERA Registered (P02400005722)', 'Spot Registration at Shankarpally Sub-Registrar Office'],
    bankPartners: ['State Bank of India', 'HDFC Bank', 'Canara Bank', 'Axis Bank']
  }
];
