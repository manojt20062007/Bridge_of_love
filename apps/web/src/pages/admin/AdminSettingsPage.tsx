import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Settings, Save, CheckCircle2, Loader2, Building, ShieldCheck } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    TRUST_NAME: 'Bridge Of Love Charitable Trust',
    TRUST_TAGLINE: 'Connecting compassionate hearts with people in need',
    TRUST_REG_NO: 'BOL/TN/2021/004921',
    TRUST_PAN: 'AAATB1234F',
    TRUST_80G_REG: 'AAATB1234FF20214',
    TRUST_12A_REG: 'AAATB1234FE20213',
    TRUST_ADDRESS: 'Plot No. 42, Karuna Nagar, 3rd Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
    TRUST_PHONE: '+91 94441 23456',
    TRUST_EMAIL: 'contact@bridgeoflove.org',
    FOUNDER_NAME: 'Dr. Sundaram Krishnamurthy & Smt. Vasantha Krishnamurthy',
    CORPUS_DONATION_ACCOUNT: 'Bridge Of Love Charitable Trust | HDFC Bank A/C: 50200067891234 | IFSC: HDFC0000124',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api
      .get<any[]>('/admin/settings')
      .then((items) => {
        if (items && items.length > 0) {
          const map: Record<string, string> = {};
          items.forEach((i) => {
            map[i.key] = i.value;
          });
          setSettings((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSaving(true);

    try {
      await api.patch('/admin/settings', settings);
      setSuccessMessage('Trust settings and statutory parameters saved successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading trust settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Trust Settings & Statutory Parameters</h1>
        <p className="text-xs text-slate-500">
          Configure legal entity parameters, tax exemption certificates, and banking credentials displayed on receipts.
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

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Building className="w-4 h-4 text-brand-coral" />
              <span>Trust Name & Tagline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Official Legal Name</label>
                <input
                  type="text"
                  required
                  value={settings.TRUST_NAME || ''}
                  onChange={(e) => handleChange('TRUST_NAME', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={settings.TRUST_TAGLINE || ''}
                  onChange={(e) => handleChange('TRUST_TAGLINE', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Statutory */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Statutory Legal & Tax Registration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Registration Deed Number</label>
                <input
                  type="text"
                  value={settings.TRUST_REG_NO || ''}
                  onChange={(e) => handleChange('TRUST_REG_NO', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Trust Income Tax PAN</label>
                <input
                  type="text"
                  value={settings.TRUST_PAN || ''}
                  onChange={(e) => handleChange('TRUST_PAN', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Section 80G Approval Order No</label>
                <input
                  type="text"
                  value={settings.TRUST_80G_REG || ''}
                  onChange={(e) => handleChange('TRUST_80G_REG', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Section 12A Registration No</label>
                <input
                  type="text"
                  value={settings.TRUST_12A_REG || ''}
                  onChange={(e) => handleChange('TRUST_12A_REG', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact & Banking */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              Headquarters & Official Banking
            </h3>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Official Address</label>
              <input
                type="text"
                value={settings.TRUST_ADDRESS || ''}
                onChange={(e) => handleChange('TRUST_ADDRESS', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={settings.TRUST_PHONE || ''}
                  onChange={(e) => handleChange('TRUST_PHONE', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.TRUST_EMAIL || ''}
                  onChange={(e) => handleChange('TRUST_EMAIL', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Direct Bank Account Particulars</label>
              <textarea
                rows={2}
                value={settings.CORPUS_DONATION_ACCOUNT || ''}
                onChange={(e) => handleChange('CORPUS_DONATION_ACCOUNT', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Update All Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
