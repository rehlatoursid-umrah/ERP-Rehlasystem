"use server";

import { uploadFileToR2 } from '@/app/lib/s3';

/**
 * Server Action untuk mengunggah file ke Cloudflare R2
 * 
 * @param formData FormData yang berisi 'file' dan opsional 'folder'
 * @returns Object dengan success status dan url/error
 */
export async function uploadAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return { success: false, error: 'Tidak ada file yang diunggah.' };
    }

    // Validasi ukuran file (misalnya maksimal 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' };
    }

    // Mengkonversi File object menjadi Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Mengunggah ke R2
    const publicUrl = await uploadFileToR2(buffer, file.name, file.type, folder);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error in uploadAction:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan saat mengunggah file.' };
  }
}
