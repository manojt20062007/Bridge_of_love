import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { api } from '../../lib/api.js';
import { formatINR } from '../../lib/utils.js';
import { Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const MemberDonatePage: React.FC = () => {
  const { user } = useAuth();
  const { openDonationModal } = useDonationModal();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);

  useEffect(() => {
    api.get<any[]>('/campaigns?status=ACTIVE').then(setCampaigns).catch(() => {});
  }, []);

  const handleLaunch = () => {
    const chosenCampaign = campaigns.find((c) => c.id === selectedCampaignId);
    openDonationModal({
      campaignId: selectedCampaignId || undefined,
      campaignTitle: chosenCampaign?.title,
      defaultAmount: selectedAmount,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
          Make a Member Contribution
        </h1>
        <p className="text-xs text-slate-500">
          Your donation is directly recorded on your member account and an official 80G tax exemption receipt is generated instantly.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Cause Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Select Fund / Cause
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
          >
            <option value="">General Charitable Corpus (Where Most Needed)</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Select Amount
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                  selectedAmount === amt
                    ? 'bg-brand-coral text-white border-brand-coral shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {formatINR(amt, false)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-brand-cream rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-brand-green font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Tax Exemption Benefits</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Registered with Income Tax Department under Section 80G (Order No: AAATB1234FF20214). Your PAN is recorded to enable hassle-free deduction during tax filing.
          </p>
        </div>

        <button
          onClick={handleLaunch}
          className="w-full py-4 rounded-2xl bg-brand-coral hover:bg-brand-coralHover text-white text-sm font-bold shadow-md transition flex items-center justify-center space-x-2"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span>Confirm & Proceed to Donate {formatINR(selectedAmount)}</span>
        </button>
      </div>
    </div>
  );
};
