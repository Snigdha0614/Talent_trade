import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { WishlistItem } from '../types.ts';

const router = Router();

// Get current user's favorites hydrated
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userItems = db.wishlists.filter((w) => w.userId === userId);

  const freelancers = userItems
    .filter((w) => w.itemType === 'FREELANCER')
    .map((w) => db.users.find((u) => u.id === w.itemId))
    .filter(Boolean)
    .map((u) => {
      const { passwordHash, ...safe } = u!;
      return safe;
    });

  const services = userItems
    .filter((w) => w.itemType === 'SERVICE')
    .map((w) => db.services.find((s) => s.id === w.itemId))
    .filter(Boolean);

  const projects = userItems
    .filter((w) => w.itemType === 'PROJECT')
    .map((w) => db.projects.find((p) => p.id === w.itemId))
    .filter(Boolean);

  return res.json({
    success: true,
    rawWishlist: userItems,
    freelancers,
    services,
    projects,
  });
});

// Toggle wishlist item
router.post('/toggle', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { itemType, itemId } = req.body;
  if (!itemType || !itemId) {
    return res.status(400).json({ success: false, message: 'Item type and item ID are required.' });
  }

  const existingIdx = db.wishlists.findIndex(
    (w) => w.userId === userId && w.itemType === itemType && w.itemId === itemId
  );

  if (existingIdx !== -1) {
    db.wishlists.splice(existingIdx, 1);
    db.persist();
    return res.json({ success: true, saved: false, message: 'Removed from favorites.' });
  } else {
    const newItem: WishlistItem = {
      id: `wsh_${Date.now()}`,
      userId,
      itemType,
      itemId,
      createdAt: new Date().toISOString(),
    };
    db.wishlists.push(newItem);
    db.persist();
    return res.json({ success: true, saved: true, message: 'Added to favorites!' });
  }
});

export default router;
