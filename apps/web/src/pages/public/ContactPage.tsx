import React, { useState } from 'react';
import { api } from '../../lib/api.js';
import { MapPin, Phone, Mail, Building, CheckCircle2, Send, Loader2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await api.post('/content/contact', {
        name,
        email,
        mobile: mobile || undefined,
        subject,
        message,
      });

      setSuccessMessage('Thank you for reaching out to Bridge Of Love. Our trustees or volunteer coordinators will connect with you within 24 hours.');
      setName('');
      setEmail('');
      setMobile('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 space-y-16 w-full px-6 sm:px-10 lg:px-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">Reach Out</span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-navy">
          Contact Bridge Of Love Trust
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Whether you wish to sponsor a program, volunteer at our community kitchen, or verify trust credentials, we are here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-serif font-bold text-brand-navy">Send Us a Message</h2>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Raman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject of Inquiry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sponsoring 50 Elder Meals"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Write your message or inquiry here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info: Address, Phone, Bank Account */}
        <div className="lg:col-span-5 space-y-6">
          {/* Office Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-serif font-bold text-brand-navy">Trust Headquarters</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-coral shrink-0 mt-0.5" />
                <span>Plot No. 42, Karuna Nagar, 3rd Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040</span>
              </p>
              <p className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-brand-coral shrink-0" />
                <span>+91 94441 23456</span>
              </p>
              <p className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-brand-coral shrink-0" />
                <span>contact@bridgeoflove.org</span>
              </p>
            </div>
          </div>

          {/* Official Bank Account Details for NEFT/RTGS */}
          <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 text-brand-gold text-xs font-bold">
              <Building className="w-4 h-4" />
              <span>Direct Bank Transfer Details</span>
            </div>

            <h3 className="text-base font-serif font-bold">Bridge Of Love Charitable Trust</h3>
            <p className="text-xs text-slate-300">
              For direct institutional corpus contributions or RTGS/NEFT donations:
            </p>

            <div className="bg-slate-800/80 p-4 rounded-xl space-y-2 text-xs font-mono border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-white">HDFC Bank Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch:</span>
                <span className="text-white">Anna Nagar West, Chennai</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account No:</span>
                <span className="text-amber-400 font-bold">50200067891234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="text-amber-400 font-bold">HDFC0000124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="text-white">Current A/C (Trust)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * After making a direct bank transfer, please email the transaction reference to receipts@bridgeoflove.org to receive your official 80G receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
