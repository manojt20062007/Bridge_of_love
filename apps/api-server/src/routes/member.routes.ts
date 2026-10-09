import { Router } from 'express';
import { MemberController } from '../controllers/member.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('MEMBER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/me', MemberController.getProfile);
router.patch('/me', MemberController.updateProfile);
router.get('/me/donations', MemberController.getMyDonations);
router.get('/me/receipts', MemberController.getMyReceipts);
router.get('/me/receipts/:receiptId/download', MemberController.downloadReceipt);

export default router;
