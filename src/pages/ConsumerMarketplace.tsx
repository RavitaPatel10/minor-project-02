import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Product, Order } from '../types/index.ts';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Package,
  ShoppingCart,
  Trash2,
  Clock,
  ShieldCheck,
  Truck
} from 'lucide-react';

interface ConsumerMarketplaceProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({ currentTab, setCurrentTab }) => {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  const { items, addToCart, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [organicFilter, setOrganicFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Checkout form
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Flat 402, Green Glen Residency, Saket, New Delhi 110017');
  const [contactMobile, setContactMobile] = useState(user?.mobile || '+91 98980 12345');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  const CATEGORIES = [
    'All',
    'Grains & Pulses',
    'Vegetables',
    'Fresh Fruits',
    'Spices & Herbs',
    'Dairy & Honey',
    'Cold-Pressed Oils'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (organicFilter !== 'All') params.append('organicStatus', organicFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/consumer/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/consumer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, organicFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsOrdering(true);
    try {
      const orderPayload = {
        deliveryAddress,
        contactMobile,
        items: items.map(i => ({
          productId: i.product.id,
          quantityKg: i.quantityKg
        }))
      };

      const res = await fetch('/api/consumer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setOrderSuccess(data.order);
      clearCart();
      await fetchProducts();
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Consumer Hero */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farm-To-Home · 100% Direct From Farmers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('consumer_browse', 'Fresh Harvests Directly From Local Farmers')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            Support rural agricultural producers directly. Certified chemical-free grains, cold-pressed oils, pure spices, and A2 dairy delivered to your doorstep.
          </p>
        </div>
      </div>

      {/* CART & CHECKOUT VIEW (if currentTab === 'cart') */}
      {currentTab === 'cart' ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-700" />
              <span>Shopping Cart ({totalItems} KG)</span>
            </h2>
            <button
              onClick={() => setCurrentTab('marketplace')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              ← Back to Marketplace
            </button>
          </div>

          {orderSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Order Placed Successfully!</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Order <strong className="font-mono text-emerald-800">#{orderSuccess.orderNumber}</strong> has been transmitted directly to the respective farmer(s). You can track delivery status in real-time.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => { setOrderSuccess(null); setCurrentTab('orders'); }}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition"
                >
                  Track Order
                </button>
                <button
                  onClick={() => { setOrderSuccess(null); setCurrentTab('marketplace'); }}
                  className="px-5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-3">
              <Package className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-medium">Your cart is currently empty.</p>
              <button
                onClick={() => setCurrentTab('marketplace')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 rounded-xl hover:bg-emerald-900"
              >
                Browse Harvests
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Item List */}
              <div className="md:col-span-2 space-y-4">
                {items.map(({ product, quantityKg }) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{product.title}</h4>
                      <p className="text-xs text-stone-500">
                        Farmer: {product.farmerName} · {product.farmerVillage}
                      </p>
                      <span className="text-xs font-mono font-semibold text-emerald-800 mt-1 block">
                        ₹{product.pricePerKg} / KG
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantityKg - 1)}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-mono font-bold text-stone-800">
                          {quantityKg} KG
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantityKg + 1)}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-20 text-right font-mono font-bold text-stone-900 text-sm">
                        ₹{product.pricePerKg * quantityKg}
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Checkout Particulars
                </h3>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Priya Sharma'}
                    className="w-full px-3 py-1.5 text-xs bg-stone-200/60 border border-stone-300 rounded-lg text-stone-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Delivery Address</label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Direct Delivery</span>
                    <span className="text-emerald-700 font-semibold">FREE (Farmer Dispatched)</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                    <span>Total Payable</span>
                    <span className="font-mono text-emerald-900 text-base">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isOrdering ? 'Confirming Order...' : 'Confirm Order & Pay on Delivery'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : currentTab === 'orders' ? (
        /* ORDERS TRACKING VIEW */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>My Orders & Real-Time Tracking</span>
            </h2>
            <button
              onClick={() => setCurrentTab('marketplace')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Browse More Products
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <Package className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-xs">No orders placed yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((ord) => {
                const ORDER_STAGES = ['ORDER_RECEIVED', 'ACCEPTED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED'];
                const currentIdx = ORDER_STAGES.indexOf(ord.status);

                return (
                  <div key={ord.id} className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-stone-900">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-xs text-stone-500 ml-2">
                          Ordered on {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-900">
                        Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Stepper for Order Fulfillment */}
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {ORDER_STAGES.map((stg, i) => {
                        const isDone = i <= currentIdx;
                        const isNow = i === currentIdx;
                        return (
                          <div
                            key={stg}
                            className={`p-2 rounded text-[11px] font-semibold border ${
                              isNow
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : isDone
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            <span className="block text-[9px] opacity-75">Stage 0{i + 1}</span>
                            <span className="truncate block mt-0.5">{stg.replace(/_/g, ' ')}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order items list */}
                    <div className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200">
                      <span className="font-semibold text-stone-800 block mb-1">Purchased Harvests:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {ord.items.map((it, idx) => (
                          <li key={idx}>
                            <strong>{it.quantityKg} KG</strong> · {it.title} (Grown by {it.farmerName}) @ ₹{it.pricePerKg}/kg
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-[11px] text-stone-500">
                        Delivery to: {ord.deliveryAddress}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* MARKETPLACE CATALOG */
        <>
          {/* Search & Category Filter bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wheat, basmati rice, mustard oil, chana, honey..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={organicFilter}
                  onChange={(e) => setOrganicFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-medium"
                >
                  <option value="All">All Certifications</option>
                  <option value="VERIFIED_ORGANIC">Verified Organic</option>
                  <option value="NATURAL_FARMING">Natural Farming</option>
                  <option value="IN_CONVERSION">In Conversion</option>
                </select>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Styled CSS/SVG Fallback Container for Organic Product */}
                  <div className="h-44 bg-gradient-to-br from-emerald-800 via-emerald-950 to-stone-900 p-4 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-emerald-100">
                        {product.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {product.organicStatus === 'VERIFIED_ORGANIC' ? 'NPOP Organic' : 'Chemical-Free'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-emerald-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {product.farmerVillage}, {product.farmerDistrict}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1 leading-snug line-clamp-2">
                        {language === 'hi' && product.titleHi ? product.titleHi : product.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 space-y-1">
                      <div>Grown by: <strong>{product.farmerName}</strong></div>
                      <div>Harvested: <strong>{product.harvestDate}</strong></div>
                      <div>Stock: <strong>{product.quantityAvailableKg} {product.unit} available</strong></div>
                    </div>
                  </div>
                </div>

                {/* Footer / Buy Action */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black font-mono text-emerald-950">
                      ₹{product.pricePerKg}
                    </span>
                    <span className="text-xs text-stone-500"> / {product.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, 5);
                      setCurrentTab('cart');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
