import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Public API: Lookup booking by booking code + phone (or name)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.bookingCode?.trim()) {
      return NextResponse.json({ success: false, error: 'Kode booking wajib diisi' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor HP wajib diisi untuk verifikasi' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const booking = await db.booking.findUnique({
      where: { bookingCode: body.bookingCode.trim().toUpperCase() },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, whatsapp: true, email: true },
        },
        package: {
          select: { id: true, name: true, type: true, durationDays: true, durationNights: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            method: true,
            bankName: true,
            referenceNumber: true,
            status: true,
            paidAt: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Kode booking tidak ditemukan' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Verify phone number matches
    const phone = body.phone.trim().replace(/\D/g, '');
    const customerPhone = (booking.customer.phone || '').replace(/\D/g, '');
    const customerWa = (booking.customer.whatsapp || '').replace(/\D/g, '');

    if (!phone || (!customerPhone.includes(phone) && !customerWa.includes(phone) && !phone.includes(customerPhone) && !phone.includes(customerWa))) {
      return NextResponse.json({ success: false, error: 'Nomor HP tidak cocok dengan data booking' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        roomType: booking.roomType,
        priceTotal: booking.priceTotal,
        paidAmount: booking.paidAmount,
        remainingAmount: booking.remainingAmount,
        currency: booking.currency,
        createdAt: booking.createdAt,
        customer: booking.customer,
        package: booking.package,
        payments: booking.payments,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
