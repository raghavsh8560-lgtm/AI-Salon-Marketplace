import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const uniqueUnsplashIds = [
  'photo-1560066984-138dadb4c035', // 0
  'photo-1522337360788-8b13dee7a37e', // 1
  'photo-1562322140-8baeececf3df', // 2
  'photo-1521590832167-7bcbfaa6381f', // 3
  'photo-1633681926035-ec1ac984418a', // 4
  'photo-1598300042247-d088f8ab3a91', // 5
  'photo-1621605815971-fbc98d665033', // 6
  'photo-1607604276583-eef5d076aa5f', // 7
  'photo-1582095133179-bfd08e2fc6b3', // 8
  'photo-1512290923902-8a9f81dc236c', // 9
  'photo-1519699047748-de8e457a634e', // 10
  'photo-1487412720507-e7ab37603c6f', // 11
  'photo-1600607687939-ce8a6c25118c', // 12
  'photo-1616486338812-3dadae4b4ace', // 13
  'photo-1604654894610-df63bc536371', // 14
  'photo-1596178065887-1198b6148b2b', // 15
  'photo-1503951914875-452162b0f3f1', // 16
  'photo-1527799820374-dcf8d9d4a3ef', // 17
  'photo-1560869713-7d0a29430f23', // 18
  'photo-1599351431202-1e0f0137899a', // 19
  'photo-1516975080664-ed2fc6a32937', // 20
  'photo-1534528741775-53994a69daeb', // 21
  'photo-1544005313-94ddf0286df2', // 22
  'photo-1506794778202-cad84cf45f1d', // 23
  'photo-1507003211169-0a1dd7228f2d', // 24
  'photo-1500648767791-00dcc994a43e', // 25
  'photo-1519085360753-af0119f7cbe7', // 26
  'photo-1580489944761-15a19d654956', // 27
  'photo-1594744803329-e58b31de215f', // 28
  'photo-1567532939604-b6b5b0db2604', // 29
  'photo-1531746020798-e6953c6e8e04', // 30
  'photo-1548142813-c348350df52b', // 31
  'photo-1607746882042-944635dfe10e', // 32
  'photo-1542909168-82c3e7fdca5c', // 33
  'photo-1522075469751-3a6694fb2f61', // 34
  'photo-1605497746444-ac9dbd43d19f', // 35
  'photo-1580618672591-eb180b1a973f', // 36
  'photo-1601049541289-9b1b7bbbfe19', // 37
  'photo-1556229174-5e42a09e45af', // 38
  'photo-1617897903246-719242758050', // 39
  'photo-1598440947619-2c35fc9aa908', // 40
  'photo-1608248597481-496100c8c836', // 41
  'photo-1570158268183-d296b2890211', // 42
  'photo-1566492031773-4f4e44671857', // 43
  'photo-1508214751196-bcfd4ca60f91', // 44
  'photo-1551836022-d5d88e9218df', // 45
  'photo-1573496359142-b8d87734a5a2', // 46
  'photo-1589710751893-f9a6790af714', // 47
  'photo-1603252109303-2751441dd157', // 48
  'photo-1620331311520-246422fd82f9'  // 49
];

function getUnsplashUrl(index: number, width: number = 800): string {
  const id = uniqueUnsplashIds[index % uniqueUnsplashIds.length];
  return `https://images.unsplash.com/${id}?w=${width}&auto=format&fit=crop&q=80`;
}

