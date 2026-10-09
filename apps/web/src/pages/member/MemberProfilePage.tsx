import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { CheckCircle2, Loader2, Save } from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.profile?.fullName || '');
      setMobile(user.mobile || '');
      setAddress(user.profile?.address || '');
      setCity(user.profile?.city || '');
      setState(user.profile?.state || '');
      setPostalCode(user.profile?.postalCode || '');
      setPanNumber(user.profile?.panNumber || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      await api.patch('/members/me', {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postalCode: postalCode.trim() || null,
        panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : null,
      });

      await refreshUser();
      setSuccessMessage('Member profile updated successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-brand-navy">Personal Profile</h1>
        <p className="text-xs text-slate-500">
          Manage your personal identity, contact details, and statutory PAN for tax deduction certificates.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-brand-coral outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number (For 80G Receipts)</label>
              <input
                type="text"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs uppercase bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Postal Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
