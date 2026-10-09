import { Router } from 'express';
import { TransparencyController } from '../controllers/transparency.controller.js';

const router = Router();

router.get('/summary', TransparencyController.getSummary);
router.get('/reports', TransparencyController.getReports);

export default router;
