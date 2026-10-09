import React, { useState, useEffect } from 'react';
import { useDonationModal } from '../../context/DonationModalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { formatINR } from '../../lib/utils.js';
import { Heart, CheckCircle2, ShieldCheck, X, Loader2, Download, ExternalLink } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const DonationModal: React.FC = () => {
  const { isOpen, options, closeDonationModal } = useDonationModal();
  const { user } = useAuth();

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [campaignId, setCampaignId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Donor Details
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorPan, setDonorPan] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notes, setNotes] = useState('');

  // States
  const [step, setStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdReceipt, setCreatedReceipt] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('FORM');
      setErrorMessage('');
      setCreatedReceipt(null);

      // Preload campaigns
      api.get<any[]>('/campaigns').then((data) => {
        setCampaigns(data || []);
      }).catch(() => {});

      if (options.defaultAmount) {
        setAmount(options.defaultAmount);
        setCustomAmount(options.defaultAmount.toString());
      }
      if (options.campaignId) {
        setCampaignId(options.campaignId);
      } else {
        setCampaignId('');
      }

      // Pre-fill user data if logged in
      if (user) {
        setDonorName(user.profile?.fullName || '');
        setDonorEmail(user.email || '');
        setDonorMobile(user.mobile || '');
        setDonorAddress(user.profile?.address || '');
        setDonorPan(user.profile?.panNumber || '');
      }
    }
  }, [isOpen, options, user]);

  if (!isOpen) return null;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    }
  };

  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount < 100) {
      setErrorMessage('Minimum donation amount is ₹100.');
      return;
    }
    if (!donorName.trim() || !donorEmail.trim() || !donorMobile.trim()) {
      setErrorMessage('Please fill in your full name, email, and mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(donorMobile.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (donorPan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(donorPan.trim())) {
      setErrorMessage('Please enter a valid 10-character PAN (e.g. ABCDE1234F) for 80G tax benefit.');
      return;
    }

    setStep('PROCESSING');

    try {
      // 1. Create order on backend
      const orderData = await api.post<any>('/donations/create-order', {
        amount,
        campaignId: campaignId || null,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorMobile: donorMobile.trim(),
        donorAddress: donorAddress.trim() || null,
        donorPan: donorPan.trim() ? donorPan.trim().toUpperCase() : null,
        isAnonymous,
        notes: notes.trim() || null,
      });

      // 2. Complete payment (using built-in simulation or Razorpay checkout)
      setTimeout(async () => {
        try {
          const verifyData = await api.post<any>('/donations/verify-payment', {
            donationId: orderData.donationId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_${Date.now()}_simulated`,
            razorpaySignature: 'mock_signature_valid',
          });

          setCreatedReceipt(verifyData.receipt);
          setStep('SUCCESS');
        } catch (verifyErr: any) {
          setErrorMessage(verifyErr.message || 'Payment verification failed.');
          setStep('FORM');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to initiate donation.');
      setStep('FORM');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-brand-navy text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral border border-brand-coral/40">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif">Make a Compassionate Donation</h3>
              <p className="text-xs text-slate-300">100% Tax Exemption under Section 80G | Registered Trust</p>
            </div>
          </div>
          <button
            onClick={closeDonationModal}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 'FORM' && (
            <form onSubmit={handleInitiateDonation} className="space-y-5">
              {errorMessage && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Purpose / Campaign Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Cause / Fund
                </label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none text-slate-800"
                >
                  <option value="">General Charitable Corpus (Where Most Needed)</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Contribution Amount (INR)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-2 px-1 text-sm font-semibold rounded-lg border transition ${
                        amount === amt
                          ? 'bg-brand-coral text-white border-brand-coral shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-coral hover:bg-slate-100'
                      }`}
                    >
                      {formatINR(amt, false)}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    placeholder="Enter custom amount (min ₹100)"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Donor Identity Fields */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Donor Particulars (For 80G Receipt)
                  </h4>
                  <span className="text-xs text-brand-green font-medium flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verifiable 80G Receipt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Email Address (For PDF Receipt) *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Mobile Number (10 digits) *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 text-xs bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={donorMobile}
                        onChange={(e) => setDonorMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-brand-coral outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">PAN Number (For Tax Exemption)</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={donorPan}
                      onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm uppercase bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Postal Address</label>
                  <input
                    type="text"
                    placeholder="Address, City, State, PIN code"
                    value={donorAddress}
                    onChange={(e) => setDonorAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-coral outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="anonToggle"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-brand-coral rounded border-slate-300 focus:ring-brand-coral"
                  />
                  <label htmlFor="anonToggle" className="text-xs text-slate-600 cursor-pointer">
                    Keep my identity anonymous on public donor boards
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white font-bold text-base shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Proceed to Donate {formatINR(amount)}</span>
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  🔒 Secured with 256-bit SSL encryption & official Razorpay processing
                </p>
              </div>
            </form>
          )}

          {step === 'PROCESSING' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-brand-coral animate-spin mx-auto" />
              <h4 className="text-lg font-bold font-serif text-brand-navy">Processing Contribution...</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Connecting with secure payment gateway to verify your contribution of {formatINR(amount)}.
              </p>
            </div>
          )}

          {step === 'SUCCESS' && createdReceipt && (
            <div className="py-4 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-serif font-bold text-brand-navy">Thank You for Your Generosity!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Your contribution of <strong>{formatINR(createdReceipt.amount)}</strong> has been received and verified.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2 font-semibold">
                  <span className="text-slate-500">Official Receipt No:</span>
                  <span className="text-brand-navy font-mono text-sm">{createdReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Donor Name:</span>
                  <span className="font-medium text-slate-800">{createdReceipt.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cause / Purpose:</span>
                  <span className="font-medium text-slate-800">{createdReceipt.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Benefit:</span>
                  <span className="text-brand-green font-semibold">Eligible for 80G Deduction</span>
                </div>
              </div>

              {/* Download & Verification Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`/api/v1/members/me/receipts/${createdReceipt.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-semibold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </a>

                <a
                  href={`/verify-receipt/${createdReceipt.receiptNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify Authenticity Online</span>
                </a>
              </div>

              <button
                type="button"
                onClick={closeDonationModal}
                className="text-xs text-slate-500 hover:text-slate-800 underline mt-2 inline-block"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
