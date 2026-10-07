import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { Message, WorkSubmission, PortfolioItem } from '../types.ts';

const router = Router();

// Get messages for a project workspace
router.get('/:projectId/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const messages = db.messages.filter((m) => m.projectId === project.id);
  return res.json({ success: true, count: messages.length, messages });
});

// Send a message in a project workspace
router.post('/:projectId/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { content, attachment } = req.body;
  if (!content && !attachment) {
    return res.status(400).json({ success: false, message: 'Message content or attachment is required.' });
  }

  const recipientId = project.clientId === user.id ? project.freelancerId : project.clientId;

  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId: project.id,
    senderId: user.id,
    senderName: user.name,
    senderAvatar: user.profileImage,
    receiverId: recipientId || '',
    content: content || (attachment ? `Shared file: ${attachment.name}` : ''),
    attachment: attachment || undefined,
    timestamp: new Date().toISOString(),
  };

  db.messages.push(newMessage);

  // If there is an attachment, also add to project workspace files
  if (attachment) {
    project.attachments.push(attachment);
  }

  // Notify recipient
  if (recipientId) {
    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: recipientId,
      type: 'MESSAGE',
      title: `New message from ${user.name}`,
      message: `${user.name} sent a message in "${project.title}".`,
      link: `/projects/${project.id}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  db.persist();

  return res.status(201).json({ success: true, message: newMessage });
});

// Upload/Share file in workspace
router.post('/:projectId/attachments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const { name, url, size } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'File name is required.' });
  }

  const attachment = {
    name: name.trim(),
    url: url || '#',
    size: size || '1.2 MB',
  };

  project.attachments.push(attachment);

  // Add system message
  db.messages.push({
    id: `msg_file_${Date.now()}`,
    projectId: project.id,
    senderId: req.user!.id,
    senderName: req.user!.name,
    senderAvatar: '',
    receiverId: '',
    content: `Uploaded file: ${attachment.name} (${attachment.size})`,
    attachment,
    timestamp: new Date().toISOString(),
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'File shared in workspace.',
    attachments: project.attachments,
  });
});

// Submit Work for Review (Freelancer)
router.post('/:projectId/submit-work', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  // Must be freelancer or participant
  if (project.freelancerId !== req.user?.id && project.clientId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized to submit work.' });
  }

  const { description, files, notes } = req.body;
  if (!description) {
    return res.status(400).json({ success: false, message: 'Please describe the deliverables submitted.' });
  }

  const version = (project.submissions?.length || 0) + 1;
  const isResubmission = project.status === 'REVISION_REQUESTED';

  const newSubmission: WorkSubmission = {
    id: `sub_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    description: description.trim(),
    files: Array.isArray(files) ? files : [],
    notes: notes ? notes.trim() : '',
    version,
  };

  if (!project.submissions) {
    project.submissions = [];
  }

  project.submissions.unshift(newSubmission);
  project.status = isResubmission ? 'RESUBMITTED' : 'SUBMITTED';
  project.progress = 90;

  // Notify client
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: project.clientId,
    type: 'WORK_SUBMITTED',
    title: isResubmission ? 'Work Resubmitted' : 'Work Submitted for Review',
    message: `${project.freelancerName || 'Freelancer'} submitted deliverables (v${version}) for "${project.title}". Review and accept or request revisions.`,
    link: `/projects/${project.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.json({
    success: true,
    message: isResubmission ? 'Work resubmitted for client review!' : 'Work submitted for client review!',
    project,
    submission: newSubmission,
  });
});

// Client Review: Accept Work or Request Revision
router.post('/:projectId/review-work', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  if (project.clientId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only the project owner can review submitted work.' });
  }

  const { action, revisionComments } = req.body; // 'ACCEPT' | 'REVISION'

  if (action === 'REVISION') {
    if (!revisionComments) {
      return res.status(400).json({ success: false, message: 'Please specify revision requirements and comments.' });
    }

    project.status = 'REVISION_REQUESTED';
    project.progress = 75;

    if (project.submissions && project.submissions.length > 0) {
      project.submissions[0].revisionNotes = revisionComments;
    }

    if (project.freelancerId) {
      db.notifications.push({
        id: `notif_${Date.now()}`,
        userId: project.freelancerId,
        type: 'REVISION_REQUESTED',
        title: 'Revision Requested',
        message: `${project.clientName} requested revisions for "${project.title}". Comment: ${revisionComments}`,
        link: `/projects/${project.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.persist();

    return res.json({
      success: true,
      message: 'Revision requested. The freelancer has been notified.',
      project,
    });
  } else if (action === 'ACCEPT') {
    // Accepted
    if (project.mode === 'SKILL_EXCHANGE') {
      project.status = 'EXCHANGE_COMPLETED';
      project.progress = 100;
    } else {
      // Paid project: accepted, pending simulated payment
      project.status = 'ACCEPTED';
      project.progress = 100;
    }

    if (project.freelancerId) {
      db.notifications.push({
        id: `notif_${Date.now()}`,
        userId: project.freelancerId,
        type: 'PROJECT_ACCEPTED',
        title: 'Deliverables Accepted!',
        message: `${project.clientName} accepted your deliverables for "${project.title}"! Project is complete.`,
        link: `/projects/${project.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.persist();

    return res.json({
      success: true,
      message:
        project.mode === 'SKILL_EXCHANGE'
          ? 'Work accepted! Skill exchange successfully completed.'
          : 'Work accepted! Please proceed to simulated payment to release funds to the freelancer.',
      project,
    });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid action. Must be ACCEPT or REVISION.' });
  }
});

// Add Completed Project to Freelancer Portfolio (Section 18)
router.post('/:projectId/add-to-portfolio', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const freelancer = db.users.find((u) => u.id === req.user?.id);
  if (!freelancer) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { title, description, skills, projectUrl } = req.body;

  const newPortItem: PortfolioItem = {
    id: `port_proj_${Date.now()}`,
    title: title || project.title,
    description: description || project.description,
    skills: Array.isArray(skills) && skills.length > 0 ? skills : project.requiredSkills,
    projectUrl: projectUrl || '',
    completedAt: new Date().toISOString().split('T')[0],
  };

  freelancer.portfolio.unshift(newPortItem);
  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Completed project added to your portfolio!',
    portfolio: freelancer.portfolio,
  });
});

export default router;
