import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { Review } from '../types.ts';

const router = Router();

// Submit rating and review
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const reviewer = db.users.find((u) => u.id === req.user?.id);
  if (!reviewer) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { projectId, revieweeId, rating, comment } = req.body;

  if (!projectId || !revieweeId || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Please provide rating (1-5 stars), review comment, and project ID.',
    });
  }

  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const reviewee = db.users.find((u) => u.id === revieweeId);
  if (!reviewee) {
    return res.status(404).json({ success: false, message: 'Reviewee user not found.' });
  }

  // Prevent multiple reviews by the same user on the same project
  const existingReview = db.reviews.find(
    (r) => r.projectId === projectId && r.reviewerId === reviewer.id
  );
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted a review for this project.',
    });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating)));

  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId: project.id,
    projectTitle: project.title,
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    reviewerAvatar: reviewer.profileImage,
    reviewerRole: reviewer.role,
    revieweeId: reviewee.id,
    rating: numRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate reviewee average rating
  const allReviewsForUser = db.reviews.filter((r) => r.revieweeId === reviewee.id);
  const total = allReviewsForUser.reduce((acc, curr) => acc + curr.rating, 0);
  reviewee.rating = Number((total / allReviewsForUser.length).toFixed(1));
  reviewee.reviewCount = allReviewsForUser.length;

  // Also update service rating if freelancer
  if (reviewee.role === 'FREELANCER') {
    db.services
      .filter((s) => s.freelancerId === reviewee.id)
      .forEach((s) => {
        s.freelancerRating = reviewee.rating;
      });
  }

  // Notify reviewee
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: reviewee.id,
    type: 'REVIEW_RECEIVED',
    title: 'New Review Received!',
    message: `${reviewer.name} left you a ${numRating}-star review: "${comment.slice(0, 50)}..."`,
    link: `/profile/${reviewee.id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Review submitted successfully! Thank you for your feedback.',
    review: newReview,
    updatedRating: reviewee.rating,
  });
});

// Get reviews received by a user
router.get('/user/:userId', (req: Request, res: Response) => {
  const reviews = db.reviews.filter((r) => r.revieweeId === req.params.userId);
  return res.json({ success: true, count: reviews.length, reviews });
});

export default router;
