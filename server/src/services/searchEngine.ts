import { findSalons } from './db.js';
import { searchVectors } from './vectorStore.js';


export interface RankedSalonResult {
  salon: any;
  score: number;
  breakdown: {
    semantic: number;
    serviceMatch: number;
    locationMatch: number;
    budgetMatch: number;
    userPrefMatch: number;
  };
  reasons: string[];
}

export async function performHybridSearch(
  queryText: string,
  userProfile?: {
    hairConcerns?: string | null;
    skinConcerns?: string | null;
    budgetRange?: string | null;
    favoriteSalons?: string[];
  }
): Promise<RankedSalonResult[]> {
  const queryLower = queryText.toLowerCase();

  // 1. Run Semantic Vector Search
  // Retrieve top matches for both salon profiles and individual services
  const semanticSalonMatches = await searchVectors(queryText, 'salon', 30);
  const semanticServiceMatches = await searchVectors(queryText, 'service', 30);

  // Map scores by Salon ID
  const semanticScores: Record<string, number> = {};
  
  // Apply salon profile vector scores
  for (const match of semanticSalonMatches) {
    semanticScores[match.id] = Math.max(semanticScores[match.id] || 0, match.score);
  }
  
  // Apply service vector scores (linking matched service to its salon)
  for (const match of semanticServiceMatches) {
    if (match.metadata && match.metadata.salonId) {
      const salonId = match.metadata.salonId;
      // We weight service matches slightly higher if they are very close
      semanticScores[salonId] = Math.max(semanticScores[salonId] || 0, match.score * 0.95);
    }
  }

  // 2. Fetch all Salons from DB (with services, professionals, packages)
  const salons = await findSalons();


  // 3. Detect filters in Query
  // Area Detection
  const areas = ['malviya nagar', 'vaishali nagar', 'mansarovar', 'raja park', 'jagatpura', 'c-scheme'];
  let detectedArea = '';
  for (const area of areas) {
    if (queryLower.includes(area)) {
      detectedArea = area;
      break;
    }
  }

  // Budget Detection (e.g. "under 1500" or "below 3000")
  let detectedMaxPrice = Infinity;
  const priceRegex = /(?:under|below|less than|within|rs\.?|₹)\s*(\d+)/i;
  const matchPrice = queryLower.match(priceRegex);
  if (matchPrice && matchPrice[1]) {
    detectedMaxPrice = parseInt(matchPrice[1], 10);
  }

  // Service Category Keywords Detection
  const serviceCategories = ['bridal', 'makeup', 'haircut', 'hair cut', 'spa', 'facial', 'nail', 'color', 'groom', 'skincare', 'wellness'];
  let detectedCategory = '';
  if (queryLower.includes('bridal') || queryLower.includes('makeup') || queryLower.includes('wedding')) {
    detectedCategory = 'bridal';
  } else if (queryLower.includes('haircut') || queryLower.includes('hair cut') || queryLower.includes('fade') || queryLower.includes('trim')) {
    detectedCategory = 'haircut';
  } else if (queryLower.includes('spa') || queryLower.includes('massage')) {
    detectedCategory = 'spa';
  } else if (queryLower.includes('facial') || queryLower.includes('cleanup') || queryLower.includes('clean-up')) {
    detectedCategory = 'facial';
  } else if (queryLower.includes('nail') || queryLower.includes('extension') || queryLower.includes('chrome')) {
    detectedCategory = 'nail';
  } else if (queryLower.includes('color') || queryLower.includes('dye') || queryLower.includes('highlight') || queryLower.includes('balayage')) {
    detectedCategory = 'color';
  } else if (queryLower.includes('groom') || queryLower.includes('shave')) {
    detectedCategory = 'groom';
  }

  const results: RankedSalonResult[] = [];

  for (const salon of salons) {
    // --- Core scoring axes ---
    
    // A. Semantic score (Max similarity matched, baseline is 0.4 for unlisted)
    const semantic = semanticScores[salon.id] !== undefined ? semanticScores[salon.id] : 0.45;

    // B. Service Match
    let serviceMatch = 0;
    // Check if the salon has services matching the query keyword or detected category
    const hasCategory = salon.services.some((s: any) => s.category.toLowerCase().includes(detectedCategory || '___'));
    const keywordMatch = salon.services.some((s: any) => s.name.toLowerCase().includes(queryLower)) || 
                         salon.expertise.some((e: any) => e.toLowerCase().includes(queryLower)) ||
                         salon.name.toLowerCase().includes(queryLower);
    
    if (keywordMatch) {
      serviceMatch = 1.0;
    } else if (detectedCategory && hasCategory) {
      serviceMatch = 0.8;
    } else if (!detectedCategory) {
      serviceMatch = 1.0; // No service requested, baseline is high
    }

    // C. Location Match
    let locationMatch = 1.0; // Default if no area detected
    if (detectedArea) {
      if (salon.area.toLowerCase() === detectedArea) {
        locationMatch = 1.0;
      } else {
        locationMatch = 0.0; // Hard penalty for area mismatch
      }
    }

    // D. Budget Match
    let budgetMatch = 1.0;
    // Check if services are under maximum price limit (if specified)
    if (detectedMaxPrice !== Infinity) {
      const cheapServices = salon.services.filter(
        (s: any) => s.price <= detectedMaxPrice && 
        (detectedCategory ? s.category.toLowerCase().includes(detectedCategory) : true)
      );
      if (cheapServices.length > 0) {
        budgetMatch = 1.0;
      } else {
        budgetMatch = 0.0; // Exceeds budget
      }
    } else if (userProfile?.budgetRange) {
      // Profile budget match
      if (salon.pricingCategory === userProfile.budgetRange) {
        budgetMatch = 1.0;
      } else if (
        (userProfile.budgetRange === 'BUDGET' && salon.pricingCategory === 'LUXURY') ||
        (userProfile.budgetRange === 'LUXURY' && salon.pricingCategory === 'BUDGET')
      ) {
        budgetMatch = 0.3; // Mismatch penalty
      } else {
        budgetMatch = 0.7; // Moderate match
      }
    }

    // E. User Preference Match
    let userPrefMatch = 0.5; // Neutral default
    let matchesConcern = false;
    if (userProfile) {
      // Check if salon's expertise aligns with hair/skin concerns
      const concerns = `${userProfile.hairConcerns || ''} ${userProfile.skinConcerns || ''}`.toLowerCase();
      
      if (concerns.includes('frizz') && (salon.expertise.includes('Hair Repair') || salon.expertise.includes('Hair Smoothing') || salon.expertise.includes('Keratin Spas'))) {
        matchesConcern = true;
      }
      if (concerns.includes('acne') && (salon.expertise.includes('Skin Care') || salon.expertise.includes('Acne Cleanups') || salon.expertise.includes('Skincare'))) {
        matchesConcern = true;
      }
      if (concerns.includes('bridal') && salon.expertise.includes('Bridal Makeup')) {
        matchesConcern = true;
      }
      if (userProfile.favoriteSalons?.includes(salon.id)) {
        userPrefMatch = 1.0;
      } else if (matchesConcern) {
        userPrefMatch = 0.9;
      }
    }

    // --- COMPOSITE SCORING ALGORITHM ---
    // Formula: 40% Semantic + 20% Service + 15% Location + 15% Budget + 10% User Preference
    const score = 
      (semantic * 0.40) + 
      (serviceMatch * 0.20) + 
      (locationMatch * 0.15) + 
      (budgetMatch * 0.15) + 
      (userPrefMatch * 0.10);

    // Only return if it matches location filters
    if (locationMatch > 0 && budgetMatch > 0) {
      // Build user-friendly 3-4 reasons based on query, userProfile, and salon properties
      const reasons: string[] = [];

      // 1. Concern & reviews match (e.g. "Strong reviews for acne treatments")
      const concerns = `${userProfile?.hairConcerns || ''} ${userProfile?.skinConcerns || ''}`.toLowerCase();
      const isAcneQuery = queryLower.includes('acne') || concerns.includes('acne') || queryLower.includes('skin') || concerns.includes('skin') || queryLower.includes('facial');
      const isFrizzQuery = queryLower.includes('frizz') || concerns.includes('frizz') || queryLower.includes('hair') || concerns.includes('hair') || queryLower.includes('keratin') || queryLower.includes('smooth');
      const isBridalQuery = queryLower.includes('bridal') || concerns.includes('bridal') || queryLower.includes('makeup') || concerns.includes('makeup') || queryLower.includes('wedding');

      if (isAcneQuery && (salon.expertise.includes('Skincare') || salon.expertise.includes('Skin Care') || salon.expertise.includes('Acne Cleanups'))) {
        reasons.push(`Strong reviews for acne & skin treatments`);
      } else if (isFrizzQuery && (salon.expertise.includes('Hair Repair') || salon.expertise.includes('Hair Smoothing') || salon.expertise.includes('Keratin Spas'))) {
        reasons.push(`Highly reviewed for frizz & hair care treatments`);
      } else if (isBridalQuery && salon.expertise.includes('Bridal Makeup')) {
        reasons.push(`Excellent reviews for bridal styling & makeup`);
      } else if (salon.expertise && salon.expertise.length > 0) {
        reasons.push(`Top reviews for specialized ${salon.expertise[0]} treatments`);
      } else {
        reasons.push(`Highly recommended for beauty & grooming care`);
      }

      // 2. Offers specific treatment (e.g. "Offers Hydra Facial" or "Offers Olaplex Hair Spa")
      const matchedServices = salon.services.filter((s: any) => 
        s.name.toLowerCase().includes(queryLower) || 
        (detectedCategory && s.category.toLowerCase().includes(detectedCategory))
      );
      if (matchedServices.length > 0) {
        reasons.push(`Offers ${matchedServices[0].name}`);
      } else if (salon.services.length > 0) {
        reasons.push(`Offers ${salon.services[0].name}`);
      }

      // 3. Rating match (e.g. "4.8+ rating")
      if (salon.rating) {
        reasons.push(`${salon.rating}+ rating based on customer feedback`);
      }

      // 4. Location match (e.g. "Close to your location" or "Located in C-Scheme")
      if (detectedArea && salon.area.toLowerCase() === detectedArea) {
        reasons.push(`Close to your location (situated in ${salon.area})`);
      } else {
        reasons.push(`Conveniently situated in ${salon.area}`);
      }

      // 5. User saved favorite
      if (userProfile?.favoriteSalons?.includes(salon.id)) {
        reasons.unshift(`One of your saved favorite salons`);
      }

      results.push({
        salon,
        score,
        breakdown: {
          semantic,
          serviceMatch,
          locationMatch,
          budgetMatch,
          userPrefMatch,
        },
        reasons: reasons.slice(0, 4), // return top 3-4 reasons
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
}
