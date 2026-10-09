import { Router } from 'express';
import { ContentController } from '../controllers/content.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Public Content
router.get('/activities', ContentController.getActivities);
router.get('/activities/:slug', ContentController.getActivityBySlug);
router.get('/gallery', ContentController.getGallery);
router.get('/testimonials', ContentController.getTestimonials);
router.post('/testimonials', ContentController.createTestimonial);
router.post('/contact', ContentController.submitContactMessage);

// Protected Admin Content Management
router.post('/activities', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.createActivity);
router.patch('/activities/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.updateActivity);
router.delete('/activities/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.deleteActivity);

router.post('/gallery', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.createGalleryItem);
router.delete('/gallery/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.deleteGalleryItem);

router.patch('/testimonials/:id/approve', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.approveTestimonial);
router.get('/contact-messages', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.getContactMessages);
router.patch('/contact-messages/:id/read', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ContentController.markMessageRead);

export default router;
