import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'local_db.json');

const prisma = new PrismaClient();
let isFallbackMode = false;

// Ensure folder structures
const ensureDataDir = () => {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Check database connection on startup
async function checkDbConnection() {
  try {
    await prisma.$connect();
    await prisma.salon.count();
    console.log('✅ Connected to PostgreSQL database via Prisma.');
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed. Switching to Local JSON Database Fallback Mode.');
    isFallbackMode = true;
    initializeLocalDb();
  }
}

// Initial check
checkDbConnection();

const uniqueUnsplashIds = [
  'photo-1560066984-138dadb4c035', 'photo-1522337360788-8b13dee7a37e', 'photo-1562322140-8baeececf3df',
  'photo-1521590832167-7bcbfaa6381f', 'photo-1633681926035-ec1ac984418a', 'photo-1598300042247-d088f8ab3a91',
  'photo-1621605815971-fbc98d665033', 'photo-1607604276583-eef5d076aa5f', 'photo-1582095133179-bfd08e2fc6b3',
  'photo-1512290923902-8a9f81dc236c', 'photo-1519699047748-de8e457a634e', 'photo-1487412720507-e7ab37603c6f',
  'photo-1600607687939-ce8a6c25118c', 'photo-1616486338812-3dadae4b4ace', 'photo-1604654894610-df63bc536371',
  'photo-1596178065887-1198b6148b2b', 'photo-1503951914875-452162b0f3f1', 'photo-1527799820374-dcf8d9d4a3ef',
  'photo-1560869713-7d0a29430f23', 'photo-1599351431202-1e0f0137899a', 'photo-1516975080664-ed2fc6a32937',
  'photo-1534528741775-53994a69daeb', 'photo-1544005313-94ddf0286df2', 'photo-1506794778202-cad84cf45f1d',
  'photo-1507003211169-0a1dd7228f2d', 'photo-1500648767791-00dcc994a43e', 'photo-1519085360753-af0119f7cbe7',
  'photo-1580489944761-15a19d654956', 'photo-1594744803329-e58b31de215f', 'photo-1567532939604-b6b5b0db2604',
  'photo-1531746020798-e6953c6e8e04', 'photo-1548142813-c348350df52b', 'photo-1607746882042-944635dfe10e',
  'photo-1542909168-82c3e7fdca5c', 'photo-1522075469751-3a6694fb2f61', 'photo-1605497746444-ac9dbd43d19f',
  'photo-1580618672591-eb180b1a973f', 'photo-1601049541289-9b1b7bbbfe19', 'photo-1556229174-5e42a09e45af',
  'photo-1617897903246-719242758050', 'photo-1598440947619-2c35fc9aa908', 'photo-1608248597481-496100c8c836',
  'photo-1570158268183-d296b2890211', 'photo-1566492031773-4f4e44671857', 'photo-1508214751196-bcfd4ca60f91',
  'photo-1551836022-d5d88e9218df', 'photo-1573496359142-b8d87734a5a2', 'photo-1589710751893-f9a6790af714',
  'photo-1603252109303-2751441dd157', 'photo-1620331311520-246422fd82f9'
];

function getUnsplashUrl(index: number, width: number = 800): string {
  const id = uniqueUnsplashIds[index % uniqueUnsplashIds.length];
  return `https://images.unsplash.com/${id}?w=${width}&auto=format&fit=crop&q=80`;
}

function generateUniqueAbout(salonName: string, area: string, pricing: string, gender: string, specialty: string, index: number): string {
  const years = (index % 6) + 5;
  const stories = [
    `My team and I started this journey on a quiet corner in ${area} about ${years} years ago, driven by a simple dream: to create a sanctuary where people could get a premium beauty makeover without feeling rushed.`,
    `When I first opened the doors of ${salonName} ${years} years ago, I wanted to bring a new level of styling excellence to Jaipur. We started as a tiny team of two styling in ${area}.`,
    `Over ${years} years ago, ${salonName} was founded with a single mission: to redefine the self-care experience in ${area}. We believed that premium grooming should be an immersive, relaxing ritual.`
  ];
  const story = stories[index % stories.length];

  const teamDescriptions = [
    `Our team on the floor consists of senior designers and certified aestheticians who have trained at leading academies. We regularly hold masterclasses to keep up with international trends.`,
    `We pride ourselves on our highly curated team of professionals. Every stylist, therapist, and makeup artist here has at least 5 years of hands-on salon floor experience.`,
    `At the core of our salon is a dedicated group of specialists. We work collaboratively to craft personalized hair designs, glowing skin facials, and stunning transformations.`
  ];
  const teamDesc = teamDescriptions[index % teamDescriptions.length];

  const whyChooseUs = [
    `What sets us apart is our absolute commitment to customization. We don't believe in one-size-fits-all treatments, which is why we start with a thorough hair and skin analysis.`,
    `Clients return to us because of our uncompromising focus on quality. We use only organic, authentic products and sanitise all metal tools using hospital-grade autoclaves.`,
    `We have earned the loyalty of local families in ${area} by maintaining a friendly, warm environment coupled with the absolute highest standards of sanitation.`
  ];
  const chooseUs = whyChooseUs[index % whyChooseUs.length];

  const closing = [
    `We are deeply honored by the trust our Jaipur clients place in us, and we work hard to exceed expectations on every single visit.`,
    `Our reputation in ${area} has been built entirely on positive word-of-mouth, which is the greatest testimonial to our team's daily dedication.`,
    `Whether you need a simple trim or a heavy bridal package, we treat every appointment as a special occasion. We look forward to welcoming you.`
  ];
  const closeText = closing[index % closing.length];

  return `Welcome to ${salonName}. ${story} Today, we are proud to be one of Jaipur's most trusted ${gender.toLowerCase()} beauty spaces, offering top-tier ${pricing.toLowerCase()} services. Over the years, we have built a reputation of warmth, precision, and passion. Our clients aren't just visitors; they are part of our extended family.

${teamDesc} From custom hair repair and global coloring to advanced facial cleanups and nail structures, we combine art and science to deliver custom results. Our creative director and senior stylists work together to ensure that every haircut, facial, or nail extension is executed with absolute perfection. We believe that beauty and wellness are constantly evolving, which is why our team regularly updates their skills with international masterclasses.

We offer a comprehensive menu of services covering hair styling, premium spas, high-definition makeup, and wellness scrubs. ${chooseUs} We use only authentic, premium products like L'Oreal Professionnel, Olaplex, and luxury organic skincare ranges. We understand that your hair and skin are unique, which is why we start every appointment with a detailed, personal consultation. This bespoke approach ensures that you leave our doors feeling confident, rejuvenated, and truly pampered. We've invested in the latest styling technologies, from autoclaved precision tools to Dyson supersonic systems, prioritizing your safety and comfort.

Our local reputation in ${area} is built entirely on trust and positive word-of-mouth. ${closeText} This trust is something we earn every single day by maintaining hospital-grade hygiene standards and providing a warm, friendly atmosphere. Whether you are stepping in for a quick trim, a relaxing oil massage, or a complete bridal makeover for your special day, you can rest assured that you are in the safest hands in Jaipur. We look forward to welcoming you soon and helping you experience the magic of professional self-care.`;
}

// Initial database seeding if file is empty or missing
function initializeLocalDb() {
  ensureDataDir();
  if (fs.existsSync(LOCAL_DB_PATH)) {
    // Make sure we clear cache or populate demo accounts if missing
    try {
      const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
      if (db.salons.length === 21 && db.users.some((u: any) => u.email === 'admin@salonhub.com')) {
        return; // Already properly initialized
      }
    } catch (e) {}
  }

  console.log('🌱 Initializing local JSON database cache with 21 premium unique salons...');

  // Create demo users
  const users = [
    {
      id: 'usr-admin',
      name: 'Hub Admin',
      email: 'admin@salonhub.com',
      role: 'ADMIN',
      suspended: false,
      favoriteSalons: [],
      createdAt: new Date()
    },
    {
      id: 'usr-owner',
      name: 'Royal Glow Owner',
      email: 'owner@royalglow.com',
      role: 'OWNER',
      suspended: false,
      favoriteSalons: [],
      createdAt: new Date()
    },
    {
      id: 'usr-demo',
      name: 'Pooja Sen',
      email: 'pooja@example.com',
      role: 'USER',
      suspended: false,
      favoriteSalons: [],
      hairType: 'Frizzy/Curly',
      hairLength: 'Medium',
      hairGoals: 'Frizz Control & Growth',
      hairConcerns: 'Dryness and split ends',
      skinType: 'Combination',
      skinTone: 'Wheatish',
      skinConcerns: 'Pigmentation & Tanning',
      budgetRange: 'MID',
      occasion: 'Bridal Party',
      preferences: 'Organic products preferred',
      createdAt: new Date()
    }
  ];

  const specialtiesList = [
    'Luxury European Hair Artistry', 'Keratin & Frizz Control Solutions', 'Budget Bridal Draping & Glow',
    'Precision Modern Hair Sculpting', 'High-Definition Engagement Makeup', 'Sharp Fades & Anti-Acne Cleanups',
    'Traditional Royal Shaving Rituals', 'Elite 3D Gel Nail Artistry', 'Organic Ayurvedic Skin Rejuvenation',
    'Avant-Garde Global Balayage', 'Youth Undercuts & Singeing Tattoos', 'Custom Metallic Chrome Extensions',
    'Advanced Smooth-Kera Therapy', 'French Gold-Dust Anti-Stress Facials', 'Rajasthani Traditional Bridal Mehndi',
    'Detoxifying Charcoal Facial Polishes', 'Gentlemen\'s Scalp Repair Treatments', 'Quick Beard Trims & Clay De-tanning',
    'Deep Sea Marine Hydrating Facials', 'Artistic Freehand Nail Engravings', 'Celebrity Makeup & Airbrush Draping'
  ];

  const areasList = ['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'];

  const namesList = [
    'La Belleza Salon & Spa', 'Aura Unisex Salon', 'The Pink City Salon', 'Style & Scissors',
    'Glow & Glitter Makeup Studio', 'Reborn Men\'s Salon', 'The Royal Grooming Lounge',
    'Bellezza Bridal Studio', 'Sheer Elegance Salon', 'Toni & Guy (Mock Franchise)',
    'Scissors & Spades', 'Slay Queen Nails & Hair', 'Glamour & Glitz Salon',
    'Enchante Luxury Salon', 'Neelam Bridal Studio', 'The Gentleman\'s Club Barber',
    'Looks Men\'s Salon', 'Urban Groom Salon', 'Maverick Men\'s Grooming',
    'Verve Salon', 'Royal Glow Salon'
  ];

  const pricingCategories = ['LUXURY', 'MID', 'BUDGET', 'MID', 'MID', 'BUDGET', 'LUXURY', 'BUDGET', 'MID', 'LUXURY', 'BUDGET', 'MID', 'MID', 'LUXURY', 'BUDGET', 'MID', 'MID', 'BUDGET', 'MID', 'MID', 'LUXURY'];
  const genderCategories = ['UNISEX', 'UNISEX', 'FEMALE', 'UNISEX', 'FEMALE', 'MALE', 'MALE', 'FEMALE', 'FEMALE', 'UNISEX', 'MALE', 'FEMALE', 'UNISEX', 'FEMALE', 'FEMALE', 'MALE', 'MALE', 'MALE', 'MALE', 'UNISEX', 'UNISEX'];

  const salons: any[] = [];
  const posts: any[] = [];

  for (let i = 0; i < 21; i++) {
    const id = i === 20 ? 'salon-royal-glow' : `salon-${i + 1}`;
    const name = namesList[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const area = areasList[i % areasList.length];
    const pricing = pricingCategories[i];
    const gender = genderCategories[i];
    const specialty = specialtiesList[i];

    const coverImage = getUnsplashUrl(i * 2);
    const gallery = [
      getUnsplashUrl(i * 2),
      getUnsplashUrl(i * 2 + 1),
      getUnsplashUrl(i * 2 + 2)
    ];

    const brandStory = generateUniqueAbout(name, area, pricing, gender, specialty, i);
    
    // Professionals list
    const profNames = [
      ['Rohan Verma', 'Kiran Sharma'],
      ['Vikram Dev', 'Preeti Sen'],
      ['Suman Choudhary', 'Aisha Khan'],
      ['Kabir Lal', 'Megha Soni'],
      ['Pooja Vyas', 'Neetu Kumawat'],
      ['Raj Kumar', 'Vijay Meena'],
      ['Aman Mathur', 'Ali Khan'],
      ['Tanvi Jain', 'Divya Singh'],
      ['Priya Sharma', 'Rita Kothari'],
      ['Marcus Sterling', 'Elena Gilbert'],
      ['Rohan Sharma', 'Vijay Sen'],
      ['Nisha Vyas', 'Payal Sen'],
      ['Rita Sen', 'Sujata Goel'],
      ['Nisha Kumawat', 'Riddhi Sen'],
      ['Mamta Meena', 'Aradhana Rao'],
      ['Amit Jain', 'Rahul Sen'],
      ['Vijay Sen', 'Deepak Meena'],
      ['Karan Joshi', 'Nitin Sen'],
      ['Aman Goel', 'Sanjay Vyas'],
      ['Tanya Goel', 'Richa Vyas'],
      ['Harshita Shekhawat', 'Deepika Rathore']
    ];

    const profs = profNames[i % profNames.length].map((nameStr, pIdx) => ({
      id: `prof-${id}-${pIdx}`,
      name: nameStr,
      specialization: pIdx === 0 ? specialty : 'Senior Stylist',
      yearsExperience: 4 + pIdx * 2 + (i % 3),
      certifications: ['Toni & Guy Academy Certified'],
      bio: `Specialist in ${specialty} with years of dedicated training.`,
      profileImage: getUnsplashUrl(i * 2 + 10 + pIdx, 150),
      salonId: id
    }));

    // Services list
    const services = [
      { id: `srv-${id}-1`, name: 'Luxury Global Coloring', category: 'Hair', price: 2999 + i * 50, duration: 120, description: 'Uniform rich hair dye coloring using ammonia-free formulas.' },
      { id: `srv-${id}-2`, name: 'Keratin Nourishing Hair Spa', category: 'Hair Spa', price: 1499 + i * 30, duration: 60, description: 'Deep bond-building and smoothening conditioning hair spa.' },
      { id: `srv-${id}-3`, name: 'Signature Precision Haircut', category: 'Hair', price: 599 + i * 15, duration: 45, description: 'Creative layered trim, refreshing hair wash, and blow dry styling.' },
      { id: `srv-${id}-4`, name: 'Hydra Facial Glow Therapy', category: 'Skin', price: 2499 + i * 40, duration: 60, description: 'Multi-stage skin exfoliation, deep cleanse, and hydration resurfacing.' },
      { id: `srv-${id}-5`, name: 'Premium Pedicure & Nail Scrub', category: 'Nails', price: 899 + i * 20, duration: 40, description: 'Nourishing foot bath, nail shaping, and premium polish finish.' },
      { id: `srv-${id}-6`, name: 'HD Bridal Makeover Package', category: 'Bridal', price: 7999 + i * 100, duration: 150, description: 'Flawless wedding makeup look including draping, bun, and lashes.' }
    ];

    const reviews = [
      {
        id: `rev-${id}-1`,
        salonId: id,
        name: i % 2 === 0 ? 'Anjali Sharma' : 'Vikram Singh',
        rating: 4.0 + (i % 2) * 1.0,
        comment: `Excellent service! The staff was incredibly welcoming and my ${specialty} turned out exactly as requested.`,
        date: `2026-06-${10 + (i % 14)}`
      }
    ];

    salons.push({
      id,
      name,
      slug,
      coverImage,
      gallery,
      brandStory: brandStory.split('\n\n')[0] || '',
      overview: brandStory.slice(0, 150) + '...',
      expertise: [specialty, 'Hairstyling', 'Facials', 'Grooming'],
      teamStructure: '1 Creative Director, 2 Senior Stylists, 1 Master Aesthetician.',
      certifications: ['L\'Oreal Professional Advanced Partner', 'Olaplex Authorized Salon'],
      pricingCategory: pricing,
      openingHours: '10:00 AM - 08:30 PM',
      location: `${area}, Jaipur`,
      area,
      address: `Plot ${50 + i * 8}, Marg ${i + 1}, ${area}, Jaipur, Rajasthan 302001`,
      phone: `+91 98290 ${10000 + i}`,
      amenities: ['WiFi', 'Air Conditioning', 'Beverages', 'Sanitized Station'],
      technologies: ['Dyson Stylers', 'autoclave sterilizers'],
      hygieneStandards: 'Hospital-grade autoclaves and sanitized fresh gowns.',
      serviceGuarantee: 'Bespoke adjustments available within 5 days.',
      bookingPolicies: '2-hour cancellation notice is appreciated.',
      rating: parseFloat((4.2 + (i % 9) * 0.1).toFixed(1)),
      reviewsCount: 30 + i * 6,
      genderCategory: gender,
      featured: i % 4 === 0,
      ownerId: i === 20 ? 'usr-owner' : null,
      status: 'APPROVED',
      isVerified: true,
      offers: [`Flat 10% Off on ${specialty}`, 'Free Blowdry on bill > 2000'],
      services,
      packages: [],
      membershipPlans: [],
      professionals: profs,
      reviews
    });

    // Create 3 posts per salon
    const categories = ['Transformation', 'Offer', 'Announcement'];
    const postsContent = [
      `Delighted to showcase this fresh hair makeover transform! Styled using Olaplex bond repair.`,
      `Exclusive Deal: Get flat 15% off on all skin therapies this weekend! Book slots early.`,
      `We are proud to introduce our new stylist to our team. Book a slot today!`
    ];

    for (let pIdx = 0; pIdx < 3; pIdx++) {
      posts.push({
        id: `post-${id}-${pIdx}`,
        salonId: id,
        content: `${name} Announcement: ${postsContent[pIdx]}`,
        category: categories[pIdx],
        image: getUnsplashUrl(i * 2 + pIdx * 3, 500),
        video: null,
        likes: ['usr-demo'],
        createdAt: new Date()
      });
    }
  }

  // 3. Products
  const productsData = [
    { id: 'prod-1', name: 'Argan Oil Anti-Frizz Serum', category: 'Hair', price: 999, brand: 'BeautyBio', description: 'Lightweight argan serum that smooths frizzy ends and adds glossy shine.', benefits: 'Reduces frizz by 90%, protects against heat styling, hydrates dry curly hair.', usageInstructions: 'Apply 2-3 drops to damp hair from mid-lengths to ends. Do not rinse.', skinTypes: [], hairTypes: ['Frizzy', 'Curly', 'Dry'], rating: 4.8, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=400&auto=format&fit=crop&q=80' },
    { id: 'prod-2', name: 'Hydra-Glow Hyaluronic Cream', category: 'Skin', price: 1249, brand: 'GlowRx', description: 'Intensive moisture cream formulated with 2% pure hyaluronic acid for plump skin.', benefits: 'Locks in deep hydration, repairs skin barrier, gives an instant dewy glow.', usageInstructions: 'Massage onto clean face and neck morning and night.', skinTypes: ['Dry', 'Combination', 'Sensitive'], hairTypes: [], rating: 4.7, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&auto=format&fit=crop&q=80' },
    { id: 'prod-3', name: 'Salicylic Acid Acne Defense Gel', category: 'Skin', price: 799, brand: 'ClearSkin', description: 'Spot treatment gel targeting breakouts, blackheads, and open pores.', benefits: 'Clears acne blemishes, controls excess sebum, reduces skin redness.', usageInstructions: 'Apply a thin layer directly to affected spots at night.', skinTypes: ['Oily', 'Combination'], hairTypes: [], rating: 4.5, image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&auto=format&fit=crop&q=80' }
  ];

  const initialDb = {
    users,
    salons,
    bookings: [],
    chatSessions: [],
    chatMessages: [],
    posts,
    frozenSlots: [],
    analytics: {
      mostAskedQuestions: [
        { question: 'frizzy hair remedy', count: 15 },
        { question: 'best bridal makeup under ₹2000', count: 12 },
        { question: 'hydra facial benefits', count: 8 }
      ],
      mostRecommendedServices: [
        { service: 'Keratin Nourishing Hair Spa', count: 18 },
        { service: 'Luxury Bridal Makeup & Styling', count: 14 },
        { service: 'Hydra Facial Brightening Cure', count: 10 }
      ],
      mostRecommendedSalons: [
        { salonName: 'La Belleza Salon & Spa', count: 12 },
        { salonName: 'The Pink City Salon', count: 10 },
        { salonName: 'Aura Unisex Salon', count: 8 }
      ],
      popularTreatments: [
        { treatment: 'Keratin Spa', count: 22 },
        { treatment: 'Hydra Facial', count: 15 }
      ],
      chatSatisfaction: 4.8,
      totalChats: 45,
    }
  };

  writeLocalDb(initialDb);
  console.log('🌱 Local JSON DB populated with 21 premium unique salons.');
}

// Load current local database state
export function readLocalDb(): any {
  ensureDataDir();
  try {
    const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const db = JSON.parse(content);
    db.posts = db.posts || [];
    db.frozenSlots = db.frozenSlots || [];
    return db;
  } catch (e) {
    return { users: [], salons: [], bookings: [], chatSessions: [], chatMessages: [], posts: [], frozenSlots: [], analytics: {} };
  }
}

// Save local database state
function writeLocalDb(data: any) {
  ensureDataDir();
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// --- DB ADAPTER EXPORTS ---

export async function findUserByEmail(email: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.users.find((u: any) => u.email === email) || null;
  }
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const newUser = { id: `usr-${Math.random().toString(36).substring(2, 9)}`, favoriteSalons: [], createdAt: new Date(), ...data };
    db.users.push(newUser);
    writeLocalDb(db);
    return newUser;
  }
  return prisma.user.create({ data });
}

export async function findUserById(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.users.find((u: any) => u.id === id) || null;
  }
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...data, updatedAt: new Date() };
      writeLocalDb(db);
      return db.users[idx];
    }
    return null;
  }
  return prisma.user.update({ where: { id }, data });
}

