import React from 'react';
import { AppNotification } from '../types/index.ts';
import { MessageSquare, X, Check, BellRing } from 'lucide-react';

interface SMSNotificationModalProps {
  notification: AppNotification | null;
  onClose: () => void;
}

export const SMSNotificationModal: React.FC<SMSNotificationModalProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Simulated Mobile Header */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              Simulated SMS Gateway (Gov-Agri)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smartphone Screen Simulator */}
        <div className="p-5 bg-stone-100">
          <div className="text-center mb-3">
            <span className="text-[11px] font-medium text-stone-500 bg-stone-200/80 px-2.5 py-0.5 rounded-full">
              Sender: VK-GOVMSP · Today
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-xs border border-stone-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  {notification.title}
                </h4>
                <p className="text-xs text-stone-700 mt-1.5 leading-relaxed font-sans">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2.5 pt-2 border-t border-stone-100">
                  <span>Delivered via SMS API</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Check className="w-3 h-3" /> Sent to +91 98765 43210
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-stone-500 italic">
              * Simulated high-priority transactional SMS delivery for rural Indian network reliability.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="p-3 bg-white border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};
