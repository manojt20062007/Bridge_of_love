import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { CampaignController } from '../controllers/campaign.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Protect all admin endpoints
router.use(authenticate);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

// Dashboard Stats
router.get('/dashboard', AdminController.getDashboardStats);

// Members
router.get('/members', AdminController.getMembers);
router.get('/members/:id', AdminController.getMemberById);
router.patch('/members/:id/status', AdminController.updateMemberStatus);

// Donations
router.get('/donations', AdminController.getDonations);
router.post('/donations/offline', AdminController.recordOfflineDonation);

// Campaigns CRUD
router.post('/campaigns', CampaignController.createCampaign);
router.patch('/campaigns/:id', CampaignController.updateCampaign);
router.delete('/campaigns/:id', CampaignController.deleteCampaign);

// Income
router.get('/income', AdminController.getIncomeEntries);
router.post('/income', AdminController.createIncomeEntry);

// Expenses
router.get('/expenses', AdminController.getExpenses);
router.post('/expenses', AdminController.createExpense);
router.post('/expenses/:id/approve', AdminController.approveExpense);
router.post('/expenses/:id/reject', AdminController.rejectExpense);
router.post('/expenses/:id/pay', AdminController.payExpense);

// Receipts
router.get('/receipts', AdminController.getReceipts);
router.post('/receipts/:id/cancel', AdminController.cancelReceipt);

// Financial Reports
router.get('/reports', AdminController.getReports);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

// Settings
router.get('/settings', AdminController.getSettings);
router.patch('/settings', AdminController.updateSettings);

export default router;