export async function findSalons(filters: any = {}) {
  if (isFallbackMode) {
    const db = readLocalDb();
    let salons = db.salons;
    
    // Apply filters
    if (filters.area) {
      salons = salons.filter((s: any) => s.area === filters.area);
    }
    if (filters.genderCategory) {
      salons = salons.filter((s: any) => s.genderCategory === filters.genderCategory);
    }
    if (filters.pricingCategory) {
      salons = salons.filter((s: any) => s.pricingCategory === filters.pricingCategory);
    }
    if (filters.expertise) {
      salons = salons.filter((s: any) => s.expertise.includes(filters.expertise.has));
    }
    return salons;
  }
  return prisma.salon.findMany({
    where: filters,
    include: {
      services: true,
      professionals: true,
      packages: true,
    },
  });
}

export async function findSalonById(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.salons.find((s: any) => s.id === id) || null;
  }
  return prisma.salon.findUnique({
    where: { id },
    include: {
      services: true,
      packages: true,
      membershipPlans: true,
      professionals: true,
      reviews: true,
    },
  });
}

export async function createBooking(data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const salon = db.salons.find((s: any) => s.id === data.salonId);
    const professional = salon?.professionals.find((p: any) => p.id === data.professionalId);
    
    const newBooking = {
      id: data.id,
      userId: data.userId,
      salonId: data.salonId,
      professionalId: data.professionalId,
      date: data.date,
      time: data.time,
      services: data.services,
      totalPrice: data.totalPrice,
      status: data.status || 'CONFIRMED',
      createdAt: new Date(),
      salon: {
        name: salon?.name || '',
        coverImage: salon?.coverImage || '',
        location: salon?.location || '',
      },
      professional: {
        name: professional?.name || '',
      }
    };
    db.bookings.push(newBooking);
    writeLocalDb(db);
    return newBooking;
  }
  return prisma.booking.create({
    data,
    include: {
      salon: { select: { name: true, coverImage: true, location: true } },
      professional: { select: { name: true } }
    }
  });
}

