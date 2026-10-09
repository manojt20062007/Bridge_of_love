import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';

export const MemberReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>('/members/me/receipts')
      .then((data) => setReceipts(data || []))
      .catch(() => setReceipts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-brand-navy">80G Donation Receipts Archive</h1>
        <p className="text-xs text-slate-500">
          Official computer-generated tax exemption certificates. Download PDF documents for IT filing or verify authenticity.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading your receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p>No donation receipts issued yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt Number</th>
                  <th className="py-3.5 px-4">Date Issued</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Cause / Purpose</th>
                  <th className="py-3.5 px-4">80G Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      {rcpt.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(rcpt.issueDate)}</td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      {formatINR(rcpt.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{rcpt.purpose}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-brand-green font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Eligible (80G)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={`/verify-receipt/${rcpt.receiptNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition"
                        title="Verify Public Authenticity"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Verify</span>
                      </a>

                      <a
                        href={`/api/v1/members/me/receipts/${rcpt.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white font-semibold text-[11px] transition shadow-sm"
                        title="Download PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
