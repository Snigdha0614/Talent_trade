import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { Project, ProjectTask } from '../types.ts';

const router = Router();

// List projects
router.get('/', (req: Request, res: Response) => {
  const {
    clientId,
    freelancerId,
    mode,
    status,
    category,
    search,
    myProjects,
  } = req.query;

  let projects = db.projects;

  if (clientId) {
    projects = projects.filter((p) => p.clientId === clientId);
  }

  if (freelancerId) {
    projects = projects.filter((p) => p.freelancerId === freelancerId);
  }

  if (mode && mode !== 'ALL') {
    projects = projects.filter((p) => p.mode === mode);
  }

  if (status && status !== 'ALL') {
    projects = projects.filter((p) => p.status === status);
  }

  if (category && category !== 'All') {
    projects = projects.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: projects.length, projects });
});

// Get project details by ID
router.get('/:id', (req: Request, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const proposals = db.proposals.filter((pr) => pr.projectId === project.id);
  const client = db.users.find((u) => u.id === project.clientId);
  const freelancer = project.freelancerId ? db.users.find((u) => u.id === project.freelancerId) : null;

  return res.json({
    success: true,
    project,
    proposals,
    client: client
      ? {
          id: client.id,
          name: client.name,
          profileImage: client.profileImage,
          rating: client.rating,
          location: client.location,
        }
      : null,
    freelancer: freelancer
      ? {
          id: freelancer.id,
          name: freelancer.name,
          profileImage: freelancer.profileImage,
          rating: freelancer.rating,
          title: freelancer.title,
        }
      : null,
  });
});

// Create new project (Client only)
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    title,
    description,
    category,
    requiredSkills,
    budget,
    deadline,
    mode = 'PAID',
    attachments,
    clientOfferedSkill,
    freelancerOfferedSkill,
    exchangeTerms,
    freelancerId,
    status = 'PUBLISHED',
  } = req.body;

  if (!title || !description || !category || !deadline) {
    return res.status(400).json({
      success: false,
      message: 'Please provide project title, description, category, and deadline.',
    });
  }

  if (mode === 'PAID' && (budget === undefined || Number(budget) < 0)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid budget for paid projects.' });
  }

  const assignedFreelancer = req.body.freelancerId
    ? db.users.find((u) => u.id === req.body.freelancerId)
    : null;

  const newProject: Project = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId: user.id,
    clientName: user.name,
    clientAvatar: user.profileImage,
    freelancerId: assignedFreelancer ? assignedFreelancer.id : undefined,
    freelancerName: assignedFreelancer ? assignedFreelancer.name : undefined,
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    budget: mode === 'PAID' ? Number(budget) : 0,
    deadline: deadline,
    mode: mode === 'SKILL_EXCHANGE' ? 'SKILL_EXCHANGE' : 'PAID',
    status: assignedFreelancer ? 'IN_PROGRESS' : status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
    progress: assignedFreelancer ? 15 : 0,
    tasks: assignedFreelancer
      ? [
          {
            id: `task_${Date.now()}_1`,
            title: 'Initial Kickoff & Requirements Alignment',
            description: 'Clarify project scope, deliverables, and timeline milestones.',
            assignedTo: assignedFreelancer.id,
            assignedToName: assignedFreelancer.name,
            deadline: deadline,
            status: 'Completed',
          },
          {
            id: `task_${Date.now()}_2`,
            title: 'Primary Deliverable Implementation',
            description: 'Core project work based on agreed specifications.',
            assignedTo: assignedFreelancer.id,
            assignedToName: assignedFreelancer.name,
            deadline: deadline,
            status: 'In Progress',
          },
        ]
      : [],
    submissions: [],
    attachments: Array.isArray(attachments) ? attachments : [],
    clientOfferedSkill,
    freelancerOfferedSkill,
    exchangeTerms,
    createdAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  db.persist();

  return res.status(201).json({
    success: true,
    message: status === 'DRAFT' ? 'Project draft saved.' : 'Project posted successfully!',
    project: newProject,
  });
});

// Add Task to Project Workspace
router.post('/:id/tasks', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  // Check participation
  const isParticipant =
    project.clientId === req.user?.id || project.freelancerId === req.user?.id || req.user?.role === 'ADMIN';
  if (!isParticipant) {
    return res.status(403).json({ success: false, message: 'Unauthorized to add tasks to this workspace.' });
  }

  const { title, description, assignedTo, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required.' });
  }

  const assignee = db.users.find((u) => u.id === assignedTo) || req.user!;

  const newTask: ProjectTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    assignedTo: assignee.id,
    assignedToName: assignee.name,
    deadline: deadline || project.deadline,
    status: 'Pending',
  };

  project.tasks.push(newTask);
  db.persist();

  return res.status(201).json({ success: true, message: 'Task added.', task: newTask, tasks: project.tasks });
});

// Update Task Status
router.patch('/:id/tasks/:taskId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const task = project.tasks.find((t) => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const { status } = req.body;
  if (status) {
    task.status = status;
  }

  // Recalculate project progress based on tasks if present
  if (project.tasks.length > 0) {
    const completed = project.tasks.filter((t) => t.status === 'Completed').length;
    project.progress = Math.round((completed / project.tasks.length) * 100);
  }

  db.persist();
  return res.json({ success: true, message: 'Task updated.', tasks: project.tasks, progress: project.progress });
});

export default router;
