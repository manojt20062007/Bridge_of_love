import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  BarChart3,
  Users,
  HeartHandshake,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  FileCheck2,
  FileSpreadsheet,
  Globe,
  ShieldAlert,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { label: 'Overview Metrics', icon: BarChart3, path: '/admin/dashboard' },
    { label: 'Member Directory', icon: Users, path: '/admin/members' },
    { label: 'Donations & Pledges', icon: HeartHandshake, path: '/admin/donations' },
    { label: 'Other Trust Income', icon: ArrowDownLeft, path: '/admin/income' },
    { label: 'Expense Approvals', icon: ArrowUpRight, path: '/admin/expenses' },
    { label: 'Campaign Causes', icon: Target, path: '/admin/campaigns' },
    { label: 'Receipt Archive', icon: FileCheck2, path: '/admin/receipts' },
    { label: 'Financial Reports', icon: FileSpreadsheet, path: '/admin/reports' },
    { label: 'Website Content', icon: Globe, path: '/admin/content' },
    { label: 'Security Audit Logs', icon: ShieldAlert, path: '/admin/audit-logs' },
    { label: 'Trust Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar on Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-coral flex items-center justify-center text-white shadow">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold font-serif text-white leading-none">Bridge Of Love</div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1">Admin Console</div>
          </div>
        </div>

        {/* Admin Identity */}
        <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-lg border border-white/5 flex items-center space-x-2.5 text-xs">
          <div className="w-8 h-8 rounded bg-brand-navyLight border border-white/10 text-white font-bold flex items-center justify-center text-xs">
            A
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate">{user.profile?.fullName || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400">Full System Access</p>
          </div>
        </div>

        {/* Menu list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-brand-coral text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom bar */}
        <div className="p-3 border-t border-slate-800 space-y-1 text-xs">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-brand-coral fill-current" />
          <span className="font-bold text-sm">Bridge Of Love — Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 text-xs">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex justify-between">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
              Return to Website
            </Link>
            <button onClick={() => logout()} className="text-red-400">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
