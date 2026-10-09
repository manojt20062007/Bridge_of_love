import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar.js';
import { Footer } from '../common/Footer.js';
import { DonationModal } from '../common/DonationModal.js';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <DonationModal />
    </div>
  );
};
