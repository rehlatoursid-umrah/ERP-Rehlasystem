"use server";

import { db } from '@/app/lib/db';
import { createInvoiceForBooking, syncInvoiceWithPayments } from '@/app/actions/admin';

// --- GET ALL SUPPLIERS ---
export async function getSuppliers(type?: string) {
  const where = type ? { type } : {};
  return db.supplier.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 3 } }
  });
}

// --- CREATE SUPPLIER ---
export async function createSupplier(data: {
  name: string; type: string; contactPerson?: string; phone?: string;
  email?: string; address?: string; country?: string;
  bankName?: string; bankAccount?: string; notes?: string;
}) {
  return db.supplier.create({
    data: {
      name: data.name, type: data.type,
      contactPerson: data.contactPerson || null, phone: data.phone || null,
      email: data.email || null, address: data.address || null,
      country: data.country || null, bankName: data.bankName || null,
      bankAccount: data.bankAccount || null, notes: data.notes || null,
    }
  });
}

// --- UPDATE SUPPLIER ---
export async function updateSupplier(id: string, data: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) clean[k] = v === '' ? null : v;
  }
  return db.supplier.update({ where: { id }, data: clean });
}

// --- DELETE SUPPLIER ---
export async function deleteSupplier(id: string) {
  await db.supplier.delete({ where: { id } });
  return { success: true };
}

// --- GET PACKAGES ---
export async function getPackages() {
  return db.package.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      bookings: { select: { id: true, status: true } },
      departures: { select: { id: true, departureDate: true, status: true, currentPax: true, maxCapacity: true } },
    }
  });
}

// --- CREATE PACKAGE ---
export async function createPackage(data: {
  name: string; type?: string; description?: string; status?: string;
  priceQuad?: number; priceTriple?: number; priceDouble?: number; priceSingle?: number;
  currency?: string; durationDays?: number; durationNights?: number;
  includes?: string; excludes?: string; hotelMakkah?: string; hotelMadinah?: string;
  airline?: string; coverImage?: string;
}) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  return db.package.create({
    data: {
      name: data.name, slug,
      type: data.type || 'REGULAR', description: data.description || null,
      status: data.status || 'DRAFT',
      priceQuad: data.priceQuad || 0, priceTriple: data.priceTriple || 0,
      priceDouble: data.priceDouble || 0, priceSingle: data.priceSingle || 0,
      currency: data.currency || 'IDR',
      durationDays: data.durationDays || 9, durationNights: data.durationNights || 7,
      includes: data.includes || null, excludes: data.excludes || null,
      hotelMakkah: data.hotelMakkah || null, hotelMadinah: data.hotelMadinah || null,
      airline: data.airline || null, coverImage: data.coverImage || null,
    }
  });
}

// --- UPDATE PACKAGE ---
export async function updatePackage(id: string, data: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && k !== 'slug') clean[k] = v === '' ? null : v;
  }
  return db.package.update({ where: { id }, data: clean });
}

// --- DELETE PACKAGE ---
export async function deletePackage(id: string) {
  await db.package.delete({ where: { id } });
  return { success: true };
}

// --- GET BOOKINGS ---
export async function getBookings() {
  return db.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, fullName: true, phone: true, whatsapp: true } },
      package: { select: { id: true, name: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    }
  });
}

// --- CREATE BOOKING ---
export async function createBooking(data: {
  customerId: string; packageId?: string; roomType?: string;
  priceTotal: number; currency?: string; notes?: string;
}) {
  const count = await db.booking.count();
  const year = new Date().getFullYear();
  const bookingCode = `BK-${year}-${String(count + 1).padStart(4, '0')}`;

  const booking = await db.booking.create({
    data: {
      bookingCode,
      customerId: data.customerId,
      packageId: data.packageId || null,
      roomType: data.roomType || null,
      priceTotal: data.priceTotal,
      currency: data.currency || 'IDR',
      remainingAmount: data.priceTotal,
      notes: data.notes || null,
    }
  });

  // Auto-generate invoice for this booking
  try {
    await createInvoiceForBooking(booking.id);
  } catch (e) {
    console.error('Auto-invoice creation failed:', e);
  }

  return booking;
}

// --- UPDATE BOOKING STATUS ---
export async function updateBookingStatus(id: string, status: string) {
  return db.booking.update({ where: { id }, data: { status } });
}

// --- DELETE BOOKING ---
export async function deleteBooking(id: string) {
  await db.booking.delete({ where: { id } });
  return { success: true };
}

// --- ADD PAYMENT ---
export async function addPayment(data: {
  bookingId: string; amount: number; method?: string;
  bankName?: string; referenceNumber?: string; notes?: string;
}) {
  const payment = await db.payment.create({
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      method: data.method || null,
      bankName: data.bankName || null,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
      paidAt: new Date(),
      status: 'VERIFIED',
    }
  });

  // Update booking amounts
  const booking = await db.booking.findUnique({
    where: { id: data.bookingId },
    include: { payments: { where: { status: 'VERIFIED' } } }
  });

  if (booking) {
    const totalPaid = booking.payments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);
    const remaining = booking.priceTotal - totalPaid;
    const newStatus = remaining <= 0 ? 'FULLY_PAID' : totalPaid > 0 ? 'DP_PAID' : booking.status;

    await db.booking.update({
      where: { id: data.bookingId },
      data: { paidAmount: totalPaid, remainingAmount: Math.max(0, remaining), status: newStatus }
    });
  }

  // Auto-sync invoice with payment data
  try {
    await syncInvoiceWithPayments(data.bookingId);
  } catch (e) {
    console.error('Invoice sync failed:', e);
  }

  return payment;
}
