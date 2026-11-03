import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  QueueRecord,
  WeighmentRecord,
  PaymentRecord,
  ProcurementSlot,
  ProcurementCentre
} from '../types/index.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import {
  Scale,
  Users,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Send,
  RefreshCw,
  Plus,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Printer
} from 'lucide-react';

interface OperatorDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ currentTab, setCurrentTab }) => {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();

  // Internal Operator Data State
  const [centreInfo, setCentreInfo] = useState<any>(null);
  const [queue, setQueue] = useState<QueueRecord[]>([]);
  const [weighments, setWeighments] = useState<WeighmentRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [slots, setSlots] = useState<ProcurementSlot[]>([]);
  const [reports, setReports] = useState<any>(null);

  // Modals & Active selections
  const [selectedReceipt, setSelectedReceipt] = useState<WeighmentRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Weighbridge Terminal Form State
  const [selectedTokenForWeighment, setSelectedTokenForWeighment] = useState<string>('TKN-KNL-101');
  const [counterNum, setCounterNum] = useState<number>(1);
  const [grossWeight, setGrossWeight] = useState<number>(5500);
  const [tareWeight, setTareWeight] = useState<number>(2300);
  const [acceptedWeight, setAcceptedWeight] = useState<number>(3150);
  const [rejectedWeight, setRejectedWeight] = useState<number>(50);
  const [rejectionReason, setRejectionReason] = useState<string>('Excess moisture 13.8% (>12% limit) & weed dockage');
  const [moistureContent, setMoistureContent] = useState<number>(11.2);
  const [weighCrop, setWeighCrop] = useState<string>('Wheat');
  const [mspRate, setMspRate] = useState<number>(24.25);
  const [isWeighing, setIsWeighing] = useState(false);

  // Check-In Form State
  const [checkinTokenInput, setCheckinTokenInput] = useState('');
  const [checkinCounterInput, setCheckinCounterInput] = useState(1);

  // Payment update State
  const [paymentRefInput, setPaymentRefInput] = useState<Record<string, string>>({});

  // Slot Form State
  const [newSlotDate, setNewSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSlotStart, setNewSlotStart] = useState('09:00 AM');
  const [newSlotEnd, setNewSlotEnd] = useState('11:00 AM');
  const [newSlotCap, setNewSlotCap] = useState(15000);
  const [newSlotLimit, setNewSlotLimit] = useState(8);

  // SMS Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('Mandi Notice: Counter 2 & 3 Running at Full Speed');
  const [broadcastMsg, setBroadcastMsg] = useState('Please ensure all moisture test samples are submitted. Unloading time per tractor is averaging 10 minutes.');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Auto calculate net weight
  const netWeight = Math.max(0, grossWeight - tareWeight);

