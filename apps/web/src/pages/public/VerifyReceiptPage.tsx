import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { formatINR, formatDate } from '../../lib/utils.js';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Heart, Download } from 'lucide-react';

export const VerifyReceiptPage: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    api
      .get<any>(`/donations/public/verify-receipt/${receiptNumber}`)
      .then(setData)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [receiptNumber]);

  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Querying trust verification ledger...</p>
        </div>
      ) : isError || !data ? (
        <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800">Unverified or Invalid Receipt</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            No official record could be found matching receipt number <strong>{receiptNumber}</strong> in the Bridge Of Love verified registry.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-block py-2.5 px-6 rounded-xl bg-brand-navy text-white text-xs font-bold"
            >
              Contact Trust Office
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-navy text-white p-6 sm:p-8 text-center space-y-2 border-b border-white/10">
            <div className="inline-flex items-center space-x-1.5 bg-brand-green/20 text-emerald-400 border border-brand-green/30 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>OFFICIALLY VERIFIED & AUTHENTIC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">Bridge Of Love Charitable Trust</h1>
            <p className="text-xs text-slate-300">
              Statutory Donation Receipt Verification (Section 80G, Income Tax Act)
            </p>
          </div>

          {/* Details Table */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Receipt Number</span>
                <p className="text-sm font-mono font-bold text-brand-navy">{data.receiptNumber}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Date of Issue</span>
                <p className="text-sm font-semibold text-slate-800">{formatDate(data.issueDate)}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Donor Identity (Masked for Privacy)</span>
                <p className="text-sm font-semibold text-slate-800">{data.maskedDonorName}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Payment Mode</span>
                <p className="text-sm font-semibold text-slate-800">{data.paymentMethod}</p>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-brand-cream p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                <span className="text-slate-600 font-semibold">Purpose / Program Supported:</span>
                <span className="font-bold text-brand-navy text-right max-w-xs">{data.purpose}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700">Verified Contribution Amount:</span>
                <span className="text-brand-coral font-mono text-base">{formatINR(data.amount)}</span>
              </div>
            </div>

            {/* Legal Information */}
            <div className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 space-y-1 border border-slate-200">
              <p className="font-bold text-slate-700">Legal Registration Particulars:</p>
              <p>Trust Reg No: {data.trustRegNo} | Trust PAN: {data.trustPan}</p>
              <p>Income Tax 80G Order: {data.trust80GReg} (Valid & Current)</p>
              <p>Cryptographic Verification Hash: {data.verificationCode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
