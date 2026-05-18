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
      { nik: { contains: search } },
    ]
  } : {};

  const customers = await db.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      bookings: { select: { id: true, status: true, priceTotal: true } },
      documents: { select: { id: true, category: true, status: true, fileUrl: true, fileName: true } },
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
  fatherName?: string;
  motherName?: string;
  maritalStatus?: string;
  occupation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssued?: string;
  passportPlace?: string;
  passportPhoto?: string;
  bloodType?: string;
  healthNotes?: string;
  vaccineMeningitis?: boolean;
  vaccineDate?: string;
  hasDiseases?: boolean;
  diseaseNotes?: string;
  specialNeeds?: boolean;
  wheelchair?: boolean;
  previousUmrah?: boolean;
  previousHajj?: boolean;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  agreedTerms?: boolean;
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
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      maritalStatus: data.maritalStatus || null,
      occupation: data.occupation || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      passportNumber: data.passportNumber || null,
      passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
      passportIssued: data.passportIssued ? new Date(data.passportIssued) : null,
      passportPlace: data.passportPlace || null,
      passportPhoto: data.passportPhoto || null,
      bloodType: data.bloodType || null,
      healthNotes: data.healthNotes || null,
      vaccineMeningitis: data.vaccineMeningitis || false,
      vaccineDate: data.vaccineDate ? new Date(data.vaccineDate) : null,
      hasDiseases: data.hasDiseases || false,
      diseaseNotes: data.diseaseNotes || null,
      specialNeeds: data.specialNeeds || false,
      wheelchair: data.wheelchair || false,
      previousUmrah: data.previousUmrah || false,
      previousHajj: data.previousHajj || false,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      agreedTerms: data.agreedTerms || false,
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
  fatherName?: string;
  motherName?: string;
  maritalStatus?: string;
  occupation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportIssued?: string;
  passportPlace?: string;
  passportPhoto?: string;
  bloodType?: string;
  healthNotes?: string;
  vaccineMeningitis?: boolean;
  vaccineDate?: string;
  hasDiseases?: boolean;
  diseaseNotes?: string;
  specialNeeds?: boolean;
  wheelchair?: boolean;
  previousUmrah?: boolean;
  previousHajj?: boolean;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  agreedTerms?: boolean;
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
  try {
    // Check if customer has bookings
    const customer = await db.customer.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } }
    });

    if (customer && customer._count.bookings > 0) {
      return { success: false, error: "Gagal: Jamaah tidak dapat dihapus karena memiliki riwayat transaksi/booking aktif." };
    }

    await db.customer.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Delete Customer Error:", error);
    return { success: false, error: "Terjadi kesalahan internal saat menghapus data." };
  }
}

// --- GET STATS ---
export async function getCustomerStats() {
  const total = await db.customer.count();
  const withPassport = await db.customer.count({ where: { passportNumber: { not: null } } });
  const withVaccine = await db.customer.count({ where: { vaccineMeningitis: true } });
  
  return { total, withPassport, withVaccine };
}

