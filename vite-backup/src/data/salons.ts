export interface Service {
  name: string;
  category: 'Bridal Makeup' | 'Hair Spa' | 'Hair Cut' | 'Facial' | 'Nail Art' | 'Hair Color' | 'Skin Care' | 'Groom Packages';
  duration: number; // in minutes
  price: number; // in INR (₹)
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Salon {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  area: 'Malviya Nagar' | 'Vaishali Nagar' | 'Mansarovar' | 'Raja Park' | 'Jagatpura' | 'C-Scheme';
  address: string;
  phone: string;
  timing: string;
  description: string;
  featured: boolean;
  services: Service[];
  reviews: Review[];
}

export const salonsData: Salon[] = [
  {
    id: 'salon-1',
    name: 'La Belleza Salon & Spa',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 184,
    area: 'C-Scheme',
    address: 'Plot 12, Sardar Patel Marg, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 98290 12345',
    timing: '10:00 AM - 8:30 PM',
    description: 'La Belleza is a luxury premium beauty sanctuary in the heart of Jaipur. We offer world-class hair designs, bespoke bridal styling, and rejuvenating skin care therapies with high-end international products.',
    featured: true,
    services: [
      { name: 'Luxury Bridal Makeup & Styling', category: 'Bridal Makeup', duration: 150, price: 8500 },
      { name: 'Olaplex Hair Nourishing Spa', category: 'Hair Spa', duration: 75, price: 2499 },
      { name: 'Signature Haircut by Master Stylist', category: 'Hair Cut', duration: 45, price: 950 },
      { name: 'Hydra Facial Brightening Cure', category: 'Facial', duration: 60, price: 3499 },
      { name: 'Gel Extensions with Hand-painted Nail Art', category: 'Nail Art', duration: 90, price: 1799 },
      { name: 'Balayage Premium Global Coloring', category: 'Hair Color', duration: 180, price: 4999 },
      { name: 'Luxury Pre-Bridal Grooming Package', category: 'Groom Packages', duration: 240, price: 7499 }
    ],
    reviews: [
      { id: 'r1-1', name: 'Anjali Sharma', rating: 5, comment: 'Absolutely amazing bridal makeup! They transformed me for my wedding day. Worth every rupee.', date: '2026-06-10' },
      { id: 'r1-2', name: 'Riya Sen', rating: 4, comment: 'Loved the hair spa, very soothing. The staff is highly professional. The waiting area is a bit small though.', date: '2026-06-12' },
      { id: 'r1-3', name: 'Megha Gupta', rating: 5, comment: 'Excellent hygiene and safety protocols. The Hydra Facial left a beautiful glow.', date: '2026-06-15' }
    ]
  },
  {
    id: 'salon-2',
    name: 'Aura Unisex Salon',
    image: 'https://images.unsplash.com/photo-1522337060762-d41222e154e9?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337060762-d41222e154e9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 142,
    area: 'Vaishali Nagar',
    address: 'E-52, Chitrakoot Marg, Vaishali Nagar, Jaipur, Rajasthan 302021',
    phone: '+91 98290 54321',
    timing: '09:30 AM - 09:00 PM',
    description: 'Aura Unisex Salon is a vibrant family beauty care studio offering outstanding hair transformations, relaxing oil treatments, and comprehensive groom and bridal bundles for modern couples.',
    featured: true,
    services: [
      { name: 'Keratin Nourishing Hair Spa', category: 'Hair Spa', duration: 60, price: 1499 },
      { name: 'Trendy Unisex Hair Cut & Blow Dry', category: 'Hair Cut', duration: 40, price: 650 },
      { name: 'O3+ Power Facial for Tan Removal', category: 'Facial', duration: 50, price: 1899 },
      { name: 'Ultimate Groom Premium Package', category: 'Groom Packages', duration: 180, price: 3999 },
      { name: 'Premium Global Hair Coloring', category: 'Hair Color', duration: 150, price: 2999 },
      { name: 'Gel Nail Extensions Set', category: 'Nail Art', duration: 60, price: 1199 },
      { name: 'Brightening Skin Scrub & Polishing', category: 'Skin Care', duration: 45, price: 999 }
    ],
    reviews: [
      { id: 'r2-1', name: 'Vikram Singh', rating: 5, comment: 'Top class groom package. The haircut and beard trimming were flawless.', date: '2026-06-08' },
      { id: 'r2-2', name: 'Sneha Roy', rating: 4, comment: 'Staff is polite. Got a global color done and it matches perfectly. Slightly expensive.', date: '2026-06-14' }
    ]
  },
  {
    id: 'salon-3',
    name: 'The Pink City Salon',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewsCount: 96,
    area: 'Malviya Nagar',
    address: 'B-24, Sector 5, Malviya Nagar, Jaipur, Rajasthan 302017',
    phone: '+91 91160 98765',
    timing: '10:00 AM - 08:00 PM',
    description: 'The Pink City Salon brings you highly affordable, premium quality beauty routines. Specializing in stunning budget bridal makeups, lovely nail extensions, and quick skin refreshments.',
    featured: true,
    services: [
      { name: 'Affordable Bridal Makeup', category: 'Bridal Makeup', duration: 120, price: 1899 },
      { name: 'Nourishing Herbal Hair Spa', category: 'Hair Spa', duration: 45, price: 699 },
      { name: 'Basic Haircut & Trimming', category: 'Hair Cut', duration: 30, price: 299 },
      { name: 'Fruit Glow Facial & Cleanup', category: 'Facial', duration: 40, price: 599 },
      { name: 'Nail Polish & Simple Nail Art', category: 'Nail Art', duration: 30, price: 499 },
      { name: 'Deep Clean Skin Brightening', category: 'Skin Care', duration: 30, price: 450 },
      { name: 'Budget Groom Basic Package', category: 'Groom Packages', duration: 90, price: 1499 }
    ],
    reviews: [
      { id: 'r3-1', name: 'Kiran Meena', rating: 5, comment: 'I got their bridal makeup for ₹1899 and it was spectacular! Truly best budget choice in Malviya Nagar.', date: '2026-06-11' },
      { id: 'r3-2', name: 'Aditi Jain', rating: 4, comment: 'Decent services. Very value for money. The nail art was very clean.', date: '2026-06-14' }
    ]
  },
  {
    id: 'salon-4',
    name: 'Style & Scissors',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a3ef?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 210,
    area: 'Raja Park',
    address: 'Gali 2, Near Hanuman Temple, Raja Park, Jaipur, Rajasthan 302004',
    phone: '+91 97840 22334',
    timing: '10:00 AM - 09:00 PM',
    description: 'Style & Scissors is Jaipur\'s favorite hair salon brand. Renowned for custom haircuts, premium colors, fashion highlights, and rich nourishing hair treatments.',
    featured: true,
    services: [
      { name: 'Shampoo + Haircut + Blowdry styling', category: 'Hair Cut', duration: 50, price: 799 },
      { name: 'Loreal Expert Deep Hair Spa', category: 'Hair Spa', duration: 60, price: 1299 },
      { name: 'Root Touch Up with Highlights', category: 'Hair Color', duration: 90, price: 2199 },
      { name: 'Party Makeup & Hair Styling', category: 'Bridal Makeup', duration: 90, price: 3499 },
      { name: 'Gold Radiant Facial Therapy', category: 'Facial', duration: 60, price: 1499 },
      { name: 'De-Tan Face & Neck Cleanup', category: 'Skin Care', duration: 30, price: 499 }
    ],
    reviews: [
      { id: 'r4-1', name: 'Divya Soni', rating: 5, comment: 'Excellent styling! They knew exactly what haircut would suit my round face structure.', date: '2026-06-12' },
      { id: 'r4-2', name: 'Nikhil Vyas', rating: 4.5, comment: 'Great service. I regularly get my hair color and spa done here. Courteous staff.', date: '2026-06-15' }
    ]
  },
  {
    id: 'salon-5',
    name: 'Glow & Glitter Makeup Studio',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.4,
    reviewsCount: 88,
    area: 'Mansarovar',
    address: '102/5, Near Mansarovar Plaza, Mansarovar, Jaipur, Rajasthan 302020',
    phone: '+91 93510 44556',
    timing: '10:30 AM - 08:00 PM',
    description: 'We are a dedicated makeup and skincare studio in Mansarovar. From glowing hydra sessions to stunning bridal transformations, our trained cosmetologists ensure a personalized sparkle.',
    featured: false,
    services: [
      { name: 'Bridal HD Makeup Package', category: 'Bridal Makeup', duration: 150, price: 6999 },
      { name: 'Anti-Aging Diamond Facial', category: 'Facial', duration: 75, price: 2199 },
      { name: 'Herbal Dandruff Cleanse Spa', category: 'Hair Spa', duration: 55, price: 899 },
      { name: 'Premium Nail Art with Glitters', category: 'Nail Art', duration: 45, price: 799 },
      { name: 'Under Eye Dark Circle Therapy', category: 'Skin Care', duration: 40, price: 850 },
      { name: 'Groom Special D-Tan Facial + Hair Trim', category: 'Groom Packages', duration: 80, price: 1850 }
    ],
    reviews: [
      { id: 'r5-1', name: 'Manish Verma', rating: 4, comment: 'Nice place for facial and basic grooming. Prompt and helpful team.', date: '2026-06-03' },
      { id: 'r5-2', name: 'Pooja Choudhary', rating: 4.8, comment: 'Got my engagement HD makeup done here. They did a fantastic job with skin prep.', date: '2026-06-09' }
    ]
  },
  {
    id: 'salon-6',
    name: 'Reborn Salon',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.2,
    reviewsCount: 75,
    area: 'Jagatpura',
    address: 'Plot 42, Mahal Road, Jagatpura, Jaipur, Rajasthan 302017',
    phone: '+91 96940 77889',
    timing: '09:00 AM - 08:30 PM',
    description: 'Reborn Salon focuses on refreshing beauty essentials at very reasonable prices. We are a neighborhood favorite in Jagatpura for cleanups, shaves, and nourishing hair treatments.',
    featured: false,
    services: [
      { name: 'Advanced Charcoal Skin Treatment', category: 'Skin Care', duration: 45, price: 799 },
      { name: 'Split-ends Hair Cut & Conditioning', category: 'Hair Cut', duration: 35, price: 349 },
      { name: 'Smooth Silk Relaxing Hair Spa', category: 'Hair Spa', duration: 50, price: 799 },
      { name: 'Papaya Cleanse & Acne Facial', category: 'Facial', duration: 45, price: 699 },
      { name: 'Complete Groom Makeover Package', category: 'Groom Packages', duration: 120, price: 2499 },
      { name: 'Simple Polish and Manicure', category: 'Nail Art', duration: 35, price: 399 }
    ],
    reviews: [
      { id: 'r6-1', name: 'Prerna Joshi', rating: 4, comment: 'Nice, clean salon with friendly staff. Very pocket friendly rates.', date: '2026-06-05' },
      { id: 'r6-2', name: 'Harshit Sharma', rating: 4.5, comment: 'Amazing hair cut and styling. Very professional stylist named Raj.', date: '2026-06-11' }
    ]
  },
  {
    id: 'salon-7',
    name: 'The Royal Grooming Lounge',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 167,
    area: 'C-Scheme',
    address: 'Showroom 4, JPN Road, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 99990 11223',
    timing: '10:00 AM - 09:00 PM',
    description: 'The Royal Grooming Lounge caters specifically to gentlemen and grooms looking for luxury haircuts, hot towel shaves, premium skin care, and custom hair color profiles in C-Scheme.',
    featured: true,
    services: [
      { name: 'Royal Groom Full Package', category: 'Groom Packages', duration: 210, price: 6999 },
      { name: 'Hot Oil Head Spa + Neck Massage', category: 'Hair Spa', duration: 45, price: 999 },
      { name: 'Executive Haircut & Styling Session', category: 'Hair Cut', duration: 40, price: 690 },
      { name: 'Anti-Stress Charcoal Facial', category: 'Facial', duration: 50, price: 1499 },
      { name: 'Global Beard Dye & Styling', category: 'Hair Color', duration: 60, price: 1199 },
      { name: 'Tan Block Face Polish & Scrub', category: 'Skin Care', duration: 40, price: 799 }
    ],
    reviews: [
      { id: 'r7-1', name: 'Apoorv Mathur', rating: 5, comment: 'Undoubtedly the best men\'s grooming lounge in C-scheme. The royal package makes you feel like a king.', date: '2026-06-07' },
      { id: 'r7-2', name: 'Yuvraj Goel', rating: 5, comment: 'Staff is extremely skilled. The hot towel shave is an absolute must-try experience here!', date: '2026-06-12' }
    ]
  },
  {
    id: 'salon-8',
    name: 'Bellezza Bridal Studio',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 112,
    area: 'Malviya Nagar',
    address: 'A-18, Apex Circle, Malviya Nagar, Jaipur, Rajasthan 302017',
    phone: '+91 92250 88990',
    timing: '10:00 AM - 08:00 PM',
    description: 'Bellezza Bridal Studio is specialized in bridal makeovers, party makeups, and high-fashion nail extensions. We offer premium beauty services at highly competitive rates.',
    featured: false,
    services: [
      { name: 'Best Bridal Makeup (Premium HD)', category: 'Bridal Makeup', duration: 150, price: 1999 },
      { name: 'Hair Wash + Loreal Spa + Deep Moisture', category: 'Hair Spa', duration: 60, price: 1199 },
      { name: 'Bridal Nail Extensions & 3D Art', category: 'Nail Art', duration: 90, price: 1499 },
      { name: 'Instant Radiance Bridal Facial', category: 'Facial', duration: 60, price: 1799 },
      { name: 'Glaze Global Hair Coloring', category: 'Hair Color', duration: 120, price: 3499 },
      { name: 'Full Arms & Legs De-Tan Polish', category: 'Skin Care', duration: 75, price: 1299 }
    ],
    reviews: [
      { id: 'r8-1', name: 'Megha Khandelwal', rating: 5, comment: 'Found this bridal studio through recommendations. Absolutely loved my makeup for the Sangeet ceremony!', date: '2026-06-14' },
      { id: 'r8-2', name: 'Asha Saxena', rating: 4, comment: 'Nice, fast service. The bridal makeup under ₹2000 is a steal deal for the quality they provide.', date: '2026-06-16' }
    ]
  },
  {
    id: 'salon-9',
    name: 'Sheer Elegance Salon',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewsCount: 95,
    area: 'Vaishali Nagar',
    address: 'Shop 15, Vaishali Plaza, Vaishali Nagar, Jaipur, Rajasthan 302021',
    phone: '+91 95490 88776',
    timing: '10:00 AM - 08:30 PM',
    description: 'We believe beauty lies in simple elegance. Sheer Elegance offers outstanding hair care, specialized herbal spa procedures, and beautiful, long-lasting nail shellacs.',
    featured: false,
    services: [
      { name: 'Revitalizing Aloe-Vera Hair Spa', category: 'Hair Spa', duration: 55, price: 999 },
      { name: 'Trendy Female Haircut & Setting', category: 'Hair Cut', duration: 40, price: 499 },
      { name: 'O3+ Facial Glow Session', category: 'Facial', duration: 60, price: 1699 },
      { name: 'Premium Acrylic Nail Extensions', category: 'Nail Art', duration: 75, price: 1399 },
      { name: 'Organic Body Skin Scrubbing', category: 'Skin Care', duration: 50, price: 1199 }
    ],
    reviews: [
      { id: 'r9-1', name: 'Priya Verma', rating: 4, comment: 'I got the acrylic nail extensions done. Very neat work. The tech is super skilled.', date: '2026-06-02' },
      { id: 'r9-2', name: 'Shruti Agrawal', rating: 5, comment: 'The Aloe-Vera Hair spa is extremely relaxing. Good customer service.', date: '2026-06-10' }
    ]
  },
  {
    id: 'salon-10',
    name: 'Toni & Guy (Mock Franchise)',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a3ef?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 304,
    area: 'C-Scheme',
    address: 'F-14, Bhagat Singh Marg, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 91190 22334',
    timing: '09:30 AM - 09:00 PM',
    description: 'Get international styling standards in Jaipur. Specialized in high-fashion ramp haircuts, professional scalp treatments, global ombre coloring, and premium bride/groom packages.',
    featured: true,
    services: [
      { name: 'Creative Director Haircut', category: 'Hair Cut', duration: 60, price: 1500 },
      { name: 'Kerastase Scalp Repair Spa', category: 'Hair Spa', duration: 75, price: 2999 },
      { name: 'Fashion Ombre / Highlights', category: 'Hair Color', duration: 180, price: 5499 },
      { name: 'Bridal Airbrush HD Makeup', category: 'Bridal Makeup', duration: 180, price: 12000 },
      { name: 'Sothys Premium Luxury Facial', category: 'Facial', duration: 90, price: 4499 },
      { name: 'Toni & Guy Groom Royal Package', category: 'Groom Packages', duration: 240, price: 8999 }
    ],
    reviews: [
      { id: 'r10-1', name: 'Manav Gupta', rating: 5, comment: 'Top-tier haircut! Expensive, but you pay for the absolute best styling expertise.', date: '2026-06-08' },
      { id: 'r10-2', name: 'Nikita Jain', rating: 4, comment: 'Services are premium, no doubt. The Kerastase spa is super premium, highly recommended.', date: '2026-06-13' }
    ]
  },
  {
    id: 'salon-11',
    name: 'Scissors & Spades',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.3,
    reviewsCount: 65,
    area: 'Raja Park',
    address: 'Plot 31, Ram Gali No. 4, Raja Park, Jaipur, Rajasthan 302004',
    phone: '+91 97820 44552',
    timing: '09:00 AM - 08:30 PM',
    description: 'A pocket-friendly, highly active salon in Raja Park for men and teens. Specializing in slick hair fades, clean shaves, basic coloring, and anti-acne cleanups.',
    featured: false,
    services: [
      { name: 'Slick Hair Fade / Under-cut', category: 'Hair Cut', duration: 30, price: 250 },
      { name: 'Anti-Acne Face Cleanup', category: 'Skin Care', duration: 40, price: 450 },
      { name: 'Deep Conditioning Hair Spa', category: 'Hair Spa', duration: 45, price: 650 },
      { name: 'Classic Beard Grooming & Styling', category: 'Groom Packages', duration: 30, price: 390 },
      { name: 'Root touch up hair color', category: 'Hair Color', duration: 45, price: 890 }
    ],
    reviews: [
      { id: 'r11-1', name: 'Rohan Sharma', rating: 4.5, comment: 'Great place for quick haircuts. They do awesome fades.', date: '2026-06-03' },
      { id: 'r11-2', name: 'Ankur Yadav', rating: 4, comment: 'Very cheap prices, friendly staff. Highly satisfied with my beard styling.', date: '2026-06-06' }
    ]
  },
  {
    id: 'salon-12',
    name: 'Slay Queen Nails & Hair',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 78,
    area: 'Vaishali Nagar',
    address: 'Near Nursery Circle, Vaishali Nagar, Jaipur, Rajasthan 302021',
    phone: '+91 91230 44558',
    timing: '11:00 AM - 08:00 PM',
    description: 'Slay Queen is your go-to boutique for gorgeous nail extensions and premium hair styling. Get ready to slay with customized 3D nail art, chrome overlays, and hair blow-outs.',
    featured: false,
    services: [
      { name: 'Chrome / Glitter Nail Extensions', category: 'Nail Art', duration: 75, price: 1299 },
      { name: 'Premium Hair Wash & Blow-Dry', category: 'Hair Cut', duration: 35, price: 399 },
      { name: 'Anti-Hairfall Tea-Tree Spa', category: 'Hair Spa', duration: 50, price: 899 },
      { name: 'Tan Defense Skin Scrub', category: 'Skin Care', duration: 40, price: 699 },
      { name: 'Full Gel Overlay set', category: 'Nail Art', duration: 50, price: 899 }
    ],
    reviews: [
      { id: 'r12-1', name: 'Tanvi Jain', rating: 5, comment: 'I got the chrome extensions. Absolutely gorgeous. The technicians take their time and ensure perfect finishes.', date: '2026-06-04' },
      { id: 'r12-2', name: 'Ritu Sen', rating: 4, comment: 'Lovely interior. Very girly and cute. Got a blowout and it lasted 3 days.', date: '2026-06-09' }
    ]
  },
  {
    id: 'salon-13',
    name: 'Glamour & Glitz Salon',
    image: 'https://images.unsplash.com/photo-1522337060762-d41222e154e9?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337060762-d41222e154e9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.4,
    reviewsCount: 119,
    area: 'Mansarovar',
    address: 'Plot 88, Madhyam Marg, Mansarovar, Jaipur, Rajasthan 302020',
    phone: '+91 93140 11992',
    timing: '10:00 AM - 08:30 PM',
    description: 'Glamour & Glitz is a full-service family salon in Mansarovar. We specialize in bridal makeups, premium global colors, smoothing therapies, and refreshing wellness facials.',
    featured: false,
    services: [
      { name: 'Kera-smooth Advanced Hair Spa', category: 'Hair Spa', duration: 75, price: 1699 },
      { name: 'Bridal Traditional HD Makeup', category: 'Bridal Makeup', duration: 150, price: 6500 },
      { name: 'Global Hair Coloring (Loreal)', category: 'Hair Color', duration: 150, price: 2999 },
      { name: 'De-Tan Skin Polish Facial', category: 'Facial', duration: 60, price: 1199 },
      { name: 'Creative Layers Haircut', category: 'Hair Cut', duration: 45, price: 599 }
    ],
    reviews: [
      { id: 'r13-1', name: 'Sapna Goyal', rating: 4.8, comment: 'Got my hair colored. The stylist recommended the perfect shade. Very friendly team.', date: '2026-06-01' },
      { id: 'r13-2', name: 'Tarun Mathur', rating: 4, comment: 'Clean place, got facial and haircut done. Satisfactory service.', date: '2026-06-08' }
    ]
  },
  {
    id: 'salon-14',
    name: 'Enchante Luxury Salon',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 156,
    area: 'Malviya Nagar',
    address: 'T-10, Calgiri Marg, Malviya Nagar, Jaipur, Rajasthan 302017',
    phone: '+91 98870 55667',
    timing: '10:00 AM - 09:00 PM',
    description: 'Enchante offers a luxurious escape from daily stresses. Specializing in organic premium facials, rich aromatherapy scalp spa, and highly styled haircut makeovers.',
    featured: true,
    services: [
      { name: 'Gold Dust Facial + Neck Massage', category: 'Facial', duration: 75, price: 2299 },
      { name: 'Luxury Tea-Tree Nourishing Spa', category: 'Hair Spa', duration: 60, price: 1799 },
      { name: 'Premium Haircut & Styling', category: 'Hair Cut', duration: 50, price: 899 },
      { name: 'Anti-Tanning Body Polishing', category: 'Skin Care', duration: 90, price: 2499 },
      { name: 'Gel extensions & stones Nail Art', category: 'Nail Art', duration: 90, price: 1699 }
    ],
    reviews: [
      { id: 'r14-1', name: 'Nisha Kumawat', rating: 5, comment: 'Superb facial! The massage was so calming, and my skin felt so hydrated.', date: '2026-06-05' },
      { id: 'r14-2', name: 'Deepika Rao', rating: 4.5, comment: 'Beautiful ambiance. They play relaxing music. The hair spa was premium.', date: '2026-06-11' }
    ]
  },
  {
    id: 'salon-15',
    name: 'Neelam Bridal Studio',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.1,
    reviewsCount: 52,
    area: 'Jagatpura',
    address: 'Near Jagatpura Railway Station, Jagatpura, Jaipur, Rajasthan 302017',
    phone: '+91 94140 77881',
    timing: '10:00 AM - 08:00 PM',
    description: 'Neelam Bridal Studio brings professional wedding styling, bridal makeup and mehndi artists to Jagatpura. Very affordable packages for weddings and festivals.',
    featured: false,
    services: [
      { name: 'Traditional Bridal Makeup (Special)', category: 'Bridal Makeup', duration: 120, price: 3999 },
      { name: 'Basic Aloe Scalp Hair Spa', category: 'Hair Spa', duration: 45, price: 599 },
      { name: 'Bridal Mehndi & Hand Massage', category: 'Skin Care', duration: 90, price: 1499 },
      { name: 'Acne Defense Herbal Facial', category: 'Facial', duration: 50, price: 899 },
      { name: 'Party Haircut & Styling', category: 'Hair Cut', duration: 35, price: 349 }
    ],
    reviews: [
      { id: 'r15-1', name: 'Mamta Meena', rating: 4, comment: 'Nice bridal makeup at very reasonable rates. Good response from staff.', date: '2026-06-04' },
      { id: 'r15-2', name: 'Babita Koli', rating: 4.2, comment: 'Mehendi work was very beautiful. Salon is a bit small but clean.', date: '2026-06-08' }
    ]
  },
  {
    id: 'salon-16',
    name: 'Natural Glow Beauty Parlour',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.3,
    reviewsCount: 81,
    area: 'Raja Park',
    address: 'E-4, Shanti Path, Raja Park, Jaipur, Rajasthan 302004',
    phone: '+91 95290 33445',
    timing: '10:00 AM - 07:30 PM',
    description: 'Natural Glow Parlour offers skin cleansing, standard facials, waxing, and hair conditioning treatments. We use chemical-free, organic products suitable for all skin types.',
    featured: false,
    services: [
      { name: 'Fruit Radiance Cleanse & Facial', category: 'Facial', duration: 55, price: 799 },
      { name: 'Anti-Tan Skin Brightening Polish', category: 'Skin Care', duration: 45, price: 699 },
      { name: 'Nourishing Milk Hair Spa', category: 'Hair Spa', duration: 50, price: 799 },
      { name: 'Female Basic Hair Cut', category: 'Hair Cut', duration: 30, price: 299 },
      { name: 'Simple Gel Overlay Polish', category: 'Nail Art', duration: 30, price: 499 }
    ],
    reviews: [
      { id: 'r16-1', name: 'Priyanka Sharma', rating: 4.5, comment: 'Very pleasant service. The fruit facial was very soothing.', date: '2026-06-07' },
      { id: 'r16-2', name: 'Nidhi Singhal', rating: 4, comment: 'Nice behavior. They use good organic brands. Value for money.', date: '2026-06-12' }
    ]
  },
  {
    id: 'salon-17',
    name: 'Looks Salon (Mock)',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 154,
    area: 'Mansarovar',
    address: 'Plot 20, Madhyam Marg, Mansarovar, Jaipur, Rajasthan 302020',
    phone: '+91 99820 44557',
    timing: '10:00 AM - 09:00 PM',
    description: 'Looks Salon offers styling experiences that keep up with international fashion. We provide custom root touchups, global colors, hair smoothing, and executive groom services.',
    featured: false,
    services: [
      { name: 'Loreal Global Hair Color', category: 'Hair Color', duration: 150, price: 2799 },
      { name: 'Hair Smoothing / Keratin Spa', category: 'Hair Spa', duration: 90, price: 2199 },
      { name: 'Fashion Hair Cut & Wash', category: 'Hair Cut', duration: 40, price: 590 },
      { name: 'O3+ Luxury Gold Facial', category: 'Facial', duration: 60, price: 1999 },
      { name: 'Looks Special Groom Package', category: 'Groom Packages', duration: 150, price: 3499 }
    ],
    reviews: [
      { id: 'r17-1', name: 'Abhishek Jain', rating: 5, comment: 'Got my keratin treatment here. Superb shine. Stylist was very professional.', date: '2026-06-03' },
      { id: 'r17-2', name: 'Shreya Mittal', rating: 4, comment: 'Satisfying service. Got a haircut and they styled it very well.', date: '2026-06-09' }
    ]
  },
  {
    id: 'salon-18',
    name: 'Urban Groom Salon',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.2,
    reviewsCount: 49,
    area: 'Jagatpura',
    address: 'E-12, Sector 2, Jagatpura, Jaipur, Rajasthan 302017',
    phone: '+91 93140 88771',
    timing: '09:00 AM - 08:30 PM',
    description: 'Urban Groom is a budget-friendly men\'s barber shop in Jagatpura. Our services range from quick stylish cuts and shaves to refreshing de-tanning face cleanses.',
    featured: false,
    services: [
      { name: 'Men\'s Hair Cut + Shampoo', category: 'Hair Cut', duration: 25, price: 220 },
      { name: 'Tan Removal Clay Facial', category: 'Facial', duration: 40, price: 599 },
      { name: 'Anti-Hairfall Hair Spa', category: 'Hair Spa', duration: 40, price: 599 },
      { name: 'Basic Groom Package (Shave + Cut + Facial)', category: 'Groom Packages', duration: 90, price: 1199 },
      { name: 'Root Hair Dye Black', category: 'Hair Color', duration: 40, price: 499 }
    ],
    reviews: [
      { id: 'r18-1', name: 'Devendra Meena', rating: 4, comment: 'Nice and quick haircut. Shave was very smooth. Good budget salon.', date: '2026-06-10' },
      { id: 'r18-2', name: 'Rahul Joshi', rating: 4.5, comment: 'Excellent styling at this price. Clean sheets and tools.', date: '2026-06-14' }
    ]
  },
  {
    id: 'salon-19',
    name: 'Bloom Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewsCount: 93,
    area: 'Vaishali Nagar',
    address: 'Plot 104, Amrapali Marg, Vaishali Nagar, Jaipur, Rajasthan 302021',
    phone: '+91 97720 99881',
    timing: '10:00 AM - 08:30 PM',
    description: 'Bloom Beauty is dedicated to complete skin, body, and hair wellness. Our advanced hydrating formulas, massage spa sessions, and nail arts are customized to bring out your inner bloom.',
    featured: false,
    services: [
      { name: 'Deep Sea Hydrating Facial', category: 'Facial', duration: 60, price: 1899 },
      { name: 'Anti-Frizz Argan Hair Spa', category: 'Hair Spa', duration: 60, price: 1399 },
      { name: 'Collagen Skin Repair Therapy', category: 'Skin Care', duration: 50, price: 1499 },
      { name: 'Nail Polish Shellac Set', category: 'Nail Art', duration: 40, price: 799 },
      { name: 'Bloom Special Bridal Package', category: 'Bridal Makeup', duration: 180, price: 7999 }
    ],
    reviews: [
      { id: 'r19-1', name: 'Aakanksha Vyas', rating: 4.5, comment: 'Got the Hydrating facial. Very calming. Skin felt plump and glowy.', date: '2026-06-05' },
      { id: 'r19-2', name: 'Chitra Jain', rating: 5, comment: 'Argan Hair Spa is really nice. Helped with my frizzy hair. Nice ambiance.', date: '2026-06-11' }
    ]
  },
  {
    id: 'salon-20',
    name: 'Verve Salon',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a3ef?w=600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a3ef?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 112,
    area: 'C-Scheme',
    address: 'Plot 18, Subhash Marg, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 99290 88772',
    timing: '10:00 AM - 08:30 PM',
    description: 'Verve Salon is a boutique studio offering high-level personalization. Famous for precision haircuts, advanced oil spas, custom chrome nail arts, and vibrant colors.',
    featured: false,
    services: [
      { name: 'Nourishing Argan Oil Spa', category: 'Hair Spa', duration: 60, price: 1599 },
      { name: 'Precision Layers Haircut', category: 'Hair Cut', duration: 45, price: 799 },
      { name: 'Custom Chrome Nail Art Set', category: 'Nail Art', duration: 60, price: 1299 },
      { name: 'Highlight Streaks (Per Streak)', category: 'Hair Color', duration: 30, price: 350 },
      { name: 'Radiant Pearl Facial therapy', category: 'Facial', duration: 60, price: 1699 }
    ],
    reviews: [
      { id: 'r20-1', name: 'Tanya Goel', rating: 5, comment: 'Superb precision haircut! The stylist really listened to what I wanted.', date: '2026-06-10' },
      { id: 'r20-2', name: 'Simran Jeet', rating: 4, comment: 'Nice nail art options. Got chrome extensions and they look fabulous.', date: '2026-06-12' }
    ]
  }
];