export async function findBookingsByUserId(userId: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.bookings.filter((b: any) => b.userId === userId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return prisma.booking.findMany({
    where: { userId },
    include: {
      salon: { select: { name: true, coverImage: true, location: true, address: true } },
      professional: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateBookingStatus(id: string, userId: string, status: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.bookings.findIndex((b: any) => b.id === id);
    if (idx >= 0 && (db.bookings[idx].userId === userId || userId === 'ADMIN' || userId === 'OWNER' || userId === 'ALL')) {
      db.bookings[idx].status = status;
      writeLocalDb(db);
      return db.bookings[idx];
    }
    return null;
  }
  return prisma.booking.update({
    where: { id },
    data: { status }
  });
}

export async function updateBookingReschedule(id: string, userId: string, date: string, time: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.bookings.findIndex((b: any) => b.id === id);
    if (idx >= 0 && (db.bookings[idx].userId === userId || userId === 'ADMIN' || userId === 'OWNER' || userId === 'ALL')) {
      db.bookings[idx].date = date;
      db.bookings[idx].time = time;
      db.bookings[idx].status = 'CONFIRMED';
      writeLocalDb(db);
      return db.bookings[idx];
    }
    return null;
  }
  return prisma.booking.update({
    where: { id },
    data: { date, time, status: 'CONFIRMED' }
  });
}

export async function getAIAnalytics() {
  if (isFallbackMode) {
    const db = readLocalDb();
    const totalBookingsCount = db.bookings.length;
    const confirmedCount = db.bookings.filter((b: any) => b.status === 'CONFIRMED').length;
    const cancelledCount = db.bookings.filter((b: any) => b.status === 'CANCELLED').length;
    const totalUsersCount = db.users.length;
    const totalChats = db.analytics.totalChats || 10;
    const conversionRate = totalBookingsCount > 0 ? (totalBookingsCount / totalChats) * 100 : 0;

    const performance = db.salons.map((s: any) => {
      const bookingsCount = db.bookings.filter((b: any) => b.salonId === s.id).length;
      return {
        salonId: s.id,
        name: s.name,
        area: s.area,
        rating: s.rating,
        bookingsCount,
        revenue: bookingsCount * 1250
      };
    }).sort((a: any, b: any) => b.bookingsCount - a.bookingsCount);

    return {
      summary: {
        totalBookings: totalBookingsCount,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        userGrowth: totalUsersCount + 42,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
      aiAnalytics: db.analytics,
      salonPerformance: performance
    };
  }
  return null;
}

// --- CHAT SESSIONS & HISTORY HELPERS ---

export async function findChatSessionsByUserId(userId: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.chatSessions.filter((s: any) => s.userId === userId).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function findChatSessionById(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const session = db.chatSessions.find((s: any) => s.id === id);
    if (!session) return null;
    const messages = db.chatMessages.filter((m: any) => m.sessionId === id).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { ...session, messages };
  }
  return prisma.chatSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });
}

export async function createChatSession(id: string, title: string, userId: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const newSession = {
      id,
      title,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.chatSessions.push(newSession);
    writeLocalDb(db);
    return newSession;
  }
  return prisma.chatSession.create({
    data: { id, title, userId }
  });
}

export async function createChatMessage(
  sessionId: string,
  sender: 'user' | 'ai',
  text: string,
  recommendedSalons: any[] = [],
  recommendedProducts: any[] = []
) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const newMsg = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      sessionId,
      sender,
      text,
      recommendedSalons,
      recommendedProducts,
      createdAt: new Date()
    };
    db.chatMessages.push(newMsg);
    
    // Update session timestamp
    const sessionIdx = db.chatSessions.findIndex((s: any) => s.id === sessionId);
    if (sessionIdx >= 0) {
      db.chatSessions[sessionIdx].updatedAt = new Date();
    }

    writeLocalDb(db);
    return newMsg;
  }
  return prisma.chatMessage.create({
    data: {
      sessionId,
      sender,
      text,
      recommendedSalons: recommendedSalons || [],
      recommendedProducts: recommendedProducts || [],
    }
  });
}

