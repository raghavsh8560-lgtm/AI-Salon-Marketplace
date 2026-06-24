import { Router, Response, Request } from 'express';
import { findSalons, findSalonById } from '../services/db.js';
import { performHybridSearch } from '../services/searchEngine.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// List salons with optional query filters (Area, Gender, Budget, Specialty)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { area, genderCategory, pricingCategory, specialty } = req.query;

  try {
    const filters: any = {};

    if (area) {
      filters.area = area as string;
    }
    if (genderCategory) {
      filters.genderCategory = genderCategory as string;
    }
    if (pricingCategory) {
      filters.pricingCategory = pricingCategory as string;
    }
    if (specialty) {
      filters.expertise = {
        has: specialty as string,
      };
    }

    const salons = await findSalons(filters);
    res.json(salons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve salons.' });
  }
});

// Advanced Hybrid Search (semantic vector + filters + keywords ranking)
router.get('/search', async (req: AuthenticatedRequest, res: Response) => {
  const { q, userId } = req.query;

  if (!q) {
    res.status(400).json({ error: 'Query parameter q is required.' });
    return;
  }

  try {
    let userProfile = undefined;
    if (userId) {
      // Dynamic profile loading handled by search engine if userId supplied
    }

    const results = await performHybridSearch(q as string, userProfile);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search engine failed.' });
  }
});

// Compare 2-3 salons side-by-side
router.get('/compare', async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.query;

  if (!ids) {
    res.status(400).json({ error: 'Comma-separated salon ids query parameter is required.' });
    return;
  }

  const salonIds = (ids as string).split(',');
  if (salonIds.length < 2 || salonIds.length > 3) {
    res.status(400).json({ error: 'Can only compare between 2 and 3 salons.' });
    return;
  }

  try {
    const salons = await Promise.all(salonIds.map((id) => findSalonById(id)));
    const validSalons = salons.filter(s => s !== null);
    res.json(validSalons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Comparison compilation failed.' });
  }
});

// Get salon details by id
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const salon = await findSalonById(id);

    if (!salon) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }

    res.json(salon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve salon details.' });
  }
});

