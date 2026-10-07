import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { Payment } from '../types.ts';

const router = Router();

// Process Simulated Payment
router.post('/demo', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, method = 'Card' } = req.body;

  if (!projectId) {
    return res.status(400).json({ success: false, message: 'Project ID is required.' });
  }

  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  if (project.clientId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only the project owner can release payment.' });
  }

  if (!project.freelancerId) {
    return res.status(400).json({ success: false, message: 'Cannot process payment: No freelancer assigned.' });
  }

  const txnId = `TXN_SIM_${Date.now().toString().slice(-8)}`;

  const newPayment: Payment = {
    id: `pay_${Date.now()}`,
    projectId: project.id,
    projectTitle: project.title,
    clientId: project.clientId,
    clientName: project.clientName,
    freelancerId: project.freelancerId,
    freelancerName: project.freelancerName || 'Freelancer',
    amount: project.budget,
    method: method,
    transactionId: txnId,
    status: 'Completed',
    createdAt: new Date().toISOString(),
  };

  db.payments.unshift(newPayment);
  project.status = 'COMPLETED';
  project.progress = 100;

  // Add system payment message to chat
  db.messages.push({
    id: `msg_pay_${Date.now()}`,
    projectId: project.id,
    senderId: project.clientId,
    senderName: project.clientName,
    senderAvatar: project.clientAvatar,
    receiverId: project.freelancerId,
    content: `[Demo Payment Receipt] Released simulated payment of $${project.budget.toLocaleString()} via ${method} (Txn: ${txnId}). Project marked Completed!`,
    timestamp: new Date().toISOString(),
  });

  // Notify freelancer
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: project.freelancerId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received (Simulated)',
    message: `${project.clientName} released $${project.budget.toLocaleString()} for "${project.title}". Txn: ${txnId}. Please leave a client review!`,
    link: `/projects/${project.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Demo payment completed successfully! Escrow released to freelancer.',
    payment: newPayment,
    project,
  });
});

// Get payment receipt for project
router.get('/project/:projectId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const payment = db.payments.find((p) => p.projectId === req.params.projectId);
  return res.json({ success: true, payment: payment || null });
});

// List all transactions for current user or admin
router.get('/transactions', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  let txns = db.payments;

  if (req.user?.role !== 'ADMIN') {
    txns = txns.filter((p) => p.clientId === userId || p.freelancerId === userId);
  }

  return res.json({ success: true, count: txns.length, transactions: txns });
});

export default router;
