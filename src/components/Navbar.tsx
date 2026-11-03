import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { Sprout, LogOut, ShoppingCart, Globe, Bell } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications,
  unreadCount = 0
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Determine navigation tabs based on user role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'farmer') {
      return [
        { id: 'overview', label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
        { id: 'procurement', label: language === 'hi' ? 'स्लॉट बुक करें' : 'Book Mandi Slot' },
        { id: 'queue', label: language === 'hi' ? 'लाइव कतार' : 'Live Queue' },
        { id: 'farm_to_home', label: language === 'hi' ? 'जैविक बाज़ार' : 'Farm-to-Home' },
        { id: 'history', label: language === 'hi' ? 'खरीद रसीदें' : 'Procurement Slips' }
      ];
    }

    if (user.role === 'consumer') {
      return [
        { id: 'marketplace', label: language === 'hi' ? 'उपज बाज़ार' : 'Marketplace' },
        { id: 'orders', label: language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders' },
        { id: 'cart', label: language === 'hi' ? 'शॉपिंग कार्ट' : 'Shopping Cart' }
      ];
    }

    if (user.role === 'operator') {
      return [
        { id: 'overview', label: language === 'hi' ? 'मंडी अवलोकन' : 'Overview' },
        { id: 'queue_mgmt', label: language === 'hi' ? 'लाइव कतार' : 'Live Queue' },
        { id: 'weighbridge', label: language === 'hi' ? 'धर्मकांटा टर्मिनल' : 'Weighbridge' },
        { id: 'slots', label: language === 'hi' ? 'स्लॉट प्रबंधन' : 'Mandi Slots' },
        { id: 'payments', label: language === 'hi' ? 'डीबीटी भुगतान' : 'DBT Payments' },
        { id: 'reports', label: language === 'hi' ? 'रिपोर्ट्स' : 'Reports & CSV' }
      ];
    }

    if (user.role === 'admin') {
      return [
        { id: 'overview', label: language === 'hi' ? 'सिस्टम सारांश' : 'System Overview' },
        { id: 'operators', label: language === 'hi' ? 'ऑपरेटर प्रबंधन' : 'Authorize Operators' },
        { id: 'centres', label: language === 'hi' ? 'खरीद केंद्र' : 'Mandi Centres' },
        { id: 'logs', label: language === 'hi' ? 'ऑडिट लॉग्स' : 'Audit Logs' }
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === 'consumer') {
      setCurrentTab('marketplace');
    } else {
      setCurrentTab('overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Go to Home Overview"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-900 transition-colors">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-stone-900 whitespace-nowrap block group-hover:text-emerald-800 transition-colors">
                {language === 'hi' ? 'स्मार्ट कृषि कनेक्ट' : 'Smart Agriculture Connect'}
              </span>
              <span className="text-[10px] text-stone-500 hidden sm:block whitespace-nowrap font-medium">
                {user ? `${user.role.toUpperCase()} CONSOLE` : 'Smart India Hackathon'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links with crisp active states */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setCurrentTab(link.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-stone-200"
            title="Switch language between English and Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Cart Icon for Consumer */}
          {user?.role === 'consumer' && (
            <button
              onClick={() => setCurrentTab('cart')}
              className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'cart'
                  ? 'bg-emerald-800 text-white'
                  : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Notifications button if handler provided */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer border border-stone-200"
              title="View SMS Alert & Dispatch Log"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          )}

          {/* User profile & Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="text-right hidden lg:block">
                <span className="text-xs font-bold text-stone-900 block truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-stone-500 block capitalize">
                  {user.role} · {user.district || 'Karnal'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title={t('logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile nav subbar if user logged in */}
      {user && navLinks.length > 0 && (
        <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-50 border-t border-stone-200 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setCurrentTab(link.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 bg-white border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
