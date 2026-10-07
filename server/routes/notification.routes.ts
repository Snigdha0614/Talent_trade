import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get all notifications for current user
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.notifications.filter((n) => n.userId === req.user?.id);
  const unreadCount = notifs.filter((n) => !n.read).length;

  return res.json({
    success: true,
    count: notifs.length,
    unreadCount,
    notifications: notifs,
  });
});

// Mark single notification as read
router.patch('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user?.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  notif.read = true;
  db.persist();

  return res.json({ success: true, notification: notif });
});

// Mark all as read
router.post('/mark-all-read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  db.notifications
    .filter((n) => n.userId === req.user?.id)
    .forEach((n) => {
      n.read = true;
    });

  db.persist();
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
