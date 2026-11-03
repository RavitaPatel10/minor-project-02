import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Booking,
  Token,
  ProcurementCentre,
  Product,
  Order,
  AppNotification,
  WeighmentRecord
} from '../types/index.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { SMSNotificationModal } from '../components/SMSNotificationModal.tsx';
import {
  Sprout,
  Clock,
  Ticket,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Package,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Bell,
  Scale,
  FileText
} from 'lucide-react';

interface FarmerDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ currentTab, setCurrentTab }) => {
  const { user, farmerProfile, token } = useAuth();
  const { language, t } = useLanguage();

  // State
  const [overview, setOverview] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [ordersReceived, setOrdersReceived] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<WeighmentRecord | null>(null);
  const [selectedSMS, setSelectedSMS] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedCentreId, setSelectedCentreId] = useState<string>('cen_karnal_01');
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [expectedQty, setExpectedQty] = useState<number>(2000);
  const [bookingDate, setBookingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState<string>('10:30 AM - 12:30 PM');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Grains & Pulses' | 'Vegetables' | 'Fresh Fruits' | 'Spices & Herbs' | 'Dairy & Honey' | 'Cold-Pressed Oils'>('Grains & Pulses');
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newQuantity, setNewQuantity] = useState<number>(500);
  const [newHarvestDate, setNewHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newOrganicStatus, setNewOrganicStatus] = useState<'VERIFIED_ORGANIC' | 'IN_CONVERSION' | 'NATURAL_FARMING'>('VERIFIED_ORGANIC');
  const [newDescription, setNewDescription] = useState('');
  const [newPickup, setNewPickup] = useState(user?.village ? `${user.village}, ${user.district}` : 'Taraori, Karnal');
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [ovRes, bkRes, cenRes, prdRes, ordRes, earnRes, notifRes] = await Promise.all([
        fetch('/api/farmer/overview', { headers }),
        fetch('/api/farmer/bookings', { headers }),
        fetch('/api/procurement/centres'),
        fetch('/api/farmer/products', { headers }),
        fetch('/api/farmer/orders', { headers }),
        fetch('/api/farmer/earnings', { headers }),
        fetch('/api/notifications', { headers })
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (bkRes.ok) {
        const d = await bkRes.json();
        setBookings(d.bookings || []);
      }
      if (cenRes.ok) {
        const d = await cenRes.json();
        setCentres(d.centres || []);
      }
      if (prdRes.ok) {
        const d = await prdRes.json();
        setMyProducts(d.products || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrdersReceived(d.orders || []);
      }
      if (earnRes.ok) setEarnings(await earnRes.json());
      if (notifRes.ok) {
        const d = await notifRes.json();
        setNotifications(d.notifications || []);
      }
    } catch (e) {
      console.error('Failed to load farmer dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle slot booking
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccessMsg(null);
    setIsBooking(true);

    try {
      const res = await fetch('/api/farmer/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          centreId: selectedCentreId,
          crop: selectedCrop,
          expectedQuantityKg: expectedQty,
          date: bookingDate,
          timeSlot: bookingSlot
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      setBookingSuccessMsg(`Mandi slot booked! Token ${data.token.tokenNumber} generated successfully.`);
      await fetchData();
      // Navigate to queue view to see live status
      setTimeout(() => {
        setCurrentTab('queue');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Error booking slot.');
    } finally {
      setIsBooking(false);
    }
  };

  // Handle Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSuccess(null);
    try {
      const res = await fetch('/api/farmer/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          description: newDescription,
          pricePerKg: newPrice,
          quantityAvailableKg: newQuantity,
          harvestDate: newHarvestDate,
          organicStatus: newOrganicStatus,
          pickupLocation: newPickup
        })
      });

      if (!res.ok) throw new Error('Failed to create listing');
      setProductSuccess('Organic harvest listed successfully in Farm-to-Home marketplace!');
      setNewTitle('');
      setNewDescription('');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Order Status update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/farmer/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bkgId: string) => {
    if (!confirm('Are you sure you want to cancel this procurement slot booking?')) return;
    try {
      const res = await fetch(`/api/farmer/bookings/${bkgId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const STAGES = [
    { key: 'SLOT_BOOKED', label: 'Slot Booked' },
    { key: 'TOKEN_GENERATED', label: 'Token Generated' },
    { key: 'CHECKED_IN', label: 'Checked In' },
    { key: 'WEIGHMENT_IN_PROGRESS', label: 'Weighment Active' },
    { key: 'WEIGHMENT_COMPLETED', label: 'Weighment Done' },
    { key: 'PROCUREMENT_COMPLETED', label: 'Procurement Done' },
    { key: 'PAYMENT_PENDING', label: 'Payment Pending' },
    { key: 'PAYMENT_SETTLED', label: 'DBT Settled' }
  ];

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const activeBooking: Booking | null = overview?.activeBooking || bookings[0] || null;
  const activeToken: Token | null = overview?.activeToken || null;
  const currentStageIndex = activeBooking ? getStageIndex(activeBooking.status) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Welcome Banner (Always Visible on Top) */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>Kisan Welfare Portal · e-Procurement Mandi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('welcome', 'Welcome')}, {user?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100">
              <span className="font-mono bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                {farmerProfile?.farmerCode || 'FMR-HR-KNL-1001'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                {user?.village || 'Taraori'}, {user?.district || 'Karnal'} ({user?.state || 'Haryana'})
              </span>
              <span>·</span>
              <span>Land: <strong>{farmerProfile?.landSizeAcres || 8.5} Acres</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {notifications.length > 0 && (
              <button
                onClick={() => setSelectedSMS(notifications[0])}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>Simulated SMS Alert ({notifications.length})</span>
              </button>
            )}
            <button
              onClick={() => setCurrentTab('procurement')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Mandi Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB: OVERVIEW (Default Dashboard View) */}
      {(currentTab === 'overview' || !currentTab) && (
        <div className="space-y-6">
          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <button
              onClick={() => setCurrentTab('procurement')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold uppercase">{t('stat_upcoming_booking', 'Upcoming Booking')}</span>
                <Calendar className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-lg font-bold text-stone-900 truncate">
                {activeBooking ? activeBooking.date : 'Book Slot'}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold block truncate">
                {activeBooking ? activeBooking.timeSlot : '+ Click to book'}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('queue')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold uppercase">{t('stat_active_token', 'Active Token')}</span>
                <Ticket className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-bold font-mono text-emerald-800 truncate">
                {activeToken?.tokenNumber || (activeBooking?.tokenId ? 'TKN-KNL-104' : 'No Token')}
              </p>
              <span className="text-[11px] text-stone-500 font-medium block">
                {activeBooking?.status.replace(/_/g, ' ') || 'Ready to book'}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('queue')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold uppercase">{t('stat_waiting_time', 'Waiting Time')}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                {overview?.estimatedWaitTime !== undefined ? `${overview.estimatedWaitTime} min` : '8 min'}
              </p>
              <span className="text-[11px] text-stone-500 block">
                {overview?.farmersAhead || 2} farmers ahead in queue
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('farm_to_home')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-left hover:border-emerald-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold uppercase">{t('stat_produce_listed', 'Listed Produce')}</span>
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                {(overview?.totalProduceListedKg || 1270).toLocaleString('en-IN')} KG
              </p>
              <span className="text-[11px] text-purple-700 font-semibold block">
                {myProducts.length} direct organic products
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs col-span-2 lg:col-span-1 text-left hover:border-emerald-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-xs font-semibold uppercase">{t('stat_completed_procurement', 'Procured')}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
                {(overview?.totalProcuredKg || 0).toLocaleString('en-IN')} KG
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                ₹{(overview?.totalProcurementEarnings || 0).toLocaleString('en-IN')} MSP Credit
              </span>
            </button>
          </div>

          {/* Active Token Callout if present */}
          {activeBooking && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900 mb-2">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Active Token: {activeToken?.tokenNumber || 'TKN-KNL-104'}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {activeBooking.crop} Procurement at {activeBooking.centreName}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Scheduled for <strong>{activeBooking.date} ({activeBooking.timeSlot})</strong> · Counter {activeBooking.counterAssigned || 2}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTab('queue')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>View Live Queue Tracking</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Book Procurement Slot</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Avoid long mandi waiting queues. Reserve an official APMC weighing slot with guaranteed counter allotment.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('procurement')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                <span>Open Booking Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Farm-to-Home Marketplace</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Sell certified organic harvests directly to consumers with zero intermediary commission.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('farm_to_home')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-800 hover:text-purple-950 cursor-pointer"
              >
                <span>Manage Harvest Listings ({myProducts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Procurement & DBT Slips</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  View and print official electronic weighment slips and track Direct Benefit Transfer bank settlements.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('history')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-stone-950 cursor-pointer"
              >
                <span>View All Records ({bookings.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: PROCUREMENT (Book Mandi Slot Assistant) */}
      {currentTab === 'procurement' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-200 pb-4 mb-6">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Smart Procurement Assistant</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">
              {t('find_centre', 'Find Government Procurement Centre & Book Slot')}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Select a verified APMC procurement centre, reserve your preferred date, and eliminate queue congestion.
            </p>
          </div>

          {bookingSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>{bookingSuccessMsg}</span>
              </div>
              <button
                onClick={() => setBookingSuccessMsg(null)}
                className="text-xs font-bold underline text-emerald-800 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleBookSlot} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Centre Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Select Procurement Centre
              </label>
              <select
                value={selectedCentreId}
                onChange={(e) => setSelectedCentreId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.district}, {c.state})
                  </option>
                ))}
              </select>
              {(() => {
                const cen = centres.find(c => c.id === selectedCentreId) || centres[0];
                return cen ? (
                  <div className="mt-3 text-[11px] text-stone-600 space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200">
                    <div>Counters: <strong>{cen.activeCounters} Active</strong> / {cen.totalCounters} Total</div>
                    <div>Avg Speed: <strong>{cen.avgMinsPerFarmer} mins</strong> per tractor weighment</div>
                    <div>Daily Cap: <strong>{(cen.dailyCapacityKg / 100).toLocaleString('en-IN')} Quintals</strong></div>
                    <div>Supported: {cen.cropsSupported.join(', ')}</div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Crop & Quantity */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Crop & Expected Quantity
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option value="Wheat">Wheat (गेंहू)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Paddy (Basmati)">Basmati Paddy (धान)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Chana (Gram)">Chana (चना)</option>
                  <option value="Barley">Barley (जौ)</option>
                </select>

                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="50"
                    value={expectedQty}
                    onChange={(e) => setExpectedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono"
                    placeholder="Quantity in KG"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-bold text-stone-400">
                    KG
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                = {(expectedQty / 100).toFixed(1)} Quintals · Official MSP rate will apply upon quality approval.
              </p>
            </div>

            {/* Date & Slot */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Date & Arrival Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option value="08:30 AM - 10:30 AM">08:30 AM - 10:30 AM</option>
                  <option value="10:30 AM - 12:30 PM">10:30 AM - 12:30 PM</option>
                  <option value="01:30 PM - 03:30 PM">01:30 PM - 03:30 PM</option>
                  <option value="03:30 PM - 05:30 PM">03:30 PM - 05:30 PM</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isBooking ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <span>Confirm Slot & Generate Token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB: QUEUE (Live Queue Tracking & Token Terminal) */}
      {currentTab === 'queue' && (
        <div className="space-y-6">
          {activeBooking ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
              <div className="p-6 bg-stone-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white">
                      Live Queue Active
                    </span>
                    <span className="text-stone-400 text-xs font-mono">
                      Mandi: {activeBooking.centreName}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold mt-1">
                    Token #{activeToken?.tokenNumber || 'TKN-KNL-104'}
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Crop: <strong>{activeBooking.crop}</strong> · Expected: <strong>{activeBooking.expectedQuantityKg} KG</strong> · Slot: <strong>{activeBooking.timeSlot}</strong>
                  </p>
                </div>

                <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 text-center sm:text-right min-w-[200px]">
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">
                    Dynamic Waiting Time
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-400 tabular-nums mt-0.5">
                    {overview?.estimatedWaitTime ?? 8} Mins
                  </div>
                  <span className="text-xs text-stone-300 block">
                    {overview?.farmersAhead ?? 1} farmers ahead · Counter {activeBooking.counterAssigned || 2}
                  </span>
                </div>
              </div>

              {/* Stepper: All 8 Procurement Stages */}
              <div className="p-6 bg-stone-50 border-b border-stone-200">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
                  Procurement Lifecycle Tracker (8 Transparent Stages)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {STAGES.map((stg, i) => {
                    const isPassed = i <= currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    return (
                      <div
                        key={stg.key}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isCurrent
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        <span className="text-[10px] font-mono block opacity-75">Step 0{i + 1}</span>
                        <span className="text-xs font-bold leading-tight block mt-0.5">
                          {stg.label}
                        </span>
                        {isPassed && (
                          <CheckCircle2 className={`w-3.5 h-3.5 mx-auto mt-1 ${isCurrent ? 'text-emerald-200' : 'text-emerald-600'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Queue Guidance Alert */}
              <div className="p-4 bg-emerald-50 text-emerald-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Gate Instructions:</strong> When your token is called, bring your tractor/trolley to <strong>Weighbridge Counter {activeBooking.counterAssigned || 2}</strong>. Electronic weighbridge will measure gross and tare automatically.
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setSelectedSMS(notifications[0])}
                    className="font-bold underline text-emerald-800 hover:text-emerald-950 whitespace-nowrap text-xs cursor-pointer"
                  >
                    View SMS Alert
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 space-y-3">
              <Ticket className="w-10 h-10 mx-auto text-stone-300" />
              <h3 className="text-base font-bold text-stone-800">No Active Mandi Token</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You do not have an active queue token at this moment. You can book a slot at any nearby procurement centre to generate a token.
              </p>
              <button
                onClick={() => setCurrentTab('procurement')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition cursor-pointer"
              >
                Book Procurement Slot
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: FARM-TO-HOME (Direct Selling Marketplace) */}
      {currentTab === 'farm_to_home' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Organic Farm-To-Home</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 mt-1">
                Direct Farmer Produce Marketplace
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                List and sell certified organic pulses, grains, honey, and cold-pressed oils directly to verified consumers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500">
                Direct Revenue: <strong className="font-mono text-emerald-800 text-sm">₹{(earnings?.totalSales || 2450).toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>

          {productSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{productSuccess}</span>
            </div>
          )}

          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              List New Organic Agricultural Harvest
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Heirloom Sharbati Wheat"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white font-medium"
                >
                  <option value="Grains & Pulses">Grains & Pulses</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fresh Fruits">Fresh Fruits</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                  <option value="Dairy & Honey">Dairy & Honey</option>
                  <option value="Cold-Pressed Oils">Cold-Pressed Oils</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Organic Certification</label>
                <select
                  value={newOrganicStatus}
                  onChange={(e) => setNewOrganicStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white font-medium"
                >
                  <option value="VERIFIED_ORGANIC">Verified Organic (NPOP/Jaivik Bharat)</option>
                  <option value="NATURAL_FARMING">Natural / Subhash Palekar ZBNF</option>
                  <option value="IN_CONVERSION">In Conversion (Pesticide Free)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Price (₹ / KG)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Quantity Available (KG)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={newHarvestDate}
                  onChange={(e) => setNewHarvestDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Pickup Location</label>
                <input
                  type="text"
                  required
                  value={newPickup}
                  onChange={(e) => setNewPickup(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Harvest Story & Quality Description</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe farming practice, soil health, and packaging details..."
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-sm cursor-pointer"
              >
                Publish Farm Listing
              </button>
            </div>
          </form>

          {/* My Listed Products Table */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              My Current Farm Listings ({myProducts.length})
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Produce</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Price / KG</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Available Qty</th>
                    <th className="py-2.5 px-4 font-semibold">Certification</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {myProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-stone-500 text-xs">
                        No products listed yet. Use the form above to list your first harvest.
                      </td>
                    </tr>
                  ) : (
                    myProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="py-2.5 px-4 font-medium text-stone-900">{p.title}</td>
                        <td className="py-2.5 px-4 text-stone-600">{p.category}</td>
                        <td className="py-2.5 px-4 font-mono text-right tabular-nums font-semibold">₹{p.pricePerKg}</td>
                        <td className="py-2.5 px-4 font-mono text-right tabular-nums">{p.quantityAvailableKg} {p.unit}</td>
                        <td className="py-2.5 px-4 text-xs">
                          <span className="text-emerald-800 font-medium">
                            {p.organicStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-xs font-semibold text-emerald-700">Active Listing</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Received From Consumers */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Consumer Orders Received ({ordersReceived.length})
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Order #</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Items & Qty</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Delivery Address</th>
                    <th className="py-2.5 px-4 font-semibold">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {ordersReceived.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-stone-500 text-xs">
                        No customer orders received yet.
                      </td>
                    </tr>
                  ) : (
                    ordersReceived.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                        <td className="py-2.5 px-4 text-stone-800 font-medium">{ord.consumerName}</td>
                        <td className="py-2.5 px-4 text-xs text-stone-600">
                          {ord.items.map(it => `${it.quantityKg}kg ${it.title}`).join(', ')}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-right tabular-nums">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-stone-500 max-w-xs truncate">
                          {ord.deliveryAddress}
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded border border-stone-300 bg-white cursor-pointer"
                          >
                            <option value="ORDER_RECEIVED">Order Received</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: HISTORY (Procurement & Weighment Records) */}
      {currentTab === 'history' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-1">
              Government Procurement Booking & Weighment History
            </h3>
            <p className="text-xs text-stone-500">
              Complete transparent log of mandi slot bookings, digital tokens, and weighment slips.
            </p>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Booking ID</th>
                  <th className="py-2.5 px-4 font-semibold">Procurement Centre</th>
                  <th className="py-2.5 px-4 font-semibold">Crop</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Expected Qty</th>
                  <th className="py-2.5 px-4 font-semibold">Date & Time Slot</th>
                  <th className="py-2.5 px-4 font-semibold">Mandi Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{b.bookingCode}</td>
                    <td className="py-2.5 px-4 text-stone-800">{b.centreName}</td>
                    <td className="py-2.5 px-4 font-medium text-emerald-800">{b.crop}</td>
                    <td className="py-2.5 px-4 font-mono text-right tabular-nums">{b.expectedQuantityKg} KG</td>
                    <td className="py-2.5 px-4 text-xs text-stone-600">
                      {b.date} · {b.timeSlot}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-xs font-semibold text-stone-800">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {['SLOT_BOOKED', 'TOKEN_GENERATED'].includes(b.status) ? (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-800 font-medium">Slip Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

      {/* Simulated SMS Notification Modal */}
      <SMSNotificationModal notification={selectedSMS} onClose={() => setSelectedSMS(null)} />
    </div>
  );
};
