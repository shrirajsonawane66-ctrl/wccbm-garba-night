import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  ClockAlert,
  Ban,
  HeartHandshake,
  ScanSearch,
  Search,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api, downloadExport } from '../lib/api.ts';
import type { DashboardStats } from '../types.ts';

interface AdminDashboardProps {
  token: string;
}

interface PassListRow {
  pass_id: string;
  status: string;
  issued_at: string;
  scanned_at: string | null;
  expires_at: string;
  event_name: string;
  student: {
    student_id: string;
    full_name: string;
    email: string | null;
    mobile: string;
    course: string;
    year: string;
    division: string | null;
  };
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  USED: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  EXPIRED: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
  CANCELLED: 'bg-red-500/15 text-red-300 border-red-500/40',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rows, setRows] = useState<PassListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);
  const [notice, setNotice] = useState('');
  const limit = 10;

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.adminStats(token));
    } catch (err: any) {
      setNotice(err.message || 'Could not load stats.');
    }
  }, [token]);

  const loadPasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminPasses(token, { search, status, page, limit });
      setRows(res.rows || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setNotice(err.message || 'Could not load passes.');
    } finally {
      setLoading(false);
    }
  }, [token, search, status, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const id = setTimeout(loadPasses, search ? 400 : 0);
    return () => clearTimeout(id);
  }, [loadPasses, search, status, page]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(format);
    setNotice('');
    try {
      await downloadExport(token, format);
    } catch (err: any) {
      setNotice(err.message || 'Export failed.');
    } finally {
      setExporting(null);
    }
  };

  const handleCancel = async (passId: string) => {
    if (!window.confirm(`Cancel pass ${passId}? This cannot be undone.`)) return;
    setNotice('');
    try {
      await api.adminCancelPass(token, passId);
      await Promise.all([loadStats(), loadPasses()]);
    } catch (err: any) {
      setNotice(err.message || 'Could not cancel pass.');
    }
  };

  const statCards = [
    { label: 'Registered Students', value: stats?.total_students ?? '—', icon: Users, color: 'text-amber-400' },
    { label: 'Total E-Passes', value: stats?.total_passes ?? '—', icon: Ticket, color: 'text-purple-400' },
    { label: 'Active Passes', value: stats?.active ?? '—', icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Used Passes', value: stats?.used ?? '—', icon: Clock, color: 'text-amber-400' },
    { label: 'Dandiya Pairs', value: stats?.dandiya_pairs ?? '—', icon: HeartHandshake, color: 'text-pink-400' },
    { label: 'Valid Scans', value: stats?.valid_scans ?? '—', icon: ScanSearch, color: 'text-sky-400' },
    { label: 'Expired Passes', value: stats?.expired ?? '—', icon: ClockAlert, color: 'text-orange-400' },
    { label: 'Cancelled Passes', value: stats?.cancelled ?? '—', icon: Ban, color: 'text-red-400' },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const BreakdownPanel: React.FC<{ title: string; data: { key: string; count: number }[] }> = ({ title, data }) => {
    const max = Math.max(1, ...(data || []).map((d) => d.count));
    return (
      <div className="rounded-2xl bg-[#0e1424] border border-slate-800 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{title}</h3>
        {(!data || data.length === 0) && <p className="text-sm text-slate-500">No E-Passes issued yet.</p>}
        <div className="space-y-2.5">
          {(data || []).slice(0, 10).map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="text-slate-300 font-medium truncate">{d.key}</span>
                <span className="text-slate-400 font-mono">{d.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  style={{ width: `${Math.round((d.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">{notice}</div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl bg-[#0e1424] border border-slate-800 p-4">
              <Icon className={`w-5 h-5 ${card.color} mb-2`} />
              <div className="text-2xl font-extrabold text-slate-100">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BreakdownPanel title="E-Passes by Year" data={stats?.by_year || []} />
        <BreakdownPanel title="E-Passes by Department" data={stats?.by_course || []} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, student ID, pass ID, email or mobile…"
            className="w-full bg-[#0e1424] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-[#0e1424] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="USED">USED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold border border-slate-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-400" />
            {exporting === 'csv' ? '…' : 'CSV'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting === 'xlsx' ? '…' : 'Excel'}
          </button>
          <button
            onClick={() => {
              loadStats();
              loadPasses();
            }}
            title="Refresh"
            className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0e1424] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Pass ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Course / Year</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued At</th>
                <th className="px-4 py-3">Scanned At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">No passes found.</td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.pass_id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-amber-300">{r.pass_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{r.student?.full_name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{r.student?.student_id || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.student?.course || '—'}
                      {r.student?.year ? ` · ${r.student.year}` : ''}
                      {r.student?.division ? ` · ${r.student.division}` : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.student?.mobile || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.student?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_STYLES[r.status] || STATUS_STYLES.ACTIVE}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(r.issued_at).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.scanned_at ? new Date(r.scanned_at).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancel(r.pass_id)}
                          className="text-[11px] text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-lg px-2.5 py-1"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400 border-t border-slate-800">
          <span>
            {total} pass{total === 1 ? '' : 'es'} · page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};