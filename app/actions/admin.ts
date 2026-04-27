"use server";

import { db } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

// ============================================
// USER MANAGEMENT
// ============================================

export async function getUsers() {
  return db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
    }
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role: string;
  phone?: string;
}) {
  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error('Email sudah terdaftar');

  const hashedPassword = await bcrypt.hash(data.password, 12);
  return db.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      phone: data.phone || null,
    }
  });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
  password?: string;
}) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password && data.password.length > 0) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  return db.user.update({ where: { id }, data: updateData });
}

export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } });
  return { success: true };
}

// ============================================
// SETTINGS
// ============================================

export async function getSettings(group?: string) {
  const where = group ? { group } : {};
  return db.setting.findMany({ where, orderBy: { key: 'asc' } });
}

export async function updateSetting(key: string, value: string) {
  return db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group: 'general' },
  });
}

export async function updateSettings(settings: { key: string; value: string; group?: string }[]) {
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, group: s.group || 'general' },
    });
  }
  return { success: true };
}

// ============================================
// INVOICE
// ============================================

export async function getInvoices() {
  return db.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        include: {
          customer: { select: { id: true, fullName: true, phone: true, whatsapp: true } },
          package: { select: { name: true } },
        }
      }
    }
  });
}

export async function createInvoice(data: {
  bookingId: string;
  subtotal: number;
  discount?: number;
  tax?: number;
  dueDate?: string;
  notes?: string;
}) {
  const count = await db.invoice.count();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;

  const discount = data.discount || 0;
  const tax = data.tax || 0;
  const total = data.subtotal - discount + tax;

  return db.invoice.create({
    data: {
      invoiceNumber,
      bookingId: data.bookingId,
      subtotal: data.subtotal,
      discount,
      tax,
      total,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      status: 'DRAFT',
    }
  });
}

export async function updateInvoiceStatus(id: string, status: string) {
  const updateData: Record<string, unknown> = { status };
  if (status === 'SENT') updateData.sentAt = new Date();
  if (status === 'PAID') updateData.paidAt = new Date();

  return db.invoice.update({ where: { id }, data: updateData });
}

export async function deleteInvoice(id: string) {
  await db.invoice.delete({ where: { id } });
  return { success: true };
}

// ============================================
// DEPARTURE (GROUP KEBERANGKATAN)
// ============================================

export async function getDepartures() {
  return db.departure.findMany({
    orderBy: { departureDate: 'desc' },
    include: {
      package: { select: { id: true, name: true } },
      bookings: {
        include: {
          customer: { select: { fullName: true, phone: true } },
        }
      }
    }
  });
}

export async function createDeparture(data: {
  packageId: string;
  departureDate: string;
  returnDate?: string;
  flightDepart?: string;
  flightReturn?: string;
  pnrCode?: string;
  maxCapacity?: number;
  tourLeader?: string;
  muthowwif?: string;
  notes?: string;
}) {
  return db.departure.create({
    data: {
      packageId: data.packageId,
      departureDate: new Date(data.departureDate),
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
      flightDepart: data.flightDepart || null,
      flightReturn: data.flightReturn || null,
      pnrCode: data.pnrCode || null,
      maxCapacity: data.maxCapacity || 45,
      tourLeader: data.tourLeader || null,
      muthowwif: data.muthowwif || null,
      notes: data.notes || null,
    }
  });
}

export async function updateDepartureStatus(id: string, status: string) {
  return db.departure.update({ where: { id }, data: { status } });
}

export async function deleteDeparture(id: string) {
  await db.departure.delete({ where: { id } });
  return { success: true };
}
