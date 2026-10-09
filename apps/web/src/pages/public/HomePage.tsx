import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { api } from '../../lib/api.js';
import { formatINR } from '../../lib/utils.js';
import {
  Heart,
  ShieldCheck,
  Users,
  Utensils,
  GraduationCap,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  FileText,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { openDonationModal } = useDonationModal();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [transparency, setTransparency] = useState<any>(null);

  useEffect(() => {
    api.get<any[]>('/campaigns?featured=true').then(setCampaigns).catch(() => {});
    api.get<any[]>('/content/activities').then((acts) => setActivities((acts || []).slice(0, 3))).catch(() => {});
    api.get<any>('/transparency/summary').then(setTransparency).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. CINEMATIC EDITORIAL HERO */}
      <section className="relative bg-brand-cream border-b border-slate-200/60 overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-brand-coralLight border border-brand-coral/20 px-3.5 py-1.5 rounded-full text-brand-coral text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-brand-coral animate-ping"></span>
                <span>Government Registered Trust | 80G Tax Exemption Available</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-navy leading-[1.15] tracking-tight">
                Connecting compassionate hearts with{' '}
                <span className="text-brand-coral italic underline decoration-brand-coral/30">people in need.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Bridge Of Love is a grassroots charitable trust committed to protecting human dignity. From daily nutritious meals for destitute elders to comprehensive school scholarships for young girls and rural mobile healthcare, we ensure every rupee translates into real-world relief with uncompromised financial transparency.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={() => openDonationModal()}
                  className="py-4 px-8 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white font-bold text-sm shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Donate to Support a Life</span>
                </button>

                <Link
                  to="/register"
                  className="py-4 px-7 rounded-xl bg-white hover:bg-slate-50 text-brand-navy font-bold text-sm border border-slate-300 shadow-sm hover:shadow transition flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4 text-brand-coral" />
                  <span>Become a Member Patron</span>
                </Link>
              </div>

              {/* Micro-assurances */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center text-brand-navy font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-green mr-1.5" />
                  Instant Verifiable 80G Receipts
                </span>
                <span className="flex items-center text-brand-navy font-medium">
                  <CheckCircle className="w-4 h-4 text-brand-coral mr-1.5" />
                  Itemized Financial Ledger
                </span>
                <span className="flex items-center text-brand-navy font-medium">
                  <FileText className="w-4 h-4 text-brand-gold mr-1.5" />
                  Audited by Chartered Accountants
                </span>
              </div>
            </div>

            {/* Right Editorial Photography Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80"
                    alt="Volunteers serving destitute children and elders"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <p className="text-xs uppercase tracking-widest text-brand-gold font-bold">Field Dispatch</p>
                    <p className="text-lg font-serif font-bold">Annapurna Food Relief Drive</p>
                    <p className="text-xs text-slate-300">
                      Nutritious warm meals handed over with love and dignity in suburban settlements.
                    </p>
                  </div>
                </div>

                {/* Overlapping Floating Metric Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3.5 max-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-serif text-brand-navy">350+ Meals</div>
                    <div className="text-[11px] text-slate-500 font-medium">Served every morning to destitute seniors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATUTORY IMPACT STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center">
            <div className="pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-coral">3,840+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Destitute Elders Supported</div>
              <p className="text-[11px] text-slate-400 mt-1">Daily meals, groceries & medicines</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-400">200+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Girl Scholars Adopted</div>
              <p className="text-[11px] text-slate-400 mt-1">Full tuition, tablets & uniforms</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-emerald-400">1,800+</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Rural Patients Treated</div>
              <p className="text-[11px] text-slate-400 mt-1">Mobile health vans & cataract surgeries</p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-8">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-sky-400">100%</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Audited Transparency</div>
              <p className="text-[11px] text-slate-400 mt-1">Every rupee verified on public ledger</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICE VERTICALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-coral">Areas of Service</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            Where Your Compassion Reaches
          </h3>
          <p className="text-sm text-slate-600">
            We focus on four foundational pillars of human empowerment, upholding the dignity and self-respect of those who need it most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif font-bold text-brand-navy">Hunger Relief & Nutrition</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Serving freshly prepared, balanced hot lunches daily to bedridden seniors, abandoned widows, and destitute daily-wage earners. Monthly dry ration grocery kits ensure household food security.
            </p>
            <div className="pt-2">
              <Link to="/campaigns/annapurna-food-security" className="text-xs font-bold text-brand-coral flex items-center hover:underline">
                <span>View Annapurna Program</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif font-bold text-brand-navy">Girl Child Education & STEM</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Breaking the cycle of intergenerational poverty. We pay annual school fees, supply educational laptops, textbooks, and tutoring to meritorious young women from economically vulnerable homes.
            </p>
            <div className="pt-2">
              <Link to="/campaigns/asha-deep-girl-child-education" className="text-xs font-bold text-brand-coral flex items-center hover:underline">
                <span>View Asha Deep Scholarships</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif font-bold text-brand-navy">Mobile Clinic & Elder Health</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Delivering doctor consultations and monthly diabetic/blood pressure medications directly to remote rural hamlets. We also sponsor 100% free cataract restoration surgeries for seniors.
            </p>
            <div className="pt-2">
              <Link to="/campaigns/sanjeevani-rural-medical-camps" className="text-xs font-bold text-brand-coral flex items-center hover:underline">
                <span>View Sanjeevani Outreach</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURRENT ACTIVE CAUSES */}
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Current Urgent Causes</span>
              <h3 className="text-3xl font-serif font-bold text-brand-navy">Causes That Need Your Compassion</h3>
              <p className="text-sm text-slate-600">Choose a cause close to your heart or contribute to our general corpus fund.</p>
            </div>
            <Link
              to="/campaigns"
              className="inline-flex items-center space-x-2 text-xs font-bold text-brand-navy hover:text-brand-coral transition"
            >
              <span>View All Causes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.map((camp) => {
              const target = Number(camp.targetAmount || 1);
              const raised = Number(camp.raisedAmount || 0);
              const percent = Math.min(100, Math.round((raised / target) * 100));

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={camp.coverImage}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-brand-navy/90 text-white text-[11px] font-semibold py-1 px-2.5 rounded-full backdrop-blur-sm">
                      {camp.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-lg font-serif font-bold text-brand-navy group-hover:text-brand-coral transition line-clamp-2">
                        {camp.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {camp.summary}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-navy">Raised: {formatINR(raised, false)}</span>
                        <span className="text-slate-500">Goal: {formatINR(target, false)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-coral rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>{percent}% Completed</span>
                        <span>80G Eligible</span>
                      </div>

                      <div className="pt-3">
                        <button
                          onClick={() => openDonationModal({ campaignId: camp.id, campaignTitle: camp.title })}
                          className="w-full py-2.5 px-4 rounded-xl bg-brand-navy hover:bg-brand-coral text-white text-xs font-bold transition flex items-center justify-center space-x-2"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span>Contribute to this Cause</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL STORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative bg-slate-100 min-h-[340px]">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                alt="Smt. Kausalya Ammal"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-serif font-bold">Smt. R. Kausalya Ammal, 74</p>
                <p className="text-xs text-slate-300">Annapurna Kitchen Beneficiary, Vyisarpadi</p>
              </div>
            </div>

            <div className="lg:col-span-7 p-8 sm:p-12 space-y-4 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Authentic Beneficiary Story</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
                “When You Serve Food with Loving Respect, You Restore Someone’s Will to Live.”
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                “After my husband passed away and my knee joints deteriorated, even preparing one meal became impossible. I spent months on empty stomachs, feeling forgotten by the world.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every morning at 8:30 AM, Bridge Of Love volunteers arrive at my door with hot, freshly prepared meals and a warm smile. They don’t just deliver food; they inquire about my health and treat me like their own grandmother. Because of them, I know I am never truly alone.”
              </p>
              <div className="pt-2">
                <button
                  onClick={() => openDonationModal()}
                  className="py-3 px-6 rounded-xl bg-brand-coral text-white text-xs font-bold shadow hover:bg-brand-coralHover transition"
                >
                  Sponsor an Elder’s Meals (₹1,500/month)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENCY PREVIEW */}
      <section className="bg-brand-navy text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Radical Accountability</span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold">100% Transparent Financial Accounting</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We publish our verified collections, approved expenditures, and current ledger balances in real time. We believe donors deserve absolute clarity on where every single rupee is utilized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Verified Income</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
                {formatINR(transparency?.totalIncome || 3825000)}
              </div>
              <p className="text-[11px] text-slate-400">Direct donations & sanctioned grants</p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Total Approved Relief Expenses</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-coral">
                {formatINR(transparency?.totalApprovedExpenses || 482000)}
              </div>
              <p className="text-[11px] text-slate-400">Rations, medical supplies & scholarships</p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Available Operational Corpus</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-gold">
                {formatINR(transparency?.availableBalance || 3343000)}
              </div>
              <p className="text-[11px] text-slate-400">Reserved for ongoing community relief</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/transparency"
              className="inline-flex items-center space-x-2 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
            >
              <BarChart2 className="w-4 h-4 text-brand-gold" />
              <span>Inspect Full Financial Transparency & Audit Statements</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. RECENT ACTIVITIES & DISPATCHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">On the Ground</span>
            <h3 className="text-3xl font-serif font-bold text-brand-navy">Recent Community Relief Activities</h3>
            <p className="text-sm text-slate-600">Photographic documentation of our volunteer field initiatives.</p>
          </div>
          <Link
            to="/activities"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-navy hover:text-brand-coral transition"
          >
            <span>View All Dispatches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((act) => (
            <div key={act.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-100">
                <img src={act.coverImage} alt={act.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-coral" />
                    <span>{new Date(act.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{act.location}</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-brand-navy line-clamp-2">{act.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{act.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-brand-coral">
                  Impact: {act.beneficiariesCount} Beneficiaries Served
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VOLUNTEER & MEMBERSHIP INVITATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Community of Compassion</span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold">Become a Registered Member Patron</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Register an account to receive monthly impact reports, download computerized 80G tax receipts instantly, track your lifetime contributions, and participate in our general body meetings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-sm font-bold shadow-md transition"
            >
              Register as a Member
            </Link>
            <button
              onClick={() => openDonationModal()}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition"
            >
              Make a Quick Donation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
