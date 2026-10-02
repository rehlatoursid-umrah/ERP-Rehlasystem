import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

// Penyimpanan file di disk server sendiri (pengganti Cloudflare R2).
// Nama fungsi `uploadFileToR2` sengaja dipertahankan agar pemanggil lama
// tidak perlu diubah. File disajikan oleh route `/files/[...path]`.
const FILES_DIR = process.env.FILES_DIR || path.join(process.cwd(), 'storage', 'files');
const FILES_PUBLIC_URL = (process.env.FILES_PUBLIC_URL || '/files').replace(/\/$/, '');

/**
 * Menyimpan buffer file ke disk dan mengembalikan URL publiknya.
 *
 * @param fileBuffer Buffer file yang akan disimpan
 * @param fileName Nama file asli (akan ditambahkan UUID agar unik)
 * @param mimeType Tipe MIME dari file (tidak dipakai untuk disk, dipertahankan untuk kompatibilitas)
 * @param folder Folder penyimpanan (default: 'uploads')
 * @returns URL publik file yang berhasil disimpan
 */
export async function uploadFileToR2(
  fileBuffer: Buffer,
  fileName: string,
  _mimeType: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_') || 'uploads';
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${safeFolder}/${uuidv4()}-${safeFileName}`;

    const target = path.join(FILES_DIR, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, fileBuffer, { mode: 0o640 });

    const publicUrl = `${FILES_PUBLIC_URL}/${key}`;
    console.log(`✅ File berhasil disimpan: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Gagal menyimpan file:', error);
    throw new Error('Gagal menyimpan file. Periksa FILES_DIR dan izin folder.');
  }
}
