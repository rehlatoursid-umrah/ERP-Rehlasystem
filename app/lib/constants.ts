// ============================================
// BRAND & DESIGN TOKENS
// Central source of truth for all branding
// ============================================

export const BRAND = {
  primary: '#3a0519',
  primaryLight: '#5a0826',
  secondary: '#a77a0b',
  secondaryLight: '#c59d5f',
  accent: '#fdf8e8',
  success: '#25D366',
  successDark: '#20bd5a',
  danger: '#dc2626',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export const COMPANY = {
  name: 'REHLA INDONESIA',
  shortName: 'Travel Rehla',
  tagline: 'PPIU SK No. 03010220049160002',
  address: 'Komplek Permata Biru Bandung Jawa Barat',
  website: 'rehlatours.id',
  logo: '/rehlasticky.png',
  phone: '6283197321658',
} as const;

export const MARKUP_PERCENT = 0.20;

export const CURRENCIES = ['IDR', 'SAR', 'USD'] as const;
export type Currency = typeof CURRENCIES[number];

export const ROOM_TYPES = ['QUAD', 'TRIPLE', 'DOUBLE', 'SINGLE'] as const;
export type RoomType = typeof ROOM_TYPES[number];

export const VISA_TYPES = [
  'Tourist Visa (Multiple Entry)',
  'Visa Entry Mesir',
  'Visa VoA Mesir',
  'Visa Single Entry Umrah',
  'Visa Turis Elektronik Saudi',
  'Umrah Plus',
] as const;

export const ENTRY_TYPES = ['Single Entry', 'Multiple Entry'] as const;

export const FLIGHT_CLASSES = ['Economy', 'Business', 'First'] as const;

export const USER_ROLES = ['SUPERADMIN', 'ADMIN', 'STAFF', 'AGENT'] as const;
export type UserRole = typeof USER_ROLES[number];

export const BOOKING_STATUSES = [
  'PENDING', 'CONFIRMED', 'DP_PAID', 'FULLY_PAID', 'CANCELLED', 'REFUNDED'
] as const;

export const PAYMENT_METHODS = ['TRANSFER', 'CASH', 'CARD', 'QRIS'] as const;

export const DOCUMENT_CATEGORIES = [
  'PASSPORT', 'KTP', 'VACCINE', 'VISA', 'PHOTO', 'PAYMENT_PROOF', 'OTHER'
] as const;

export const DOCUMENT_STATUSES = [
  'UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED'
] as const;

export const QUOTATION_TYPES = ['VISA', 'HOTEL', 'FLIGHT', 'ITINERARY'] as const;

// Exchange Rate API
export const EXCHANGE_RATE_API_URL = 'https://v6.exchangerate-api.com/v6/706a72e4c866009aea40c82a/latest/USD';
export const EXCHANGE_RATE_FALLBACK = { SAR: 4300, USD: 16200 };
