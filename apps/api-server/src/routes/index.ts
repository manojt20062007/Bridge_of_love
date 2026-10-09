import { Router } from 'express';
import authRoutes from './auth.routes.js';
import memberRoutes from './member.routes.js';
import donationRoutes from './donation.routes.js';
import campaignRoutes from './campaign.routes.js';
import transparencyRoutes from './transparency.routes.js';
import adminRoutes from './admin.routes.js';
import contentRoutes from './content.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/donations', donationRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/transparency', transparencyRoutes);
router.use('/admin', adminRoutes);
router.use('/content', contentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Bridge Of Love API Server',
    version: '1.0.0',
  });
});

export default router;
