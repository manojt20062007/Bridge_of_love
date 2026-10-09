import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/utils.js';
import { PlusCircle, Trash2, Check, MessageSquare, Image, Calendar, UserCheck } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const [tab, setTab] = useState<'ACTIVITIES' | 'GALLERY' | 'TESTIMONIALS' | 'MESSAGES'>('ACTIVITIES');
  const [activities, setActivities] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = () => {
    setIsLoading(true);
    Promise.all([
      api.get<any[]>('/content/activities'),
      api.get<any[]>('/content/gallery'),
      api.get<any[]>('/content/testimonials'),
      api.get<any[]>('/content/contact-messages'),
    ])
      .then(([acts, gals, tests, msgs]) => {
        setActivities(acts || []);
        setGallery(gals || []);
        setTestimonials(tests || []);
        setMessages(msgs || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleApproveTestimonial = async (id: string) => {
    try {
      await api.patch(`/content/testimonials/${id}/approve`);
      fetchContent();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await api.patch(`/content/contact-messages/${id}/read`);
      fetchContent();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Website Content Management</h1>
        <p className="text-xs text-slate-500">
          Curate public activities dispatches, gallery photographs, donor testimonials, and user contact inquiries.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('ACTIVITIES')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            tab === 'ACTIVITIES' ? 'bg-brand-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Activities ({activities.length})</span>
        </button>

        <button
          onClick={() => setTab('GALLERY')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            tab === 'GALLERY' ? 'bg-brand-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>Gallery ({gallery.length})</span>
        </button>

        <button
          onClick={() => setTab('TESTIMONIALS')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            tab === 'TESTIMONIALS' ? 'bg-brand-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Testimonials ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setTab('MESSAGES')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            tab === 'MESSAGES' ? 'bg-brand-navy text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquiries ({messages.length})</span>
        </button>
      </div>

      {/* Content Panes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {tab === 'ACTIVITIES' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900">Field Dispatches</h3>
            <div className="divide-y divide-slate-100">
              {activities.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {a.location} • {formatDate(a.date)} • {a.beneficiariesCount} Beneficiaries
                    </p>
                  </div>
                  <span className="text-brand-coral font-bold">{a.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'GALLERY' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900">Photo Archive</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="rounded-2xl overflow-hidden border border-slate-200 text-xs space-y-1">
                  <img src={g.imageUrl} alt={g.title} className="h-32 w-full object-cover" />
                  <div className="p-2">
                    <p className="font-bold text-slate-800 truncate">{g.title}</p>
                    <p className="text-[10px] text-slate-400">{g.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'TESTIMONIALS' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900">Beneficiary & Member Testimonials</h3>
            <div className="divide-y divide-slate-100">
              {testimonials.map((t) => (
                <div key={t.id} className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.roleOrRelation}</p>
                    </div>
                    {t.isApproved ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-[10px]">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveTestimonial(t.id)}
                        className="py-1 px-3 bg-brand-coral text-white rounded-lg font-bold text-[11px]"
                      >
                        Approve for Public Display
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 italic">“{t.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'MESSAGES' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-900">Inbound Contact Inquiries</h3>
            {messages.length === 0 ? (
              <p className="text-xs text-slate-400">No contact messages received yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map((m) => (
                  <div key={m.id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                        <span className="text-slate-400 ml-2">({m.email} {m.mobile ? `• +91 ${m.mobile}` : ''})</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{formatDate(m.createdAt)}</span>
                    </div>
                    <p className="font-semibold text-slate-700">Subject: {m.subject}</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {m.message}
                    </p>
                    {!m.isRead && (
                      <button
                        onClick={() => handleMarkMessageRead(m.id)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px]"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
