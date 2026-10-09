import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { Heart, ShieldCheck, Users, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const CampaignDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openDonationModal } = useDonationModal();

  useEffect(() => {
    setIsLoading(true);
    api
      .get<any>(`/campaigns/${slug}`)
      .then(setCampaign)
      .catch(() => setCampaign(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-serif font-bold text-slate-800">Campaign Not Found</h2>
        <p className="text-sm text-slate-500">The cause you are looking for may have concluded or is unavailable.</p>
        <Link
          to="/campaigns"
          className="inline-flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-brand-navy text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Causes</span>
        </Link>
      </div>
    );
  }

  const target = Number(campaign.targetAmount || 1);
  const raised = Number(campaign.raisedAmount || 0);
  const percent = Math.min(100, Math.round((raised / target) * 100));

  return (
    <div className="py-10 sm:py-16 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/campaigns"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Causes</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Cover, Story, Beneficiary Scope */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-lg bg-slate-100 aspect-video">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-brand-navy/90 text-white text-xs font-bold py-1.5 px-3.5 rounded-full backdrop-blur-sm">
              {campaign.category}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy leading-tight">
              {campaign.title}
            </h1>
            <p className="text-base text-slate-700 font-medium leading-relaxed bg-brand-cream p-4 rounded-2xl border border-slate-200">
              {campaign.summary}
            </p>
          </div>

          {/* Full Narrative */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-brand-navy border-b border-slate-100 pb-3">
              About This Initiative
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {campaign.description}
            </div>

            {campaign.beneficiaryDescription && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-brand-green" /> Beneficiary Scope
                </span>
                <p className="leading-relaxed">{campaign.beneficiaryDescription}</p>
              </div>
            )}
          </div>

          {/* Recent Contributions List */}
          {campaign.donations && campaign.donations.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-brand-navy flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-coral" />
                <span>Recent Benefactor Contributions</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {campaign.donations.map((d: any) => (
                  <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{d.donorName}</p>
                      <p className="text-[11px] text-slate-400">{formatDate(d.createdAt)}</p>
                    </div>
                    <div className="font-bold text-brand-coral font-mono">{formatINR(d.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Column: Progress & Donation Action */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Fundraising Progress</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-serif font-bold text-brand-navy">{formatINR(raised, false)}</span>
                <span className="text-xs text-slate-500">raised of {formatINR(target, false)}</span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-coral rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{percent}% Goal Achieved</span>
                <span>Active Campaign</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <button
                onClick={() => openDonationModal({ campaignId: campaign.id, campaignTitle: campaign.title })}
                className="w-full py-4 rounded-2xl bg-brand-coral hover:bg-brand-coralHover text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>Donate to this Cause</span>
              </button>

              <div className="p-3 bg-brand-cream rounded-xl text-center text-xs text-slate-600 space-y-1">
                <span className="flex items-center justify-center text-brand-green font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-1 text-brand-green" /> 80G Tax Exemption Eligible
                </span>
                <p className="text-[11px] text-slate-500">
                  Instant computerized PDF receipt generated upon verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
