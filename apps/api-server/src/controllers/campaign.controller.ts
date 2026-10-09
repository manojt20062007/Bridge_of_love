import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { CreateCampaignSchema, UpdateCampaignSchema } from '@bridge-of-love/validation';
import { AuditService } from '../services/audit.service.js';
import { CampaignStatus } from '@prisma/client';

export class CampaignController {
  static async getCampaigns(req: Request, res: Response) {
    const status = (req.query.status as CampaignStatus) || undefined;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const featured = req.query.featured === 'true' ? true : undefined;

    const where: any = {};
    if (status && status !== ('ALL' as any)) {
      where.status = status;
    } else if (!req.user?.roles.includes('ADMIN')) {
      where.status = CampaignStatus.ACTIVE;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: campaigns,
    });
  }

  static async getCampaignBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        donations: {
          where: { status: 'PAID', isAnonymous: false },
          select: {
            id: true,
            donorName: true,
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Campaign not found' },
      });
    }

    res.json({
      success: true,
      data: campaign,
    });
  }

  static async createCampaign(req: Request, res: Response) {
    const validated = CreateCampaignSchema.parse(req.body);

    const existing = await prisma.campaign.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'A campaign with this URL slug already exists' },
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...validated,
        status: CampaignStatus.ACTIVE,
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'CAMPAIGN_CREATED',
      entityType: 'CAMPAIGN',
      entityId: campaign.id,
      newValues: validated,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    });
  }

  static async updateCampaign(req: Request, res: Response) {
    const { id } = req.params;
    const validated = UpdateCampaignSchema.parse(req.body);

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Campaign not found' },
      });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: validated,
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'CAMPAIGN_UPDATED',
      entityType: 'CAMPAIGN',
      entityId: id,
      oldValues: existing,
      newValues: validated,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: updated,
    });
  }

  static async deleteCampaign(req: Request, res: Response) {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { donations: true } } },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Campaign not found' },
      });
    }

    if (campaign._count.donations > 0) {
      // Do not hard delete campaigns with existing financial donations
      const archived = await prisma.campaign.update({
        where: { id },
        data: { status: CampaignStatus.COMPLETED },
      });

      return res.json({
        success: true,
        message: 'Campaign has historical donations; marked as COMPLETED instead of deleting.',
        data: archived,
      });
    }

    await prisma.campaign.delete({ where: { id } });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'CAMPAIGN_DELETED',
      entityType: 'CAMPAIGN',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  }
}
