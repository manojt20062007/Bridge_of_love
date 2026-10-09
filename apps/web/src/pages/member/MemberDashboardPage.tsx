import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { Heart, FileText, History, Download, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MemberDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openDonationModal } = useDonationModal();
  const [data, setData] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/members/me/donations?limit=5'),
      api.get<any[]>('/members/me/receipts'),
    ])
      .then(([donationsData, receiptsData]) => {
        setData(donationsData);
        setReceipts(receiptsData || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading your member dashboard...</p>
      </div>
    );
  }

  const totalContributed = data?.totalContributed || 0;
  const totalCount = data?.total || 0;
  const recentItems = data?.items || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-brand-navy rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-brand-coral/20 text-brand-coral px-3 py-1 rounded-full text-xs font-bold border border-brand-coral/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Member Patron</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Welcome back, {user?.profile?.fullName || user?.email.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Your benevolent contributions empower elderly citizens and provide girl scholars with life-changing opportunities.
          </p>
        </div>

        <button
          onClick={() => openDonationModal()}
          className="py-3 px-6 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold shadow transition flex items-center space-x-2 shrink-0"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Make a Contribution</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">Lifetime Contribution</span>
          <div className="text-3xl font-serif font-bold text-brand-navy">{formatINR(totalContributed)}</div>
          <p className="text-xs text-slate-500">100% directly deployed for verified relief</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">Total Donations Count</span>
          <div className="text-3xl font-serif font-bold text-brand-coral">{totalCount}</div>
          <p className="text-xs text-slate-500">Recorded verified contributions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs uppercase font-bold text-slate-400">80G Receipts Issued</span>
          <div className="text-3xl font-serif font-bold text-brand-green">{receipts.length}</div>
          <p className="text-xs text-slate-500">Downloadable tax exemption certificates</p>
        </div>
      </div>

      {/* Recent Donations & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Donations */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-serif font-bold text-brand-navy flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-coral" />
              <span>Recent Contributions</span>
            </h2>
            <Link to="/member/donations" className="text-xs font-bold text-brand-coral hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Heart className="w-8 h-8 mx-auto text-slate-300" />
              <p>You haven't made any contributions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentItems.map((item: any) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">
                      {item.campaign?.title || 'General Charitable Corpus Fund'}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>{formatDate(item.createdAt)}</span>
                      <span>•</span>
                      <span>{item.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-bold font-mono text-sm text-brand-navy">
                      {formatINR(item.amount)}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Issued Receipts Quick Download */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-serif font-bold text-brand-navy flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-green" />
              <span>80G Receipts Archive</span>
            </h2>
            <Link to="/member/receipts" className="text-xs font-bold text-brand-coral hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {receipts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p>Receipts will appear here after a verified contribution.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.slice(0, 4).map((rcpt) => (
                <div
                  key={rcpt.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono font-bold text-brand-navy">{rcpt.receiptNumber}</p>
                    <p className="text-[11px] text-slate-500">{formatDate(rcpt.issueDate)}</p>
                    <p className="text-[11px] font-bold text-brand-coral">{formatINR(rcpt.amount)}</p>
                  </div>

                  <a
                    href={`/api/v1/members/me/receipts/${rcpt.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:text-brand-coral hover:border-brand-coral transition shadow-sm"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
