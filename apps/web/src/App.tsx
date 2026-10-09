import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layouts/PublicLayout.js';
import { MemberLayout } from './components/layouts/MemberLayout.js';
import { AdminLayout } from './components/layouts/AdminLayout.js';

// Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { MissionPage } from './pages/public/MissionPage.js';
import { CampaignsPage } from './pages/public/CampaignsPage.js';
import { CampaignDetailPage } from './pages/public/CampaignDetailPage.js';
import { ActivitiesPage } from './pages/public/ActivitiesPage.js';
import { TransparencyPage } from './pages/public/TransparencyPage.js';
import { GalleryPage } from './pages/public/GalleryPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { VerifyReceiptPage } from './pages/public/VerifyReceiptPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';

// Member Portal Pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage.js';
import { MemberDonatePage } from './pages/member/MemberDonatePage.js';
import { MemberDonationsPage } from './pages/member/MemberDonationsPage.js';
import { MemberReceiptsPage } from './pages/member/MemberReceiptsPage.js';
import { MemberProfilePage } from './pages/member/MemberProfilePage.js';
import { MemberSecurityPage } from './pages/member/MemberSecurityPage.js';

// Admin Dashboard Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminMembersPage } from './pages/admin/AdminMembersPage.js';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage.js';
import { AdminIncomePage } from './pages/admin/AdminIncomePage.js';
import { AdminExpensesPage } from './pages/admin/AdminExpensesPage.js';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage.js';
import { AdminReceiptsPage } from './pages/admin/AdminReceiptsPage.js';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.js';
import { AdminContentPage } from './pages/admin/AdminContentPage.js';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Website Route Group */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:slug" element={<CampaignDetailPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="transparency" element={<TransparencyPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="verify-receipt/:receiptNumber" element={<VerifyReceiptPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* 2. Member Portal Route Group */}
      <Route path="/member" element={<MemberLayout />}>
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboardPage />} />
        <Route path="donate" element={<MemberDonatePage />} />
        <Route path="donations" element={<MemberDonationsPage />} />
        <Route path="receipts" element={<MemberReceiptsPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
        <Route path="security" element={<MemberSecurityPage />} />
      </Route>

      {/* 3. Admin Dashboard Route Group */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="members" element={<AdminMembersPage />} />
        <Route path="donations" element={<AdminDonationsPage />} />
        <Route path="income" element={<AdminIncomePage />} />
        <Route path="expenses" element={<AdminExpensesPage />} />
        <Route path="campaigns" element={<AdminCampaignsPage />} />
        <Route path="receipts" element={<AdminReceiptsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
