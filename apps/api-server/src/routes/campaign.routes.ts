import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';

const router = Router();

router.get('/', CampaignController.getCampaigns);
router.get('/:slug', CampaignController.getCampaignBySlug);

export default router;
