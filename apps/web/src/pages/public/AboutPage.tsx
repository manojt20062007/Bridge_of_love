import React from 'react';
import { ShieldCheck, Heart, Users, Target, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 space-y-16 w-full px-6 sm:px-10 lg:px-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Our Heritage & Purpose</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          About Bridge Of Love Charitable Trust
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded on the timeless Indian tenet of <em>“Manava Sevaye Madhava Seva”</em> (Service to humanity is worship of the divine), Bridge Of Love serves as an unshakeable bridge between benevolent donors and vulnerable families enduring adversity.
        </p>
      </div>

      {/* History & Genesis */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-coral">Trust Genesis</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
            Born from a Commitment to Elder Dignity and Children's Future
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In 2021, Dr. Sundaram Krishnamurthy and Smt. Vasantha Krishnamurthy began distributing home-cooked lunches to a dozen abandoned elderly citizens in North Chennai who had no surviving family. Witnessing the severe deprivation faced by both destitute seniors and talented young girls forced to drop out of school, the initiative formalised into <strong>Bridge Of Love Charitable Trust</strong>.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Today, our network feeds over 350 elders daily, funds full academic scholarships for 200 young women, and operates mobile healthcare camps across 14 rural village panchayats.
          </p>
        </div>

        <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-lg bg-slate-100 aspect-video">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80"
            alt="Founders serving meals"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">Our Guiding Values</h3>
          <p className="text-sm text-slate-600">The foundational principles that govern every action and rupee entrusted to us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-coral flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h4 className="text-base font-serif font-bold text-brand-navy">Compassionate Dignity</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never treat beneficiaries as charity cases. Every hot meal and aid packet is served with deep reverence, respecting human honor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-serif font-bold text-brand-navy">Absolute Transparency</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single voucher, invoice, donation, and receipt is logged in a publicly verifiable double-entry system. Zero hidden deductions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-base font-serif font-bold text-brand-navy">Tangible Impact</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We track real-world results: meals served, students graduated into jobs, and cataract vision restored—not hollow marketing promises.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-serif font-bold text-brand-navy">Community Ownership</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Programs are guided by local volunteers, elders, and community teachers who intimately understand local needs and hardships.
            </p>
          </div>
        </div>
      </div>

      {/* Legal & Statutory Registrations Box */}
      <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Statutory Governance</span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold">Legal Registrations & Tax Exemption Credentials</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Bridge Of Love operates in strict adherence to Indian trust laws, non-profit statutory compliance, and annual audit filings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="bg-slate-800/70 p-4 rounded-xl border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Trust Deed Reg No</div>
            <div className="text-sm font-mono font-bold text-white">BOL/TN/2021/004921</div>
            <div className="text-[11px] text-slate-400">Sub-Registrar Anna Nagar, Chennai</div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Income Tax PAN</div>
            <div className="text-sm font-mono font-bold text-amber-400">AAATB1234F</div>
            <div className="text-[11px] text-slate-400">Directorate of Income Tax (Exemptions)</div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Section 80G Order No</div>
            <div className="text-sm font-mono font-bold text-emerald-400">AAATB1234FF20214</div>
            <div className="text-[11px] text-slate-400">50% Tax Exemption for Donors</div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Section 12A Order No</div>
            <div className="text-sm font-mono font-bold text-sky-400">AAATB1234FE20213</div>
            <div className="text-[11px] text-slate-400">Income Tax Act, 1961</div>
          </div>
        </div>
      </div>
    </div>
  );
};