export async function deleteChatSession(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.chatSessions = db.chatSessions.filter((s: any) => s.id !== id);
    db.chatMessages = db.chatMessages.filter((m: any) => m.sessionId !== id);
    writeLocalDb(db);
    return true;
  }
  return prisma.chatSession.delete({ where: { id } });
}

export async function updateAIAnalyticsStats(query: string, recommendedSalons: any[]) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const analytics = db.analytics;
    
    // Update Questions
    const questions = analytics.mostAskedQuestions || [];
    const qMatch = questions.find((q: any) => q.question.toLowerCase() === query.toLowerCase());
    if (qMatch) {
      qMatch.count += 1;
    } else {
      questions.push({ question: query, count: 1 });
    }
    questions.sort((a: any, b: any) => b.count - a.count);

    // Update Salons
    const salons = analytics.mostRecommendedSalons || [];
    for (const rSalon of recommendedSalons || []) {
      const sMatch = salons.find((s: any) => s.salonName === rSalon.name);
      if (sMatch) {
        sMatch.count += 1;
      } else {
        salons.push({ salonName: rSalon.name, count: 1 });
      }
    }
    salons.sort((a: any, b: any) => b.count - a.count);

    analytics.mostAskedQuestions = questions.slice(0, 10);
    analytics.mostRecommendedSalons = salons.slice(0, 10);
    analytics.totalChats = (analytics.totalChats || 0) + 1;

    writeLocalDb(db);
    return;
  }

  // Under normal mode, handled in the route
}

