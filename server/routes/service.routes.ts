import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';
import { Service } from '../types.ts';

const router = Router();

// Search and filter services
router.get('/', (req: Request, res: Response) => {
  const {
    search,
    category,
    skill,
    minPrice,
    maxPrice,
    maxDeliveryTime,
    minRating,
    freelancerId,
    status,
  } = req.query;

  let services = db.services;

  // By default, public list only shows published services unless filtered by owner
  if (status) {
    services = services.filter((s) => s.status === status);
  } else if (!freelancerId) {
    services = services.filter((s) => s.status === 'PUBLISHED');
  }

  if (freelancerId) {
    services = services.filter((s) => s.freelancerId === freelancerId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    services = services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.freelancerName.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    services = services.filter((s) => s.category.toLowerCase() === String(category).toLowerCase());
  }

  if (skill) {
    services = services.filter((s) =>
      s.skills.some((sk) => sk.toLowerCase() === String(skill).toLowerCase())
    );
  }

  if (minPrice) {
    services = services.filter((s) => s.price >= Number(minPrice));
  }

  if (maxPrice) {
    services = services.filter((s) => s.price <= Number(maxPrice));
  }

  if (maxDeliveryTime) {
    services = services.filter((s) => s.deliveryTimeDays <= Number(maxDeliveryTime));
  }

  if (minRating) {
    services = services.filter((s) => s.freelancerRating >= Number(minRating));
  }

  return res.json({ success: true, count: services.length, services });
});

// Get single service by ID
router.get('/:id', (req: Request, res: Response) => {
  const service = db.services.find((s) => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  // Increment view counter
  service.views += 1;
  db.persist();

  const freelancer = db.users.find((u) => u.id === service.freelancerId);
  const reviews = db.reviews.filter((r) => r.revieweeId === service.freelancerId);

  return res.json({
    success: true,
    service,
    freelancer: freelancer
      ? {
          id: freelancer.id,
          name: freelancer.name,
          profileImage: freelancer.profileImage,
          bio: freelancer.bio,
          title: freelancer.title,
          rating: freelancer.rating,
          reviewCount: freelancer.reviewCount,
          location: freelancer.location,
          availability: freelancer.availability,
        }
      : null,
    reviews,
  });
});

// Create new service (Freelancer only)
router.post('/', authenticate, requireRole('FREELANCER'), (req: AuthenticatedRequest, res: Response) => {
  const freelancer = db.users.find((u) => u.id === req.user?.id);
  if (!freelancer) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    title,
    description,
    category,
    skills,
    price,
    deliveryTimeDays,
    sampleWorkUrls,
    portfolio,
    availability,
    status = 'PUBLISHED',
  } = req.body;

  if (!title || !description || !category || !price || !deliveryTimeDays) {
    return res.status(400).json({
      success: false,
      message: 'Please provide Title, Description, Category, Price, and Delivery Time.',
    });
  }

  const newService: Service = {
    id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    freelancerId: freelancer.id,
    freelancerName: freelancer.name,
    freelancerAvatar: freelancer.profileImage,
    freelancerRating: freelancer.rating,
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    skills: Array.isArray(skills) ? skills : [],
    price: Number(price),
    deliveryTimeDays: Number(deliveryTimeDays),
    sampleWorkUrls: Array.isArray(sampleWorkUrls) ? sampleWorkUrls : [],
    portfolio: Array.isArray(portfolio) ? portfolio : [],
    availability: availability || 'Available',
    status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
    views: 0,
    ordersCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.services.unshift(newService);
  db.persist();

  return res.status(201).json({
    success: true,
    message: status === 'DRAFT' ? 'Service draft saved successfully.' : 'Service published successfully and is now live!',
    service: newService,
  });
});

// Update service
router.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const service = db.services.find((s) => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  if (service.freelancerId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized to modify this service.' });
  }

  const {
    title,
    description,
    category,
    skills,
    price,
    deliveryTimeDays,
    sampleWorkUrls,
    availability,
    status,
  } = req.body;

  if (title) service.title = title.trim();
  if (description) service.description = description.trim();
  if (category) service.category = category.trim();
  if (skills && Array.isArray(skills)) service.skills = skills;
  if (price !== undefined) service.price = Number(price);
  if (deliveryTimeDays !== undefined) service.deliveryTimeDays = Number(deliveryTimeDays);
  if (sampleWorkUrls && Array.isArray(sampleWorkUrls)) service.sampleWorkUrls = sampleWorkUrls;
  if (availability) service.availability = availability;
  if (status) service.status = status;

  db.persist();

  return res.json({ success: true, message: 'Service updated successfully.', service });
});

// Delete service
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const index = db.services.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  const service = db.services[index];
  if (service.freelancerId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this service.' });
  }

  db.services.splice(index, 1);
  db.persist();

  return res.json({ success: true, message: 'Service deleted.' });
});

export default router;
