import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Public API: Customer self-registration + optional booking
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor HP wajib diisi' }, { status: 400 });
    }

    // Create customer
    const customer = await db.customer.create({
      data: {
        fullName: body.fullName.trim(),
        nickname: body.nickname?.trim() || null,
        gender: body.gender || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        birthPlace: body.birthPlace?.trim() || null,
        nik: body.nik?.trim() || null,
        phone: body.phone.trim(),
        whatsapp: body.whatsapp?.trim() || null,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        province: body.province?.trim() || null,
        passportNumber: body.passportNumber?.trim() || null,
        passportExpiry: body.passportExpiry ? new Date(body.passportExpiry) : null,
        passportIssued: body.passportIssued ? new Date(body.passportIssued) : null,
        bloodType: body.bloodType || null,
        healthNotes: body.healthNotes?.trim() || null,
        vaccineMeningitis: body.vaccineMeningitis || false,
        vaccineDate: body.vaccineDate ? new Date(body.vaccineDate) : null,
        emergencyName: body.emergencyName?.trim() || null,
        emergencyPhone: body.emergencyPhone?.trim() || null,
        emergencyRelation: body.emergencyRelation?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    let booking: any = null;

    // If customer also selected a package, create a booking
    if (body.packageId) {
      // Get package price based on room type
      const pkg = await db.package.findUnique({ where: { id: body.packageId } });
      if (pkg) {
        const roomType = body.roomType || 'QUAD';
        const priceMap: Record<string, number> = {
          QUAD: pkg.priceQuad,
          TRIPLE: pkg.priceTriple,
          DOUBLE: pkg.priceDouble,
          SINGLE: pkg.priceSingle,
        };
        const priceTotal = priceMap[roomType] || pkg.priceQuad;

        // Generate booking code
        const count = await db.booking.count();
        const year = new Date().getFullYear();
        const bookingCode = `BK-${year}-${String(count + 1).padStart(4, '0')}`;

        booking = await db.booking.create({
          data: {
            bookingCode,
            customerId: customer.id,
            packageId: body.packageId,
            roomType,
            priceTotal,
            remainingAmount: priceTotal,
            currency: pkg.currency || 'IDR',
            notes: body.bookingNotes?.trim() || null,
          },
        });

        // Auto-generate invoice for this booking
        try {
          const { createInvoiceForBooking } = await import('@/app/actions/admin');
          await createInvoiceForBooking(booking.id);
        } catch (e) {
          console.error('Auto-invoice creation failed:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      customerName: customer.fullName,
      booking: booking ? {
        id: booking.id,
        bookingCode: booking.bookingCode,
        priceTotal: booking.priceTotal,
        remainingAmount: booking.remainingAmount,
      } : null,
    });
  } catch (error: any) {
    console.error('Public registration API error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan saat mendaftar' }, { status: 500 });
  }
}
