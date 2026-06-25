import dotenv from 'dotenv';
import { searchVectors } from './vectorStore.js';
import { performHybridSearch } from './searchEngine.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface ChatMessageInput {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Intent Detection Category List
export type IntentCategory = 
  | 'Hair'
  | 'Skin'
  | 'Beauty'
  | 'Fashion'
  | 'Lifestyle'
  | 'Products'
  | 'Salon Discovery'
  | 'Booking';

// Direct call to Gemini model for classifying user query intent
export async function detectIntent(queryText: string): Promise<IntentCategory> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return 'Salon Discovery'; // Default fallback
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Classify the following query into exactly one of these categories:
- Hair
- Skin
- Beauty
- Fashion
- Lifestyle
- Products
- Salon Discovery
- Booking

Query: "${queryText}"

Return ONLY the single category name, nothing else.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const categories: IntentCategory[] = ['Hair', 'Skin', 'Beauty', 'Fashion', 'Lifestyle', 'Products', 'Salon Discovery', 'Booking'];
      const matched = categories.find(c => text.toLowerCase().includes(c.toLowerCase()));
      if (matched) return matched;
    }
  } catch (err) {
    console.error('Error detecting intent:', err);
  }
  return 'Salon Discovery';
}

// Helper to determine if query is out of supported beauty/grooming domains
function isOutOfDomain(queryText: string): boolean {
  const queryLower = queryText.toLowerCase();
  
  // High-priority whitelist terms
  const whitelist = [
    'hair', 'skin', 'makeup', 'bridal', 'groom', 'styling', 'fashion', 'shave',
    'facial', 'nail', 'spa', 'massage', 'acne', 'frizz', 'trim', 'cut', 'dye',
    'balayage', 'tanning', 'dandruff', 'salon', 'booking', 'eyelash', 'eyebrow',
    'waxing', 'treatment', 'cream', 'serum', 'routine', 'outfit', 'beauty',
    'wellness', 'self-care', 'pedicure', 'manicure'
  ];

  const matched = whitelist.some(term => queryLower.includes(term));
  if (matched) return false;

  // Blacklist terms (unrelated general knowledge)
  const blacklist = [
    'math', 'coding', 'programming', 'javascript', 'python', 'recipe for pizza',
    'weather in', 'finance', 'stock market', 'crypto', 'politics', 'history of',
    'how to code', 'car engine', 'plumbing', 'astrophysics', 'write a poem about'
  ];

  return blacklist.some(term => queryLower.includes(term));
}

