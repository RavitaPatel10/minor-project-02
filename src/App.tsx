import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { OfflineBanner } from './components/OfflineBanner.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { FarmerDashboard } from './pages/FarmerDashboard.tsx';
import { ConsumerMarketplace } from './pages/ConsumerMarketplace.tsx';
import { OperatorDashboard } from './pages/OperatorDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { SMSNotificationModal } from './components/SMSNotificationModal.tsx';
import { AppNotification } from './types/index.ts';

function MainAppContent() {
  const { user, token, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  // Reset tab when user role changes
  useEffect(() => {
    if (!user) return;
    if (user.role === 'farmer') setCurrentTab('overview');
    else if (user.role === 'consumer') setCurrentTab('marketplace');
    else if (user.role === 'operator') setCurrentTab('overview');
    else if (user.role === 'admin') setCurrentTab('overview');
  }, [user?.role]);

  // Fetch notifications for the logged in user
  useEffect(() => {
    if (!token || !user) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setNotifications(d.notifications || []);
        }
      } catch (e) {
        console.warn('Could not fetch notifications:', e);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [token, user]);

  const handleOpenNotifications = () => {
    if (notifications.length > 0) {
      setSelectedNotification(notifications[0]);
    } else {
      setSelectedNotification({
        id: 'notif_default',
        userId: user?.id || 'usr_demo',
        role: user?.role || 'farmer',
        title: 'System Operational Notification',
        message: 'All electronic weighbridges and mandi procurement centers are currently operating at normal capacity.',
        type: 'SMS_SIMULATED',
        read: true,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest">
          Loading Smart Agriculture Connect...
        </p>
      </div>
    );
  }

  // FIRST PAGE REQUIREMENT:
  // "When anyone opens the website, the first page must be the Login Page.
  // Do not allow access to protected website features without authentication."
  if (!user) {
    return (
      <>
        <OfflineBanner />
        <LoginPage />
      </>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  // Authenticated Application Shell with strict Role-Based Rendering
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      <OfflineBanner />
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNotifications={handleOpenNotifications}
        unreadCount={unreadCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {user.role === 'farmer' && (
          <FarmerDashboard currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}
        {user.role === 'consumer' && (
          <ConsumerMarketplace currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}
        {user.role === 'operator' && (
          <OperatorDashboard currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}
        {user.role === 'admin' && (
          <AdminDashboard currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}
      </main>

      <footer className="bg-white border-t border-stone-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <p>© {new Date().getFullYear()} Smart Agriculture Connect · Smart India Hackathon Project</p>
          <p>Department of Agriculture & Farmers Welfare · APMC e-Procurement & Direct Selling</p>
        </div>
      </footer>

      {/* Simulated SMS Notification Popup */}
      <SMSNotificationModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
