import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Public API: Customer submits payment update (records a PENDING payment)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID wajib diisi' }, { status: 400 });
    }
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ success: false, error: 'Jumlah pembayaran harus lebih dari 0' }, { status: 400 });
    }
    if (!body.method) {
      return NextResponse.json({ success: false, error: 'Metode pembayaran wajib diisi' }, { status: 400 });
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: body.bookingId },
      include: { customer: { select: { phone: true, whatsapp: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // Verify phone
    if (body.phone) {
      const phone = body.phone.replace(/\D/g, '');
      const custPhone = (booking.customer.phone || '').replace(/\D/g, '');
      const custWa = (booking.customer.whatsapp || '').replace(/\D/g, '');
      if (!custPhone.includes(phone) && !custWa.includes(phone) && !phone.includes(custPhone) && !phone.includes(custWa)) {
        return NextResponse.json({ success: false, error: 'Verifikasi gagal' }, { status: 403 });
      }
    }

    // Create payment with PENDING status (admin will verify later)
    const payment = await db.payment.create({
      data: {
        bookingId: body.bookingId,
        amount: body.amount,
        method: body.method || null,
        bankName: body.bankName?.trim() || null,
        bankAccount: body.bankAccount?.trim() || null,
        referenceNumber: body.referenceNumber?.trim() || null,
        proofUrl: body.proofUrl || null,
        notes: body.notes?.trim() || `Pembayaran dari customer form`,
        paidAt: new Date(),
        status: 'PENDING', // Admin perlu verifikasi
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil dicatat! Menunggu verifikasi admin.',
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan saat mencatat pembayaran' }, { status: 500 });
  }
}
