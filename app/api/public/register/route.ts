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

    // Check for pre-uploaded URLs (from immediate upload flow)
    let ktpUrl: string | null = (formData.get('ktpUrl') as string) || null;
    let passportUrl: string | null = (formData.get('passportUrl') as string) || null;

    // Fall back to uploading files if no pre-uploaded URLs
    try {
      const { uploadFileToR2 } = await import('@/app/lib/s3');
      if (!ktpUrl && ktpFile) {
        ktpUrl = await uploadFileToR2(Buffer.from(await ktpFile.arrayBuffer()), (ktpFile as File).name || 'ktp.jpg', ktpFile.type || 'image/jpeg', 'documents');
      }
      if (!passportUrl && passportFile) {
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
        fatherName: body.fatherName?.trim() || null,
        motherName: body.motherName?.trim() || null,
        maritalStatus: body.maritalStatus || null,
        occupation: body.occupation?.trim() || null,
        phone: body.phone.trim(),
        whatsapp: body.whatsapp?.trim() || null,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        province: body.province?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        passportNumber: body.passportNumber?.trim() || null,
        passportExpiry: body.passportExpiry ? new Date(body.passportExpiry) : null,
        passportIssued: body.passportIssued ? new Date(body.passportIssued) : null,
        passportPlace: body.passportPlace?.trim() || null,
        passportPhoto: passportUrl,
        hasDiseases: body.hasDiseases === 'true',
        diseaseNotes: body.diseaseNotes?.trim() || null,
        specialNeeds: body.specialNeeds === 'true',
        wheelchair: body.wheelchair === 'true',
        previousUmrah: body.previousUmrah === 'true',
        previousHajj: body.previousHajj === 'true',
        bloodType: body.bloodType || null,
        healthNotes: body.healthNotes?.trim() || null,
        vaccineMeningitis: body.vaccineMeningitis === 'true',
        vaccineDate: body.vaccineDate ? new Date(body.vaccineDate) : null,
        emergencyName: body.emergencyName?.trim() || null,
        emergencyPhone: body.emergencyPhone?.trim() || null,
        emergencyRelation: body.emergencyRelation?.trim() || null,
        agreedTerms: body.agreedTerms === 'true',
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

    // ============================================
    // POST-REGISTRATION: PDF + WhatsApp Notifications
    // ============================================
    const customerPhone = customer.whatsapp || customer.phone;
    const registrationDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Fetch package info if booking was created
    let pkgInfo: any = null;
    if (booking && body.packageId) {
      pkgInfo = await db.package.findUnique({ where: { id: body.packageId } });
    }

    // 1. Generate PDF Confirmation & upload to R2
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

      console.log('[PDF] Starting PDF generation for:', customer.fullName);
      const pdfElement = React.createElement(RegistrationConfirmationPdf, { data: pdfData as any });
      const pdfBuffer = await renderToBuffer(pdfElement as any);
      console.log('[PDF] PDF buffer generated, size:', pdfBuffer.length);

      // Upload PDF to R2
      const { uploadFileToR2 } = await import('@/app/lib/s3');
      const fileName = `Konfirmasi-Pendaftaran-${customer.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdfUrl = await uploadFileToR2(Buffer.from(pdfBuffer), fileName, 'application/pdf', 'confirmations');
      console.log('[PDF] PDF uploaded to R2:', pdfUrl);
    } catch (e: any) {
      console.error('[PDF] Failed to generate PDF:', e?.message || e);
      console.error('[PDF] Stack:', e?.stack);
    }

    // 2. Send WhatsApp to Customer (ALWAYS send greeting, PDF optional)
    if (customerPhone) {
      try {
        const { sendWhatsAppFile, sendWhatsAppMessage } = await import('@/app/lib/whatsapp');

        // Build greeting message with proper newlines
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

        console.log('[WA-Customer] Sending greeting to:', customerPhone);
        await sendWhatsAppMessage(customerPhone, greetingMsg);
        console.log('[WA-Customer] Greeting sent successfully');

        // Send PDF file if available
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
          console.log('[WA-Customer] Sending PDF file...');
          await sendWhatsAppFile(customerPhone, pdfUrl, pdfCaption, `Konfirmasi-${customer.fullName.replace(/\s+/g, '-')}.pdf`);
          console.log('[WA-Customer] PDF sent successfully');
        }
      } catch (e: any) {
        console.error('[WA-Customer] Failed:', e?.message || e);
      }
    } else {
      console.warn('[WA-Customer] No phone number available for customer');
    }

    // 3. Send Enhanced Admin Notification
    try {
      const { sendAdminNotification } = await import('@/app/lib/whatsapp');
      const fmtDate = (d: Date | null) => d ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

      const adminLines = [
        `🔔 *PENDAFTARAN BARU!*`,
        `━━━━━━━━━━━━━━━━━`,
        ``,
        `👤 *DATA JAMAAH*`,
        `▸ Nama: *${customer.fullName}*`,
        `▸ NIK: ${customer.nik || '-'}`,
        `▸ TTL: ${customer.birthPlace || '-'}, ${fmtDate(customer.birthDate)}`,
        `▸ Kelamin: ${customer.gender === 'MALE' ? 'Laki-laki' : customer.gender === 'FEMALE' ? 'Perempuan' : '-'}`,
        `▸ Ayah: ${customer.fatherName || '-'}`,
        `▸ Ibu: ${customer.motherName || '-'}`,
        `▸ Status: ${customer.maritalStatus || '-'}`,
        `▸ Pekerjaan: ${customer.occupation || '-'}`,
        ``,
        `📱 *KONTAK*`,
        `▸ Telepon: ${customer.phone}`,
        `▸ WhatsApp: ${customer.whatsapp || '-'}`,
        `▸ Email: ${customer.email || '-'}`,
        `▸ Alamat: ${customer.address || '-'}`,
        `▸ Kota: ${customer.city || '-'}, ${customer.province || '-'} ${customer.postalCode || ''}`,
        ``,
        `🆘 *KONTAK DARURAT*`,
        `▸ ${customer.emergencyName || '-'} (${customer.emergencyRelation || '-'})`,
        `▸ HP: ${customer.emergencyPhone || '-'}`,
        ``,
        `🛂 *PASPOR*`,
        `▸ No: ${customer.passportNumber || 'Belum diisi'}`,
        `▸ Berlaku: ${fmtDate(customer.passportExpiry)}`,
        `▸ Tempat: ${customer.passportPlace || '-'}`,
        ``,
        `🏥 *KESEHATAN*`,
        `▸ Penyakit: ${customer.hasDiseases ? (customer.diseaseNotes || 'Ya') : 'Tidak'}`,
        `▸ Kebutuhan Khusus: ${customer.specialNeeds ? 'Ya' : 'Tidak'}`,
        `▸ Kursi Roda: ${customer.wheelchair ? 'Ya' : 'Tidak'}`,
        `▸ Umrah: ${customer.previousUmrah ? 'Pernah' : 'Belum'}`,
        `▸ Haji: ${customer.previousHajj ? 'Pernah' : 'Belum'}`,
      ];

      if (booking) {
        adminLines.push(
          ``,
          `✈️ *BOOKING UMRAH*`,
          `▸ Kode: *${booking.bookingCode}*`,
          `▸ Paket: *${pkgInfo?.name || '-'}* (${pkgInfo?.type || '-'})`,
          `▸ Kamar: ${booking.roomType}`,
          `▸ Total: *Rp ${booking.priceTotal.toLocaleString('id-ID')}*`,
          `▸ Status: PENDING`,
        );
      } else {
        adminLines.push(
          ``,
          `📋 *Tanpa Booking Paket*`,
          `Jamaah mendaftar data diri saja (waiting list)`,
        );
      }

      adminLines.push(
        ``,
        `━━━━━━━━━━━━━━━━━`,
        `📅 Terdaftar: ${registrationDate}`,
        `🔗 Cek di Dashboard CRM`,
      );

      await sendAdminNotification(adminLines.join('\n'));
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
