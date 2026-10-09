import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { CreateDonationOrderSchema, VerifyPaymentSchema } from '@bridge-of-love/validation';
import { RazorpayService } from '../services/razorpay.service.js';
import { ReceiptService } from '../services/receipt.service.js';
import { EmailService } from '../services/email.service.js';
import { AuditService } from '../services/audit.service.js';
import { DonationType, PaymentMethod, PaymentStatus, LedgerEntryType } from '@prisma/client';

export class DonationController {
  static async createOrder(req: Request, res: Response) {
    const validated = CreateDonationOrderSchema.parse(req.body);
    const userId = req.user?.id || null;

    let campaign = null;
    if (validated.campaignId) {
      campaign = await prisma.campaign.findUnique({
        where: { id: validated.campaignId },
      });
      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Selected campaign does not exist' },
        });
      }
    }

    // 1. Create Donation Record in CREATED status
    const donation = await prisma.donation.create({
      data: {
        userId,
        donorName: validated.donorName,
        donorEmail: validated.donorEmail,
        donorMobile: validated.donorMobile,
        donorAddress: validated.donorAddress || null,
        donorPan: validated.donorPan || null,
        campaignId: validated.campaignId || null,
        amount: validated.amount,
        currency: 'INR',
        donationType: validated.campaignId ? DonationType.CAMPAIGN : DonationType.GENERAL,
        paymentMethod: PaymentMethod.RAZORPAY,
        isAnonymous: validated.isAnonymous,
        notes: validated.notes || null,
        status: PaymentStatus.CREATED,
      },
    });

    // 2. Create Razorpay order
    const rzpOrder = await RazorpayService.createOrder(validated.amount, donation.id);

    // 3. Update donation with Razorpay Order ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        razorpayOrderId: rzpOrder.orderId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Donation order initiated successfully',
      data: {
        donationId: donation.id,
        razorpayOrderId: rzpOrder.orderId,
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency,
        keyId: ENV.RAZORPAY_KEY_ID,
        isSimulation: rzpOrder.isSimulation,
      },
    });
  }

  static async verifyPayment(req: Request, res: Response) {
    const validated = VerifyPaymentSchema.parse(req.body);

    const donation = await prisma.donation.findUnique({
      where: { id: validated.donationId },
      include: {
        campaign: true,
        receipt: true,
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: { code: 'DONATION_NOT_FOUND', message: 'Donation record not found' },
      });
    }

    // Idempotency: If already paid and receipt generated, return existing receipt
    if (donation.status === PaymentStatus.PAID && donation.receipt) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: {
          donationId: donation.id,
          receipt: donation.receipt,
        },
      });
    }

    // Server-side cryptographic signature check
    const isValidSignature = RazorpayService.verifyPaymentSignature(
      validated.razorpayOrderId,
      validated.razorpayPaymentId,
      validated.razorpaySignature
    );

    if (!isValidSignature) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: PaymentStatus.FAILED },
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: 'Cryptographic signature verification failed. Payment was not authenticated.',
        },
      });
    }

    // Process atomically with database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Donation Status to PAID
      const updatedDonation = await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: PaymentStatus.PAID,
          razorpayPaymentId: validated.razorpayPaymentId,
        },
      });

      // 2. Record Payment gateway log
      await tx.payment.create({
        data: {
          donationId: donation.id,
          gateway: 'RAZORPAY',
          gatewayOrderId: validated.razorpayOrderId,
          gatewayPaymentId: validated.razorpayPaymentId,
          gatewaySignature: validated.razorpaySignature,
          amount: donation.amount,
          currency: donation.currency,
          status: PaymentStatus.PAID,
        },
      });

      // 3. Update campaign raised amount if applicable
      if (donation.campaignId) {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            raisedAmount: { increment: donation.amount },
          },
        });
      }

      // 4. Create sequential collision-safe Receipt
      const receiptNumber = await ReceiptService.getNextReceiptNumber();
      const verificationCode = `VER-${receiptNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const amountInWords = (await import('../utils/numberToWords.js')).convertNumberToIndianWords(Number(donation.amount));

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          donationId: donation.id,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          donorMobile: donation.donorMobile,
          donorAddress: donation.donorAddress,
          donorPan: donation.donorPan,
          amount: donation.amount,
          amountInWords,
          purpose: donation.campaign?.title || 'General Charitable Corpus Fund',
          paymentMethod: PaymentMethod.RAZORPAY,
          transactionReference: validated.razorpayPaymentId,
          verificationCode,
          trustPan: ENV.TRUST_PAN,
          trust80GReg: ENV.TRUST_80G_REG,
        },
      });

      // 5. Record Financial Ledger Entry (Credit)
      await tx.financialLedgerEntry.create({
        data: {
          entryType: LedgerEntryType.CREDIT,
          amount: donation.amount,
          balanceAfter: 0,
          account: 'MAIN_OPERATIONAL_FUND',
          referenceType: 'DONATION',
          referenceId: donation.id,
          description: `Online donation from ${donation.donorName} (${receipt.receiptNumber})`,
        },
      });

      return { updatedDonation, receipt };
    });

    // Generate PDF and send Email in background
    ReceiptService.generateReceiptPDF(result.receipt.id)
      .then((pdfBuffer) => {
        EmailService.sendReceiptEmail({
          donorEmail: result.receipt.donorEmail,
          donorName: result.receipt.donorName,
          receiptNumber: result.receipt.receiptNumber,
          amount: Number(result.receipt.amount),
          purpose: result.receipt.purpose,
          pdfBuffer,
        });
      })
      .catch(() => {});

    await AuditService.record({
      userId: donation.userId,
      userName: donation.donorName,
      action: 'DONATION_VERIFIED_PAID',
      entityType: 'DONATION',
      entityId: donation.id,
      newValues: {
        receiptNumber: result.receipt.receiptNumber,
        amount: donation.amount,
        paymentId: validated.razorpayPaymentId,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Donation payment verified successfully. Official 80G receipt issued.',
      data: {
        donationId: result.updatedDonation.id,
        receipt: result.receipt,
      },
    });
  }

  static async getDonationById(req: Request, res: Response) {
    const { id } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, title: true, slug: true } },
        receipt: true,
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Donation not found' },
      });
    }

    res.json({
      success: true,
      data: donation,
    });
  }

  static async verifyPublicReceipt(req: Request, res: Response) {
    const { receiptNumber } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: {
        receiptNumber: {
          equals: receiptNumber,
          mode: 'insensitive',
        },
      },
      include: {
        donation: {
          select: {
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECEIPT_NOT_FOUND',
          message: 'No official receipt found matching this receipt number.',
        },
      });
    }

    // Privacy mask donor name: e.g. "Ananya Ramanathan" -> "A****a R********n"
    const maskName = (name: string) => {
      return name
        .split(' ')
        .map((part) => {
          if (part.length <= 2) return part;
          return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
        })
        .join(' ');
    };

    res.json({
      success: true,
      data: {
        receiptNumber: receipt.receiptNumber,
        issueDate: receipt.issueDate,
        status: receipt.status,
        maskedDonorName: maskName(receipt.donorName),
        amount: Number(receipt.amount),
        purpose: receipt.purpose,
        paymentMethod: receipt.paymentMethod,
        is80GApplicable: receipt.is80GApplicable,
        trustName: ENV.TRUST_NAME,
        trustRegNo: ENV.TRUST_REG_NO,
        trustPan: receipt.trustPan,
        trust80GReg: receipt.trust80GReg,
        verificationCode: receipt.verificationCode,
      },
    });
  }

  static async razorpayWebhook(req: Request, res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawPayload = JSON.stringify(req.body);

    if (!signature || !RazorpayService.verifyWebhookSignature(rawPayload, signature)) {
      return res.status(400).json({ status: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const donation = await prisma.donation.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (donation && donation.status !== PaymentStatus.PAID) {
          await prisma.donation.update({
            where: { id: donation.id },
            data: {
              status: PaymentStatus.PAID,
              razorpayPaymentId: paymentEntity.id,
            },
          });
        }
      }
    }

    res.json({ status: 'ok' });
  }
}
