import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/utils.js';
import { ShieldAlert, Search, Terminal } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = '/admin/audit-logs';
    if (search.trim()) url += `?action=${encodeURIComponent(search.trim())}`;

    api
      .get<any[]>(url)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Security & Operational Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Immutable system logs recording administrative logins, financial approvals, member status adjustments, and receipt cancellations.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Querying security audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No audit logs matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-sans tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Initiator / User</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-brand-navy font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                      {log.userName || log.userId || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">{log.entityId}</td>
                    <td className="py-3 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-sans text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
