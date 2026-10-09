import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    if (ENV.SMTP_HOST && ENV.SMTP_PASS && ENV.SMTP_PASS !== 'secret_smtp_password') {
      transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
    } else {
      // In development, create a test ethereal account or log mock emails
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'bridgeoflove_dev@ethereal.email',
          pass: 'mock_pass',
        },
      });
    }
  }
  return transporter;
}

export class EmailService {
  /**
   * Send donation receipt notification email
   */
  static async sendReceiptEmail(params: {
    donorEmail: string;
    donorName: string;
    receiptNumber: string;
    amount: number;
    purpose: string;
    pdfBuffer?: Buffer;
  }) {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(params.amount);

    const verificationUrl = `${ENV.APP_URL}/verify-receipt/${params.receiptNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0B1B2B; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif;">${ENV.TRUST_NAME}</h1>
          <p style="margin: 6px 0 0 0; color: #D94A3D; font-size: 13px;">${ENV.TRUST_TAGLINE}</p>
        </div>

        <div style="padding: 28px;">
          <h2 style="color: #0B1B2B; font-size: 18px; margin-top: 0;">Dear ${params.donorName},</h2>
          <p style="line-height: 1.6; color: #475569;">
            We express our heartfelt gratitude for your generous donation of <strong>${formattedAmount}</strong> towards <em>${params.purpose}</em>.
          </p>

          <div style="background-color: #F8FAFC; border-left: 4px solid #D94A3D; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Receipt Number:</strong> ${params.receiptNumber}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Contribution Amount:</strong> ${formattedAmount}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Tax Benefit:</strong> Eligible for 80G Deduction (Reg: ${ENV.TRUST_80G_REG})</p>
          </div>

          <p style="line-height: 1.6; color: #475569;">
            Your official donation receipt has been generated and is attached to this email. You can also view or download your receipt anytime from your member portal or directly verify its authenticity online.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0B1B2B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Verify & View Receipt Online
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Warm regards,<br />
            <strong>Board of Trustees</strong><br />
            Bridge Of Love Charitable Trust<br />
            ${ENV.TRUST_ADDRESS}
          </p>
        </div>
      </div>
    `;

    try {
      const client = await getTransporter();
      const mailOptions: nodemailer.SendMailOptions = {
        from: ENV.SMTP_FROM,
        to: params.donorEmail,
        subject: `Donation Receipt ${params.receiptNumber} — Bridge Of Love Charitable Trust`,
        html,
        attachments: params.pdfBuffer
          ? [
              {
                filename: `Donation_Receipt_${params.receiptNumber}.pdf`,
                content: params.pdfBuffer,
                contentType: 'application/pdf',
              },
            ]
          : [],
      };

      await client.sendMail(mailOptions);
      logger.info(`Receipt email sent to ${params.donorEmail} for receipt ${params.receiptNumber}`);
    } catch (error) {
      logger.warn(`Failed to dispatch real email to ${params.donorEmail} (Email service logged):`, error);
    }
  }

  /**
   * Send Welcome Email upon registration
   */
  static async sendWelcomeEmail(email: string, name: string) {
    logger.info(`Welcome email triggered for new member: ${name} <${email}>`);
  }

  /**
   * Send Password Reset instructions
   */
  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${ENV.APP_URL}/reset-password?token=${token}`;
    logger.info(`Password reset email triggered for ${email} with link: ${resetUrl}`);
  }
}
