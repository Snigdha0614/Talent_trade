import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { SkillExchangeRequest, Project } from '../types.ts';

const router = Router();

// Get skill exchange requests for current user (both sent & received)
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const requests = db.exchanges.filter(
    (ex) => ex.senderId === userId || ex.receiverId === userId
  );
  return res.json({ success: true, count: requests.length, exchanges: requests });
});

// Create new Skill Exchange Request
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const sender = db.users.find((u) => u.id === req.user?.id);
  if (!sender) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    receiverId,
    offeredSkill,
    requestedSkill,
    description,
    durationDays = 7,
    exchangeTerms,
  } = req.body;

  if (!receiverId || !offeredSkill || !requestedSkill || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide recipient, offered skill, requested skill, and description.',
    });
  }

  if (receiverId === sender.id) {
    return res.status(400).json({ success: false, message: 'Cannot exchange skills with yourself.' });
  }

  const receiver = db.users.find((u) => u.id === receiverId);
  if (!receiver) {
    return res.status(404).json({ success: false, message: 'Recipient not found.' });
  }

  const newExchange: SkillExchangeRequest = {
    id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.profileImage,
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverAvatar: receiver.profileImage,
    offeredSkill: offeredSkill.trim(),
    requestedSkill: requestedSkill.trim(),
    description: description.trim(),
    durationDays: Number(durationDays),
    exchangeTerms: exchangeTerms ? exchangeTerms.trim() : `Exchange ${offeredSkill} for ${requestedSkill}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.exchanges.unshift(newExchange);

  // Notify receiver
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: receiver.id,
    type: 'EXCHANGE_REQUEST',
    title: 'New Skill Exchange Proposal',
    message: `${sender.name} proposed to barter "${offeredSkill}" in exchange for your "${requestedSkill}".`,
    link: '/skill-exchange',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Skill exchange request sent successfully! You will be notified once accepted.',
    exchange: newExchange,
  });
});

// Accept Skill Exchange Request -> Automatically creates a Skill Exchange Project Workspace
router.patch('/:id/accept', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const exchange = db.exchanges.find((ex) => ex.id === req.params.id);
  if (!exchange) {
    return res.status(404).json({ success: false, message: 'Exchange request not found.' });
  }

  if (exchange.receiverId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only the recipient can accept this exchange request.' });
  }

  const sender = db.users.find((u) => u.id === exchange.senderId);
  const receiver = db.users.find((u) => u.id === exchange.receiverId);

  if (!sender || !receiver) {
    return res.status(404).json({ success: false, message: 'Users involved in this exchange not found.' });
  }

  exchange.status = 'ACCEPTED';

  // Calculate deadline
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + (exchange.durationDays || 7));

  // Determine Client / Freelancer labeling for the shared workspace
  // Sender is initiator (client), Receiver is collaborator (freelancer)
  const newProject: Project = {
    id: `proj_ex_${Date.now()}`,
    clientId: sender.id,
    clientName: sender.name,
    clientAvatar: sender.profileImage,
    freelancerId: receiver.id,
    freelancerName: receiver.name,
    freelancerAvatar: receiver.profileImage,
    title: `Skill Exchange: ${exchange.offeredSkill} ⇄ ${exchange.requestedSkill}`,
    description: exchange.description,
    category: 'Skill Barter',
    requiredSkills: [exchange.offeredSkill, exchange.requestedSkill],
    budget: 0,
    deadline: deadlineDate.toISOString().split('T')[0],
    mode: 'SKILL_EXCHANGE',
    clientOfferedSkill: exchange.offeredSkill,
    freelancerOfferedSkill: exchange.requestedSkill,
    exchangeTerms: exchange.exchangeTerms,
    status: 'EXCHANGE_IN_PROGRESS',
    progress: 20,
    tasks: [
      {
        id: `task_ex_1_${Date.now()}`,
        title: `${sender.name}: Prepare & Deliver ${exchange.offeredSkill}`,
        description: `Deliver the agreed deliverables for ${exchange.offeredSkill}.`,
        assignedTo: sender.id,
        assignedToName: sender.name,
        deadline: deadlineDate.toISOString().split('T')[0],
        status: 'In Progress',
      },
      {
        id: `task_ex_2_${Date.now()}`,
        title: `${receiver.name}: Prepare & Deliver ${exchange.requestedSkill}`,
        description: `Deliver the reciprocal deliverables for ${exchange.requestedSkill}.`,
        assignedTo: receiver.id,
        assignedToName: receiver.name,
        deadline: deadlineDate.toISOString().split('T')[0],
        status: 'In Progress',
      },
    ],
    submissions: [],
    attachments: [],
    createdAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  exchange.projectId = newProject.id;

  // Add kickoff message
  db.messages.push({
    id: `msg_ex_init_${Date.now()}`,
    projectId: newProject.id,
    senderId: receiver.id,
    senderName: receiver.name,
    senderAvatar: receiver.profileImage,
    receiverId: sender.id,
    content: `Skill exchange confirmed! Let's collaborate on ${exchange.offeredSkill} and ${exchange.requestedSkill}.`,
    timestamp: new Date().toISOString(),
  });

  // Notify sender
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: sender.id,
    type: 'EXCHANGE_REQUEST',
    title: 'Skill Exchange Accepted!',
    message: `${receiver.name} accepted your skill exchange! Project Workspace is now active.`,
    link: `/projects/${newProject.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.json({
    success: true,
    message: 'Skill exchange accepted! Project workspace created.',
    exchange,
    project: newProject,
  });
});

// Reject Skill Exchange Request
router.patch('/:id/reject', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const exchange = db.exchanges.find((ex) => ex.id === req.params.id);
  if (!exchange) {
    return res.status(404).json({ success: false, message: 'Exchange request not found.' });
  }

  if (exchange.receiverId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized action.' });
  }

  exchange.status = 'REJECTED';
  db.persist();

  return res.json({ success: true, message: 'Skill exchange request declined.', exchange });
});

export default router;
