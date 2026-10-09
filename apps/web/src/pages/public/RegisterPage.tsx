import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Heart, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters with numbers and symbols');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      return;
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber.trim())) {
      setErrorMessage('Invalid PAN format (expected e.g. ABCDE1234F)');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password,
        confirmPassword,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : undefined,
        acceptTerms,
      });

      navigate('/member/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-coral/20 text-brand-coral flex items-center justify-center mx-auto border border-brand-coral/40">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
            Become a Member Patron
          </h1>
          <p className="text-xs text-slate-500">
            Join the Bridge Of Love charitable trust community. Access personal 80G tax receipts and lifetime donation records.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Ramanathan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. ananya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number (10 Digits) *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-brand-coral outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number (Optional, for 80G)</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
            <input
              type="text"
              placeholder="Apartment, Street address"
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
                placeholder="Chennai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
              <input
                type="text"
                placeholder="Tamil Nadu"
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
                placeholder="600040"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-brand-coral rounded border-slate-300 focus:ring-brand-coral"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-normal">
              I agree to the Bridge Of Love Charitable Trust rules, constitution, and terms of service. I confirm that funds provided are from legitimate personal income.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Member Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already registered as a member? </span>
          <Link to="/login" className="font-bold text-brand-navy hover:text-brand-coral transition">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
