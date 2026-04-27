import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Pastikan variabel environment tersedia
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

export const s3Client = new S3Client({
  region: 'auto', // R2 requires 'auto'
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Mengunggah buffer file ke Cloudflare R2 dan mengembalikan Public URL.
 * 
 * @param fileBuffer Buffer file yang akan diunggah
 * @param fileName Nama file asli (akan ditambahkan UUID agar unik)
 * @param mimeType Tipe MIME dari file (misal: 'image/jpeg', 'application/pdf')
 * @param folder Folder penyimpanan di R2 (default: 'uploads')
 * @returns Public URL file yang berhasil diunggah
 */
export async function uploadFileToR2(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    // Generate nama file yang unik untuk menghindari bentrok
    const fileExtension = fileName.split('.').pop() || '';
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${folder}/${uuidv4()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    // Menghasilkan public URL
    const publicUrl = `${R2_PUBLIC_URL}/${uniqueFileName}`;
    console.log(`✅ File berhasil diunggah ke R2: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Gagal mengunggah file ke R2:', error);
    throw new Error('Gagal mengunggah file ke R2. Periksa kredensial dan konfigurasi bucket.');
  }
}
