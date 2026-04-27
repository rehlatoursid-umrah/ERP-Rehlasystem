import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Tailwind class merge utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as Indonesian locale */
export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

/** Format currency with symbol */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') {
    return `Rp ${formatNumber(Math.ceil(amount))}`;
  }
  return `${currency} ${formatNumber(amount)}`;
}

/** Format Indonesian phone number (08xx -> 628xx) */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return cleaned;
}

/** Format date to Indonesian locale */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('id-ID', defaultOptions);
}

/** Format date to short format (e.g. "27 Apr 2026") */
export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format datetime */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Calculate nights between two dates */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/** Calculate flight duration */
export function getFlightDuration(start: string, end: string): string {
  if (!start || !end) return '';
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}j ${minutes}m`;
}

/** Generate a unique reference number */
export function generateRefNumber(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/** Generate a booking code */
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString().slice(2, 6);
  return `BK-${year}-${random}`;
}

/** Generate an invoice number */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString().slice(2, 6);
  return `INV-${year}${month}-${random}`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/** Get status color class */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // General
    DRAFT: 'bg-gray-100 text-gray-600',
    ACTIVE: 'bg-green-100 text-green-700',
    CLOSED: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-gray-100 text-gray-500',
    // Booking
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    DP_PAID: 'bg-indigo-100 text-indigo-700',
    FULLY_PAID: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-orange-100 text-orange-700',
    // Document
    UPLOADED: 'bg-blue-100 text-blue-600',
    VERIFIED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-red-100 text-red-600',
    // Invoice
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    // Payment
    // Quotation
    ACCEPTED: 'bg-green-100 text-green-700',
    // Departure
    PLANNING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
