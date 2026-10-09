import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import {
  LayoutDashboard,
  Heart,
  History,
  FileText,
  User,
  Shield,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { DonationModal } from '../common/DonationModal.js';

export const MemberLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const { openDonationModal } = useDonationModal();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading member portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    { label: 'Dashboard Overview', icon: LayoutDashboard, path: '/member/dashboard' },
    { label: 'Make a Contribution', icon: Heart, path: '/member/donate' },
    { label: 'Donation History', icon: History, path: '/member/donations' },
    { label: '80G Tax Receipts', icon: FileText, path: '/member/receipts' },
    { label: 'Profile Details', icon: User, path: '/member/profile' },
    { label: 'Security & Password', icon: Shield, path: '/member/security' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-navy text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/40">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-serif font-bold text-white leading-tight">Bridge Of Love</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Member Portal</p>
          </div>
        </div>

        {/* Member Profile Badge */}
        <div className="p-4 mx-4 my-4 bg-slate-900/60 rounded-xl border border-white/5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-coral/20 text-brand-coral font-bold flex items-center justify-center text-sm border border-brand-coral/30">
            {(user.profile?.fullName || user.email)[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user.profile?.fullName || 'Member'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? 'bg-brand-coral text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => openDonationModal()}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-coral to-red-600 hover:opacity-95 text-white text-xs font-bold shadow transition flex items-center justify-center space-x-2"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Quick Donate</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Website</span>
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 text-xs text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-brand-navy text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-brand-coral fill-current" />
          <span className="font-serif font-bold text-sm">Bridge Of Love</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openDonationModal()}
            className="py-1 px-2.5 rounded-lg bg-brand-coral text-white text-xs font-bold"
          >
            Donate
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 rounded-lg text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Dropdown */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-brand-navy border-b border-slate-800 p-4 space-y-2 text-xs">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
            <Link to="/" onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
              Return to Website
            </Link>
            <button onClick={() => logout()} className="text-red-400">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <DonationModal />
    </div>
  );
};