// RAG Prompt Construction and Streaming Call to Gemini
export async function streamGeminiChat(
  queryText: string,
  history: ChatMessageInput[],
  userProfile: any,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string, recommendedSalons: any[], recommendedProducts: any[]) => void
) {
  console.log('[DEBUG] streamGeminiChat entry. Query:', queryText);
  // Check Domain Restrictions
  if (isOutOfDomain(queryText)) {
    console.log('[DEBUG] Query is out of domain!');
    const politeRedirect = `🌸 Hello! I am the Glowique Specialist. I can only provide recommendations and consultations regarding **Hair, Skin, Beauty, Grooming, Fashion, and Lifestyle**. 

I noticed your question seems unrelated to these areas. Could you tell me if you are looking for any hair treatments, skincare routines, or top-rated salons in Jaipur instead? I am here to help you pamper yourself!`;
    onChunk(politeRedirect);
    onDone(politeRedirect, [], []);
    return;
  }

  // 1. Run RAG Vector Queries in parallel
  console.log('[DEBUG] Running RAG queries...');
  let matchingGuides: any[] = [];
  let matchingProducts: any[] = [];
  let matchingSalons: any[] = [];


  try {
    const guides = await searchVectors(queryText, 'guide', 2);
    matchingGuides = guides.map(g => g.text);

    const products = await searchVectors(queryText, 'product', 3);
    matchingProducts = products.map(p => ({
      id: p.id,
      name: p.metadata?.name || p.text,
      brand: p.metadata?.brand || '',
      price: p.metadata?.price || 0,
      description: p.metadata?.description || ''
    }));

    // Ranked Salon search using hybrid search
    const rankedSalons = await performHybridSearch(queryText, userProfile);
    matchingSalons = rankedSalons.slice(0, 3).map(r => ({
      id: r.salon.id,
      name: r.salon.name,
      area: r.salon.area,
      rating: r.salon.rating,
      pricingCategory: r.salon.pricingCategory,
      matchedServices: r.salon.services.slice(0, 2).map((s: any) => ({ name: s.name, price: s.price })),
      reasons: r.reasons || [],
      professionals: r.salon.professionals ? r.salon.professionals.slice(0, 2).map((p: any) => ({
        id: p.id,
        name: p.name,
        specialization: p.specialization,
        profileImage: p.profileImage
      })) : []
    }));
  } catch (err) {
    console.error('Error fetching RAG context:', err);
  }

  console.log('[DEBUG] RAG context query complete. Guides found:', matchingGuides.length, 'Products found:', matchingProducts.length, 'Salons matched:', matchingSalons.length);


  // 2. Build system instruction with context injection
  const profileStr = userProfile 
    ? `User Profile Details: Hair Type is ${userProfile.hairType || 'unknown'}, Skin Type is ${userProfile.skinType || 'unknown'}, Hair Concerns: ${userProfile.hairConcerns || 'none'}, Skin Concerns: ${userProfile.skinConcerns || 'none'}, Budget Category: ${userProfile.budgetRange || 'MID'}.`
    : 'User Profile Details: No profile information registered yet.';

  const contextPrompt = `
SYSTEM INSTRUCTIONS:
You are the Expert AI Beauty, Skincare & Lifestyle Consultant for Glowique (premium marketplace in Jaipur).
You are warm, luxurious, empathetic, and highly expert.
Respond ONLY to Hair, Skin, Beauty, Grooming, Fashion, and Lifestyle queries.

For any specific hair, skin, beauty, or wellness concern, you MUST structure your response exactly as follows:
1. Explain the problem/concern in exactly 4-5 lines of text.
2. Explain the likely causes of this concern.
3. Suggest professional salon treatments and home-care options.
4. Mention that you have searched the Glowique Jaipur database.
5. Recommend the best matching salons from the database context provided below.
6. Explain in detail why each salon is recommended for their concern (matching their specialties, stylists, or reviews).

You MUST also follow these formatting rules:
- Always include a section header "## Personal Tips" with custom tips.
- At the very end of your response, you MUST provide 2-3 smart follow-up suggestions as bullet points starting with "• " on separate lines at the bottom (e.g. "• Compare Hydra Facial vs Clean-Up", "• Book a consultation").

${profileStr}

RETRIEVED GUIDES:
${matchingGuides.join('\n\n')}

RETRIEVED PRODUCTS:
${JSON.stringify(matchingProducts, null, 2)}

RETRIEVED SALONS:
${JSON.stringify(matchingSalons, null, 2)}
`;

  // 3. Setup Contents including history
  const contents = [
    { role: 'user', parts: [{ text: contextPrompt }] },
    ...history,
    { role: 'user', parts: [{ text: queryText }] }
  ];

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    // Return mock streaming response if API key is missing
    const isSkinQuery = queryText.toLowerCase().includes('skin') || queryText.toLowerCase().includes('acne') || queryText.toLowerCase().includes('oil');
    
    const mockFullText = isSkinQuery ? `🧴 Skin Consultation Analysis

Oily skin is a very common concern characterized by an overproduction of sebum from the sebaceous glands, leading to a shiny complexion and enlarged pores. Under Jaipur's hot and dry climate, dust particles easily adhere to this excess oil, which can frequently clog pores and trigger acne flare-ups. Managing this requires a careful balance of hydration and gentle exfoliation without stripping the skin's natural moisture barrier.

Likely Causes:
Genetics, hormonal shifts, over-washing with harsh soaps, environmental pollution, and humid weather.

Suggested Treatments:
• Professional: Hydra Facial Brightening Care, O3+ Power Facial for Tan Removal, Deep Cleanse.
• Home-care: Salicylic acid gel cleansers, hyaluronic acid moisturizers, gel sunscreen.

Database Search:
I have searched the Glowique Jaipur database to find the best specialized skin clinics matching your profile.

Recommended Salons:
1. La Belleza Salon & Spa (C-Scheme)
   - Reason: Highly recommended for its "Hydra Facial Brightening Cure". Elena Gilbert is their CIDESCO Certified skin expert.
2. Aura Unisex Salon (Vaishali Nagar)
   - Reason: Offers premium "O3+ Power Facials" which are excellent for oily skin tan removal and deep cleansing.

## Personal Tips
Wash your face at most twice a day; over-washing can actually trigger your skin to produce more sebum in self-defense.

• Book a Hydra Facial at La Belleza
• Compare O3+ Facial vs Hydra Facial
• Talk to a Skin Specialist`
    : `🧴 Hair Consultation Analysis

Frizzy and dry hair is a common concern that occurs when the hair cuticle layer is raised, allowing moisture from the air to penetrate the hair shaft and cause it to swell. In Jaipur's dry air or during seasonal shifts, the hair lacks sufficient hydration, leading to rough textures, flyaways, and split ends. Proper conditioning and smoothing treatments are essential to flatten the cuticle and restore shine.

Likely Causes:
Lack of natural oils, heat styling tools, chemical coloring, environmental exposure, and washing with hot water.

Suggested Treatments:
• Professional: Olaplex Hair Nourishing Spa, Keratin Smoothing Treatment, Hair Botox.
• Home-care: Sulfate-free moisturizing shampoos, Argan oil hair serums, microfiber hair towels.

Database Search:
I have searched the Glowique Jaipur database to find top-rated hair care salons in your vicinity.

Recommended Salons:
1. La Belleza Salon & Spa (C-Scheme)
   - Reason: Specializes in "Olaplex Hair Nourishing Spa". Rohan Mehra is their senior designer and Olaplex certified educator.
2. Aura Unisex Salon (Vaishali Nagar)
   - Reason: Offers an affordable "Keratin Nourishing Hair Spa" which is excellent for taming persistent frizz.

## Personal Tips
Always apply a heat protectant spray before using hair dryers or straighteners to keep the cuticle closed.

• Book Olaplex Spa at La Belleza
• Compare Keratin vs Olaplex Spa
• Find Hair Stylists in Jaipur`;

    // Stream out word by word
    const words = mockFullText.split(' ');
    let currentText = '';
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      onChunk(words[i] + ' ');
      await new Promise(r => setTimeout(r, 20));
    }
    onDone(mockFullText, matchingSalons, matchingProducts);
    return;
  }

  // 4. Trigger streaming request to Google Gemini API
  console.log('[DEBUG] Contacting Google Gemini streaming API...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini streaming failed: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body reader not available.');
    }

    const decoder = new TextDecoder('utf-8');
    let fullResponseText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Parse SSE chunks (Gemini returns JSON array stream, need to parse chunk objects)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete last line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Remove trailing commas or brackets since Gemini streams in JSON format chunks
        let cleanLine = line.trim();
        if (cleanLine.startsWith(',')) cleanLine = cleanLine.substring(1);
        if (cleanLine.startsWith('[') || cleanLine.endsWith(']')) continue;

        try {
          const parsed = JSON.parse(cleanLine);
          const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunkText) {
            fullResponseText += chunkText;
            onChunk(chunkText);
          }
        } catch (e) {
          // JSON parsing might fail if chunk is split across lines; buffer handles this.
        }
      }
    }

    // Process remainder of buffer
    if (buffer.trim()) {
      try {
        let cleanLine = buffer.trim();
        if (cleanLine.startsWith(',')) cleanLine = cleanLine.substring(1);
        const parsed = JSON.parse(cleanLine);
        const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (chunkText) {
          fullResponseText += chunkText;
          onChunk(chunkText);
        }
      } catch (e) {}
    }

    onDone(fullResponseText, matchingSalons, matchingProducts);
  } catch (error) {
    console.error('Error calling Gemini streaming API, falling back to mock response:', error);
    
    // Fallback to mock streaming response to keep demo working
    const isSkinQuery = queryText.toLowerCase().includes('skin') || queryText.toLowerCase().includes('acne') || queryText.toLowerCase().includes('oil');
    
    const mockFullText = isSkinQuery ? `🧴 Skin Consultation Analysis

Oily skin is a very common concern characterized by an overproduction of sebum from the sebaceous glands, leading to a shiny complexion and enlarged pores. Under Jaipur's hot and dry climate, dust particles easily adhere to this excess oil, which can frequently clog pores and trigger acne flare-ups. Managing this requires a careful balance of hydration and gentle exfoliation without stripping the skin's natural moisture barrier.

Likely Causes:
Genetics, hormonal shifts, over-washing with harsh soaps, environmental pollution, and humid weather.

Suggested Treatments:
• Professional: Hydra Facial Brightening Care, O3+ Power Facial for Tan Removal, Deep Cleanse.
• Home-care: Salicylic acid gel cleansers, hyaluronic acid moisturizers, gel sunscreen.

Database Search:
I have searched the Glowique Jaipur database to find the best specialized skin clinics matching your profile.

Recommended Salons:
1. La Belleza Salon & Spa (C-Scheme)
   - Reason: Highly recommended for its "Hydra Facial Brightening Cure". Elena Gilbert is their CIDESCO Certified skin expert.
2. Aura Unisex Salon (Vaishali Nagar)
   - Reason: Offers premium "O3+ Power Facials" which are excellent for oily skin tan removal and deep cleansing.

## Personal Tips
Wash your face at most twice a day; over-washing can actually trigger your skin to produce more sebum in self-defense.

• Book a Hydra Facial at La Belleza
• Compare O3+ Facial vs Hydra Facial
• Talk to a Skin Specialist`
    : `🧴 Hair Consultation Analysis

Frizzy and dry hair is a common concern that occurs when the hair cuticle layer is raised, allowing moisture from the air to penetrate the hair shaft and cause it to swell. In Jaipur's dry air or during seasonal shifts, the hair lacks sufficient hydration, leading to rough textures, flyaways, and split ends. Proper conditioning and smoothing treatments are essential to flatten the cuticle and restore shine.

Likely Causes:
Lack of natural oils, heat styling tools, chemical coloring, environmental exposure, and washing with hot water.

Suggested Treatments:
• Professional: Olaplex Hair Nourishing Spa, Keratin Smoothing Treatment, Hair Botox.
• Home-care: Sulfate-free moisturizing shampoos, Argan oil hair serums, microfiber hair towels.

Database Search:
I have searched the Glowique Jaipur database to find top-rated hair care salons in your vicinity.

Recommended Salons:
1. La Belleza Salon & Spa (C-Scheme)
   - Reason: Specializes in "Olaplex Hair Nourishing Spa". Rohan Mehra is their senior designer and Olaplex certified educator.
2. Aura Unisex Salon (Vaishali Nagar)
   - Reason: Offers an affordable "Keratin Nourishing Hair Spa" which is excellent for taming persistent frizz.

## Personal Tips
Always apply a heat protectant spray before using hair dryers or straighteners to keep the cuticle closed.

• Book Olaplex Spa at La Belleza
• Compare Keratin vs Olaplex Spa
• Find Hair Stylists in Jaipur`;

    // Stream out word by word
    const words = mockFullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + ' ');
      await new Promise(r => setTimeout(r, 20));
    }
    onDone(mockFullText, matchingSalons, matchingProducts);
  }
}
