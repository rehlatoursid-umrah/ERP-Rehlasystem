'use client';

import { useExchangeRate } from '@/app/hooks/useExchangeRate';

// ============================================
// CURRENCY RATE WIDGET
// Shared component replacing duplicated rate display
// ============================================

export function CurrencyRateWidget() {
  const { rates, loading } = useExchangeRate();

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="bg-white border px-3 py-1 rounded shadow-sm animate-pulse">
          <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="bg-white border px-3 py-1 rounded shadow-sm animate-pulse">
          <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-right">
        <p className="text-[10px] font-bold text-gray-400 tracking-wide">SAR (XE)</p>
        <p className="text-sm font-bold text-gray-800">Rp {rates.SAR.toLocaleString()}</p>
      </div>
      <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-right">
        <p className="text-[10px] font-bold text-gray-400 tracking-wide">USD (XE)</p>
        <p className="text-sm font-bold text-gray-800">Rp {rates.USD.toLocaleString()}</p>
      </div>
    </div>
  );
}
