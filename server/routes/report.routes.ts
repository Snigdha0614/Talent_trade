import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { Report } from '../types.ts';

const router = Router();

// Submit report
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { type, description, evidence, reportedUser, serviceId, projectId } = req.body;

  if (!type || !description) {
    return res.status(400).json({ success: false, message: 'Report type and description are required.' });
  }

  let reportedUserName = undefined;
  if (reportedUser) {
    const target = db.users.find((u) => u.id === reportedUser);
    reportedUserName = target?.name;
  }

  const newReport: Report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reportedBy: user.id,
    reportedByName: user.name,
    reportedUser,
    reportedUserName,
    serviceId,
    projectId,
    type,
    description: description.trim(),
    evidence: evidence ? evidence.trim() : undefined,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(newReport);
  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Report submitted for administrative review. Our moderation team will investigate promptly.',
    report: newReport,
  });
});

// Admin list all reports
router.get('/', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  return res.json({ success: true, count: db.reports.length, reports: db.reports });
});

// Admin update report status & resolution notes
router.patch('/:id', authenticate, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found.' });
  }

  const { status, adminResponse } = req.body;
  if (status) report.status = status;
  if (adminResponse !== undefined) report.adminResponse = adminResponse.trim();

  // If resolved and reportedUser exists, notify reported user or take action
  if (status === 'Resolved' && report.reportedBy) {
    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: report.reportedBy,
      type: 'MESSAGE',
      title: 'Report Resolution Update',
      message: `Your report regarding "${report.type}" has been resolved by administration: ${report.adminResponse || 'Action taken.'}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  db.persist();

  return res.json({ success: true, message: 'Report status updated.', report });
});

export default router;
