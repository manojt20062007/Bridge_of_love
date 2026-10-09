import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { UpdateProfileSchema } from '@bridge-of-love/validation';
import { ReceiptService } from '../services/receipt.service.js';
import { AuditService } from '../services/audit.service.js';

export class MemberController {
  static async getProfile(req: Request, res: Response) {
    const userId = req.user!.id;

    const profile = await prisma.memberProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Member profile not found' },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const validated = UpdateProfileSchema.parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      if (validated.mobile) {
        await tx.user.update({
          where: { id: userId },
          data: { mobile: validated.mobile },
        });
      }

      return await tx.memberProfile.update({
        where: { userId },
        data: {
          fullName: validated.fullName,
          address: validated.address,
          city: validated.city,
          state: validated.state,
          postalCode: validated.postalCode,
          panNumber: validated.panNumber,
        },
      });
    });

    await AuditService.record({
      userId,
      userName: req.user!.fullName,
      action: 'MEMBER_PROFILE_UPDATED',
      entityType: 'MEMBER_PROFILE',
      entityId: updated.id,
      newValues: validated,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  }

  static async getMyDonations(req: Request, res: Response) {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string || '10', 10)));
    const status = req.query.status as string | undefined;

    const where: any = { userId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: { id: true, title: true, slug: true },
          },
          receipt: {
            select: { id: true, receiptNumber: true, status: true, issueDate: true },
          },
        },
      }),
    ]);

    // Member total donations metric
    const totalContributed = await prisma.donation.aggregate({
      where: { userId, status: 'PAID' },
      _sum: { amount: true },
    });

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalContributed: Number(totalContributed._sum.amount || 0),
      },
    });
  }

  static async getMyReceipts(req: Request, res: Response) {
    const user = req.user!;
    const receipts = await prisma.receipt.findMany({
      where: {
        donation: {
          userId: user.id,
        },
      },
      orderBy: { issueDate: 'desc' },
      include: {
        donation: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            createdAt: true,
            campaign: { select: { title: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: receipts,
    });
  }

  static async downloadReceipt(req: Request, res: Response) {
    const { receiptId } = req.params;
    const user = req.user!;

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { donation: true },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: { code: 'RECEIPT_NOT_FOUND', message: 'Receipt not found' },
      });
    }

    // RBAC: Verify ownership or admin permission
    const isOwner = receipt.donation.userId === user.id || receipt.donorEmail === user.email;
    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to download this donation receipt.',
        },
      });
    }

    try {
      const pdfBuffer = await ReceiptService.generateReceiptPDF(receipt.id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Donation_Receipt_${receipt.receiptNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'PDF_GENERATION_FAILED', message: err.message },
      });
    }
  }
}
