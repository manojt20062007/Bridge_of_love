import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { PlusCircle, ArrowDownLeft, Loader2, X } from 'lucide-react';

export const AdminIncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('GRANT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchIncomes = () => {
    setIsLoading(true);
    api
      .get<any[]>('/admin/income')
      .then(setIncomes)
      .catch(() => setIncomes([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/income', {
        title: title.trim(),
        amount: Number(amount),
        incomeDate: new Date(incomeDate).toISOString(),
        source,
        referenceNumber: referenceNumber.trim() || null,
        notes: notes.trim() || null,
      });

      setIsModalOpen(false);
      fetchIncomes();
      setTitle('');
      setReferenceNumber('');
      setNotes('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to record income');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Grants & Non-Gateway Income</h1>
          <p className="text-xs text-slate-500">Record institutional CSR grants, bank transfers, and corpus contributions.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-3.5 bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record Income Entry</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading income ledger...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No income entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Title / Source Description</th>
                  <th className="py-3.5 px-4">Source Type</th>
                  <th className="py-3.5 px-4">Reference No</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Received By</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inc.title}</p>
                      {inc.notes && <p className="text-[11px] text-slate-500 truncate max-w-sm">{inc.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">
                      {inc.source.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{inc.referenceNumber || '-'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {formatINR(inc.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inc.receivedBy}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{formatDate(inc.incomeDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">Record Other Income</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateIncome} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Income Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSR Grant from Tech Foundation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Income Category *</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="GRANT">Institutional CSR Grant</option>
                    <option value="BANK_TRANSFER">Patron Bank Transfer</option>
                    <option value="MEMBERSHIP_FEE">Membership Fee</option>
                    <option value="OFFLINE_DONATION">Offline Corpus Donation</option>
                    <option value="OTHER">Other Income</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Date Received *</label>
                  <input
                    type="date"
                    required
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Sanction / UTR Reference</label>
                  <input
                    type="text"
                    placeholder="GRANT-2026-Q1"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notes / Program Earmarking</label>
                <textarea
                  rows={2}
                  placeholder="Specify purpose, e.g. Earmarked for Asha Deep girl scholar tablets..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record & Credit Ledger</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
