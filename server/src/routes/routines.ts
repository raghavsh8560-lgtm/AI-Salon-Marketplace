import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Generate and Save a personalized Beauty Routine planner using Gemini
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (!user.skinType && !user.hairType) {
      res.status(400).json({ error: 'Please complete your skin and hair assessment questionnaire first.' });
      return;
    }

    // Call Gemini to generate a structured routine
    let routineData: any = null;
    const prompt = `Generate a highly personalized daily skincare and haircare routine for a user in Jaipur with the following details:
- Skin Type: ${user.skinType || 'Combination'}
- Skin Tone: ${user.skinTone || 'N/A'}
- Skin Concerns: ${user.skinConcerns || 'None'}
- Hair Type: ${user.hairType || 'Normal'}
- Hair Length: ${user.hairLength || 'Medium'}
- Hair Concerns: ${user.hairConcerns || 'None'}
- Budget Level: ${user.budgetRange || 'MID'}
- Preferences: ${user.preferences || 'None'}

Return ONLY a valid JSON object matching this TypeScript interface, no other text or explanation:
{
  "title": string,
  "rationale": string,
  "morning": [
    { "step": number, "time": string, "name": string, "productType": string, "instructions": string }
  ],
  "night": [
    { "step": number, "time": string, "name": string, "productType": string, "instructions": string }
  ],
  "weekly": [
    { "day": string, "name": string, "instructions": string }
  ]
}`;

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        try {
          routineData = JSON.parse(text);
        } catch (e) {
          console.warn('Failed to parse Gemini routine JSON, falling back to static generation.', e);
        }
      }
    }

    // Static fallback if Gemini is not available or fails parsing
    if (!routineData) {
      routineData = {
        title: `${user.name}'s Custom Hydration & Control Regimen`,
        rationale: `This routine is tailored to balance your oily/dry zones and soothe frizz under Jaipur's hot climate conditions.`,
        morning: [
          { step: 1, time: '08:00 AM', name: 'Mild Cleanse', productType: 'Gentle Foaming Wash', instructions: 'Cleanse face with lukewarm water to remove overnight sebum.' },
          { step: 2, time: '08:15 AM', name: 'Hydrating Splash', productType: 'Hyaluronic Acid Gel/Serum', instructions: 'Apply 2 drops to damp skin to lock in moisture.' },
          { step: 3, time: '08:30 AM', name: 'Shield SPF', productType: 'Matte Gel Sunscreen', instructions: 'Protect skin against Jaipur heat tanning. Reapply every 3 hours.' }
        ],
        night: [
          { step: 1, time: '09:30 PM', name: 'Double Cleanse', productType: 'Micellar Water + Wash', instructions: 'Thoroughly wash off outdoor dust and sunscreen.' },
          { step: 2, time: '09:45 PM', name: 'Active Treatment', productType: 'Salicylic spot gel / Vitamin C', instructions: 'Apply to dark spots or active pigmentation zones.' },
          { step: 3, time: '10:00 PM', name: 'Lock & Repair', productType: 'Anti-Frizz Hair Serum', instructions: 'Apply 2 drops of Argan serum to hair ends before sleep.' }
        ],
        weekly: [
          { day: 'Sunday', name: 'Onion Hair Oil Massage', instructions: 'Massage scalp, leave in for 2 hours, wash with anti-fall shampoo.' },
          { day: 'Wednesday', name: 'De-Tan Mud Mask', instructions: 'Apply O3+ clay mask for 15 minutes to lift off dust tanning.' }
        ]
      };
    }

    // Save routine in User preferences
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: JSON.stringify(routineData)
      }
    });

    res.json(routineData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate beauty routine.' });
  }
});

// Fetch saved routine
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user && user.preferences) {
      try {
        const routine = JSON.parse(user.preferences);
        res.json(routine);
        return;
      } catch (e) {
        // Not a JSON preference string, continue
      }
    }
    res.status(404).json({ message: 'No saved routine found.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch routine.' });
  }
});

export default router;
