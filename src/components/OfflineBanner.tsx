import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, lastSyncTime } = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) {
    return (
      <div className="bg-stone-100 text-stone-600 text-[11px] py-1 px-4 border-b border-stone-200 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('online_status', 'Live Connected')}
          </span>
          <span className="text-stone-400">·</span>
          <span>Last synchronized with Mandi Registry: <span className="font-mono">{lastSyncTime}</span></span>
        </div>
        <span className="text-stone-500 italic">
          National Agriculture Market (e-NAM) & APMC Compliant Engine
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs py-2 px-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
        <span className="font-medium">
          {t('offline_notice', 'Offline Mode: Displaying locally cached data. Bookings will sync once connection resumes.')}
        </span>
      </div>
      <div className="text-[11px] text-amber-100 hidden md:block">
        Cached at: <span className="font-mono">{lastSyncTime}</span>
      </div>
    </div>
  );
};