  const fetchOperatorData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cenRes, qRes, wRes, pRes, sRes, rRes] = await Promise.all([
        fetch('/api/operator/centre', { headers }),
        fetch('/api/operator/queue', { headers }),
        fetch('/api/operator/weighments', { headers }),
        fetch('/api/operator/payments', { headers }),
        fetch('/api/operator/slots', { headers }),
        fetch('/api/operator/reports', { headers })
      ]);

      if (cenRes.ok) setCentreInfo(await cenRes.json());
      if (qRes.ok) {
        const d = await qRes.json();
        setQueue(d.queue || []);
      }
      if (wRes.ok) {
        const d = await wRes.json();
        setWeighments(d.weighments || []);
      }
      if (pRes.ok) {
        const d = await pRes.json();
        setPayments(d.payments || []);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        setSlots(d.slots || []);
      }
      if (rRes.ok) setReports(await rRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOperatorData();
    const interval = setInterval(fetchOperatorData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Handle Verify Gate Check-in
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinTokenInput) return;
    try {
      const res = await fetch('/api/operator/queue/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tokenId: checkinTokenInput.trim(),
          counterNumber: checkinCounterInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage(`Farmer check-in verified! Token ${checkinTokenInput} entered active queue.`);
      setCheckinTokenInput('');
      await fetchOperatorData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  // Handle Call Next to Counter
  const handleCallNext = async (queueId: string, counterNumber: number) => {
    try {
      const res = await fetch(`/api/operator/queue/${queueId}/call-next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ counterNumber })
      });
      if (res.ok) {
        setStatusMessage(`Called farmer to Counter ${counterNumber}. Simulated SMS alert dispatched.`);
        await fetchOperatorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Mark Absent or Grace Period
  const handleUpdateQueueStatus = async (queueId: string, status: string, gracePeriodMinutes?: number) => {
    try {
      const res = await fetch(`/api/operator/queue/${queueId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, gracePeriodMinutes })
      });
      if (res.ok) {
        await fetchOperatorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Weighment & Issue Receipt
  const handleRecordWeighment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWeighing(true);
    try {
      const res = await fetch('/api/operator/weighment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tokenId: selectedTokenForWeighment,
          counterNumber: counterNum,
          crop: weighCrop,
          grossWeightKg: grossWeight,
          tareWeightKg: tareWeight,
          acceptedQuantityKg: acceptedWeight,
          rejectedQuantityKg: rejectedWeight,
          rejectionReason: rejectedWeight > 0 ? rejectionReason : undefined,
          moisturePercentage: moistureContent,
          mspRatePerKg: mspRate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSelectedReceipt(data.weighment);
      setStatusMessage(`Digital weighment slip ${data.weighment.receiptNumber} recorded! DBT voucher forwarded.`);
      await fetchOperatorData();
    } catch (err: any) {
      alert(err.message || 'Weighment recording failed.');
    } finally {
      setIsWeighing(false);
    }
  };

  // Handle Update Payment Status
  const handleUpdatePayment = async (paymentId: string, status: string) => {
    const ref = paymentRefInput[paymentId] || `PFMS${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch(`/api/operator/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          paymentRefNumber: ref,
          remarks: status === 'COMPLETED' ? 'Direct Benefit Transfer (DBT) confirmed by RBI PFMS batch.' : undefined
        })
      });

      if (res.ok) {
        setStatusMessage(`Payment #${paymentId} marked as ${status}. DBT credit notice dispatched.`);
        await fetchOperatorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create Slot
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newSlotDate,
          startTime: newSlotStart,
          endTime: newSlotEnd,
          maxCapacityKg: newSlotCap,
          farmerLimit: newSlotLimit
        })
      });
      if (res.ok) {
        setStatusMessage('New procurement time slot added.');
        await fetchOperatorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Toggle Close Slot
  const handleToggleSlot = async (slotId: string, isClosed: boolean) => {
    try {
      const res = await fetch(`/api/operator/slots/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isClosed: !isClosed })
      });
      if (res.ok) {
        await fetchOperatorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Broadcast SMS
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/broadcast-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg })
      });
      if (res.ok) {
        setBroadcastSent(true);
        setTimeout(() => setBroadcastSent(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Report Exporter
  const exportCSV = () => {
    if (!weighments.length) return;
    const headers = ['Receipt No', 'Date', 'Farmer Name', 'Mobile', 'Crop', 'Gross (KG)', 'Tare (KG)', 'Net (KG)', 'Accepted (KG)', 'Rejected (KG)', 'Moisture %', 'MSP Rate', 'Total (INR)'];
    const rows = weighments.map(w => [
      w.receiptNumber,
      w.timestamp.split('T')[0],
      w.farmerName,
      w.farmerMobile,
      w.crop,
      w.grossWeightKg,
      w.tareWeightKg,
      w.netWeightKg,
      w.acceptedQuantityKg,
      w.rejectedQuantityKg,
      w.moisturePercentage,
      w.mspRatePerKg,
      w.totalAmount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Procurement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const centre: ProcurementCentre | null = centreInfo?.centre || null;
  const stats = centreInfo?.stats || {};

  return (
    <div className="space-y-8 pb-16">
      {/* Operator Centre Header (Always Visible) */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Procurement Centre Operational Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {centre?.name || 'APMC Krishi Upaj Mandi, Karnal'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-300">
              <span className="font-mono bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700 font-bold">
                Centre ID: {centre?.code || 'HR-KNL-01'}
              </span>
              <span>·</span>
              <span>Operator: <strong>{user?.name}</strong></span>
              <span>·</span>
              <span>Active Counters: <strong>{centre?.activeCounters || 3} of {centre?.totalCounters || 4}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-900 bg-white hover:bg-stone-100 rounded-xl transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV Report</span>
            </button>
            <button
              onClick={fetchOperatorData}
              className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition cursor-pointer"
              title="Refresh Queue and Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold underline text-emerald-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. TAB: OVERVIEW */}
      {(currentTab === 'overview' || !currentTab) && (
        <div className="space-y-6">
          {/* A. OVERVIEW KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentTab('queue_mgmt')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition cursor-pointer"
            >
              <span className="text-xs font-semibold text-stone-500 uppercase block">Registered Farmers</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {stats.totalRegisteredFarmers || 10}
              </div>
              <span className="text-[11px] text-stone-500 block mt-0.5">Assigned to this mandi region</span>
            </button>

            <button
              onClick={() => setCurrentTab('slots')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition cursor-pointer"
            >
              <span className="text-xs font-semibold text-stone-500 uppercase block">Today's Bookings</span>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {stats.todaysBookingsCount || 5}
              </div>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Total tokens: {stats.totalTokensGenerated || 5}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('queue_mgmt')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition cursor-pointer"
            >
              <span className="text-xs font-semibold text-stone-500 uppercase block">In Queue / Weighing</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {queue.filter(q => q.status === 'WAITING').length} Waiting · {queue.filter(q => q.status === 'IN_COUNTER').length} Active
              </div>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Avg wait time: <strong>{stats.avgWaitingTimeMins || 8} mins</strong>
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('weighbridge')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition cursor-pointer"
            >
              <span className="text-xs font-semibold text-stone-500 uppercase block">Completed Weighments</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
                {weighments.length}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                100% digital slips recorded
              </span>
            </button>
          </div>

          {/* Quick Hub Cards for Operator Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Live Queue & Gate Check-in</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Call next farmers to active weighbridge bays, verify arriving tractor tokens, and manage transportation grace delays.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('queue_mgmt')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer"
              >
                <span>Open Queue Terminal ({queue.length} in yard)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Electronic Weighbridge</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Record vehicle gross and tare weights, enter moisture lab readings, record dockage deductions, and issue official slips.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('weighbridge')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                <span>Open Weighbridge Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">PFMS / DBT Clearance</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Verify government procurement payouts and attach treasury clearance reference numbers to credit farmer accounts.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('payments')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-950 cursor-pointer"
              >
                <span>Manage DBT Payments ({payments.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: LIVE QUEUE MANAGEMENT */}
      {currentTab === 'queue_mgmt' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-stone-900">
                <Clock className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-bold">Mandi Live Queue Terminal & Tractor Dispatch</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Formula: <code>(Farmers Ahead × Avg Speed {centre?.avgMinsPerFarmer || 12} mins) / {centre?.activeCounters || 3} Active Counters</code>
              </p>
            </div>

            {/* Quick Gate Check-in Bar */}
            <form onSubmit={handleCheckin} className="flex items-center gap-2 self-stretch sm:self-auto">
              <input
                type="text"
                value={checkinTokenInput}
                onChange={(e) => setCheckinTokenInput(e.target.value)}
                placeholder="Token (e.g. TKN-KNL-104)"
                className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg w-44 font-mono bg-white"
              />
              <select
                value={checkinCounterInput}
                onChange={(e) => setCheckinCounterInput(Number(e.target.value))}
                className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-medium"
              >
                <option value={1}>Bay 1</option>
                <option value={2}>Bay 2</option>
                <option value={3}>Bay 3</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition cursor-pointer"
              >
                Verify Check-in
              </button>
            </form>
          </div>

          {/* Live Queue Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Position</th>
                  <th className="py-2.5 px-4 font-semibold">Token ID</th>
                  <th className="py-2.5 px-4 font-semibold">Farmer Name</th>
                  <th className="py-2.5 px-4 font-semibold">Mobile</th>
                  <th className="py-2.5 px-4 font-semibold">Crop</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Expected Qty</th>
                  <th className="py-2.5 px-4 font-semibold">Arrival</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Est. Wait</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Operator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-stone-500 text-xs">
                      Queue is currently empty. Waiting for tractors at mandi gate.
                    </td>
                  </tr>
                ) : (
                  queue.map((qr) => (
                    <tr key={qr.id} className={qr.status === 'IN_COUNTER' ? 'bg-amber-50/70 font-semibold' : 'hover:bg-stone-50'}>
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-800">
                        {qr.status === 'IN_COUNTER' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                            ON WEIGHBRIDGE (C{qr.counterAssigned || 1})
                          </span>
                        ) : (
                          `#${qr.queuePosition}`
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{qr.tokenNumber}</td>
                      <td className="py-2.5 px-4 text-stone-900 font-medium">{qr.farmerName}</td>
                      <td className="py-2.5 px-4 text-xs font-mono text-stone-600">{qr.farmerMobile}</td>
                      <td className="py-2.5 px-4 text-emerald-800 font-medium">{qr.crop}</td>
                      <td className="py-2.5 px-4 font-mono text-right tabular-nums">{qr.expectedQuantityKg} KG</td>
                      <td className="py-2.5 px-4 text-xs text-stone-500">{qr.arrivalTime}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-right tabular-nums text-stone-800">
                        {qr.status === 'IN_COUNTER' ? '0 min' : `${qr.estimatedWaitMinutes} min`}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          qr.status === 'IN_COUNTER' ? 'bg-amber-100 text-amber-800' :
                          qr.status === 'WAITING' ? 'bg-blue-50 text-blue-800' :
                          qr.status === 'DELAYED_GRACE' ? 'bg-purple-50 text-purple-800' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {qr.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        {qr.status === 'WAITING' && (
                          <button
                            onClick={() => handleCallNext(qr.id, qr.counterAssigned || 1)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition cursor-pointer"
                          >
                            Call to Bay {qr.counterAssigned || 1}
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateQueueStatus(qr.id, 'DELAYED_GRACE', 20)}
                          className="px-2 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer"
                          title="Grant +20 min transport grace period"
                        >
                          +20m Grace
                        </button>
                        <button
                          onClick={() => handleUpdateQueueStatus(qr.id, 'ABSENT')}
                          className="px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB: WEIGHBRIDGE TERMINAL */}
      {currentTab === 'weighbridge' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="border-b border-stone-200 pb-4 mb-6">
              <div className="flex items-center gap-2 text-stone-900">
                <Scale className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-bold">Electronic Weighbridge & Moisture Analysis Terminal</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Capture gross truck weight, empty tare weight, moisture content, and dockage adjustments. Issues instant digital weighment slip.
              </p>
            </div>

            <form onSubmit={handleRecordWeighment} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Active Token in Counter
                  </label>
                  <select
                    value={selectedTokenForWeighment}
                    onChange={(e) => setSelectedTokenForWeighment(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white font-mono"
                  >
                    {queue.map(q => (
                      <option key={q.id} value={q.tokenNumber}>
                        {q.tokenNumber} - {q.farmerName} ({q.crop})
                      </option>
                    ))}
                    <option value="TKN-KNL-104">TKN-KNL-104 - Ramesh Patel (Wheat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Weighbridge Counter
                  </label>
                  <select
                    value={counterNum}
                    onChange={(e) => setCounterNum(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white font-medium"
                  >
                    <option value={1}>Counter 1 (Main Weighbridge)</option>
                    <option value={2}>Counter 2 (Tractor Bay B)</option>
                    <option value={3}>Counter 3 (Trolley Bay C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Crop
                  </label>
                  <select
                    value={weighCrop}
                    onChange={(e) => {
                      setWeighCrop(e.target.value);
                      if (e.target.value === 'Wheat') setMspRate(24.25);
                      else if (e.target.value === 'Mustard') setMspRate(59.50);
                      else if (e.target.value === 'Soybean') setMspRate(48.92);
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Wheat">Wheat (MSP ₹24.25/kg)</option>
                    <option value="Mustard">Mustard (MSP ₹59.50/kg)</option>
                    <option value="Soybean">Soybean (MSP ₹48.92/kg)</option>
                    <option value="Chana (Gram)">Chana (MSP ₹56.50/kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Official MSP Rate (₹/KG)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={mspRate}
                    onChange={(e) => setMspRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg font-mono bg-stone-50"
                  />
                </div>
              </div>

              {/* Weight readings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Gross Weight (KG)</label>
                  <input
                    type="number"
                    required
                    value={grossWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGrossWeight(val);
                      const net = Math.max(0, val - tareWeight);
                      setAcceptedWeight(net);
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Tare Weight (KG)</label>
                  <input
                    type="number"
                    required
                    value={tareWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTareWeight(val);
                      const net = Math.max(0, grossWeight - val);
                      setAcceptedWeight(net);
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Calculated Net (KG)</label>
                  <input
                    type="number"
                    disabled
                    value={netWeight}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-200 text-stone-900 font-mono font-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Moisture Lab Test (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Accepted vs Rejected Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Accepted Quantity (KG)</label>
                  <input
                    type="number"
                    value={acceptedWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAcceptedWeight(val);
                      setRejectedWeight(Math.max(0, netWeight - val));
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white font-mono font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Rejected Quantity (KG)</label>
                  <input
                    type="number"
                    value={rejectedWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRejectedWeight(val);
                      setAcceptedWeight(Math.max(0, netWeight - val));
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white font-mono font-bold text-red-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dockage / Rejection Reason</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason if any crop is rejected"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Total Payout Summary */}
              <div className="bg-stone-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block">Total Procurement Amount (Payable via DBT)</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ₹{(acceptedWeight * mspRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isWeighing}
                  className="px-6 py-2.5 text-xs font-bold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isWeighing ? 'Processing Slip...' : 'Save & Issue Digital Weighment Slip'}
                </button>
              </div>
            </form>
          </div>

          {/* Completed Weighments Slip Archive */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 mb-3">
              Recently Issued Digital Weighment Slips ({weighments.length})
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Receipt #</th>
                    <th className="py-2.5 px-4 font-semibold">Farmer</th>
                    <th className="py-2.5 px-4 font-semibold">Crop</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Net Weight</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Accepted Qty</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Slip Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {weighments.map((w) => (
                    <tr key={w.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{w.receiptNumber}</td>
                      <td className="py-2.5 px-4 text-stone-800">{w.farmerName}</td>
                      <td className="py-2.5 px-4 text-emerald-800 font-medium">{w.crop}</td>
                      <td className="py-2.5 px-4 font-mono text-right tabular-nums">{w.netWeightKg} KG</td>
                      <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold text-emerald-900">{w.acceptedQuantityKg} KG</td>
                      <td className="py-2.5 px-4 font-mono text-right tabular-nums font-bold">₹{w.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(w)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: SLOTS MANAGEMENT */}
      {currentTab === 'slots' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>Procurement Slot Capacity & Schedule Management</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure daily arrival quotas to prevent truck congestion on mandi access roads.
            </p>
          </div>

          {/* Add Slot Form */}
          <form onSubmit={handleCreateSlot} className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Start Time</label>
              <input
                type="text"
                required
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">End Time</label>
              <input
                type="text"
                required
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                placeholder="11:00 AM"
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Capacity (KG)</label>
              <input
                type="number"
                required
                value={newSlotCap}
                onChange={(e) => setNewSlotCap(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
              >
                + Add Time Slot
              </button>
            </div>
          </form>

          {/* Slots Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Time Slot</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Max Capacity</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Booked Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Farmers Limit</th>
                  <th className="py-2.5 px-4 font-semibold">Slot Availability</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {slots.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-medium text-stone-900">{s.date}</td>
                    <td className="py-2.5 px-4 text-stone-800 font-semibold">{s.startTime} - {s.endTime}</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums">{(s.maxCapacityKg / 100).toFixed(0)} Quintals</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums">{(s.bookedCapacityKg / 100).toFixed(0)} Quintals</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums">{s.bookedFarmers} / {s.farmerLimit} Farmers</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        s.isClosed ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.isClosed ? 'Closed' : 'Open for Booking'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleSlot(s.id, s.isClosed)}
                        className="text-xs font-semibold underline text-stone-700 hover:text-stone-900 cursor-pointer"
                      >
                        {s.isClosed ? 'Open Slot' : 'Close Slot'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: PAYMENTS MANAGEMENT */}
      {currentTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <span>PFMS / DBT Payment Clearance Portal</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Record Treasury tokens and clearance references. Ensures direct bank settlement transparency.
            </p>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Payment ID</th>
                  <th className="py-2.5 px-4 font-semibold">Farmer</th>
                  <th className="py-2.5 px-4 font-semibold">Bank Account</th>
                  <th className="py-2.5 px-4 font-semibold">Produce</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount (INR)</th>
                  <th className="py-2.5 px-4 font-semibold">Payment Ref Number</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{p.id}</td>
                    <td className="py-2.5 px-4 text-stone-800 font-medium">
                      {p.farmerName}
                      <span className="text-[10px] text-stone-500 block font-mono">{p.farmerCode}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-stone-600">{p.bankAccount}</td>
                    <td className="py-2.5 px-4 text-xs text-stone-700">
                      {p.acceptedWeightKg} KG {p.crop}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-right tabular-nums text-emerald-900">
                      ₹{p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs">
                      <input
                        type="text"
                        placeholder="e.g. PFMS2026110298124"
                        value={paymentRefInput[p.id] ?? (p.paymentRefNumber || '')}
                        onChange={(e) => setPaymentRefInput({ ...paymentRefInput, [p.id]: e.target.value })}
                        className="px-2 py-1 text-xs border border-stone-300 rounded font-mono w-40"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-1">
                      {p.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleUpdatePayment(p.id, 'COMPLETED')}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition cursor-pointer"
                        >
                          Settle DBT
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB: REPORTS & BROADCAST */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>Procurement Analytics & Government Reports</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Export verified audit-ready procurement records for state agricultural monitoring.
                </p>
              </div>

              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Official CSV Report</span>
              </button>
            </div>

            {/* Crop breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reports?.cropStats && Object.entries(reports.cropStats).map(([crop, stat]: any) => (
                <div key={crop} className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">{crop}</span>
                  <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                    {(stat.acceptedKg / 100).toFixed(1)} Quintals
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Total MSP: <strong>₹{stat.totalAmount.toLocaleString('en-IN')}</strong> · {stat.count} weighments
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Broadcast Module */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-700" />
              <span>Broadcast High-Priority SMS to Waiting Farmers</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Instantly alert all farmers currently in queue about weather alerts, lane speedups, or slot adjustments.
            </p>

            {broadcastSent && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
                SMS announcement successfully broadcast to all registered and queue farmers!
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3">
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg"
              />
              <textarea
                rows={2}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Enter SMS text (supports Hindi & English)..."
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast SMS to Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
