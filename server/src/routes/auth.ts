import { Router, Response } from 'express';
import { findUserByEmail, findUserById, updateUser } from '../services/db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { authenticateDemoUser } from '../services/authService.js';

const router = Router();

// Register user (Simplified/Deprecated: automatically creates/logs in user via passwordless flow)
router.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
  const { email, role, password } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  try {
    const result = await authenticateDemoUser(email, role, password);
    
    // Auto-map owner to salon-1 if they don't have any owned salon
    let ownedSalons: any[] = [];
    if (result.user.role === 'OWNER') {
      const { findSalons, updateSalonDetails } = await import('../services/db.js');
      const salons = await findSalons();
      const owned = salons.find((s: any) => s.ownerId === result.user.id);
      if (!owned) {
        const updated = await updateSalonDetails('salon-1', { ownerId: result.user.id });
        ownedSalons = updated ? [updated] : [];
      } else {
        ownedSalons = salons.filter((s: any) => s.ownerId === result.user.id);
      }
    }
    result.user.ownedSalons = ownedSalons;
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
});

// Login user (Passwordless email-only authentication)
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { email, role, password } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  try {
    const result = await authenticateDemoUser(email, role, password);
    
    // Auto-map owner to salon-1 if they don't have any owned salon
    let ownedSalons: any[] = [];
    if (result.user.role === 'OWNER') {
      const { findSalons, updateSalonDetails } = await import('../services/db.js');
      const salons = await findSalons();
      const owned = salons.find((s: any) => s.ownerId === result.user.id);
      if (!owned) {
        const updated = await updateSalonDetails('salon-1', { ownerId: result.user.id });
        ownedSalons = updated ? [updated] : [];
      } else {
        ownedSalons = salons.filter((s: any) => s.ownerId === result.user.id);
      }
    }
    result.user.ownedSalons = ownedSalons;
    
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error during authentication.' });
  }
});

// Get profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    
    if (user.suspended) {
      res.status(403).json({ error: 'This account has been suspended by the administrator.' });
      return;
    }
    
    const { password, ...safeUser } = user;
    
    // Fetch owned salons if owner
    let ownedSalons: any[] = [];
    if (user.role === 'OWNER') {
      const { findSalons, updateSalonDetails } = await import('../services/db.js');
      const salons = await findSalons();
      
      // Auto-map owner to salon-1 if they don't have any owned salon
      let owned = salons.find((s: any) => s.ownerId === user.id);
      if (!owned) {
        const updated = await updateSalonDetails('salon-1', { ownerId: user.id });
        if (updated) {
          ownedSalons = [updated];
        }
      } else {
        ownedSalons = salons.filter((s: any) => s.ownerId === user.id);
      }
    }
    
    res.json({ ...safeUser, ownedSalons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update Profile Assessments (Skin, Hair, Lifestyle vectors)
router.put('/assessment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const {
    hairType,
    hairLength,
    hairGoals,
    hairConcerns,
    skinType,
    skinTone,
    skinConcerns,
    budgetRange,
    occasion,
    preferences,
  } = req.body;

  try {
    const user = await updateUser(req.user!.id, {
      hairType,
      hairLength,
      hairGoals,
      hairConcerns,
      skinType,
      skinTone,
      skinConcerns,
      budgetRange,
      occasion,
      preferences,
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user assessments.' });
  }
});

// Toggle Favorite Salon
router.post('/favorites', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { salonId } = req.body;

  if (!salonId) {
    res.status(400).json({ error: 'Salon ID required.' });
    return;
  }

  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    let favoriteSalons = [...user.favoriteSalons];
    if (favoriteSalons.includes(salonId)) {
      favoriteSalons = favoriteSalons.filter((id: string) => id !== salonId);
    } else {
      favoriteSalons.push(salonId);
    }

    const updatedUser = await updateUser(req.user!.id, { favoriteSalons });
    res.json({ favoriteSalons: updatedUser.favoriteSalons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle favorite salon.' });
  }
});

// Admin: Get all users
router.get('/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { findUsers } = await import('../services/db.js');
    const users = await findUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Admin: Suspend/unsuspend user
router.put('/admin/users/:id/suspend', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { suspend } = req.body;
  try {
    const { updateUserSuspension } = await import('../services/db.js');
    const updated = await updateUserSuspension(id as string, suspend);
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ message: 'User suspension status updated.', user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user suspension.' });
  }
});

// Admin: Delete user
router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  try {
    const { deleteUser } = await import('../services/db.js');
    await deleteUser(id as string);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
