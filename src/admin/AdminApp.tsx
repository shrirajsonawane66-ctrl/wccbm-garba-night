import React, { useEffect, useState } from 'react';
import { ShieldCheck, ScanLine, LayoutDashboard, History, LogOut, ArrowLeft, Sparkles, Download, FileSpreadsheet } from 'lucide-react';
import { AdminLogin } from './AdminLogin.tsx';
import { AdminScanner } from './AdminScanner.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { api, downloadScansExport } from '../lib/api.ts';

type Tab = 'scanner' | 'dashboard' | 'scans';

const AdminApp: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string | null>(() => api.adminGetToken());
  const [role, setRole] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [tab, setTab] = useState<Tab>('scanner');
  const [scanRows, setScanRows] = useState<any[]>([]);
  const [scanExporting, setScanExporting] = useState<'csv' | 'xlsx' | null>(null);

  useEffect(() => {
    if (!adminToken) return;
    api
      .adminMe(adminToken)
      .then((me) => {
        setRole(me.role);
        setName(me.displayName || me.email || '');
      })
      .catch(() => {
        localStorage.removeItem('garba_admin_token');
        setAdminToken(null);
      });
  }, [adminToken]);

  useEffect(() => {
    if (adminToken && tab === 'scans') {
      api.adminScans(adminToken, 200).then((res) => setScanRows(res.rows || [])).catch(() => {});
    }
  }, [adminToken, tab]);

  const handleScansExport = async (format: 'csv' | 'xlsx') => {
    if (!adminToken) return;
    setScanExporting(format);
    try {
      await downloadScansExport(adminToken, format);
    } catch (err: any) {
      window.alert('Scan export failed: ' + (err.message || 'unexpected error'));
    } finally {
      setScanExporting(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('garba_admin_token');
    setAdminToken(null);
    setRole('');
  };

  if (!adminToken) {
    return <AdminLogin onLogin={() => setAdminToken(api.adminGetToken())} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; roles?: string[] }[] = [
    { id: 'scanner', label: 'QR Scanner', icon: ScanLine, roles: ['admin', 'scanner'] },
    { id: 'dashboard', label: 'Dashboard & Passes', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'scans', label: 'Scan History', icon: History, roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-[#0e1424]/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold font-serif tracking-wide text-white">ADMIN CONSOLE</h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Western College Garba E-Pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-1 hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{name || 'Admin'}</div>
              <div className="text-[10px] uppercase text-amber-400">{role}</div>
            </div>
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Site
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {tabs
            .filter((t) => !t.roles || t.roles.includes(role))
            .map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'scanner' && <AdminScanner token={adminToken} />}
        {tab === 'dashboard' && <AdminDashboard token={adminToken} />}
        {tab === 'scans' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-400">
                {scanRows.length} scan record{scanRows.length === 1 ? '' : 's'}{' '}
                <span className="text-slate-600">(scans on the gate device when verifying QRs)</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleScansExport('csv')}
                  disabled={!!scanExporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold border border-slate-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  {scanExporting === 'csv' ? '…' : 'CSV'}
                </button>
                <button
                  onClick={() => handleScansExport('xlsx')}
                  disabled={!!scanExporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {scanExporting === 'xlsx' ? '…' : 'Excel'}
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0e1424] border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Pass ID</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {scanRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No scans yet.</td>
                    </tr>
                  )}
                  {scanRows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-800/60">
                      <td className="px-4 py-3 text-slate-400">{new Date(r.scanned_at).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            r.scan_result === 'VALID_SCAN'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : r.scan_result === 'ALREADY_USED'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-red-500/15 text-red-300 border-red-500/40'
                          }`}
                        >
                          {r.scan_result}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{r.e_passes?.pass_id || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{r.e_passes?.students?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[220px] truncate">{r.device_information || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminApp;