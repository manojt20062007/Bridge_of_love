import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { Download, ExternalLink, Filter } from 'lucide-react';

export const MemberDonationsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = `/members/me/donations?page=${page}&limit=10`;
    if (statusFilter !== 'ALL') {
      url += `&status=${statusFilter}`;
    }

    api
      .get<any>(url)
      .then((data) => {
        setItems(data?.items || []);
        setTotal(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-navy">My Donation History</h1>
          <p className="text-xs text-slate-500">Record of your personal financial contributions and payment statuses.</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Verified Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading donation records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No donation records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Cause / Fund</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      {item.receipt?.receiptNumber ? (
                        <a
                          href={`/verify-receipt/${item.receipt.receiptNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-brand-coral hover:underline"
                        >
                          {item.receipt.receiptNumber}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {item.campaign?.title || 'General Charitable Corpus'}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      {formatINR(item.amount)}
                    </td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {item.receipt ? (
                        <a
                          href={`/api/v1/members/me/receipts/${item.receipt.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} total donations)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="py-1 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="py-1 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
