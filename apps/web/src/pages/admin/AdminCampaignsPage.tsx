import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatINR } from '../../lib/utils.js';
import { PlusCircle, Target, Edit, Trash2, X, Loader2 } from 'lucide-react';

export const AdminCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [category, setCategory] = useState('Nutrition Relief');
  const [beneficiaryDescription, setBeneficiaryDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchCampaigns = () => {
    setIsLoading(true);
    api
      .get<any[]>('/campaigns?status=ALL')
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/campaigns', {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        summary: summary.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        targetAmount: Number(targetAmount),
        startDate: new Date().toISOString(),
        category,
        beneficiaryDescription: beneficiaryDescription.trim() || null,
      });

      setIsModalOpen(false);
      fetchCampaigns();
      setTitle('');
      setSlug('');
      setSummary('');
      setDescription('');
      setCoverImage('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Campaign Causes Management</h1>
          <p className="text-xs text-slate-500">Create, monitor, and manage public fundraising causes.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-3.5 bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New Cause</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No campaigns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Cause Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Target Goal</th>
                  <th className="py-3.5 px-4">Total Raised</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Public Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const target = Number(c.targetAmount || 1);
                  const raised = Number(c.raisedAmount || 0);
                  const percent = Math.min(100, Math.round((raised / target) * 100));

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">/{c.slug}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {formatINR(target, false)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-coral">
                        {formatINR(raised, false)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-24 bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                          <div
                            className="bg-brand-coral h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500">{percent}%</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/campaigns/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-coral font-bold hover:underline"
                        >
                          View Public Page
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">Create Fundraising Cause</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sponsoring 50 Destitute Elders' Monthly Rations"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="sponsoring-elders-monthly-rations"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nutrition & Food Relief"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Target Amount (INR) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Cover Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Short Summary (Displayed on cards) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Concise overview of this charitable initiative..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Detailed Narrative *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Comprehensive description of the situation, needs, and execution plan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Beneficiary Scope Details</label>
                <input
                  type="text"
                  placeholder="e.g. 50 abandoned seniors residing in North Chennai slums"
                  value={beneficiaryDescription}
                  onChange={(e) => setBeneficiaryDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Cause</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
