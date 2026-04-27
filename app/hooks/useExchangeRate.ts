'use client';

import { useState, useEffect } from 'react';
import { EXCHANGE_RATE_API_URL, EXCHANGE_RATE_FALLBACK, MARKUP_PERCENT } from '@/app/lib/constants';

// ============================================
// SHARED EXCHANGE RATE HOOK
// Replaces duplicated rate-fetching in every module
// ============================================

export type ExchangeRates = {
  SAR: number;
  USD: number;
};

export function useExchangeRate() {
  const [rates, setRates] = useState<ExchangeRates>(EXCHANGE_RATE_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(EXCHANGE_RATE_API_URL);
        const data = await res.json();

        if (data?.conversion_rates) {
          setRates({
            USD: Math.ceil(data.conversion_rates.IDR),
            SAR: Math.ceil(data.conversion_rates.IDR / data.conversion_rates.SAR),
          });
          setError(null);
        }
      } catch (e) {
        console.error('Failed to fetch exchange rates:', e);
        setError('Gagal mengambil kurs live, menggunakan default.');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  /** Get IDR rate for a given currency */
  const getRateFor = (currency: string): number => {
    if (currency === 'IDR') return 1;
    if (currency === 'SAR') return rates.SAR;
    if (currency === 'USD') return rates.USD;
    return 1;
  };

  /** Convert amount to IDR with markup */
  const convertToIDR = (amount: number, currency: string): number => {
    const rate = getRateFor(currency);
    return amount * rate * (1 + MARKUP_PERCENT);
  };

  return { rates, loading, error, getRateFor, convertToIDR };
}