export async function findUsers() {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.users || [];
  }
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateUserSuspension(id: string, suspended: boolean) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx >= 0) {
      db.users[idx].suspended = suspended;
      writeLocalDb(db);
      return db.users[idx];
    }
    return null;
  }
  return prisma.user.update({
    where: { id },
    data: { suspended }
  });
}

export async function deleteUser(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.users = db.users.filter((u: any) => u.id !== id);
    writeLocalDb(db);
    return true;
  }
  return prisma.user.delete({ where: { id } });
}

export async function updateSalonDetails(id: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.salons.findIndex((s: any) => s.id === id);
    if (idx >= 0) {
      db.salons[idx] = { ...db.salons[idx], ...data };
      writeLocalDb(db);
      return db.salons[idx];
    }
    return null;
  }
  return prisma.salon.update({
    where: { id },
    data,
    include: {
      services: true,
      professionals: true,
      packages: true,
    }
  });
}

export async function updateSalonStatus(id: string, status: string, isVerified: boolean) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.salons.findIndex((s: any) => s.id === id);
    if (idx >= 0) {
      db.salons[idx].status = status;
      db.salons[idx].isVerified = isVerified;
      writeLocalDb(db);
      return db.salons[idx];
    }
    return null;
  }
  return prisma.salon.update({
    where: { id },
    data: { status, isVerified }
  });
}

