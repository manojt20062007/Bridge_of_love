import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { Heart, Menu, X, Shield, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, isAdmin, isMember, logout } = useAuth();
  const { openDonationModal } = useDonationModal();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Mission', path: '/mission' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Activities', path: '/activities' },
    { label: 'Transparency', path: '/transparency' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      {/* Top Statutory Strip */}
      <div className="bg-brand-navy text-white text-[11px] py-1.5 px-4 hidden sm:block border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-brand-coral font-bold flex items-center">
              <Shield className="w-3 h-3 mr-1 inline" /> 80G Tax Exemption Available
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Govt Reg: BOL/TN/2021/004921</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">PAN: AAATB1234F</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span>Call: +91 94441 23456</span>
            <span>Email: contact@bridgeoflove.org</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-navy to-brand-navyLight flex items-center justify-center text-white shadow-md border border-brand-navy/10 group-hover:scale-105 transition">
              <Heart className="w-6 h-6 text-brand-coral fill-current animate-pulse" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-brand-navy tracking-tight leading-none">
                Bridge Of Love
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
                Charitable Trust
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                  isActive(link.path)
                    ? 'text-brand-coral bg-brand-coralLight/60 font-bold'
                    : 'text-slate-700 hover:text-brand-navy hover:bg-slate-100/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Auth state */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition"
                >
                  <UserIcon className="w-4 h-4 text-brand-navy" />
                  <span className="max-w-[120px] truncate">{user.profile?.fullName || user.email.split('@')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{user.profile?.fullName || 'User'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isMember && (
                      <Link
                        to="/member/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Member Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-brand-navy font-semibold hover:bg-slate-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-1 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Become a Member
                </Link>
              </div>
            )}

            {/* Donate Now Primary Button */}
            <button
              onClick={() => openDonationModal()}
              className="py-2.5 px-4 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Donate Now</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => openDonationModal()}
              className="py-1.5 px-3 rounded-lg bg-brand-coral text-white text-xs font-bold shadow transition"
            >
              Donate
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold transition ${
                isActive(link.path)
                  ? 'text-brand-coral bg-brand-coralLight/60 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                {isMember && (
                  <Link
                    to="/member/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 px-3 text-center rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    Member Portal
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 px-3 text-center rounded-lg bg-brand-navy text-white text-xs font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full py-2 px-3 text-center text-xs font-semibold text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-lg bg-slate-100 text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-lg bg-brand-navy text-white"
                >
                  Join Trust
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
