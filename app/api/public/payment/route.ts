import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Public API: Customer submits payment update (records a PENDING payment)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const bookingId = formData.get('bookingId') as string;
    const amount = Number(formData.get('amount'));
    const method = formData.get('method') as string;
    const phoneInput = formData.get('phone') as string;
    const bankName = formData.get('bankName') as string;
    const bankAccount = formData.get('bankAccount') as string;
    const referenceNumber = formData.get('referenceNumber') as string;
    const notes = formData.get('notes') as string;
    const proofFile = formData.get('proofFile') as Blob | null;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID wajib diisi' }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Jumlah pembayaran harus lebih dari 0' }, { status: 400 });
    }
    if (!method) {
      return NextResponse.json({ success: false, error: 'Metode pembayaran wajib diisi' }, { status: 400 });
    }
    if (!proofFile) {
      return NextResponse.json({ success: false, error: 'Bukti transfer wajib diunggah' }, { status: 400 });
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { customer: { select: { fullName: true, phone: true, whatsapp: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // Verify phone
    if (phoneInput) {
      const phone = phoneInput.replace(/\D/g, '');
      const custPhone = (booking.customer.phone || '').replace(/\D/g, '');
      const custWa = (booking.customer.whatsapp || '').replace(/\D/g, '');
      if (!custPhone.includes(phone) && !custWa.includes(phone) && !phone.includes(custPhone) && !phone.includes(custWa)) {
        return NextResponse.json({ success: false, error: 'Verifikasi gagal' }, { status: 403 });
      }
    }

    // Upload File
    let proofUrl: string | null = null;
    if (proofFile) {
      try {
        const { uploadFileToR2 } = await import('@/app/lib/s3');
        const buffer = Buffer.from(await proofFile.arrayBuffer());
        // Use File object's name if available, else generic name
        const fileName = (proofFile as File).name || 'payment_proof.jpg';
        proofUrl = await uploadFileToR2(buffer, fileName, proofFile.type || 'image/jpeg', 'payments');
      } catch (err) {
        console.error('File upload error:', err);
        return NextResponse.json({ success: false, error: 'Gagal mengunggah file bukti' }, { status: 500 });
      }
    }

    // Create payment with PENDING status (admin will verify later)
    const payment = await db.payment.create({
      data: {
        bookingId: bookingId,
        amount: amount,
        method: method || null,
        bankName: bankName?.trim() || null,
        bankAccount: bankAccount?.trim() || null,
        referenceNumber: referenceNumber?.trim() || null,
        proofUrl: proofUrl,
        notes: notes?.trim() || `Pembayaran dari customer form`,
        paidAt: new Date(),
        status: 'PENDING', // Admin perlu verifikasi
      },
    });

    // Send WhatsApp notification to Admin
    try {
      const { sendAdminNotification } = await import('@/app/lib/whatsapp');
      const msg = `💰 *Pembayaran Masuk (PENDING)*\n\nBooking: ${booking.bookingCode}\nJamaah: ${booking.customer.fullName}\nJumlah: Rp ${amount.toLocaleString('id-ID')}\nMetode: ${method || '-'}\n\nSilakan verifikasi di menu Booking Dashboard.`;
      await sendAdminNotification(msg);
    } catch (e) {
      console.error('Failed to send admin notification:', e);
    }

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
