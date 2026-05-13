import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Public API: Customer self-registration + optional booking
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries()) as Record<string, any>;

    // Validate required fields
    if (!body.fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor HP wajib diisi' }, { status: 400 });
    }

    const ktpFile = formData.get('ktpFile') as Blob | null;
    const passportFile = formData.get('passportFile') as Blob | null;

    let ktpUrl: string | null = null;
    let passportUrl: string | null = null;

    try {
      const { uploadFileToR2 } = await import('@/app/lib/s3');
      if (ktpFile) {
        ktpUrl = await uploadFileToR2(Buffer.from(await ktpFile.arrayBuffer()), (ktpFile as File).name || 'ktp.jpg', ktpFile.type || 'image/jpeg', 'documents');
      }
      if (passportFile) {
        passportUrl = await uploadFileToR2(Buffer.from(await passportFile.arrayBuffer()), (passportFile as File).name || 'passport.jpg', passportFile.type || 'image/jpeg', 'documents');
      }
    } catch (err) {
      console.error('File upload error:', err);
      return NextResponse.json({ success: false, error: 'Gagal mengunggah dokumen' }, { status: 500 });
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
        passportPhoto: passportUrl,
        bloodType: body.bloodType || null,
        healthNotes: body.healthNotes?.trim() || null,
        vaccineMeningitis: body.vaccineMeningitis === 'true',
        vaccineDate: body.vaccineDate ? new Date(body.vaccineDate) : null,
        emergencyName: body.emergencyName?.trim() || null,
        emergencyPhone: body.emergencyPhone?.trim() || null,
        emergencyRelation: body.emergencyRelation?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    // Save KTP to Document table
    if (ktpUrl) {
      await db.document.create({
        data: {
          customerId: customer.id,
          category: 'KTP',
          fileName: (ktpFile as File)?.name || 'KTP',
          fileUrl: ktpUrl,
        }
      });
    }

    // Save Passport to Document table (also saved in Customer.passportPhoto)
    if (passportUrl) {
      await db.document.create({
        data: {
          customerId: customer.id,
          category: 'PASSPORT',
          fileName: (passportFile as File)?.name || 'Passport',
          fileUrl: passportUrl,
        }
      });
    }

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
        const year = new Date().getFullYear();
        const count = await db.booking.count();
        let bookingCode = `BK-${year}-${String(count + 1).padStart(4, '0')}`;
        
        // Ensure uniqueness
        let isUnique = false;
        let attempt = 1;
        while (!isUnique) {
          const existing = await db.booking.findUnique({ where: { bookingCode } });
          if (!existing) {
            isUnique = true;
          } else {
            bookingCode = `BK-${year}-${String(count + 1 + attempt).padStart(4, '0')}`;
            attempt++;
          }
        }

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

    // Send WhatsApp notification to Admin
    try {
      const { sendAdminNotification } = await import('@/app/lib/whatsapp');
      const msg = `📢 *Pendaftaran Baru!*\n\nNama: ${customer.fullName}\nHP: ${customer.phone}${booking ? `\n\n📝 *Booking Baru:*\nKode: ${booking.bookingCode}\nTotal: Rp ${booking.priceTotal.toLocaleString('id-ID')}` : ''}\n\nMohon cek di dashboard CRM.`;
      await sendAdminNotification(msg);
    } catch (e) {
      console.error('Failed to send admin notification:', e);
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
