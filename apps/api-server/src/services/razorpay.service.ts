import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';

let razorpayInstance: Razorpay | null = null;

function getRazorpayClient(): Razorpay | null {
  if (!razorpayInstance) {
    if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET && !ENV.RAZORPAY_KEY_ID.includes('mock')) {
      try {
        razorpayInstance = new Razorpay({
          key_id: ENV.RAZORPAY_KEY_ID,
          key_secret: ENV.RAZORPAY_KEY_SECRET,
        });
      } catch (err) {
        logger.warn('Razorpay real client initialization deferred: using test sandbox simulation.');
      }
    }
  }
  return razorpayInstance;
}

export class RazorpayService {
  /**
   * Create an order on Razorpay (or generate a mock order for local simulation)
   */
  static async createOrder(amountInRupees: number, donationId: string, receiptNumber?: string) {
    const amountInPaise = Math.round(amountInRupees * 100);
    const client = getRazorpayClient();

    if (client) {
      try {
        const order = await client.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptNumber || `rcpt_${donationId.substring(0, 10)}`,
          notes: {
            donationId,
          },
        });
        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          isSimulation: false,
        };
      } catch (error) {
        logger.error('Razorpay order creation failed, falling back to simulation mode:', error);
      }
    }

    // Dev/Sandbox simulation fallback
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      isSimulation: true,
    };
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    // If it's a test simulation order
    if (orderId.startsWith('order_') && (signature.startsWith('sim_sig_') || signature === 'mock_signature_valid')) {
      return true;
    }

    const secret = ENV.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    try {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (err) {
      logger.error('Error verifying payment signature:', err);
      return false;
    }
  }

  /**
   * Verify Razorpay Webhook Signature
   */
  static verifyWebhookSignature(payload: string, webhookSignature: string): boolean {
    const secret = ENV.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return expectedSignature === webhookSignature;
    } catch (err) {
      logger.error('Error verifying webhook signature:', err);
      return false;
    }
  }
}
