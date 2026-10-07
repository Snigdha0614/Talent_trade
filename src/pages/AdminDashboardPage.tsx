import React, { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  Layers,
  AlertTriangle,
  DollarSign,
  ArrowLeftRight,
  Shield,
  RotateCcw,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api.js';
import { User, Service, Report, Payment } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export default function AdminDashboardPage() {
  const { user, quickDemoLogin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [txnsList, setTxnsList] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'services' | 'reports' | 'txns'>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Selected report resolution modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportStatus, setReportStatus] = useState<'Pending' | 'Under Investigation' | 'Resolved' | 'Rejected'>('Resolved');
  const [adminResponse, setAdminResponse] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, userRes, srvRes, repRes, txnRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.services.list({ status: '' }),
        api.reports.list(),
        api.payments.getTransactions(),
      ]);
      setStats(statsRes.stats);
      setUsersList(userRes.users || []);
      setServicesList(srvRes.services || []);
      setReportsList(repRes.reports || []);
      setTxnsList(txnRes.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await api.admin.toggleUserStatus(userId);
      toast.info('User status updated.');
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const handleModerateService = async (serviceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      await api.admin.moderateService(serviceId, nextStatus);
      toast.info(`Service status set to ${nextStatus}.`);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to moderate service.');
    }
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await api.reports.update(selectedReport.id, {
        status: reportStatus,
        adminResponse: adminResponse.trim(),
      });
      setSelectedReport(null);
      setAdminResponse('');
      toast.success('Report updated successfully.');
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report.');
    }
  };

  const handleResetDatabase = async () => {
    try {
      await api.admin.resetDemoDb();
      toast.success('Database restored to initial demo state!');
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset database.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          Please log in as an administrator to monitor marketplace statistics, arbitrate disputes, and moderate services.
        </p>
        <button
          onClick={() => quickDemoLogin('admin')}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Enter as Admin (Instant Demo)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">TalentTrade Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Admin Moderation Console</h1>
        </div>

        <button
          type="button"
          onClick={handleResetDatabase}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Restore original seed records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center flex-wrap gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analytics & Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users ({usersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'services' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Services ({servicesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Reports & Disputes ({reportsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('txns')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'txns' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Transactions ({txnsList.length})</span>
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Registered Users</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">{stats.totalUsers}</p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {stats.totalFreelancers} Free · {stats.totalClients} Clients
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Active Workspaces</span>
              <p className="text-2xl font-black text-indigo-600 font-mono tabular-nums mt-1">{stats.activeProjects}</p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {stats.completedProjects} Completed
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Completed Skill Swaps</span>
              <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-1">
                {stats.completedExchanges}
              </p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">Reciprocal Barters</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Simulated Volume</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                ${stats.totalSimulatedVolume?.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">Escrow Cleared</span>
            </div>
          </div>

          {/* Distribution comparisons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Project Engagement Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-indigo-700">Paid Escrow Contracts</span>
                    <span className="font-mono">{stats.paidProjectsCount} projects</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{
                        width: `${
                          (stats.paidProjectsCount / (stats.paidProjectsCount + stats.skillExchangeProjectsCount || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-700">Skill Exchange Barters</span>
                    <span className="font-mono">{stats.skillExchangeProjectsCount} barters</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${
                          (stats.skillExchangeProjectsCount /
                            (stats.paidProjectsCount + stats.skillExchangeProjectsCount || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Service Category Distribution</h3>
              <div className="space-y-2">
                {Object.entries(stats.categoryDistribution || {}).map(([cat, count]: [string, any]) => (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-mono font-bold text-slate-900">{count} services</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">All Registered Accounts</h3>
            <span className="text-xs text-slate-500 font-mono">{usersList.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.profileImage || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">★ {u.rating.toFixed(1)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          u.isSuspended ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Services Moderation */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Services Catalog Moderation</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Service</th>
                  <th className="py-3 px-4 font-semibold">Freelancer</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servicesList.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{srv.title}</td>
                    <td className="py-3 px-4 text-slate-700">{srv.freelancerName}</td>
                    <td className="py-3 px-4 text-slate-500">{srv.category}</td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">${srv.price.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          srv.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {srv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleModerateService(srv.id, srv.status)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {srv.status === 'PUBLISHED' ? 'Pause / Delist' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Reports & Disputes (Section 21) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Community Reports & Milestone Disputes ({reportsList.length})
            </h3>

            {reportsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reports pending.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reportsList.map((rep) => (
                  <div key={rep.id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {rep.type}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Reported by: <strong>{rep.reportedByName}</strong>
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {rep.description}
                    </p>

                    {rep.adminResponse && (
                      <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 text-[11px]">
                        <strong>Admin Resolution Note:</strong> {rep.adminResponse}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(rep);
                          setReportStatus(rep.status);
                          setAdminResponse(rep.adminResponse || '');
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold"
                      >
                        Manage & Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution Drawer Modal */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="min-h-screen px-4 text-center flex items-center justify-center">
                <div
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setSelectedReport(null)}
                />
                <div className="relative inline-block w-full max-w-md p-6 my-8 text-left bg-white rounded-2xl shadow-xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Resolve Dispute #{selectedReport.id}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedReport.type}</p>

                  <form onSubmit={handleResolveReport} className="mt-4 space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Update Status:</label>
                      <select
                        value={reportStatus}
                        onChange={(e: any) => setReportStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      >
                        <option value="Under Investigation">Under Investigation</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Resolution Response Note:</label>
                      <textarea
                        rows={3}
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="State action taken..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(null)}
                        className="px-3 py-1.5 text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-white bg-indigo-600 rounded-lg font-semibold"
                      >
                        Save Resolution
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Transactions */}
      {activeTab === 'txns' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Simulated Escrow Transactions Ledger</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-sans">
                <tr>
                  <th className="py-3 px-4 font-semibold">Txn ID</th>
                  <th className="py-3 px-4 font-semibold">Project</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Freelancer</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txnsList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{t.transactionId}</td>
                    <td className="py-3 px-4 font-sans max-w-xs truncate">{t.projectTitle}</td>
                    <td className="py-3 px-4 font-sans">{t.clientName}</td>
                    <td className="py-3 px-4 font-sans">{t.freelancerName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">${t.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{t.method}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
