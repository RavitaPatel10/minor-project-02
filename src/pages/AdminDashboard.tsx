import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProcurementCentre, AuditLog } from '../types/index.ts';
import {
  ShieldCheck,
  UserPlus,
  Building2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTab, setCurrentTab }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [overview, setOverview] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Operator Creation Form State
  const [opName, setOpName] = useState('');
  const [opEmail, setOpEmail] = useState('');
  const [opMobile, setOpMobile] = useState('');
  const [opPassword, setOpPassword] = useState('operator123');
  const [opCentreId, setOpCentreId] = useState('');
  const [opSuccess, setOpSuccess] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  // Centre Creation Form State
  const [cenName, setCenName] = useState('');
  const [cenCode, setCenCode] = useState('');
  const [cenState, setCenState] = useState('Haryana');
  const [cenDistrict, setCenDistrict] = useState('Karnal');
  const [cenAddress, setCenAddress] = useState('');
  const [cenCounters, setCenCounters] = useState(4);
  const [cenActiveCounters, setCenActiveCounters] = useState(3);
  const [cenDailyCap, setCenDailyCap] = useState(50000);
  const [cenSuccess, setCenSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, opRes, cenRes, logRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/operators', { headers }),
        fetch('/api/procurement/centres'),
        fetch('/api/admin/audit-logs', { headers })
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (opRes.ok) {
        const d = await opRes.json();
        setOperators(d.operators || []);
      }
      if (cenRes.ok) {
        const d = await cenRes.json();
        const cList = d.centres || [];
        setCentres(cList);
        if (cList.length > 0 && !opCentreId) {
          setOpCentreId(cList[0].id);
        }
      }
      if (logRes.ok) {
        const d = await logRes.json();
        setAuditLogs(d.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError(null);
    setOpSuccess(null);

    try {
      const res = await fetch('/api/admin/operators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: opName,
          email: opEmail,
          mobile: opMobile,
          password: opPassword,
          centreId: opCentreId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create operator account');

      setOpSuccess(`Operator account for ${opName} provisioned successfully!`);
      setOpName('');
      setOpEmail('');
      setOpMobile('');
      await fetchData();
    } catch (err: any) {
      setOpError(err.message);
    }
  };

  const handleCreateCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    setCenSuccess(null);

    try {
      const res = await fetch('/api/admin/centres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: cenName,
          code: cenCode,
          state: cenState,
          district: cenDistrict,
          address: cenAddress,
          totalCounters: cenCounters,
          activeCounters: cenActiveCounters,
          dailyCapacityKg: cenDailyCap
        })
      });

      if (!res.ok) throw new Error('Failed to create centre');
      setCenSuccess(`Procurement Centre ${cenName} added to national network.`);
      setCenName('');
      setCenCode('');
      setCenAddress('');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header (Always Visible) */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-900/80 text-purple-200 text-xs font-bold mb-2 border border-purple-700">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>National Agricultural Directorate · Master Administrative Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              System Administration & Role Governance
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Authorized administrator: <strong>{user?.name}</strong> · Security policy enforcement & operator onboarding
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Registry</span>
          </button>
        </div>
      </div>

      {/* 1. TAB: OVERVIEW */}
      {(currentTab === 'overview' || !currentTab) && (
        <div className="space-y-6">
          {/* Cross-Centre System KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 uppercase block">Total System Users</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {overview?.totalUsers || 15}
              </div>
              <span className="text-[11px] text-stone-500 block">
                {overview?.totalFarmers || 10} Farmers · {overview?.totalConsumers || 2} Consumers
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 uppercase block">Procurement Centres</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {centres.length} Mandis
              </div>
              <span className="text-[11px] text-stone-500 block">
                {operators.length} Active Operators Assigned
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 uppercase block">Total Bookings</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {overview?.totalBookings || 10}
              </div>
              <span className="text-[11px] text-stone-500 block">Digital token issuance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 uppercase block">Total MSP Disbursed</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
                ₹{((overview?.totalMSPDisbursed || 336888.50) / 100000).toFixed(2)} Lakhs
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">Via Direct Benefit Transfer</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-stone-500 uppercase block">Farm-To-Home Direct</span>
              <div className="text-2xl font-bold font-mono text-purple-900 mt-1 tabular-nums">
                ₹{(overview?.totalOrganicRevenue || 6400).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-purple-700 font-medium block">
                {overview?.totalOrganicOrders || 2} Consumer Direct Orders
              </span>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Authorize Mandi Operators</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Provision authenticated operator logins assigned to specific government procurement centres.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('operators')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-800 hover:text-purple-950 cursor-pointer"
              >
                <span>Manage Operators ({operators.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Mandi Centres & Weighbridges</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Add new APMC procurement centres, configure active weighbridge counters and daily intake quotas.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('centres')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                <span>Configure Mandis ({centres.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Security Audit Trail</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Immutable event ledger auditing all user logins, gate check-in verifications, and weighment transactions.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('logs')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-stone-950 cursor-pointer"
              >
                <span>View Real-time Audit Logs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: OPERATORS PROVISIONING */}
      {currentTab === 'operators' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2 text-purple-900 text-xs font-bold uppercase tracking-wider">
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Authorized Provisioning</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-1">
              Create Mandi Procurement Operator Account
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Strict Security Mandate: Operators cannot register publicly. Only authenticated administrators can authorize new operator credentials.
            </p>
          </div>

          {opSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{opSuccess}</span>
            </div>
          )}

          {opError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{opError}</span>
            </div>
          )}

          <form onSubmit={handleCreateOperator} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Operator Full Name</label>
              <input
                type="text"
                required
                value={opName}
                onChange={(e) => setOpName(e.target.value)}
                placeholder="e.g. Suresh Varma"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={opEmail}
                onChange={(e) => setOpEmail(e.target.value)}
                placeholder="operator@agriconnect.in"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                required
                value={opMobile}
                onChange={(e) => setOpMobile(e.target.value)}
                placeholder="+91 98000 12345"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Assigned Mandi Centre</label>
              <select
                value={opCentreId}
                onChange={(e) => setOpCentreId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white"
              >
                {centres.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-lg transition shadow-sm cursor-pointer"
              >
                Authorize Operator
              </button>
            </div>
          </form>

          {/* Operators List */}
          <div className="border-t border-stone-200 pt-5">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Active Procurement Operators ({operators.length})
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Operator ID</th>
                    <th className="py-2.5 px-4 font-semibold">Name</th>
                    <th className="py-2.5 px-4 font-semibold">Email</th>
                    <th className="py-2.5 px-4 font-semibold">Mobile</th>
                    <th className="py-2.5 px-4 font-semibold">Assigned Mandi</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {operators.map(op => (
                    <tr key={op.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-800">{op.id}</td>
                      <td className="py-2.5 px-4 text-stone-900 font-medium">{op.name}</td>
                      <td className="py-2.5 px-4 text-stone-600 font-mono text-xs">{op.email}</td>
                      <td className="py-2.5 px-4 text-stone-600 font-mono text-xs">{op.mobile}</td>
                      <td className="py-2.5 px-4 text-stone-800 font-medium">{op.centreName}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: CENTRES CONFIGURATION */}
      {currentTab === 'centres' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Procurement Centres & Mandi Registry</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Register official government mandis, define electronic weighbridge counter limits, and daily intake quotas.
            </p>
          </div>

          {cenSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{cenSuccess}</span>
            </div>
          )}

          {/* Add Centre Form */}
          <form onSubmit={handleCreateCentre} className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Add New APMC Procurement Centre
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Mandi Name</label>
                <input
                  type="text"
                  required
                  value={cenName}
                  onChange={(e) => setCenName(e.target.value)}
                  placeholder="e.g. APMC Mandi, Rohtak"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Centre Code</label>
                <input
                  type="text"
                  required
                  value={cenCode}
                  onChange={(e) => setCenCode(e.target.value)}
                  placeholder="HR-ROH-01"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={cenState}
                  onChange={(e) => setCenState(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={cenDistrict}
                  onChange={(e) => setCenDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">Highway / Yard Address</label>
                <input
                  type="text"
                  value={cenAddress}
                  onChange={(e) => setCenAddress(e.target.value)}
                  placeholder="Mandi Gate No, National Highway"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Active Counters</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cenActiveCounters}
                  onChange={(e) => setCenActiveCounters(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Daily Cap (KG)</label>
                <input
                  type="number"
                  min="1000"
                  value={cenDailyCap}
                  onChange={(e) => setCenDailyCap(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
              >
                Register Mandi Centre
              </button>
            </div>
          </form>

          {/* Centres Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Code</th>
                  <th className="py-2.5 px-4 font-semibold">Mandi Name</th>
                  <th className="py-2.5 px-4 font-semibold">Location</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Counters</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Daily Capacity</th>
                  <th className="py-2.5 px-4 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {centres.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{c.code}</td>
                    <td className="py-2.5 px-4 text-stone-900 font-medium">{c.name}</td>
                    <td className="py-2.5 px-4 text-stone-600">{c.district}, {c.state}</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums">{c.activeCounters} / {c.totalCounters} Active</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold">{(c.dailyCapacityKg / 100).toLocaleString('en-IN')} Quintals</td>
                    <td className="py-2.5 px-4 text-stone-500 font-mono text-xs">{c.contactNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: AUDIT LOGS */}
      {currentTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>Real-Time Mandi Security & Operational Audit Log</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Immutable event ledger auditing all user logins, gate check-in verifications, and weighment transactions.
            </p>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">Timestamp</th>
                  <th className="py-2 px-3 font-semibold">User</th>
                  <th className="py-2 px-3 font-semibold">Role</th>
                  <th className="py-2 px-3 font-semibold">Action</th>
                  <th className="py-2 px-3 font-semibold">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono text-xs">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-stone-800 font-sans font-medium">{log.userName}</td>
                    <td className="py-2 px-3 uppercase text-[11px] text-stone-600 font-bold">{log.role}</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">{log.action}</td>
                    <td className="py-2 px-3 text-stone-700 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
