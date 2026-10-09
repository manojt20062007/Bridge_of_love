import React, { useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Shield, KeyRound, CheckCircle2, Loader2, LogOut } from 'lucide-react';

export const MemberSecurityPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { logout } = useAuth();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters with numbers and symbols');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setSuccessMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all active sessions on other devices?')) {
      try {
        await api.post('/auth/logout-all');
        await logout();
      } catch (err) {
        // ignore
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-brand-navy">Account Security</h1>
        <p className="text-xs text-slate-500">
          Update your secret credentials and protect your member identity.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-serif font-bold text-brand-navy flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-brand-coral" />
          <span>Change Account Password</span>
        </h2>

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

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-6 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Active Login Sessions</p>
            <p className="text-[11px] text-slate-500">Sign out from any other browsers or mobile sessions.</p>
          </div>

          <button
            onClick={handleLogoutAll}
            className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out All Devices</span>
          </button>
        </div>
      </div>
    </div>
  );
};
