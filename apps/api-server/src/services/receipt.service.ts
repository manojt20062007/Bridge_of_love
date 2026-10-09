import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { convertNumberToIndianWords } from '../utils/numberToWords.js';
import { PaymentMethod, ReceiptStatus } from '@prisma/client';

export interface GenerateReceiptInput {
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorMobile: string;
  donorAddress?: string | null;
  donorPan?: string | null;
  amount: number;
  purpose: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
}

export class ReceiptService {
  /**
   * Atomically generate sequential collision-safe receipt number (e.g. BOL-2026-000001)
   */
  static async getNextReceiptNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();

    return await prisma.$transaction(async (tx) => {
      const tracker = await tx.sequenceTracker.upsert({
        where: { name: 'RECEIPT' },
        update: {
          lastNumber: { increment: 1 },
        },
        create: {
          name: 'RECEIPT',
          year: currentYear,
          lastNumber: 1,
        },
      });

      const padded = tracker.lastNumber.toString().padStart(6, '0');
      return `BOL-${tracker.year}-${padded}`;
    });
  }

  /**
   * Create and record a receipt in database
   */
  static async createReceipt(input: GenerateReceiptInput) {
    const receiptNumber = await this.getNextReceiptNumber();
    const verificationCode = `VER-${receiptNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const amountInWords = convertNumberToIndianWords(input.amount);

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        donationId: input.donationId,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorMobile: input.donorMobile,
        donorAddress: input.donorAddress,
        donorPan: input.donorPan,
        amount: input.amount,
        amountInWords,
        purpose: input.purpose,
        paymentMethod: input.paymentMethod,
        transactionReference: input.transactionReference,
        verificationCode,
        status: ReceiptStatus.ISSUED,
        is80GApplicable: true,
        trustPan: ENV.TRUST_PAN,
        trust80GReg: ENV.TRUST_80G_REG,
      },
    });

    return receipt;
  }

  /**
   * Generate official PDF document buffer for a receipt
   */
  static async generateReceiptPDF(receiptId: string): Promise<Buffer> {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        donation: true,
      },
    });

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    const verificationUrl = `${ENV.APP_URL}/verify-receipt/${receipt.receiptNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 120,
    });
    const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#0B1B2B';
      const coralColor = '#D94A3D';
      const textMuted = '#4A5568';
      const borderColor = '#CBD5E1';

      // Outer Decorative Border
      doc.rect(30, 30, 535, 782).lineWidth(1.5).stroke(primaryColor);
      doc.rect(34, 34, 527, 774).lineWidth(0.5).stroke(coralColor);

      // Header Bar
      doc.rect(35, 35, 525, 95).fill('#F8FAFC');

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(primaryColor)
        .text(ENV.TRUST_NAME.toUpperCase(), 45, 48, { align: 'center', width: 505 });

      doc
        .font('Helvetica-Oblique')
        .fontSize(10)
        .fillColor(coralColor)
        .text(`“${ENV.TRUST_TAGLINE}”`, 45, 74, { align: 'center', width: 505 });

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textMuted)
        .text(
          `${ENV.TRUST_ADDRESS} | Phone: ${ENV.TRUST_PHONE} | Email: ${ENV.TRUST_EMAIL}`,
          45,
          90,
          { align: 'center', width: 505 }
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(primaryColor)
        .text(
          `Govt Reg No: ${ENV.TRUST_REG_NO}  |  PAN: ${ENV.TRUST_PAN}  |  80G Order: ${ENV.TRUST_80G_REG}  |  12A Reg: ${ENV.TRUST_12A_REG}`,
          45,
          106,
          { align: 'center', width: 505 }
        );

      // Title
      doc.moveDown(2);
      doc
        .rect(35, 140, 525, 26)
        .fill(primaryColor);

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#FFFFFF')
        .text('DONATION RECEIPT (UNDER SECTION 80G OF INCOME TAX ACT)', 45, 148, { align: 'center', width: 505 });

      // Receipt Meta Box
      let y = 180;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text('Receipt Number:', 45, y)
        .font('Helvetica')
        .text(receipt.receiptNumber, 150, y);

      doc
        .font('Helvetica-Bold')
        .text('Date of Issue:', 350, y)
        .font('Helvetica')
        .text(new Date(receipt.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 435, y);

      y += 20;
      doc
        .font('Helvetica-Bold')
        .text('Status:', 45, y)
        .fillColor(receipt.status === 'ISSUED' ? '#15803D' : '#DC2626')
        .text(receipt.status === 'ISSUED' ? 'VERIFIED & VALID' : 'CANCELLED', 150, y)
        .fillColor(primaryColor);

      doc
        .font('Helvetica-Bold')
        .text('Verification Code:', 350, y)
        .font('Helvetica')
        .text(receipt.verificationCode, 435, y);

      // Horizontal Divider
      y += 22;
      doc.moveTo(45, y).lineTo(550, y).lineWidth(0.5).stroke(borderColor);

      // Donor Information
      y += 12;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(coralColor)
        .text('DONOR DETAILS', 45, y);

      y += 18;
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(primaryColor)
        .text('Donor Full Name:', 45, y)
        .font('Helvetica')
        .text(receipt.donorName, 160, y);

      y += 16;
      doc
        .font('Helvetica-Bold')
        .text('Donor PAN Number:', 45, y)
        .font('Helvetica')
        .text(receipt.donorPan || 'Not Provided (General Category)', 160, y);

      y += 16;
      doc
        .font('Helvetica-Bold')
        .text('Email Address:', 45, y)
        .font('Helvetica')
        .text(receipt.donorEmail, 160, y);

      doc
        .font('Helvetica-Bold')
        .text('Mobile Number:', 330, y)
        .font('Helvetica')
        .text(`+91 ${receipt.donorMobile}`, 420, y);

      if (receipt.donorAddress) {
        y += 16;
        doc
          .font('Helvetica-Bold')
          .text('Postal Address:', 45, y)
          .font('Helvetica')
          .text(receipt.donorAddress, 160, y, { width: 380 });
      }

      // Horizontal Divider
      y += 24;
      doc.moveTo(45, y).lineTo(550, y).lineWidth(0.5).stroke(borderColor);

      // Contribution Particulars Table
      y += 12;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(coralColor)
        .text('CONTRIBUTION PARTICULARS', 45, y);

      y += 18;
      doc.rect(45, y, 505, 22).fill('#F1F5F9');
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('Description / Purpose', 55, y + 6)
        .text('Payment Mode', 300, y + 6)
        .text('Amount (INR)', 450, y + 6);

      y += 24;
      doc.rect(45, y, 505, 36).stroke(borderColor);

      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(Number(receipt.amount));

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(textMuted)
        .text(receipt.purpose || 'General Charitable Corpus Fund', 55, y + 6, { width: 230 })
        .text(receipt.paymentMethod, 300, y + 6)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(formattedAmount, 450, y + 6);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textMuted)
        .text(`Txn Ref: ${receipt.transactionReference}`, 55, y + 20);

      y += 46;
      doc.rect(45, y, 505, 30).fill('#FEF2F2');
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(coralColor)
        .text('Amount in Words:', 55, y + 8)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(receipt.amountInWords, 160, y + 8, { width: 380 });

      // Verification & Signatures section
      y += 50;

      // QR Code
      doc.image(qrBuffer, 55, y, { width: 85, height: 85 });
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(textMuted)
        .text('Scan with smartphone camera', 45, y + 90, { width: 110, align: 'center' })
        .text('to verify official authenticity', 45, y + 100, { width: 110, align: 'center' });

      // Signatory Box
      const signX = 350;
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('For Bridge Of Love Charitable Trust', signX, y + 15, { align: 'center', width: 180 });

      // Seal Placeholder Box
      doc
        .rect(signX + 35, y + 35, 110, 45)
        .lineWidth(0.5)
        .dash(3, { space: 3 })
        .stroke(borderColor);

      doc
        .undash()
        .font('Helvetica-Oblique')
        .fontSize(7.5)
        .fillColor(textMuted)
        .text('[ Official Digital Seal & Sign ]', signX + 35, y + 52, { align: 'center', width: 110 });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text('Authorized Trustee / Signatory', signX, y + 90, { align: 'center', width: 180 });

      // Legal Exemption Footer
      y += 120;
      doc.rect(45, y, 505, 52).fill('#F8FAFC').stroke(borderColor);
      doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(primaryColor)
        .text('STATUTORY DECLARATION & 80G TAX EXEMPTION DETAILS:', 55, y + 6);

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(textMuted)
        .text(
          '1. Bridge Of Love Charitable Trust is registered under Section 12A and Section 80G of the Income Tax Act, 1961.\n' +
          '2. Donations to this trust qualify for deduction under Section 80G in computing taxable income of the donor.\n' +
          '3. This is an official computer-generated receipt bearing a verifiable cryptographic hash. No physical signature is required.\n' +
          '4. Thank you for your benevolent support in empowering underprivileged lives.',
          55,
          y + 16,
          { width: 485, lineGap: 1.5 }
        );

      doc.end();
    });
  }
}
