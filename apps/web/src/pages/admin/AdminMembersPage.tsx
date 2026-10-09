import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/utils.js';
import { Search, UserCheck, UserX, Eye, ShieldCheck, Filter } from 'lucide-react';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Selected member for detail view
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const fetchMembers = () => {
    setIsLoading(true);
    let url = `/admin/members?page=${page}&limit=15`;
    if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    api
      .get<any>(url)
      .then((data) => {
        setMembers(data?.items || []);
        setTotal(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => setMembers([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter, search]);

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    if (window.confirm(`Are you sure you want to mark this member as ${newStatus}?`)) {
      try {
        await api.patch(`/admin/members/${memberId}/status`, { status: newStatus });
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          setSelectedMember({ ...selectedMember, status: newStatus });
        }
      } catch (err: any) {
        alert(err.message || 'Status update failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Member Directory</h1>
          <p className="text-xs text-slate-500">Manage registered member patrons and account security status.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading member directory...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">City / State</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Donations</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {m.profile?.fullName || 'Not Provided'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{m.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">+91 {m.mobile}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {m.profile?.city ? `${m.profile.city}, ${m.profile.state || ''}` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-navy">
                      {m._count?.donations || 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(m.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="p-1 rounded text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {m.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(m.id, 'SUSPENDED')}
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                          title="Suspend Member Account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(m.id, 'ACTIVE')}
                          className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-50 transition"
                          title="Activate Member Account"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
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
              Page {page} of {totalPages} ({total} members total)
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

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Full Legal Name:</span>
                <span className="font-bold text-slate-800">{selectedMember.profile?.fullName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-800">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="font-medium text-slate-800">+91 {selectedMember.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">PAN Number:</span>
                <span className="font-mono font-bold text-brand-navy">{selectedMember.profile?.panNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Full Address:</span>
                <span className="text-right text-slate-800 max-w-xs">{selectedMember.profile?.address || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">City, State, PIN:</span>
                <span className="font-medium text-slate-800">
                  {selectedMember.profile?.city || '-'}, {selectedMember.profile?.state || ''} {selectedMember.profile?.postalCode || ''}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold text-brand-navy">{selectedMember.status}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedMember(null)}
                className="py-2 px-5 bg-brand-navy text-white text-xs font-bold rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
