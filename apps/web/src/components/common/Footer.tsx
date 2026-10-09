import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800">
      {/* Top Editorial Banner */}
      <div className="bg-brand-navyDark py-12 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
              Every Contribution Directly Bridges a Life in Need
            </h3>
            <p className="text-sm text-slate-400">
              Join thousands of conscious citizens upholding human dignity with 100% financial transparency.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/register"
              className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition"
            >
              Become a Member
            </Link>
            <Link
              to="/campaigns"
              className="py-3 px-6 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold shadow-md transition"
            >
              Explore Active Causes
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="w-full py-14 px-6 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/40">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold font-serif text-white tracking-tight">Bridge Of Love</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            “Connecting compassionate hearts with people in need.” A public charitable trust dedicated to uplifting the destitute through daily nutrition, girl child education, and mobile healthcare.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Statutory Tax Status:</p>
            <p className="flex items-center text-brand-gold font-medium">
              <ShieldCheck className="w-4 h-4 mr-1 text-brand-gold" /> Section 80G & 12A Certified
            </p>
          </div>
        </div>

        {/* Col 2: Service Verticals */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold font-serif text-white tracking-wider uppercase">Our Programs</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/campaigns/annapurna-food-security" className="hover:text-white transition">
                Annapurna Food Security for Destitute Elders
              </Link>
            </li>
            <li>
              <Link to="/campaigns/asha-deep-girl-child-education" className="hover:text-white transition">
                Asha Deep Girl Child STEM Scholarships
              </Link>
            </li>
            <li>
              <Link to="/campaigns/sanjeevani-rural-medical-camps" className="hover:text-white transition">
                Sanjeevani Rural Healthcare & Free Cataract Surgeries
              </Link>
            </li>
            <li>
              <Link to="/activities" className="hover:text-white transition">
                Disaster Relief & Monsoon Ration Drives
              </Link>
            </li>
            <li>
              <Link to="/activities" className="hover:text-white transition">
                Pure Solar Drinking Water Units for Schools
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Navigation & Governance */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold font-serif text-white tracking-wider uppercase">Accountability</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/transparency" className="hover:text-white transition flex items-center">
                Financial Transparency Dashboard
              </Link>
            </li>
            <li>
              <Link to="/transparency" className="hover:text-white transition">
                Audited Statements & Form 10B
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                Board of Trustees & Registration
              </Link>
            </li>
            <li>
              <Link to="/member/dashboard" className="hover:text-white transition">
                Donor / Member Portal
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition">
                Administrative System Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Trust Headquarters & Legal */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold font-serif text-white tracking-wider uppercase">Headquarters</h4>
          <div className="space-y-2.5 text-slate-400">
            <p className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-brand-coral shrink-0 mt-0.5" />
              <span>Plot No. 42, Karuna Nagar, 3rd Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040</span>
            </p>
            <p className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-brand-coral shrink-0" />
              <span>+91 94441 23456</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-brand-coral shrink-0" />
              <span>contact@bridgeoflove.org</span>
            </p>
            <div className="pt-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
              <p className="text-slate-300 font-mono">Reg: BOL/TN/2021/004921</p>
              <p className="text-slate-300 font-mono">PAN: AAATB1234F | 80G: AAATB1234FF20214</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright */}
      <div className="border-t border-slate-800/80 py-6 px-4 text-center text-[11px] text-slate-500">
        <div className="w-full px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Bridge Of Love Charitable Trust. All rights reserved.</p>
          <p>
            Donations are deductible under Section 80G of the Indian Income Tax Act. Computer-generated receipts carry digital verification codes.
          </p>
        </div>
      </div>
    </footer>
  );
};