export async function createSalon(data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const newSalon = {
      services: [],
      packages: [],
      membershipPlans: [],
      professionals: [],
      reviews: [],
      status: 'APPROVED',
      isVerified: true,
      offers: [],
      rating: 5.0,
      reviewsCount: 0,
      featured: false,
      ...data
    };
    db.salons.push(newSalon);
    writeLocalDb(db);
    return newSalon;
  }
  return prisma.salon.create({
    data,
    include: {
      services: true,
      professionals: true,
      packages: true,
    }
  });
}

export async function findAllBookings() {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return prisma.booking.findMany({
    include: {
      salon: { select: { name: true, coverImage: true, location: true } },
      user: { select: { name: true, email: true } },
      professional: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function findBookingsBySalonId(salonId: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    return db.bookings.filter((b: any) => b.salonId === salonId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return prisma.booking.findMany({
    where: { salonId },
    include: {
      salon: { select: { name: true, coverImage: true, location: true } },
      user: { select: { name: true, email: true } },
      professional: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function rescheduleBookingByOwner(id: string, date: string, time: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const idx = db.bookings.findIndex((b: any) => b.id === id);
    if (idx >= 0) {
      db.bookings[idx].date = date;
      db.bookings[idx].time = time;
      db.bookings[idx].status = 'ACCEPTED';
      writeLocalDb(db);
      return db.bookings[idx];
    }
    return null;
  }
  return prisma.booking.update({
    where: { id },
    data: { date, time, status: 'ACCEPTED' }
  });
}

export async function createSalonProfessional(salonId: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const salonIdx = db.salons.findIndex((s: any) => s.id === salonId);
    if (salonIdx >= 0) {
      const newProf = {
        id: `prof-${Math.random().toString(36).substring(2, 9)}`,
        salonId,
        certifications: [],
        ...data
      };
      db.salons[salonIdx].professionals = db.salons[salonIdx].professionals || [];
      db.salons[salonIdx].professionals.push(newProf);
      writeLocalDb(db);
      return newProf;
    }
    return null;
  }
  return prisma.salonProfessional.create({
    data: { salonId, ...data }
  });
}

export async function updateSalonProfessional(id: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    for (let i = 0; i < db.salons.length; i++) {
      const idx = db.salons[i].professionals?.findIndex((p: any) => p.id === id);
      if (idx !== undefined && idx >= 0) {
        db.salons[i].professionals[idx] = { ...db.salons[i].professionals[idx], ...data };
        writeLocalDb(db);
        return db.salons[i].professionals[idx];
      }
    }
    return null;
  }
  return prisma.salonProfessional.update({
    where: { id },
    data
  });
}

export async function deleteSalonProfessional(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    for (let i = 0; i < db.salons.length; i++) {
      const idx = db.salons[i].professionals?.findIndex((p: any) => p.id === id);
      if (idx !== undefined && idx >= 0) {
        db.salons[i].professionals = db.salons[i].professionals.filter((p: any) => p.id !== id);
        writeLocalDb(db);
        return true;
      }
    }
    return false;
  }
  return prisma.salonProfessional.delete({ where: { id } });
}

export async function createService(salonId: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const salonIdx = db.salons.findIndex((s: any) => s.id === salonId);
    if (salonIdx >= 0) {
      const newSrv = {
        id: `srv-${Math.random().toString(36).substring(2, 9)}`,
        salonId,
        price: parseFloat(data.price),
        duration: parseInt(data.duration, 10),
        ...data
      };
      db.salons[salonIdx].services = db.salons[salonIdx].services || [];
      db.salons[salonIdx].services.push(newSrv);
      writeLocalDb(db);
      return newSrv;
    }
    return null;
  }
  return prisma.service.create({
    data: {
      salonId,
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      duration: parseInt(data.duration, 10),
      description: data.description || '',
    }
  });
}

export async function updateService(id: string, data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    for (let i = 0; i < db.salons.length; i++) {
      const idx = db.salons[i].services?.findIndex((s: any) => s.id === id);
      if (idx !== undefined && idx >= 0) {
        db.salons[i].services[idx] = {
          ...db.salons[i].services[idx],
          ...data,
          price: data.price !== undefined ? parseFloat(data.price) : db.salons[i].services[idx].price,
          duration: data.duration !== undefined ? parseInt(data.duration, 10) : db.salons[i].services[idx].duration,
        };
        writeLocalDb(db);
        return db.salons[i].services[idx];
      }
    }
    return null;
  }
  return prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      price: data.price !== undefined ? parseFloat(data.price) : undefined,
      duration: data.duration !== undefined ? parseInt(data.duration, 10) : undefined,
      description: data.description,
    }
  });
}

