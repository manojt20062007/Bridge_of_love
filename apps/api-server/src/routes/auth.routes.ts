import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.post('/change-password', authenticate, AuthController.changePassword);
router.get('/me', authenticate, AuthController.getMe);

export default router;
