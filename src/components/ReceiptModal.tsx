import React from 'react';
import { WeighmentRecord } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: WeighmentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { t } = useLanguage();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-8">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">
              Official Government Procurement Digital Weighment Slip
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 print:p-0 text-stone-800 space-y-6">
          {/* Gov / APMC Header */}
          <div className="text-center border-b border-stone-200 pb-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              Department of Agriculture & Farmers Welfare · e-Procurement Portal
            </p>
            <h2 className="text-xl font-bold text-stone-900 mt-1">
              {receipt.centreName}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Centre ID: <span className="font-mono">{receipt.centreId}</span> · Counter No: <span className="font-bold">{receipt.counterNumber}</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Electronic Weighbridge Verified & Digitally Signed
            </div>
          </div>

          {/* Receipt & Farmer Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-stone-50 p-4 rounded-lg border border-stone-200">
            <div>
              <span className="text-stone-500 block">Receipt Number</span>
              <span className="font-mono font-bold text-stone-900">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Token Number</span>
              <span className="font-mono font-bold text-stone-900">{receipt.tokenNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Date & Time</span>
              <span className="text-stone-900 font-medium">
                {new Date(receipt.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Weighbridge Operator</span>
              <span className="text-stone-900 font-medium">{receipt.operatorName}</span>
            </div>
          </div>

          {/* Farmer Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs text-stone-500 block">Farmer Name</span>
              <span className="font-semibold text-stone-900">{receipt.farmerName}</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 block">Registered Mobile</span>
              <span className="font-mono text-stone-900">{receipt.farmerMobile}</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 block">Crop / Produce</span>
              <span className="font-semibold text-emerald-800">{receipt.crop}</span>
            </div>
          </div>

          {/* Weights & Quality Analysis Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Weighment & Dockage Inspection
            </h4>
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-700 text-xs border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Measurement</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Value</th>
                    <th className="py-2.5 px-4 font-semibold">Specifications / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  <tr>
                    <td className="py-2 px-4 text-stone-600">Gross Weight (Loaded Truck)</td>
                    <td className="py-2 px-4 font-mono text-right tabular-nums font-medium">
                      {receipt.grossWeightKg.toLocaleString('en-IN')} KG
                    </td>
                    <td className="py-2 px-4 text-stone-500">Gross electronic sensor recording</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-stone-600">Tare Weight (Empty Truck)</td>
                    <td className="py-2 px-4 font-mono text-right tabular-nums font-medium">
                      {receipt.tareWeightKg.toLocaleString('en-IN')} KG
                    </td>
                    <td className="py-2 px-4 text-stone-500">Post-unloading tare verify</td>
                  </tr>
                  <tr className="bg-stone-50 font-medium">
                    <td className="py-2 px-4 text-stone-900">Net Crop Weight</td>
                    <td className="py-2 px-4 font-mono text-right tabular-nums font-bold text-stone-900">
                      {receipt.netWeightKg.toLocaleString('en-IN')} KG
                    </td>
                    <td className="py-2 px-4 text-stone-500">Gross - Tare</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-stone-600">Moisture Content</td>
                    <td className="py-2 px-4 font-mono text-right tabular-nums">
                      {receipt.moisturePercentage}%
                    </td>
                    <td className="py-2 px-4 text-stone-500">
                      {receipt.moisturePercentage <= 12 ? 'Within permissible limit (≤12%)' : 'Dockage adjustment applied'}
                    </td>
                  </tr>
                  {receipt.rejectedQuantityKg > 0 && (
                    <tr className="bg-red-50 text-red-900">
                      <td className="py-2 px-4">Rejected / Dockage Deduction</td>
                      <td className="py-2 px-4 font-mono text-right tabular-nums font-bold text-red-700">
                        -{receipt.rejectedQuantityKg.toLocaleString('en-IN')} KG
                      </td>
                      <td className="py-2 px-4 text-xs text-red-700">
                        {receipt.rejectionReason || 'Excess moisture & foreign material'}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <td className="py-3 px-4 text-sm">Final Accepted Quantity</td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums text-emerald-900 text-base">
                      {receipt.acceptedQuantityKg.toLocaleString('en-IN')} KG
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-800">
                      {(receipt.acceptedQuantityKg / 100).toFixed(2)} Quintals sanctioned for procurement
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Calculation Box */}
          <div className="bg-stone-900 text-white p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block uppercase tracking-wider">
                Official MSP Rate (2026-27)
              </span>
              <span className="text-sm font-medium">
                ₹{receipt.mspRatePerKg.toFixed(2)} / KG (₹{(receipt.mspRatePerKg * 100).toFixed(0)} / Quintal)
              </span>
            </div>
            <div className="text-right sm:border-l sm:border-stone-700 sm:pl-6">
              <span className="text-xs text-emerald-400 block uppercase font-semibold tracking-wider">
                Total Payment Payable via DBT
              </span>
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                ₹{receipt.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Legal / Note */}
          <p className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-200 pt-3">
            Note: This electronic slip constitutes official proof of produce procurement under the Minimum Support Price scheme. Amount will be credited directly to the farmer's Aadhaar-linked bank account within 24–48 hours via PFMS / DBT.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-stone-50 border-t border-stone-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
