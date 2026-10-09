import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { LedgerService } from '../services/ledger.service.js';
import { ReceiptService } from '../services/receipt.service.js';
import { AuditService } from '../services/audit.service.js';
import {
  CreateExpenseSchema,
  CreateIncomeSchema,
  OfflineDonationSchema,
  RejectExpenseSchema,
} from '@bridge-of-love/validation';
import {
  ExpenseStatus,
  LedgerEntryType,
  PaymentStatus,
  ReceiptStatus,
  UserStatus,
} from '@prisma/client';

export class AdminController {
  // ==========================================
  // Dashboard & Metrics
  // ==========================================
  static async getDashboardStats(req: Request, res: Response) {
    const summary = await LedgerService.getFinancialSummary();

    const [
      totalMembers,
      activeMembers,
      activeCampaignsCount,
      failedPaymentsCount,
      donationsThisMonthAggregate,
      recentDonations,
      recentExpenses,
    ] = await Promise.all([
      prisma.user.count({
        where: { userRoles: { some: { role: { name: 'MEMBER' } } } },
      }),
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          userRoles: { some: { role: { name: 'MEMBER' } } },
        },
      }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.donation.count({ where: { status: 'FAILED' } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.donation.findMany({
        where: { status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          campaign: { select: { title: true } },
          receipt: { select: { receiptNumber: true } },
        },
      }),
      prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        activeCampaignsCount,
        failedPaymentsCount,
        donationsThisMonth: Number(donationsThisMonthAggregate._sum.amount || 0),
        financial: summary,
        recentDonations,
        recentExpenses,
      },
    });
  }

  // ==========================================
  // Members Management
  // ==========================================
  static async getMembers(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string || '15', 10)));
    const search = req.query.search as string | undefined;
    const status = req.query.status as UserStatus | undefined;

    const where: any = {};
    if (status && status !== ('ALL' as any)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          userRoles: { include: { role: true } },
          _count: {
            select: { donations: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async getMemberById(req: Request, res: Response) {
    const { id } = req.params;

    const member = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
        donations: {
          orderBy: { createdAt: 'desc' },
          include: {
            campaign: { select: { title: true } },
            receipt: true,
          },
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }

    res.json({
      success: true,
      data: member,
    });
  }

  static async updateMemberStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Invalid member status value' },
      });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'MEMBER_STATUS_UPDATED',
      entityType: 'USER',
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: `Member status updated to ${status}`,
      data: updated,
    });
  }

  // ==========================================
  // Donations Management
  // ==========================================
  static async getDonations(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || '20', 10)));
    const search = req.query.search as string | undefined;
    const status = req.query.status as PaymentStatus | undefined;
    const exportCsv = req.query.export === 'csv';

    const where: any = {};
    if (status && status !== ('ALL' as any)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { donorEmail: { contains: search, mode: 'insensitive' } },
        { donorMobile: { contains: search } },
        { receipt: { receiptNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (exportCsv) {
      const items = await prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { title: true } },
          receipt: { select: { receiptNumber: true } },
        },
      });

      let csv = 'Receipt No,Donor Name,Email,Mobile,Amount,Status,Payment Mode,Campaign,Date\n';
      items.forEach((item) => {
        csv += `"${item.receipt?.receiptNumber || '-'}",` +
          `"${item.donorName.replace(/"/g, '""')}",` +
          `"${item.donorEmail}",` +
          `"${item.donorMobile}",` +
          `"${item.amount}",` +
          `"${item.status}",` +
          `"${item.paymentMethod}",` +
          `"${(item.campaign?.title || 'General Corpus').replace(/"/g, '""')}",` +
          `"${new Date(item.createdAt).toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="Donations_Export.csv"');
      return res.send(csv);
    }

    const [total, items] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
          receipt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async recordOfflineDonation(req: Request, res: Response) {
    const validated = OfflineDonationSchema.parse(req.body);

    const donationDate = new Date(validated.donationDate);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Donation Record
      const donation = await tx.donation.create({
        data: {
          donorName: validated.donorName,
          donorEmail: validated.donorEmail,
          donorMobile: validated.donorMobile,
          donorAddress: validated.donorAddress || null,
          donorPan: validated.donorPan || null,
          campaignId: validated.campaignId || null,
          amount: validated.amount,
          currency: 'INR',
          donationType: validated.donationType,
          paymentMethod: validated.paymentMethod,
          status: PaymentStatus.PAID,
          notes: validated.notes || null,
          createdAt: donationDate,
        },
        include: { campaign: true },
      });

      // 2. Increment campaign if attached
      if (donation.campaignId) {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: { raisedAmount: { increment: donation.amount } },
        });
      }

      // 3. Sequential Receipt
      const currentYear = donationDate.getFullYear();
      const tracker = await tx.sequenceTracker.upsert({
        where: { name: 'RECEIPT' },
        update: { lastNumber: { increment: 1 } },
        create: { name: 'RECEIPT', year: currentYear, lastNumber: 1 },
      });
      const receiptNumber = `BOL-${tracker.year}-${tracker.lastNumber.toString().padStart(6, '0')}`;
      const verificationCode = `VER-${receiptNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const amountInWords = (await import('../utils/numberToWords.js')).convertNumberToIndianWords(Number(donation.amount));

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          donationId: donation.id,
          issueDate: donationDate,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          donorMobile: donation.donorMobile,
          donorAddress: donation.donorAddress,
          donorPan: donation.donorPan,
          amount: donation.amount,
          amountInWords,
          purpose: donation.campaign?.title || 'General Charitable Corpus Fund',
          paymentMethod: donation.paymentMethod,
          transactionReference: validated.referenceNumber || `OFFLINE-REF-${Date.now()}`,
          verificationCode,
          status: ReceiptStatus.ISSUED,
          is80GApplicable: true,
          trustPan: ENV.TRUST_PAN,
          trust80GReg: ENV.TRUST_80G_REG,
          createdAt: donationDate,
        },
      });

      // 4. Ledger entry
      await tx.financialLedgerEntry.create({
        data: {
          entryType: LedgerEntryType.CREDIT,
          amount: donation.amount,
          balanceAfter: 0,
          account: 'MAIN_OPERATIONAL_FUND',
          referenceType: 'DONATION',
          referenceId: donation.id,
          description: `Offline donation received from ${donation.donorName} (${receipt.receiptNumber})`,
          recordedAt: donationDate,
        },
      });

      return { donation, receipt };
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'OFFLINE_DONATION_RECORDED',
      entityType: 'DONATION',
      entityId: result.donation.id,
      newValues: {
        receiptNumber: result.receipt.receiptNumber,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Offline donation recorded and official receipt generated.',
      data: result,
    });
  }

  // ==========================================
  // Income Management
  // ==========================================
  static async getIncomeEntries(req: Request, res: Response) {
    const items = await prisma.incomeEntry.findMany({
      orderBy: { incomeDate: 'desc' },
    });

    res.json({
      success: true,
      data: items,
    });
  }

  static async createIncomeEntry(req: Request, res: Response) {
    const validated = CreateIncomeSchema.parse(req.body);

    const created = await prisma.$transaction(async (tx) => {
      const entry = await tx.incomeEntry.create({
        data: {
          ...validated,
          incomeDate: new Date(validated.incomeDate),
          receivedBy: req.user!.fullName,
        },
      });

      await tx.financialLedgerEntry.create({
        data: {
          entryType: LedgerEntryType.CREDIT,
          amount: entry.amount,
          balanceAfter: 0,
          account: 'MAIN_OPERATIONAL_FUND',
          referenceType: 'INCOME',
          referenceId: entry.id,
          description: `${entry.title} (${entry.source})`,
          recordedAt: entry.incomeDate,
        },
      });

      return entry;
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'INCOME_ENTRY_CREATED',
      entityType: 'INCOME_ENTRY',
      entityId: created.id,
      newValues: validated,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Income entry recorded successfully',
      data: created,
    });
  }

  // ==========================================
  // Expenses Management
  // ==========================================
  static async getExpenses(req: Request, res: Response) {
    const category = req.query.category as string | undefined;
    const status = req.query.status as ExpenseStatus | undefined;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== ('ALL' as any)) where.status = status;

    const items = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        createdBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        approvedBy: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        campaign: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      data: items,
    });
  }

  static async createExpense(req: Request, res: Response) {
    const validated = CreateExpenseSchema.parse(req.body);
    const expenseDate = new Date(validated.expenseDate);

    const currentYear = expenseDate.getFullYear();
    const tracker = await prisma.sequenceTracker.upsert({
      where: { name: 'EXPENSE' },
      update: { lastNumber: { increment: 1 } },
      create: { name: 'EXPENSE', year: currentYear, lastNumber: 1 },
    });
    const expenseNumber = `EXP-${tracker.year}-${tracker.lastNumber.toString().padStart(4, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        ...validated,
        expenseNumber,
        expenseDate,
        status: ExpenseStatus.PENDING_APPROVAL,
        createdById: req.user!.id,
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'EXPENSE_VOUCHER_CREATED',
      entityType: 'EXPENSE',
      entityId: expense.id,
      newValues: { expenseNumber, amount: validated.amount, title: validated.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Expense voucher submitted for administrative approval.',
      data: expense,
    });
  }

  static async approveExpense(req: Request, res: Response) {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.APPROVED,
        approvedById: req.user!.id,
        approvedAt: new Date(),
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'EXPENSE_APPROVED',
      entityType: 'EXPENSE',
      entityId: id,
      newValues: { status: ExpenseStatus.APPROVED },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Expense voucher successfully approved.',
      data: updated,
    });
  }

  static async rejectExpense(req: Request, res: Response) {
    const { id } = req.params;
    const validated = RejectExpenseSchema.parse(req.body);

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.REJECTED,
        rejectionReason: validated.reason,
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'EXPENSE_REJECTED',
      entityType: 'EXPENSE',
      entityId: id,
      newValues: { status: ExpenseStatus.REJECTED, reason: validated.reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Expense voucher rejected.',
      data: updated,
    });
  }

  static async payExpense(req: Request, res: Response) {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_APPROVED', message: 'Only APPROVED expenses can be marked as PAID.' },
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.update({
        where: { id },
        data: {
          status: ExpenseStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Debit ledger entry
      await tx.financialLedgerEntry.create({
        data: {
          entryType: LedgerEntryType.DEBIT,
          amount: exp.amount,
          balanceAfter: 0,
          account: 'MAIN_OPERATIONAL_FUND',
          referenceType: 'EXPENSE',
          referenceId: exp.id,
          description: `${exp.title} (${exp.expenseNumber})`,
          recordedAt: new Date(),
        },
      });

      return exp;
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'EXPENSE_PAID',
      entityType: 'EXPENSE',
      entityId: id,
      newValues: { status: ExpenseStatus.PAID, paidAt: updated.paidAt },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Expense marked as PAID and debited from the trust ledger.',
      data: updated,
    });
  }

  // ==========================================
  // Receipts Management
  // ==========================================
  static async getReceipts(req: Request, res: Response) {
    const receipts = await prisma.receipt.findMany({
      orderBy: { issueDate: 'desc' },
      include: {
        donation: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
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

  static async cancelReceipt(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'A valid cancellation reason is required.' },
      });
    }

    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Receipt not found' } });
    }

    const updated = await prisma.receipt.update({
      where: { id },
      data: {
        status: ReceiptStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason.trim(),
      },
    });

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'RECEIPT_CANCELLED',
      entityType: 'RECEIPT',
      entityId: id,
      newValues: { status: ReceiptStatus.CANCELLED, reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: `Receipt ${receipt.receiptNumber} marked as CANCELLED.`,
      data: updated,
    });
  }

  // ==========================================
  // Financial Reports
  // ==========================================
  static async getReports(req: Request, res: Response) {
    const summary = await LedgerService.getFinancialSummary();

    const transactions = await prisma.financialLedgerEntry.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: {
        openingBalance: 250000.00,
        ...summary,
        closingBalance: 250000.00 + summary.availableBalance,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user!.fullName,
        transactions,
      },
    });
  }

  // ==========================================
  // Audit Logs
  // ==========================================
  static async getAuditLogs(req: Request, res: Response) {
    const action = req.query.action as string | undefined;
    const entityType = req.query.entityType as string | undefined;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: logs,
    });
  }

  // ==========================================
  // Website Settings
  // ==========================================
  static async getSettings(req: Request, res: Response) {
    const settings = await prisma.websiteSetting.findMany();
    res.json({ success: true, data: settings });
  }

  static async updateSettings(req: Request, res: Response) {
    const settingsObj: Record<string, string> = req.body;

    for (const [key, value] of Object.entries(settingsObj)) {
      await prisma.websiteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await AuditService.record({
      userId: req.user!.id,
      userName: req.user!.fullName,
      action: 'SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: 'SYSTEM',
      newValues: settingsObj,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Website settings updated successfully',
    });
  }
}
