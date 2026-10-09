import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatINR } from '../../lib/utils.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { Heart, Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const { openDonationModal } = useDonationModal();

  useEffect(() => {
    setIsLoading(true);
    let url = '/campaigns?status=ACTIVE';
    if (selectedCategory !== 'ALL') {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    if (search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }

    api
      .get<any[]>(url)
      .then((data) => setCampaigns(data || []))
      .catch(() => setCampaigns([]))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, search]);

  const categories = [
    'ALL',
    'Nutrition & Food Relief',
    'Child Education',
    'Healthcare & Elder Care',
  ];

  return (
    <div className="py-12 sm:py-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Give with Purpose</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          Active Causes Requiring Your Compassion
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Each campaign is independently accounted for. Your contribution goes directly to the chosen initiative, and you receive an official 80G tax receipt immediately.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-coral text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Causes' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
          />
        </div>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading active causes...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-slate-700">No campaigns found</h3>
          <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((camp) => {
            const target = Number(camp.targetAmount || 1);
            const raised = Number(camp.raisedAmount || 0);
            const percent = Math.min(100, Math.round((raised / target) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={camp.coverImage}
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-brand-navy/90 text-white text-[11px] font-semibold py-1 px-3 rounded-full backdrop-blur-sm">
                    {camp.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link to={`/campaigns/${camp.slug}`}>
                      <h3 className="text-lg font-serif font-bold text-brand-navy group-hover:text-brand-coral transition line-clamp-2">
                        {camp.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {camp.summary}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-brand-navy">Raised: {formatINR(raised, false)}</span>
                      <span className="text-slate-500">Target: {formatINR(target, false)}</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-coral rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{percent}% Funded</span>
                      <span className="flex items-center text-brand-green font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 80G Tax Exemption
                      </span>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <Link
                        to={`/campaigns/${camp.slug}`}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition text-center flex items-center justify-center"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>

                      <button
                        onClick={() => openDonationModal({ campaignId: camp.id, campaignTitle: camp.title })}
                        className="py-2.5 px-3 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Donate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
