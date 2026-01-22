import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("🚀 [API START] Memulai proses pengiriman...");

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const customerPhone = formData.get('phone') as string;
    const caption = formData.get('caption') as string;

    // --- KONFIGURASI (BACA DARI .ENV.LOCAL) ---
    // Menggunakan environment variable lebih aman. 
    // Jika tidak ada di .env, akan menggunakan nilai default (string di sebelah kanan ||)
    
    const BASE_URL = (process.env.WA_API_URL || 'https://gowa-veqeqo5hgucr.cgk-robin.sumopod.my.id').replace(/\/$/, '');
    
    // KREDENSIAL (User:Pass). Wajib diisi di file .env.local
    const WA_AUTH = process.env.WA_API_AUTH; 
    
    // Nomor Admin (Menggunakan nomor dari kode Anda sebagai default)
    const ADMIN_PHONE = process.env.WA_ADMIN_PHONE || '6283197321658';

    // Cek Warning jika Auth kosong
    if (!WA_AUTH) {
       console.warn("⚠️ PERINGATAN: WA_API_AUTH belum disetting di .env.local. Pengiriman mungkin gagal (Error 401).");
    }

    // --- FUNGSI PENGIRIM ---
    const sendToWhatsApp = async (targetPhone: string, msg: string) => {
      // Format Nomor HP (08xx -> 628xx)
      let phone = targetPhone.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);

      console.log(`📤 Mengirim ke ${phone}...`);

      const payload = new FormData();
      payload.append('phone', phone);
      payload.append('caption', msg);
      // PENTING: Sertakan nama file 'quotation.pdf'
      payload.append('file', file, 'quotation.pdf');
      payload.append('type', 'pdf'); // Parameter tambahan untuk memastikan tipe file

      // Setup Headers untuk Auth
      const headers: HeadersInit = {};
      if (WA_AUTH) {
        // Encode username:password ke Base64
        const encodedAuth = Buffer.from(WA_AUTH).toString('base64');
        headers['Authorization'] = `Basic ${encodedAuth}`;
      }

      // Tembak ke Endpoint /send/file
      const response = await fetch(`${BASE_URL}/send/file`, { 
        method: 'POST',
        headers: headers,
        body: payload
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Gagal kirim ke ${phone}. Status: ${response.status}`);
        
        // Deteksi Error Spesifik
        if (response.status === 401) {
            throw new Error("Gagal Login API (401 Unauthorized). Cek Username & Password di .env.local Anda.");
        }
        if (response.status === 404) {
            throw new Error(`Endpoint Salah (404). URL ${BASE_URL}/send/file tidak ditemukan di server WA.`);
        }
        throw new Error(`API WA Error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Sukses kirim ke ${phone}:`, result);
      return result;
    };

    // 1. Kirim ke Customer
    await sendToWhatsApp(customerPhone, caption);

    // 2. Kirim ke Admin (Copy)
    if (ADMIN_PHONE) {
      try {
        await sendToWhatsApp(ADMIN_PHONE, `[ADMIN COPY]\nKe: ${customerPhone}\n\n${caption}`);
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