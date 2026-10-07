import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Admin overall statistics & analytics
router.get('/stats', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  const totalUsers = db.users.length;
  const freelancers = db.users.filter((u) => u.role === 'FREELANCER');
  const clients = db.users.filter((u) => u.role === 'CLIENT');
  const activeProjects = db.projects.filter(
    (p) =>
      p.status === 'IN_PROGRESS' ||
      p.status === 'EXCHANGE_IN_PROGRESS' ||
      p.status === 'SUBMITTED' ||
      p.status === 'REVISION_REQUESTED'
  );
  const completedProjects = db.projects.filter(
    (p) => p.status === 'COMPLETED' || p.status === 'EXCHANGE_COMPLETED'
  );
  const totalServices = db.services.length;
  const pendingReports = db.reports.filter((r) => r.status === 'Pending' || r.status === 'Under Investigation');
  const completedExchanges = db.exchanges.filter(
    (ex) => ex.status === 'ACCEPTED' || ex.status === 'COMPLETED'
  );

  const paidProjectsCount = db.projects.filter((p) => p.mode === 'PAID').length;
  const skillExchangeProjectsCount = db.projects.filter((p) => p.mode === 'SKILL_EXCHANGE').length;

  const totalSimulatedVolume = db.payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Category distributions
  const categoryCounts: Record<string, number> = {};
  db.services.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  return res.json({
    success: true,
    stats: {
      totalUsers,
      totalFreelancers: freelancers.length,
      totalClients: clients.length,
      totalServices,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      pendingReports: pendingReports.length,
      completedExchanges: completedExchanges.length,
      paidProjectsCount,
      skillExchangeProjectsCount,
      totalSimulatedVolume,
      categoryDistribution: categoryCounts,
    },
  });
});

// List all users for administration
router.get('/users', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  const { role, search } = req.query;
  let users = db.users;

  if (role) {
    users = users.filter((u) => u.role === role);
  }

  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const sanitized = users.map(({ passwordHash, ...safe }) => safe);
  return res.json({ success: true, count: sanitized.length, users: sanitized });
});

// Suspend or Reactivate user
router.patch('/users/:id/status', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Cannot suspend administrator account.' });
  }

  user.isSuspended = !user.isSuspended;
  db.persist();

  return res.json({
    success: true,
    message: `User ${user.name} is now ${user.isSuspended ? 'suspended' : 'active'}.`,
    user: {
      id: user.id,
      name: user.name,
      isSuspended: user.isSuspended,
    },
  });
});

// Delete user (soft or hard remove from demo db)
router.delete('/users/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const index = db.users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const user = db.users[index];
  if (user.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Cannot delete administrator account.' });
  }

  db.users.splice(index, 1);
  db.persist();

  return res.json({ success: true, message: `User ${user.name} deleted successfully.` });
});

// Moderate / Pause service
router.patch('/services/:id/moderate', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const service = db.services.find((s) => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  const { status } = req.body; // 'PUBLISHED' | 'PAUSED' | 'DRAFT'
  service.status = status || 'PAUSED';
  db.persist();

  return res.json({ success: true, message: `Service status updated to ${service.status}.`, service });
});

// Reset demo database to defaults
router.post('/reset-demo-db', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  db.resetToDefaults();
  return res.json({ success: true, message: 'Database reset to default seed data successfully.' });
});

export default router;
