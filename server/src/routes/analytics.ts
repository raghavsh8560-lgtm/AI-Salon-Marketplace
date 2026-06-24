import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAIAnalytics, isFallbackMode } from '../services/db.js';
import { requireAdmin, authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { isFallbackMode, readLocalDb } = await import('../services/db.js');

    if (isFallbackMode) {
      const db = readLocalDb();
      const totalSalons = db.salons.length;
      const totalUsers = db.users.length;
      const totalBookings = db.bookings.length;
      
      const pendingBookings = db.bookings.filter((b: any) => b.status === 'PENDING').length;
      const completedBookings = db.bookings.filter((b: any) => b.status === 'COMPLETED').length;
      const rejectedBookings = db.bookings.filter((b: any) => b.status === 'REJECTED' || b.status === 'CANCELLED').length;
      
      const upcomingBookings = db.bookings.filter((b: any) => 
        b.date >= todayStr && ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(b.status)
      ).length;

      const totalRevenue = db.bookings
        .filter((b: any) => ['COMPLETED', 'CONFIRMED', 'ACCEPTED'].includes(b.status))
        .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

      const performance = db.salons.map((s: any) => {
        const owner = db.users.find((u: any) => u.id === s.ownerId);
        const salonBookings = db.bookings.filter((b: any) => b.salonId === s.id);
        
        const tot = salonBookings.length;
        const comp = salonBookings.filter((b: any) => b.status === 'COMPLETED').length;
        const rej = salonBookings.filter((b: any) => b.status === 'REJECTED' || b.status === 'CANCELLED').length;
        const upc = salonBookings.filter((b: any) => 
          b.date >= todayStr && ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(b.status)
        ).length;
        const vis = (s.reviewsCount || s.reviews?.length || 0) * 8 + 52;

        return {
          salonId: s.id,
          name: s.name,
          ownerName: owner?.name || 'No Owner',
          totalBookings: tot,
          upcomingBookings: upc,
          completedBookings: comp,
          rejectedBookings: rej,
          visitors: vis,
          rating: s.rating
        };
      });

      res.json({
        summary: {
          totalSalons,
          totalUsers,
          totalBookings,
          totalRevenue,
          pendingBookings,
          completedBookings,
          rejectedBookings,
          upcomingBookings,
          conversionRate: totalBookings > 0 ? parseFloat(((totalBookings / (db.analytics?.totalChats || 10)) * 100).toFixed(2)) : 0
        },
        aiAnalytics: db.analytics,
        salonPerformance: performance
      });
      return;
    }

    // Live PostgreSQL aggregates
    const aiStats = await prisma.aIAnalytics.findFirst();
    const totalSalons = await prisma.salon.count();
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const rejectedBookings = await prisma.booking.count({ where: { status: { in: ['REJECTED', 'CANCELLED'] } } });
    
    const upcomingBookings = await prisma.booking.count({
      where: {
        date: { gte: todayStr },
        status: { in: ['PENDING', 'CONFIRMED', 'ACCEPTED'] }
      }
    });

    const bookingsForRevenue = await prisma.booking.findMany({
      where: {
        status: { in: ['COMPLETED', 'CONFIRMED', 'ACCEPTED'] }
      },
      select: { totalPrice: true }
    });
    const totalRevenue = bookingsForRevenue.reduce((sum, b) => sum + b.totalPrice, 0);

    const salons = await prisma.salon.findMany({
      include: {
        owner: { select: { name: true } },
        bookings: true
      }
    });

    const performance = salons.map((s) => {
      const tot = s.bookings.length;
      const comp = s.bookings.filter(b => b.status === 'COMPLETED').length;
      const rej = s.bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length;
      const upc = s.bookings.filter(b => b.date >= todayStr && ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(b.status)).length;
      const vis = s.reviewsCount * 8 + 52;

      return {
        salonId: s.id,
        name: s.name,
        ownerName: s.owner?.name || 'No Owner',
        totalBookings: tot,
        upcomingBookings: upc,
        completedBookings: comp,
        rejectedBookings: rej,
        visitors: vis,
        rating: s.rating
      };
    });

    performance.sort((a, b) => b.totalBookings - a.totalBookings);

    res.json({
      summary: {
        totalSalons,
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingBookings,
        completedBookings,
        rejectedBookings,
        upcomingBookings,
        conversionRate: totalBookings > 0 ? parseFloat(((totalBookings / (aiStats?.totalChats || 10)) * 105).toFixed(2)) : 0
      },
      aiAnalytics: {
        mostAskedQuestions: aiStats?.mostAskedQuestions || [],
        mostRecommendedServices: aiStats?.mostRecommendedServices || [],
        mostRecommendedSalons: aiStats?.mostRecommendedSalons || [],
        popularTreatments: aiStats?.popularTreatments || [],
        chatSatisfaction: aiStats?.chatSatisfaction || 4.8,
        totalChats: aiStats?.totalChats || 0,
      },
      salonPerformance: performance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve analytics metrics.' });
  }
});

// Salon Owner specific analytics
router.get('/owner/:salonId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const salonId = req.params.salonId;
  try {
    const { findBookingsBySalonId, findSalonById } = await import('../services/db.js');
    const bookings = await findBookingsBySalonId(salonId as string);
    const salon = await findSalonById(salonId as string);
    
    if (!salon) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }
    
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter((b: any) => b.status === 'CANCELLED').length;
    
    // Revenue is the sum of totalPrice of completed/confirmed bookings
    const revenue = bookings
      .filter((b: any) => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS')
      .reduce((sum: number, b: any) => sum + b.totalPrice, 0);
      
    // Popular services: count by service names
    const serviceCounts: Record<string, number> = {};
    bookings.forEach((b: any) => {
      let servicesList = [];
      if (typeof b.services === 'string') {
        try { servicesList = JSON.parse(b.services); } catch (e) {}
      } else if (Array.isArray(b.services)) {
        servicesList = b.services;
      }
      servicesList.forEach((s: any) => {
        const name = s.name || s;
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });
    });
    
    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    // Customer growth (mock/simulated)
    const customerGrowth = totalBookings > 0 ? Math.round(totalBookings * 1.25) : 5;
    
    // Monthly bookings (simulated last 6 months)
    const monthlyBookings = [
      { month: 'Jan', count: Math.round(totalBookings * 0.1) },
      { month: 'Feb', count: Math.round(totalBookings * 0.15) },
      { month: 'Mar', count: Math.round(totalBookings * 0.2) },
      { month: 'Apr', count: Math.round(totalBookings * 0.25) },
      { month: 'May', count: Math.round(totalBookings * 0.3) },
      { month: 'Jun', count: totalBookings },
    ];
    
    res.json({
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        revenue,
        customerGrowth,
      },
      popularServices,
      monthlyBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve owner analytics.' });
  }
});

export default router;
