"use server";

import { db } from '@/app/lib/db';

// --- GET ALL CUSTOMERS ---
export async function getCustomers(search?: string) {
  const where = search ? {
    OR: [
      { fullName: { contains: search } },
      { phone: { contains: search } },
      { whatsapp: { contains: search } },
      { passportNumber: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
    ]
  } : {};

  const customers = await db.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      bookings: { select: { id: true, status: true, priceTotal: true } },
      documents: { select: { id: true, category: true, status: true } },
    }
  });
  return customers;
}

// --- GET SINGLE CUSTOMER ---
export async function getCustomer(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          package: { select: { name: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' }
      },
      documents: { orderBy: { uploadedAt: 'desc' } },
    }
  });
  return customer;
}

// --- CREATE CUSTOMER ---
export async function createCustomer(data: {
  fullName: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  nik?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssued?: string;
  bloodType?: string;
  healthNotes?: string;
  vaccineMeningitis?: boolean;
  vaccineDate?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  notes?: string;
}) {
  const customer = await db.customer.create({
    data: {
      fullName: data.fullName,
      nickname: data.nickname || null,
      gender: data.gender || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthPlace: data.birthPlace || null,
      nik: data.nik || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      province: data.province || null,
      passportNumber: data.passportNumber || null,
      passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
      passportIssued: data.passportIssued ? new Date(data.passportIssued) : null,
      bloodType: data.bloodType || null,
      healthNotes: data.healthNotes || null,
      vaccineMeningitis: data.vaccineMeningitis || false,
      vaccineDate: data.vaccineDate ? new Date(data.vaccineDate) : null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      notes: data.notes || null,
    }
  });
  return customer;
}

// --- UPDATE CUSTOMER ---
export async function updateCustomer(id: string, data: {
  fullName?: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  nik?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssued?: string;
  bloodType?: string;
  healthNotes?: string;
  vaccineMeningitis?: boolean;
  vaccineDate?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  notes?: string;
}) {
  const updateData: Record<string, unknown> = {};
  
  // Only include fields that are explicitly provided
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (['birthDate', 'passportExpiry', 'passportIssued', 'vaccineDate'].includes(key)) {
        updateData[key] = value ? new Date(value as string) : null;
      } else {
        updateData[key] = value === '' ? null : value;
      }
    }
  }

  const customer = await db.customer.update({
    where: { id },
    data: updateData,
  });
  return customer;
}

// --- DELETE CUSTOMER ---
export async function deleteCustomer(id: string) {
  await db.customer.delete({ where: { id } });
  return { success: true };
}

// --- GET STATS ---
export async function getCustomerStats() {
  const total = await db.customer.count();
  const withPassport = await db.customer.count({ where: { passportNumber: { not: null } } });
  const withVaccine = await db.customer.count({ where: { vaccineMeningitis: true } });
  
  return { total, withPassport, withVaccine };
}
