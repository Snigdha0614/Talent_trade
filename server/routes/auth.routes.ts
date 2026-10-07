import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { User } from '../types.ts';

const router = Router();

// Register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (role !== 'FREELANCER' && role !== 'CLIENT') {
    return res.status(400).json({ success: false, message: 'Role must be either Freelancer or Client.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: role,
    profileImage:
      role === 'FREELANCER'
        ? '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'
        : '/src/assets/images/avatar_client_marcus_1790830259951.jpg',
    bio: '',
    location: '',
    title: role === 'FREELANCER' ? 'Independent Specialist' : 'Project Sponsor',
    education: [],
    experience: [],
    certifications: [],
    skills: [],
    portfolio: [],
    availability: 'Available',
    rating: 5.0,
    reviewCount: 0,
    isSuspended: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.persist();

  // Initial welcome notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: newUser.id,
    type: 'MESSAGE',
    title: 'Welcome to TalentTrade',
    message: `Welcome, ${newUser.name}! Set up your profile to start ${newUser.role === 'FREELANCER' ? 'offering services and bidding on projects' : 'posting projects and finding top talent'}.`,
    link: '/profile',
    read: false,
    createdAt: new Date().toISOString(),
  });
  db.persist();

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  return res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to TalentTrade.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profileImage: newUser.profileImage,
      title: newUser.title,
    },
  });
});

// Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact admin.' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      title: user.title,
    },
  });
});

// Demo Instant Switch Login
router.post('/demo-login', (req: Request, res: Response) => {
  const { role } = req.body; // 'freelancer' | 'client' | 'admin'
  let targetEmail = 'freelancer@talenttrade.demo';

  if (role === 'client') {
    targetEmail = 'client@talenttrade.demo';
  } else if (role === 'admin') {
    targetEmail = 'admin@talenttrade.demo';
  }

  const user = db.users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'Demo account not found' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return res.json({
    success: true,
    message: `Logged in as demo ${user.role.toLowerCase()}: ${user.name}`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      title: user.title,
    },
  });
});

// Get Current User Profile & Session
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { passwordHash, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Forgot Password (Simulated)
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // For privacy, don't confirm non-existence
    return res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been dispatched.',
    });
  }

  return res.json({
    success: true,
    message: `A simulated password reset link has been dispatched to ${email}. In demo mode, use password Demo@123.`,
  });
});

export default router;
