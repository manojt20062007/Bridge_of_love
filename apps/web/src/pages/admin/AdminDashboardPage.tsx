import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  HeartHandshake,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<any>('/admin/dashboard')
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading administrative operations metrics...</p>
      </div>
    );
  }

  const fin = stats?.financial || {};

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Operations Overview</h1>
          <p className="text-xs text-slate-500">Live operational metrics, funds deployment, and pending approvals.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/expenses"
            className="py-2 px-3.5 bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Review Pending Expenses</span>
          </Link>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Members</div>
          <div className="text-2xl font-serif font-bold text-slate-900">{stats?.totalMembers || 0}</div>
          <div className="text-[10px] text-brand-green font-semibold">{stats?.activeMembers || 0} active patrons</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Verified Donations</div>
          <div className="text-2xl font-serif font-bold text-brand-navy">
            {formatINR(fin?.totalVerifiedDonations || 0, false)}
          </div>
          <div className="text-[10px] text-slate-500">This month: {formatINR(stats?.donationsThisMonth || 0, false)}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Trust Income</div>
          <div className="text-2xl font-serif font-bold text-emerald-600">
            {formatINR(fin?.totalIncome || 0, false)}
          </div>
          <div className="text-[10px] text-slate-500">Includes grants & bank transfers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Approved Expenses</div>
          <div className="text-2xl font-serif font-bold text-brand-coral">
            {formatINR(fin?.totalApprovedExpenses || 0, false)}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold">
            {formatINR(fin?.totalPendingExpenses || 0, false)} pending review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Available Balance</div>
          <div className="text-2xl font-serif font-bold text-brand-green">
            {formatINR(fin?.availableBalance || 0, false)}
          </div>
          <div className="text-[10px] text-slate-500">Net uncommitted corpus</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Causes</div>
          <div className="text-2xl font-serif font-bold text-slate-900">{stats?.activeCampaignsCount || 0}</div>
          <div className="text-[10px] text-slate-500">Publicly accepting donations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Pending Approvals</div>
          <div className="text-2xl font-serif font-bold text-amber-600">
            {stats?.recentExpenses?.filter((e: any) => e.status === 'PENDING_APPROVAL').length || 0}
          </div>
          <div className="text-[10px] text-slate-500">Vouchers awaiting trustee sign-off</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Failed Gateways</div>
          <div className="text-2xl font-serif font-bold text-red-600">{stats?.failedPaymentsCount || 0}</div>
          <div className="text-[10px] text-slate-500">Cancelled or interrupted checkouts</div>
        </div>
      </div>

      {/* Chart Section: Monthly Trends */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">Collections vs. Relief Expenditures (6 Months)</h2>
            <p className="text-xs text-slate-500">Comparison of all incoming donations and disbursed program expenses.</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fin?.monthlyTrends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(value: any) => [formatINR(Number(value)), '']}
                contentStyle={{ backgroundColor: '#0B1B2B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name="Income Received" fill="#15803D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Relief Disbursed" fill="#D94A3D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Donations */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-serif font-bold text-slate-900 flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-brand-coral" />
              <span>Recent Verified Donations</span>
            </h3>
            <Link to="/admin/donations" className="text-xs font-bold text-brand-coral hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(stats?.recentDonations || []).map((d: any) => (
              <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{d.donorName}</p>
                  <p className="text-[11px] text-slate-400">
                    {d.receipt?.receiptNumber || 'No receipt'} • {formatDate(d.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-brand-navy">{formatINR(d.amount)}</p>
                  <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    {d.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Expenses */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-serif font-bold text-slate-900 flex items-center space-x-2">
              <ArrowUpRight className="w-4 h-4 text-brand-coral" />
              <span>Recent Expense Vouchers</span>
            </h3>
            <Link to="/admin/expenses" className="text-xs font-bold text-brand-coral hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(stats?.recentExpenses || []).map((e: any) => (
              <div key={e.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5 max-w-[240px]">
                  <p className="font-semibold text-slate-800 truncate">{e.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {e.expenseNumber} • {formatDate(e.expenseDate)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-mono font-bold text-brand-coral">{formatINR(e.amount)}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : e.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-700'
                        : e.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
