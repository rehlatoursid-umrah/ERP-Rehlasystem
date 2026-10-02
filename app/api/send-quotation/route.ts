import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { sendWhatsAppDocument } from '@/app/lib/whatsapp';

export async function POST(request: Request) {
  console.log("🚀 [API START] Memulai proses pengiriman...");

  // Hanya staf yang login yang boleh mengirim WhatsApp atas nama nomor bisnis.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Sesi tidak valid. Silakan login ulang.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const customerPhone = formData.get('phone') as string;
    const caption = formData.get('caption') as string;

    // Nomor Admin (Menggunakan nomor dari kode Anda sebagai default)
    const ADMIN_PHONE = process.env.WA_ADMIN_PHONE || '6283197321658';

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Kirim ke Customer
    console.log(`📤 Mengirim ke ${customerPhone}...`);
    await sendWhatsAppDocument(customerPhone, fileBuffer, 'quotation.pdf', caption);

    // 2. Kirim ke Admin (Copy)
    if (ADMIN_PHONE) {
      try {
        await sendWhatsAppDocument(ADMIN_PHONE, fileBuffer, 'quotation.pdf', `[ADMIN COPY]\nKe: ${customerPhone}\n\n${caption}`);
      } catch (err) {
        console.warn("⚠️ Gagal kirim copy admin (tapi customer sukses).");
      }
    }

    return NextResponse.json({ success: true, message: "Terkirim ke Customer & Admin!" });

  } catch (error: any) {
    console.error("🔥 [API ERROR]:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