function generateUniqueAbout(salonName: string, area: string, pricing: string, gender: string, specialty: string, index: number): string {
  const years = (index % 6) + 5; // 5 to 10 years
  
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

async function main() {
  console.log('Seeding database with updated extended models...');

  // Clear existing data
  await prisma.frozenSlot.deleteMany({});
  await prisma.salonPost.deleteMany({});
  await prisma.aIAnalytics.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.salonProfessional.deleteMany({});
  await prisma.salon.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.guide.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedDefaultPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('Admin123', 10);
  const ownerPassword = await bcrypt.hash('Owner123', 10);

  // 1. Create Demo Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Hub Admin',
      email: 'admin@salonhub.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const ownerUser = await prisma.user.create({
    data: {
      name: 'Royal Glow Owner',
      email: 'owner@royalglow.com',
      password: ownerPassword,
      role: 'OWNER',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Pooja Sen',
      email: 'pooja@example.com',
      password: hashedDefaultPassword,
      role: 'USER',
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
    },
  });

  console.log('Demo accounts seeded.');

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
    'Verve Salon', 'Royal Glow Salon' // 21st Salon owned by demo owner
  ];

  const pricingCategories = ['LUXURY', 'MID', 'BUDGET', 'MID', 'MID', 'BUDGET', 'LUXURY', 'BUDGET', 'MID', 'LUXURY', 'BUDGET', 'MID', 'MID', 'LUXURY', 'BUDGET', 'MID', 'MID', 'BUDGET', 'MID', 'MID', 'LUXURY'];
  const genderCategories = ['UNISEX', 'UNISEX', 'FEMALE', 'UNISEX', 'FEMALE', 'MALE', 'MALE', 'FEMALE', 'FEMALE', 'UNISEX', 'MALE', 'FEMALE', 'UNISEX', 'FEMALE', 'FEMALE', 'MALE', 'MALE', 'MALE', 'MALE', 'UNISEX', 'UNISEX'];

  // Seed Salons Data
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
    
    // Create Salon
    const salon = await prisma.salon.create({
      data: {
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
        ownerId: i === 20 ? ownerUser.id : null,
        status: 'APPROVED',
        isVerified: true,
        offers: [`Flat 10% Off on ${specialty}`, 'Free Blowdry on bill > 2000']
      }
    });

    // Create unique professionals
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
      ['Harshita Shekhawat', 'Deepika Rathore'] // Royal Glow
    ];

    const profs = profNames[i % profNames.length];
    for (let pIdx = 0; pIdx < profs.length; pIdx++) {
      await prisma.salonProfessional.create({
        data: {
          name: profs[pIdx],
          specialization: pIdx === 0 ? specialty : 'Senior Stylist',
          yearsExperience: 4 + pIdx * 2 + (i % 3),
          certifications: ['Toni & Guy Academy Certified'],
          bio: `Specialist in ${specialty} with years of dedicated training.`,
          profileImage: getUnsplashUrl(i * 2 + 10 + pIdx, 150),
          salonId: salon.id
        }
      });
    }

    // Create unique services
    const baseServices = [
      { name: 'Luxury Global Coloring', category: 'Hair', price: 2999 + i * 50, duration: 120, description: 'Uniform rich hair dye coloring using ammonia-free formulas.' },
      { name: 'Keratin Nourishing Hair Spa', category: 'Hair Spa', price: 1499 + i * 30, duration: 60, description: 'Deep bond-building and smoothening conditioning hair spa.' },
      { name: 'Signature Precision Haircut', category: 'Hair', price: 599 + i * 15, duration: 45, description: 'Creative layered trim, refreshing hair wash, and blow dry styling.' },
      { name: 'Hydra Facial Glow Therapy', category: 'Skin', price: 2499 + i * 40, duration: 60, description: 'Multi-stage skin exfoliation, deep cleanse, and hydration resurfacing.' },
      { name: 'Premium Pedicure & Nail Scrub', category: 'Nails', price: 899 + i * 20, duration: 40, description: 'Nourishing foot bath, nail shaping, and premium polish finish.' },
      { name: 'HD Bridal Makeover Package', category: 'Bridal', price: 7999 + i * 100, duration: 150, description: 'Flawless wedding makeup look including draping, bun, and lashes.' }
    ];

    for (const s of baseServices) {
      await prisma.service.create({
        data: {
          salonId: salon.id,
          name: s.name,
          category: s.category,
          price: s.price,
          duration: s.duration,
          description: s.description
        }
      });
    }

    // Add unique review
    await prisma.review.create({
      data: {
        salonId: salon.id,
        name: i % 2 === 0 ? 'Anjali Sharma' : 'Vikram Singh',
        rating: 4.0 + (i % 2) * 1.0,
        comment: `Excellent service! The staff was incredibly welcoming and my ${specialty} turned out exactly as requested.`,
        date: `2026-06-${10 + (i % 14)}`
      }
    });

    // Create initial posts for feed (Phase 3 requirements)
    const categories = ['Transformation', 'Offer', 'Announcement', 'Transformation'];
    const postsContent = [
      `Delighted to showcase this fresh hair makeover transform! Styled using Olaplex bond repair.`,
      `Exclusive Deal: Get flat 15% off on all skin therapies this weekend! Book slots early.`,
      `We are proud to introduce Deepika Rathore to our professional stylists team. Book a slot today!`,
      `Transformations are our passion. Check out this gorgeous bridal airbrush draping glow.`
    ];

    for (let pIdx = 0; pIdx < 3; pIdx++) {
      await prisma.salonPost.create({
        data: {
          salonId: salon.id,
          content: `${name} Announcement: ${postsContent[pIdx]}`,
          category: categories[pIdx],
          image: getUnsplashUrl(i * 2 + pIdx * 3, 500),
          likes: [demoUser.id]
        }
      });
    }
  }

  console.log('21 unique Salons and posts seeded successfully.');

  // 3. Seed Products
  const productsData = [
    { id: 'prod-1', name: 'Argan Oil Anti-Frizz Serum', category: 'Hair', price: 999, brand: 'BeautyBio', description: 'Lightweight argan serum that smooths frizzy ends and adds glossy shine.', benefits: 'Reduces frizz by 90%, protects against heat styling, hydrates dry curly hair.', usageInstructions: 'Apply 2-3 drops to damp hair from mid-lengths to ends. Do not rinse.', skinTypes: [], hairTypes: ['Frizzy', 'Curly', 'Dry'], rating: 4.8, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=400&auto=format&fit=crop&q=80' },
    { id: 'prod-2', name: 'Hydra-Glow Hyaluronic Cream', category: 'Skin', price: 1249, brand: 'GlowRx', description: 'Intensive moisture cream formulated with 2% pure hyaluronic acid for plump skin.', benefits: 'Locks in deep hydration, repairs skin barrier, gives an instant dewy glow.', usageInstructions: 'Massage onto clean face and neck morning and night.', skinTypes: ['Dry', 'Combination', 'Sensitive'], hairTypes: [], rating: 4.7, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&auto=format&fit=crop&q=80' },
    { id: 'prod-3', name: 'Salicylic Acid Acne Defense Gel', category: 'Skin', price: 799, brand: 'ClearSkin', description: 'Spot treatment gel targeting breakouts, blackheads, and open pores.', benefits: 'Clears acne blemishes, controls excess sebum, reduces skin redness.', usageInstructions: 'Apply a thin layer directly to affected spots at night.', skinTypes: ['Oily', 'Combination'], hairTypes: [], rating: 4.5, image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&auto=format&fit=crop&q=80' }
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // 4. Seed FAQs
  const faqsData = [
    { question: 'What is a Hydra Facial and is it good for oily skin?', answer: 'Yes! A Hydra Facial is a non-invasive, multi-step skin treatment that combines cleansing, exfoliation, extraction, hydration, and antioxidant protection. It is extremely effective for oily skin as it deep cleanses clogged pores and removes excess sebum without stripping moisture.', category: 'Skin' },
    { question: 'How can I control frizzy hair during high humidity?', answer: 'Humidity causes dry hair shafts to absorb moisture from the air, resulting in swelling and frizz. To control this: Use sulfate-free moisturizing shampoos, apply a deep-conditioning hair spa (such as Olaplex or Keratin) regularly, and lock in moisture using Argan hair serums.', category: 'Hair' }
  ];

  for (const f of faqsData) {
    await prisma.fAQ.create({ data: f });
  }

  // 5. Seed Guides
  const guidesData = [
    { title: 'Ultimate Skincare Routine for Combination Skin', content: 'Combination skin requires balancing a greasy T-zone with dry cheeks. Morning: Mild foaming cleanser, alcohol-free toner, hyaluronic acid serum, light gel-based moisturizer, and gel sunscreen. Night: Swap sunscreen for a nourishing repair cream and use salicylic acid spot gels on active pimples.', category: 'Skin', tags: ['Skincare', 'Combination Skin', 'Hyaluronic Acid'] },
    { title: 'How to Prevent Hair Fall & Repair Split Ends', content: 'Hair fall is often triggered by heat styling, chemical coloring, or scalp build-up. We recommend: warm oil massages with Rosemary and Onion seed extracts, limiting heat styling tools, and regular deep-conditioning hair spas.', category: 'Hair', tags: ['Haircare', 'Hair Fall', 'Split Ends'] }
  ];

  for (const g of guidesData) {
    await prisma.guide.create({ data: g });
  }

  // 6. Initialize AI Analytics Default Record
  await prisma.aIAnalytics.create({
    data: {
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
    },
  });

  console.log('AI Analytics initialized.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
