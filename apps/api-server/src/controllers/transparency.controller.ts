import { Request, Response } from 'express';
import { LedgerService } from '../services/ledger.service.js';
import { prisma } from '../config/db.js';

export class TransparencyController {
  static async getSummary(req: Request, res: Response) {
    const summary = await LedgerService.getFinancialSummary();

    // Fetch approved & paid expenses for transparent public listing (without private vendor documents or bank internal references)
    const recentPublicExpenses = await prisma.expense.findMany({
      where: {
        status: { in: ['APPROVED', 'PAID'] },
      },
      select: {
        id: true,
        expenseNumber: true,
        title: true,
        category: true,
        amount: true,
        expenseDate: true,
        paidTo: true,
      },
      orderBy: { expenseDate: 'desc' },
      take: 8,
    });

    res.json({
      success: true,
      data: {
        ...summary,
        recentPublicExpenses,
      },
    });
  }

  static async getReports(req: Request, res: Response) {
    const reports = [
      {
        id: 'rep-fy2025-2026',
        title: 'Statutory Financial Audit & Beneficiary Impact Report FY 2025-26',
        financialYear: '2025-2026',
        auditedBy: 'M/s. R. Sankaran & Associates, Chartered Accountants',
        status: 'PUBLISHED_APPROVED',
        publishDate: '2026-03-31',
        totalDonations: '₹42,50,000.00',
        totalExpenses: '₹38,20,000.00',
        beneficiariesServed: 4120,
        pdfUrl: '#',
      },
      {
        id: 'rep-fy2024-2025',
        title: 'Annual Audited Financial Statement & Form 10B Filing FY 2024-25',
        financialYear: '2024-2025',
        auditedBy: 'M/s. R. Sankaran & Associates, Chartered Accountants',
        status: 'PUBLISHED_APPROVED',
        publishDate: '2025-04-15',
        totalDonations: '₹34,10,000.00',
        totalExpenses: '₹31,80,000.00',
        beneficiariesServed: 3200,
        pdfUrl: '#',
      },
    ];

    res.json({
      success: true,
      data: reports,
    });
  }
}