export async function deleteService(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    for (let i = 0; i < db.salons.length; i++) {
      const idx = db.salons[i].services?.findIndex((s: any) => s.id === id);
      if (idx !== undefined && idx >= 0) {
        db.salons[i].services = db.salons[i].services.filter((s: any) => s.id !== id);
        writeLocalDb(db);
        return true;
      }
    }
    return false;
  }
  return prisma.service.delete({ where: { id } });
}

export async function findPosts() {
  if (isFallbackMode) {
    const db = readLocalDb();
    const posts = db.posts || [];
    return posts.map((p: any) => {
      const salon = db.salons.find((s: any) => s.id === p.salonId);
      return {
        ...p,
        salon: salon ? { name: salon.name, coverImage: salon.coverImage } : null
      };
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return prisma.salonPost.findMany({
    include: {
      salon: {
        select: { name: true, coverImage: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createPost(data: any) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.posts = db.posts || [];
    const newPost = {
      id: `post-${Math.random().toString(36).substring(2, 9)}`,
      likes: [],
      createdAt: new Date(),
      ...data
    };
    db.posts.push(newPost);
    writeLocalDb(db);
    return newPost;
  }
  return prisma.salonPost.create({
    data
  });
}

export async function toggleLikePost(id: string, userId: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.posts = db.posts || [];
    const idx = db.posts.findIndex((p: any) => p.id === id);
    if (idx >= 0) {
      let likes = db.posts[idx].likes || [];
      if (likes.includes(userId)) {
        likes = likes.filter((uid: string) => uid !== userId);
      } else {
        likes.push(userId);
      }
      db.posts[idx].likes = likes;
      writeLocalDb(db);
      return db.posts[idx];
    }
    return null;
  }
  
  const post = await prisma.salonPost.findUnique({ where: { id } });
  if (!post) return null;
  
  let likes = post.likes;
  if (likes.includes(userId)) {
    likes = likes.filter((uid: string) => uid !== userId);
  } else {
    likes.push(userId);
  }
  
  return prisma.salonPost.update({
    where: { id },
    data: { likes }
  });
}

export async function findFrozenSlots(salonId: string, date: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    const frozenSlots = db.frozenSlots || [];
    return frozenSlots.filter((s: any) => s.salonId === salonId && s.date === date);
  }
  return prisma.frozenSlot.findMany({
    where: { salonId, date }
  });
}

export async function createFrozenSlot(salonId: string, date: string, time: string, reason: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.frozenSlots = db.frozenSlots || [];
    const exists = db.frozenSlots.some((s: any) => s.salonId === salonId && s.date === date && s.time === time);
    if (exists) return null;
    
    const newSlot = {
      id: `slot-${Math.random().toString(36).substring(2, 9)}`,
      salonId,
      date,
      time,
      reason,
      createdAt: new Date()
    };
    db.frozenSlots.push(newSlot);
    writeLocalDb(db);
    return newSlot;
  }
  return prisma.frozenSlot.create({
    data: { salonId, date, time, reason }
  });
}

export async function deleteFrozenSlot(salonId: string, date: string, time: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.frozenSlots = db.frozenSlots || [];
    const initialLen = db.frozenSlots.length;
    db.frozenSlots = db.frozenSlots.filter((s: any) => !(s.salonId === salonId && s.date === date && s.time === time));
    writeLocalDb(db);
    return db.frozenSlots.length < initialLen;
  }
  const result = await prisma.frozenSlot.deleteMany({
    where: { salonId, date, time }
  });
  return result.count > 0;
}

export async function deleteSalon(id: string) {
  if (isFallbackMode) {
    const db = readLocalDb();
    db.salons = db.salons.filter((s: any) => s.id !== id);
    db.bookings = db.bookings.filter((b: any) => b.salonId !== id);
    db.posts = (db.posts || []).filter((p: any) => p.salonId !== id);
    db.frozenSlots = (db.frozenSlots || []).filter((s: any) => s.salonId !== id);
    writeLocalDb(db);
    return true;
  }
  return prisma.salon.delete({ where: { id } });
}

export { isFallbackMode, prisma };
