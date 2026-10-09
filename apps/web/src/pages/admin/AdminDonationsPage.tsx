import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { Download, PlusCircle, Search, Filter, ShieldCheck, HeartHandshake, Loader2, X } from 'lucide-react';

export const AdminDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Offline Donation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorPan, setDonorPan] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [donationType, setDonationType] = useState('OFFLINE_CASH');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [campaignId, setCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDonations = () => {
    setIsLoading(true);
    let url = `/admin/donations?page=${page}&limit=20`;
    if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    api
      .get<any>(url)
      .then((data) => {
        setDonations(data?.items || []);
        setTotal(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => setDonations([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDonations();
    api.get<any[]>('/campaigns').then(setCampaigns).catch(() => {});
  }, [page, statusFilter, search]);

  const handleCreateOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/donations/offline', {
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorMobile: donorMobile.trim(),
        donorAddress: donorAddress.trim() || undefined,
        donorPan: donorPan.trim() ? donorPan.trim().toUpperCase() : undefined,
        amount: Number(amount),
        donationType,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        donationDate: new Date(donationDate).toISOString(),
        campaignId: campaignId || null,
      });

      setIsModalOpen(false);
      fetchDonations();
      // reset form
      setDonorName('');
      setDonorEmail('');
      setDonorMobile('');
      setDonorAddress('');
      setDonorPan('');
      setReferenceNumber('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to record offline donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/admin/donations?export=csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Donations & Collections</h1>
          <p className="text-xs text-slate-500">Comprehensive ledger of online gateway and offline cash/bank donations.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-3.5 bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Offline Donation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search donor name, email, mobile, receipt #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
          />
        </div>

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

      {/* Donations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading donations ledger...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No donation entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Cause / Purpose</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Receipt PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      {d.receipt?.receiptNumber ? (
                        <a
                          href={`/verify-receipt/${d.receipt.receiptNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-brand-coral hover:underline"
                        >
                          {d.receipt.receiptNumber}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.donorName}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{d.donorEmail}</div>
                      <div className="text-[11px] text-slate-400">+91 {d.donorMobile}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      {formatINR(d.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{d.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : d.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {d.campaign?.title || 'General Corpus'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(d.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {d.receipt ? (
                        <a
                          href={`/api/v1/members/me/receipts/${d.receipt.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-[11px]"
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({total} entries)
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

      {/* Modal: Record Offline Cash / Bank Transfer Donation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-brand-coral" />
                <h3 className="text-lg font-serif font-bold text-slate-900">Record Offline Donation</h3>
              </div>
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

            <form onSubmit={handleCreateOffline} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Venkat"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9840123456"
                    value={donorMobile}
                    onChange={(e) => setDonorMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contribution Amount (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="CASH">Cash Donation</option>
                    <option value="BANK_TRANSFER">Bank NEFT/RTGS</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Date Received *</label>
                  <input
                    type="date"
                    required
                    value={donationDate}
                    onChange={(e) => setDonationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Reference / UTR / Cheque No</label>
                  <input
                    type="text"
                    placeholder="UTR12345678"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Allocate to Cause</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="">General Charitable Corpus Fund</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Donor PAN (For 80G Certificate)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={donorPan}
                  onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 uppercase bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Issuing Receipt...</span>
                    </>
                  ) : (
                    <span>Record & Generate 80G Receipt</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
