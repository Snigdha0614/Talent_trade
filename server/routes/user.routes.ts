import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { UserSkill, Education, Experience, PortfolioItem } from '../types.ts';

const router = Router();

// Get public user profile by ID
router.get('/profile/:id', (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { passwordHash, ...safeUser } = user;
  const userServices = db.services.filter((s) => s.freelancerId === user.id && s.status === 'PUBLISHED');
  const userReviews = db.reviews.filter((r) => r.revieweeId === user.id);

  return res.json({
    success: true,
    user: safeUser,
    services: userServices,
    reviews: userReviews,
  });
});

// Update current user profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    name,
    title,
    bio,
    location,
    hourlyRate,
    availability,
    profileImage,
    education,
    experience,
    certifications,
  } = req.body;

  if (name !== undefined) user.name = name.trim();
  if (title !== undefined) user.title = title.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (location !== undefined) user.location = location.trim();
  if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate) || 0;
  if (availability !== undefined) user.availability = availability;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (education !== undefined && Array.isArray(education)) user.education = education;
  if (experience !== undefined && Array.isArray(experience)) user.experience = experience;
  if (certifications !== undefined && Array.isArray(certifications)) user.certifications = certifications;

  db.persist();

  const { passwordHash, ...safeUser } = user;
  return res.json({ success: true, message: 'Profile updated successfully.', user: safeUser });
});

// Add skill to current profile
router.post('/profile/skills', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, category, level } = req.body;
  if (!name || !level) {
    return res.status(400).json({ success: false, message: 'Skill name and level are required.' });
  }

  const existing = user.skills.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    existing.level = level;
    if (category) existing.category = category;
    db.persist();
    return res.json({ success: true, message: 'Skill level updated.', skills: user.skills });
  }

  const newSkill: UserSkill = {
    id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    name: name.trim(),
    category: category ? category.trim() : 'General',
    level: level,
  };

  user.skills.push(newSkill);
  db.persist();

  return res.status(201).json({ success: true, message: 'Skill added to profile.', skills: user.skills });
});

// Edit skill
router.put('/profile/skills/:skillId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const skill = user.skills.find((s) => s.id === req.params.skillId);
  if (!skill) {
    return res.status(404).json({ success: false, message: 'Skill not found in profile.' });
  }

  const { name, category, level } = req.body;
  if (name) skill.name = name.trim();
  if (category) skill.category = category.trim();
  if (level) skill.level = level;

  db.persist();
  return res.json({ success: true, message: 'Skill modified.', skills: user.skills });
});

// Remove skill
router.delete('/profile/skills/:skillId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.skills = user.skills.filter((s) => s.id !== req.params.skillId);
  db.persist();
  return res.json({ success: true, message: 'Skill removed.', skills: user.skills });
});

// Add portfolio project
router.post('/profile/portfolio', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { title, description, skills, projectUrl, completedAt } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Project title and description are required.' });
  }

  const newPortItem: PortfolioItem = {
    id: `port_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    title: title.trim(),
    description: description.trim(),
    skills: Array.isArray(skills) ? skills : [],
    projectUrl: projectUrl || '',
    completedAt: completedAt || new Date().toISOString().split('T')[0],
  };

  user.portfolio.unshift(newPortItem);
  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Project added to your portfolio.',
    portfolio: user.portfolio,
  });
});

// Delete portfolio item
router.delete('/profile/portfolio/:portId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.portfolio = user.portfolio.filter((p) => p.id !== req.params.portId);
  db.persist();
  return res.json({ success: true, message: 'Portfolio item deleted.', portfolio: user.portfolio });
});

// List freelancers with multi-filtering
router.get('/freelancers', (req: Request, res: Response) => {
  const { search, skill, level, minRating, availability, category } = req.query;

  let freelancers = db.users.filter((u) => u.role === 'FREELANCER' && !u.isSuspended);

  if (search) {
    const q = String(search).toLowerCase();
    freelancers = freelancers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.title && f.title.toLowerCase().includes(q)) ||
        f.bio.toLowerCase().includes(q) ||
        f.skills.some((s) => s.name.toLowerCase().includes(q))
    );
  }

  if (skill) {
    const sName = String(skill).toLowerCase();
    freelancers = freelancers.filter((f) => f.skills.some((s) => s.name.toLowerCase() === sName));
  }

  if (level) {
    freelancers = freelancers.filter((f) => f.skills.some((s) => s.level.toLowerCase() === String(level).toLowerCase()));
  }

  if (category) {
    freelancers = freelancers.filter((f) =>
      f.skills.some((s) => s.category.toLowerCase().includes(String(category).toLowerCase()))
    );
  }

  if (minRating) {
    const r = Number(minRating);
    freelancers = freelancers.filter((f) => f.rating >= r);
  }

  if (availability) {
    freelancers = freelancers.filter((f) => f.availability === availability);
  }

  const sanitized = freelancers.map(({ passwordHash, ...safe }) => safe);
  return res.json({ success: true, count: sanitized.length, freelancers: sanitized });
});

// List clients
router.get('/clients', (req: Request, res: Response) => {
  const clients = db.users
    .filter((u) => u.role === 'CLIENT' && !u.isSuspended)
    .map(({ passwordHash, ...safe }) => safe);
  return res.json({ success: true, clients });
});

export default router;