// --- RESEND WA CONFIRMATION ---
export async function resendCustomerConfirmation(customerId: string) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: { bookings: true }
    });

    if (!customer) return { success: false, error: 'Customer not found' };

    const customerPhone = customer.whatsapp || customer.phone;
    if (!customerPhone) return { success: false, error: 'Customer does not have a phone number' };

    const booking = customer.bookings && customer.bookings.length > 0 ? customer.bookings[0] : null;
    let pkgInfo: any = null;
    if (booking && booking.packageId) {
      pkgInfo = await db.package.findUnique({ where: { id: booking.packageId } });
    }

    const registrationDate = customer.createdAt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Generate PDF
    let pdfUrl: string | null = null;
    try {
      const React = (await import('react')).default;
      const { renderToBuffer } = await import('@react-pdf/renderer');
      const { RegistrationConfirmationPdf } = await import('@/app/lib/pdf-registration');

      const pdfData = {
        fullName: customer.fullName,
        nik: customer.nik || undefined,
        birthPlace: customer.birthPlace || undefined,
        birthDate: customer.birthDate?.toISOString() || undefined,
        fatherName: customer.fatherName || undefined,
        motherName: customer.motherName || undefined,
        gender: customer.gender || undefined,
        maritalStatus: customer.maritalStatus || undefined,
        occupation: customer.occupation || undefined,
        phone: customer.phone,
        whatsapp: customer.whatsapp || undefined,
        email: customer.email || undefined,
        address: customer.address || undefined,
        city: customer.city || undefined,
        province: customer.province || undefined,
        postalCode: customer.postalCode || undefined,
        emergencyName: customer.emergencyName || undefined,
        emergencyRelation: customer.emergencyRelation || undefined,
        emergencyPhone: customer.emergencyPhone || undefined,
        passportNumber: customer.passportNumber || undefined,
        passportIssued: customer.passportIssued?.toISOString() || undefined,
        passportExpiry: customer.passportExpiry?.toISOString() || undefined,
        passportPlace: customer.passportPlace || undefined,
        hasDiseases: customer.hasDiseases || false,
        diseaseNotes: customer.diseaseNotes || undefined,
        specialNeeds: customer.specialNeeds || false,
        wheelchair: customer.wheelchair || false,
        previousUmrah: customer.previousUmrah || false,
        previousHajj: customer.previousHajj || false,
        bookingCode: booking?.bookingCode || undefined,
        packageName: pkgInfo?.name || undefined,
        packageType: pkgInfo?.type || undefined,
        roomType: booking?.roomType || undefined,
        priceTotal: booking?.priceTotal || undefined,
        currency: booking?.currency || undefined,
        registrationDate,
        customerId: customer.id,
      };

      const pdfElement = React.createElement(RegistrationConfirmationPdf, { data: pdfData as any });
      const pdfBuffer = await renderToBuffer(pdfElement as any);

      const { uploadFileToR2 } = await import('@/app/lib/s3');
      const fileName = `Konfirmasi-Pendaftaran-${customer.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdfUrl = await uploadFileToR2(Buffer.from(pdfBuffer), fileName, 'application/pdf', 'confirmations');
    } catch (e: any) {
      console.error('[PDF] Failed to generate PDF during resend:', e?.message || e);
    }

    // Send WhatsApp
    const { sendWhatsAppFile, sendWhatsAppMessage } = await import('@/app/lib/whatsapp');
    
    const bookingDetail = booking
      ? `\n\n📝 *Detail Booking:*\n▸ Kode Booking: *${booking.bookingCode}*\n▸ Paket: *${pkgInfo?.name || '-'}* (${pkgInfo?.type || '-'})\n▸ Tipe Kamar: *${booking.roomType}*\n▸ Total: *Rp ${booking.priceTotal.toLocaleString('id-ID')}*`
      : '';

    const greetingMsg = [
      `بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`,
      ``,
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,`,
      ``,
      `*${customer.fullName}* yang dirahmati Allah ﷻ`,
      ``,
      `Terima kasih telah mendaftarkan diri di *Rehlatours Indonesia* 🕋`,
      ``,
      `Pendaftaran Anda telah kami terima dan tercatat dalam sistem kami pada:`,
      `📅 *${registrationDate}*`,
      `🆔 *Reg. ID: ${customer.id.slice(0, 8).toUpperCase()}*`,
      bookingDetail,
      ``,
      pdfUrl ? `Berikut terlampir dokumen konfirmasi pendaftaran Anda beserta Syarat & Ketentuan yang berlaku.` : ``,
      ``,
      `Untuk informasi lebih lanjut, silakan hubungi:`,
      `📞 *+6283197321658*`,
      `🌐 *www.rehlatours.id*`,
      ``,
      `Semoga Allah ﷻ memudahkan perjalanan ibadah Anda.`,
      ``,
      `جَزَاكَ ٱللَّٰهُ خَيْرًا`,
      ``,
      `*Tim Rehlatours Indonesia* 🤍`,
    ].join('\n');

    await sendWhatsAppMessage(customerPhone, greetingMsg);

    if (pdfUrl) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pdfCaption = [
        `📋 Dokumen Konfirmasi Pendaftaran`,
        `${customer.fullName}`,
        `${registrationDate}`,
        booking ? `Booking: ${booking.bookingCode}` : '',
        ``,
        `*Rehlatours Indonesia*`,
        `www.rehlatours.id`,
      ].join('\n');
      await sendWhatsAppFile(customerPhone, pdfUrl, pdfCaption, `Konfirmasi-${customer.fullName.replace(/\s+/g, '-')}.pdf`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resend WA Error:", error);
    return { success: false, error: "Terjadi kesalahan internal saat mengirim ulang WA." };
  }
}
