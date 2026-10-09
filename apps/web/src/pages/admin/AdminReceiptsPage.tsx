import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { FileText, Download, ExternalLink, Ban, Search, ShieldCheck, X } from 'lucide-react';

export const AdminReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cancel Modal
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchReceipts = () => {
    setIsLoading(true);
    api
      .get<any[]>('/admin/receipts')
      .then(setReceipts)
      .catch(() => setReceipts([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleCancelReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingId || cancelReason.trim().length < 5) return;

    try {
      await api.post(`/admin/receipts/${cancellingId}/cancel`, {
        reason: cancelReason.trim(),
      });
      setCancellingId(null);
      setCancelReason('');
      fetchReceipts();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel receipt');
    }
  };

  const filtered = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.donorName.toLowerCase().includes(search.toLowerCase()) ||
      r.donorEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">80G Donation Receipt Registry</h1>
          <p className="text-xs text-slate-500">
            Immutable archive of all issued computerized receipts. Manage cancellations while maintaining legal audit trails.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, donor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading receipts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No matching receipts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">PAN Number</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      <a
                        href={`/verify-receipt/${r.receiptNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-brand-coral hover:underline"
                      >
                        {r.receiptNumber}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.donorName}</p>
                      <p className="text-[11px] text-slate-400">{r.donorEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.donorPan || '-'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(r.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{r.purpose}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'ISSUED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.cancellationReason && (
                        <p className="text-[10px] text-red-600 mt-0.5 max-w-[140px] truncate">
                          {r.cancellationReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(r.issueDate)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <a
                        href={`/verify-receipt/${r.receiptNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-500 hover:text-brand-navy inline-block"
                        title="Verify Public View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <a
                        href={`/api/v1/members/me/receipts/${r.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-500 hover:text-brand-coral inline-block"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {r.status === 'ISSUED' && (
                        <button
                          onClick={() => setCancellingId(r.id)}
                          className="p-1 rounded text-red-500 hover:text-red-700"
                          title="Mark Cancelled"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">Cancel Receipt</h3>
            <p className="text-xs text-slate-500">
              Marking this receipt as cancelled will maintain the historic record while declaring it invalid upon verification. Please provide an audit reason.
            </p>

            <form onSubmit={handleCancelReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Cancellation Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Duplicate transaction / Chargeback requested by donor / Cheque bounced..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-slate-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Mark as Cancelled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
