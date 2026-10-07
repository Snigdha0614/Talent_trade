import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { Proposal } from '../types.ts';

const router = Router();

// Submit Proposal for Project (Freelancer only)
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'FREELANCER') {
    return res.status(403).json({ success: false, message: 'Only registered freelancers can submit proposals.' });
  }

  const { projectId, coverLetter, proposedPrice, deliveryTimeDays, relevantSkills, portfolioLinks } = req.body;

  if (!projectId || !coverLetter || !proposedPrice || !deliveryTimeDays) {
    return res.status(400).json({
      success: false,
      message: 'Please provide cover letter, proposed price, and delivery time.',
    });
  }

  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const freelancer = db.users.find((u) => u.id === req.user?.id);
  if (!freelancer) {
    return res.status(404).json({ success: false, message: 'Freelancer profile not found.' });
  }

  // Check if already applied
  const existing = db.proposals.find((p) => p.projectId === projectId && p.freelancerId === freelancer.id);
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this project.' });
  }

  const newProposal: Proposal = {
    id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId,
    freelancerId: freelancer.id,
    freelancerName: freelancer.name,
    freelancerAvatar: freelancer.profileImage,
    freelancerRating: freelancer.rating,
    coverLetter: coverLetter.trim(),
    proposedPrice: Number(proposedPrice),
    deliveryTimeDays: Number(deliveryTimeDays),
    relevantSkills: Array.isArray(relevantSkills) ? relevantSkills : [],
    portfolioLinks: Array.isArray(portfolioLinks) ? portfolioLinks : [],
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.proposals.unshift(newProposal);

  if (project.status === 'PUBLISHED') {
    project.status = 'PROPOSALS_RECEIVED';
  }

  // Notify client
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: project.clientId,
    type: 'PROPOSAL',
    title: 'New Proposal Received',
    message: `${freelancer.name} submitted a proposal for "${project.title}".`,
    link: `/projects/${project.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Proposal submitted successfully! The client has been notified.',
    proposal: newProposal,
  });
});

// Get proposals for a project
router.get('/project/:projectId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const proposals = db.proposals.filter((p) => p.projectId === project.id);
  return res.json({ success: true, count: proposals.length, proposals });
});

// Accept Proposal (Client only)
router.patch('/:id/accept', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const proposal = db.proposals.find((p) => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ success: false, message: 'Proposal not found.' });
  }

  const project = db.projects.find((p) => p.id === proposal.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  if (project.clientId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only the project owner can accept proposals.' });
  }

  const freelancer = db.users.find((u) => u.id === proposal.freelancerId);
  if (!freelancer) {
    return res.status(404).json({ success: false, message: 'Freelancer profile not found.' });
  }

  // Update proposal status
  proposal.status = 'ACCEPTED';

  // Mark all other proposals for this project as REJECTED
  db.proposals
    .filter((p) => p.projectId === project.id && p.id !== proposal.id)
    .forEach((p) => {
      p.status = 'REJECTED';
    });

  // Update project
  project.freelancerId = freelancer.id;
  project.freelancerName = freelancer.name;
  project.freelancerAvatar = freelancer.profileImage;
  project.budget = proposal.proposedPrice;
  project.status = 'IN_PROGRESS';
  project.progress = 10;

  // Add initial kickoff task if tasks are empty
  if (project.tasks.length === 0) {
    project.tasks.push({
      id: `task_init_${Date.now()}`,
      title: 'Initial Project Alignment & Kickoff',
      description: 'Review project requirements and deliver first draft or milestone architecture.',
      assignedTo: freelancer.id,
      assignedToName: freelancer.name,
      deadline: project.deadline,
      status: 'In Progress',
    });
  }

  // Notify freelancer
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: freelancer.id,
    type: 'PROPOSAL',
    title: 'Proposal Accepted! Workspace Active',
    message: `${project.clientName} accepted your proposal for "${project.title}". Your workspace is now ready!`,
    link: `/projects/${project.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.json({
    success: true,
    message: 'Proposal accepted! Project workspace has been activated.',
    project,
    proposal,
  });
});

// Reject Proposal
router.patch('/:id/reject', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const proposal = db.proposals.find((p) => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ success: false, message: 'Proposal not found.' });
  }

  const project = db.projects.find((p) => p.id === proposal.projectId);
  if (!project || (project.clientId !== req.user?.id && req.user?.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, message: 'Unauthorized action.' });
  }

  proposal.status = 'REJECTED';
  db.persist();

  return res.json({ success: true, message: 'Proposal rejected.', proposal });
});

export default router;
