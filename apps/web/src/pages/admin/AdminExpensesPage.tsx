import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import {
  PlusCircle,
  CheckCircle,
  XCircle,
  Check,
  CreditCard,
  Filter,
  Loader2,
  X,
  FileText,
} from 'lucide-react';

export const AdminExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FOOD_DISTRIBUTION');
  const [amount, setAmount] = useState<number>(10000);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paidTo, setPaidTo] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Reject Modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchExpenses = () => {
    setIsLoading(true);
    let url = '/admin/expenses?';
    if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
    if (categoryFilter !== 'ALL') url += `category=${categoryFilter}&`;

    api
      .get<any[]>(url)
      .then(setExpenses)
      .catch(() => setExpenses([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter, categoryFilter]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/expenses', {
        title: title.trim(),
        description: description.trim(),
        category,
        amount: Number(amount),
        expenseDate: new Date(expenseDate).toISOString(),
        paymentMethod,
        paidTo: paidTo.trim(),
        invoiceNumber: invoiceNumber.trim() || undefined,
      });

      setIsModalOpen(false);
      fetchExpenses();
      // reset
      setTitle('');
      setDescription('');
      setPaidTo('');
      setInvoiceNumber('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('Confirm approval for this expense voucher?')) {
      try {
        await api.post(`/admin/expenses/${id}/approve`);
        fetchExpenses();
      } catch (err: any) {
        alert(err.message || 'Approval failed');
      }
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    try {
      await api.post(`/admin/expenses/${rejectingId}/reject`, { reason: rejectReason.trim() });
      setRejectingId(null);
      setRejectReason('');
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handlePay = async (id: string) => {
    if (window.confirm('Execute payment and debit amount from trust operational ledger?')) {
      try {
        await api.post(`/admin/expenses/${id}/pay`);
        fetchExpenses();
      } catch (err: any) {
        alert(err.message || 'Payment mark failed');
      }
    }
  };

  const categories = [
    { value: 'FOOD_DISTRIBUTION', label: 'Food & Nutrition Relief' },
    { value: 'MEDICAL_ASSISTANCE', label: 'Medical Assistance' },
    { value: 'EDUCATION_SUPPORT', label: 'Education Support' },
    { value: 'CLOTHING', label: 'Clothing & Blankets' },
    { value: 'SHELTER', label: 'Elder Shelter Care' },
    { value: 'EMERGENCY_RELIEF', label: 'Disaster Emergency Relief' },
    { value: 'ADMINISTRATION', label: 'Administration' },
    { value: 'TRANSPORTATION', label: 'Mobile Clinic Logistics' },
    { value: 'EVENTS', label: 'Community Screening Camps' },
    { value: 'OTHER', label: 'Other Operational Expenses' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Expense Management & Approvals</h1>
          <p className="text-xs text-slate-500">
            Submit program expense vouchers, enforce approval workflows, and record ledger disbursements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-3.5 bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Expense Voucher</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved (Awaiting Payment)</option>
          <option value="PAID">Disbursed (Paid)</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No expense vouchers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Voucher No</th>
                  <th className="py-3.5 px-4">Expense Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Vendor / Payee</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{exp.expenseNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{exp.title}</p>
                      <p className="text-[11px] text-slate-500 max-w-xs truncate">{exp.description}</p>
                      {exp.rejectionReason && (
                        <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                          Reason: {exp.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {categories.find((c) => c.value === exp.category)?.label || exp.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <div>{exp.paidTo}</div>
                      {exp.invoiceNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">Inv: {exp.invoiceNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-coral">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : exp.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-700'
                            : exp.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {exp.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(exp.expenseDate)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {exp.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => handleApprove(exp.id)}
                            className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition inline-flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingId(exp.id)}
                            className="py-1 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-[11px] transition inline-flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {exp.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePay(exp.id)}
                          className="py-1 px-3 bg-brand-navy hover:bg-brand-navyLight text-white rounded-lg font-bold text-[11px] transition inline-flex items-center space-x-1 shadow-sm"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Mark Paid & Debit Ledger</span>
                        </button>
                      )}

                      {exp.status === 'PAID' && (
                        <span className="text-[11px] text-green-700 font-semibold flex items-center justify-end">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Expense Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">Create Expense Voucher</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase of 2,500 kg Sona Masoori Rice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specify procurement particulars, items, beneficiaries served..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Program Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
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
                  <label className="block font-semibold text-slate-600 mb-1">Paid To / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Nadu Agro Wholesale"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Bill / Invoice Reference No</label>
                  <input
                    type="text"
                    placeholder="INV-TNA-8812"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Disbursement Mode *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CASH">Petty Cash Voucher</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit for Trustee Approval</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-serif font-bold text-slate-900">Reject Expense Voucher</h3>
            <p className="text-xs text-slate-500">
              Provide an official reason for rejecting this expenditure voucher. The explanation will be permanently recorded in the audit trail.
            </p>

            <form onSubmit={handleReject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Incomplete tax invoice / Vendor quote exceeds approved budget..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