// Create/register salon (Owner)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, coverImage, area, location, address, phone, brandStory, overview, genderCategory, pricingCategory, expertise, amenities } = req.body;
  if (!name || !coverImage || !area || !location || !address || !phone) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }
  const id = `salon-${Math.random().toString(36).substring(2, 9)}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    const { createSalon } = await import('../services/db.js');
    const newSalon = await createSalon({
      id,
      slug,
      name,
      coverImage,
      gallery: [coverImage],
      brandStory: brandStory || 'Luxury beauty experience.',
      overview: overview || 'Bespoke grooming sanctuary.',
      expertise: expertise || [],
      teamStructure: '1 Professional Specialist.',
      certifications: [],
      pricingCategory: pricingCategory || 'MID',
      openingHours: '10:00 AM - 08:30 PM',
      location,
      area,
      address,
      phone,
      amenities: amenities || [],
      technologies: [],
      hygieneStandards: 'Autoclaved tools and sterilized stations.',
      serviceGuarantee: 'Satisfying beauty adjustments.',
      bookingPolicies: 'Reservations must be made 2 hours in advance.',
      rating: 5.0,
      reviewsCount: 0,
      genderCategory: genderCategory || 'UNISEX',
      featured: false,
      ownerId: req.user!.id,
      status: 'APPROVED',
      isVerified: true
    });
    res.status(201).json(newSalon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register salon.' });
  }
});

// Update salon details (Owner)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { updateSalonDetails } = await import('../services/db.js');
    const updated = await updateSalonDetails(id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update salon details.' });
  }
});

// Add Professional (Owner)
router.post('/:id/professionals', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const salonId = req.params.id;
  try {
    const { createSalonProfessional } = await import('../services/db.js');
    const newProf = await createSalonProfessional(salonId as string, req.body);
    if (!newProf) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }
    res.status(201).json(newProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add professional.' });
  }
});

// Edit Professional (Owner)
router.put('/professionals/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { updateSalonProfessional } = await import('../services/db.js');
    const updated = await updateSalonProfessional(id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Professional not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update professional.' });
  }
});

// Delete Professional (Owner)
router.delete('/professionals/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { deleteSalonProfessional } = await import('../services/db.js');
    const success = await deleteSalonProfessional(id as string);
    if (!success) {
      res.status(404).json({ error: 'Professional not found.' });
      return;
    }
    res.json({ message: 'Professional deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete professional.' });
  }
});

// Add Service (Owner)
router.post('/:id/services', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const salonId = req.params.id;
  try {
    const { createService } = await import('../services/db.js');
    const newSrv = await createService(salonId as string, req.body);
    if (!newSrv) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }
    res.status(201).json(newSrv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add service.' });
  }
});

// Edit Service (Owner)
router.put('/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { updateService } = await import('../services/db.js');
    const updated = await updateService(id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// Delete Service (Owner)
router.delete('/services/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { deleteService } = await import('../services/db.js');
    const success = await deleteService(id as string);
    if (!success) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

// Verify Salon (Admin)
router.post('/:id/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { isVerified } = req.body;
  try {
    const { updateSalonStatus } = await import('../services/db.js');
    const updated = await updateSalonStatus(id as string, isVerified ? 'APPROVED' : 'PENDING', isVerified);
    res.json({ message: 'Salon verification updated.', salon: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify salon.' });
  }
});

// Suspend Salon (Admin)
router.post('/:id/suspend', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { suspend } = req.body;
  try {
    const { updateSalonStatus } = await import('../services/db.js');
    const updated = await updateSalonStatus(id as string, suspend ? 'SUSPENDED' : 'APPROVED', !suspend);
    res.json({ message: 'Salon suspension updated.', salon: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to suspend salon.' });
  }
});

// Delete Salon (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { deleteSalon } = await import('../services/db.js');
    await deleteSalon(id as string);
    res.json({ message: 'Salon deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete salon.' });
  }
});

// Get slots occupancy for a salon on a specific date
router.get('/:id/slots-occupancy', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;
  
  if (!date) {
    res.status(400).json({ error: 'Date query parameter is required.' });
    return;
  }
  
  try {
    const { findFrozenSlots, isFallbackMode, prisma, readLocalDb } = await import('../services/db.js');
    
    // 1. Get frozen slots
    let frozen: any[] = [];
    if (isFallbackMode) {
      const db = readLocalDb();
      frozen = (db.frozenSlots || []).filter((s: any) => s.salonId === (id as string) && s.date === date);
    } else {
      frozen = await prisma.frozenSlot.findMany({
        where: { salonId: id as string, date: date as string }
      });
    }
    
    // 2. Get booking counts for each slot on this date
    let bookings: any[] = [];
    if (isFallbackMode) {
      const db = readLocalDb();
      bookings = db.bookings.filter((b: any) => b.salonId === (id as string) && b.date === date && b.status !== 'CANCELLED' && b.status !== 'REJECTED');
    } else {
      bookings = await prisma.booking.findMany({
        where: {
          salonId: id as string,
          date: date as string,
          status: { notIn: ['CANCELLED', 'REJECTED'] }
        },
        select: { time: true }
      });
    }
    
    const occupancy: Record<string, number> = {};
    bookings.forEach((b: any) => {
      occupancy[b.time] = (occupancy[b.time] || 0) + 1;
    });
    
    res.json({
      frozenSlots: frozen.map(f => ({ time: f.time, reason: f.reason })),
      occupancy
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve slot occupancy.' });
  }
});

// Get all frozen slots for a salon on a specific date
router.get('/:id/frozen-slots', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;
  try {
    const { findFrozenSlots } = await import('../services/db.js');
    const slots = await findFrozenSlots(id as string, date as string || '');
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve frozen slots.' });
  }
});

// Freeze a slot (Owner/Admin)
router.post('/:id/freeze-slot', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date, time, reason } = req.body;
  if (!date || !time || !reason) {
    res.status(400).json({ error: 'Date, time, and reason are required.' });
    return;
  }
  try {
    const { createFrozenSlot } = await import('../services/db.js');
    const slot = await createFrozenSlot(id as string, date, time, reason);
    if (!slot) {
      res.status(400).json({ error: 'Slot is already frozen.' });
      return;
    }
    res.status(201).json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to freeze slot.' });
  }
});

// Unfreeze a slot (Owner/Admin)
router.post('/:id/unfreeze-slot', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date, time } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: 'Date and time are required.' });
    return;
  }
  try {
    const { deleteFrozenSlot } = await import('../services/db.js');
    const success = await deleteFrozenSlot(id as string, date, time);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unfreeze slot.' });
  }
});

export default router;
