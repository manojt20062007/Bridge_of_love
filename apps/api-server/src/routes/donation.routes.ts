import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller.js';
import { donationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/create-order', donationLimiter, DonationController.createOrder);
router.post('/verify-payment', DonationController.verifyPayment);
router.get('/public/verify-receipt/:receiptNumber', DonationController.verifyPublicReceipt);
router.get('/:id', DonationController.getDonationById);

export default router;
