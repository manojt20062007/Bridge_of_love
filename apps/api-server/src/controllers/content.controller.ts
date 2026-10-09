import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ContactFormSchema } from '@bridge-of-love/validation';
import { AuditService } from '../services/audit.service.js';

export class ContentController {
  // ==========================================
  // Activities
  // ==========================================
  static async getActivities(req: Request, res: Response) {
    const isPublic = !req.user?.roles.includes('ADMIN');
    const where = isPublic ? { isPublished: true } : {};

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: activities });
  }

  static async getActivityBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    const activity = await prisma.activity.findUnique({ where: { slug } });

    if (!activity) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } });
    }

    res.json({ success: true, data: activity });
  }

  static async createActivity(req: Request, res: Response) {
    const activity = await prisma.activity.create({
      data: {
        ...req.body,
        date: new Date(req.body.date),
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'ACTIVITY_CREATED',
      entityType: 'ACTIVITY',
      entityId: activity.id,
      newValues: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({ success: true, data: activity });
  }

  static async updateActivity(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      },
    });

    res.json({ success: true, data: updated });
  }

  static async deleteActivity(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.activity.delete({ where: { id } });
    res.json({ success: true, message: 'Activity removed' });
  }

  // ==========================================
  // Gallery
  // ==========================================
  static async getGallery(req: Request, res: Response) {
    const gallery = await prisma.galleryItem.findMany({
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: gallery });
  }

  static async createGalleryItem(req: Request, res: Response) {
    const item = await prisma.galleryItem.create({
      data: {
        ...req.body,
        date: new Date(req.body.date || new Date()),
      },
    });
    res.status(201).json({ success: true, data: item });
  }

  static async deleteGalleryItem(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.galleryItem.delete({ where: { id } });
    res.json({ success: true, message: 'Gallery item removed' });
  }

  // ==========================================
  // Testimonials
  // ==========================================
  static async getTestimonials(req: Request, res: Response) {
    const isPublic = !req.user?.roles.includes('ADMIN');
    const where = isPublic ? { isApproved: true } : {};

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials });
  }

  static async createTestimonial(req: Request, res: Response) {
    const item = await prisma.testimonial.create({
      data: {
        ...req.body,
        isApproved: req.user?.roles.includes('ADMIN') ? true : false,
      },
    });
    res.status(201).json({ success: true, data: item });
  }

  static async approveTestimonial(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isApproved: true },
    });
    res.json({ success: true, data: updated });
  }

  // ==========================================
  // Contact Message Form
  // ==========================================
  static async submitContactMessage(req: Request, res: Response) {
    const validated = ContactFormSchema.parse(req.body);

    const message = await prisma.contactMessage.create({
      data: validated,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Bridge Of Love. Our team will contact you shortly.',
      data: message,
    });
  }

  static async getContactMessages(req: Request, res: Response) {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: messages });
  }

  static async markMessageRead(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true, data: updated });
  }
}
