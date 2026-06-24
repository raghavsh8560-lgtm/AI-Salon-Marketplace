import { Router, Response } from 'express';
import { createBooking, findBookingsByUserId, updateBookingStatus, updateBookingReschedule } from '../services/db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Helper to generate a unique booking reference code
function generateBookingRef(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `SA-${num}`;
}

// Create new Booking
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { salonId, date, time, services, totalPrice, professionalId } = req.body;

  if (!salonId || !date || !time || !services || !totalPrice) {
    res.status(400).json({ error: 'SalonId, date, time, services, and totalPrice are required.' });
    return;
  }

  try {
    const { findFrozenSlots, isFallbackMode, prisma, readLocalDb } = await import('../services/db.js');
    
    // 1. Check if slot is frozen
    let isFrozen = false;
    if (isFallbackMode) {
      const db = readLocalDb();
      isFrozen = (db.frozenSlots || []).some((s: any) => s.salonId === salonId && s.date === date && s.time === time);
    } else {
      const frozenCount = await prisma.frozenSlot.count({
        where: { salonId, date, time }
      });
      isFrozen = frozenCount > 0;
    }
    if (isFrozen) {
      res.status(400).json({ error: 'This time slot is frozen by the owner and unavailable for booking.' });
      return;
    }
    
    // 2. Check active booking limit (max 2 bookings per slot)
    let activeBookingsCount = 0;
    if (isFallbackMode) {
      const db = readLocalDb();
      activeBookingsCount = db.bookings.filter((b: any) => 
        b.salonId === salonId && 
        b.date === date && 
        b.time === time && 
        b.status !== 'CANCELLED' && 
        b.status !== 'REJECTED'
      ).length;
    } else {
      activeBookingsCount = await prisma.booking.count({
        where: {
          salonId,
          date,
          time,
          status: { notIn: ['CANCELLED', 'REJECTED'] }
        }
      });
    }
    if (activeBookingsCount >= 2) {
      res.status(400).json({ error: 'Slot Full: This time slot has already reached its booking limit (max 2 bookings).' });
      return;
    }

    const bookingId = generateBookingRef();

    const booking = await createBooking({
      id: bookingId,
      userId: req.user!.id,
      salonId,
      professionalId: professionalId || null,
      date,
      time,
      services, // JSON array of services
      totalPrice: parseFloat(totalPrice),
      status: 'CONFIRMED',
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create appointment booking.' });
  }
});

// Get user bookings
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await findBookingsByUserId(req.user!.id);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
});

// Cancel Booking
router.post('/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const updated = await updateBookingStatus(id, req.user!.id, 'CANCELLED');
    if (!updated) {
      res.status(404).json({ error: 'Booking not found or unauthorized.' });
      return;
    }
    res.json({ message: 'Booking cancelled successfully.', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cancellation failed.' });
  }
});

// Reschedule Booking
router.post('/:id/reschedule', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { date, time } = req.body;

  if (!date || !time) {
    res.status(400).json({ error: 'Rescheduled date and time are required.' });
    return;
  }

  try {
    const { isFallbackMode, prisma, readLocalDb } = await import('../services/db.js');
    
    // 1. Fetch booking to check salonId and ownership
    let existingBooking: any = null;
    if (isFallbackMode) {
      const db = readLocalDb();
      existingBooking = db.bookings.find((b: any) => b.id === id);
    } else {
      existingBooking = await prisma.booking.findUnique({
        where: { id }
      });
    }

    if (!existingBooking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    // Verify ownership
    if (existingBooking.userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      res.status(403).json({ error: 'Unauthorized to reschedule this booking.' });
      return;
    }

    const salonId = existingBooking.salonId;

    // Check if moving to a different slot
    if (existingBooking.date !== date || existingBooking.time !== time) {
      // Check frozen
      let isFrozen = false;
      if (isFallbackMode) {
        const db = readLocalDb();
        isFrozen = (db.frozenSlots || []).some((s: any) => s.salonId === salonId && s.date === date && s.time === time);
      } else {
        const frozenCount = await prisma.frozenSlot.count({
          where: { salonId, date, time }
        });
        isFrozen = frozenCount > 0;
      }
      if (isFrozen) {
        res.status(400).json({ error: 'Target time slot is frozen by the owner.' });
        return;
      }

      // Check booking limit (max 2 bookings per slot)
      let activeBookingsCount = 0;
      if (isFallbackMode) {
        const db = readLocalDb();
        activeBookingsCount = db.bookings.filter((b: any) => 
          b.salonId === salonId && 
          b.date === date && 
          b.time === time && 
          b.status !== 'CANCELLED' && 
          b.status !== 'REJECTED'
        ).length;
      } else {
        activeBookingsCount = await prisma.booking.count({
          where: {
            salonId,
            date,
            time,
            status: { notIn: ['CANCELLED', 'REJECTED'] }
          }
        });
      }
      if (activeBookingsCount >= 2) {
        res.status(400).json({ error: 'Target slot is full (max 2 bookings).' });
        return;
      }
    }

    const updated = await updateBookingReschedule(id, req.user!.id, date, time);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found or unauthorized.' });
      return;
    }
    res.json({ message: 'Booking rescheduled successfully.', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Rescheduling failed.' });
  }
});

// Owner get bookings
router.get('/owner/:salonId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const salonId = req.params.salonId;
  try {
    const { findBookingsBySalonId } = await import('../services/db.js');
    const bookings = await findBookingsBySalonId(salonId as string);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch salon bookings.' });
  }
});

// Admin get all bookings
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { findAllBookings } = await import('../services/db.js');
    const bookings = await findAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all bookings.' });
  }
});

// Update Booking Status (Owner/Admin)
router.put('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }
  
  try {
    const updated = await updateBookingStatus(id as string, 'ALL', status);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    
    // Simulate notification trigger
    try {
      const { sendBookingNotification } = await import('../services/notifications.js');
      await sendBookingNotification(id as string, updated.userId, status);
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }
    
    res.json({ message: 'Booking status updated successfully.', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Status update failed.' });
  }
});

// Support POST status update
router.post('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }
  try {
    const updated = await updateBookingStatus(id as string, 'ALL', status);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    try {
      const { sendBookingNotification } = await import('../services/notifications.js');
      await sendBookingNotification(id as string, updated.userId, status);
    } catch (e) {}
    res.json({ message: 'Booking status updated successfully.', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Status update failed.' });
  }
});

// Owner reschedule booking
router.post('/:id/reschedule-owner', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { date, time } = req.body;
  if (!date || !time) {
    res.status(400).json({ error: 'Rescheduled date and time are required.' });
    return;
  }
  try {
    const { rescheduleBookingByOwner } = await import('../services/db.js');
    const updated = await rescheduleBookingByOwner(id as string, date, time);
    if (!updated) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    try {
      const { sendBookingNotification } = await import('../services/notifications.js');
      await sendBookingNotification(id as string, updated.userId, 'ACCEPTED'); // Accepted and rescheduled
    } catch (e) {}
    res.json({ message: 'Booking rescheduled by owner successfully.', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Rescheduling failed.' });
  }
});

export default router;
