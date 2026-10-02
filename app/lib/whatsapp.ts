import { readFile } from 'node:fs/promises';
import path from 'node:path';

// ============================================
// WhatsApp via WAHA (WhatsApp HTTP API)
// Env: WA_API_URL, WA_API_KEY, WA_SESSION (default: 'default'), WA_ADMIN_PHONE
// ============================================

function wahaConfig() {
  const baseUrl = (process.env.WA_API_URL || '').replace(/\/$/, '');
  const apiKey = process.env.WA_API_KEY || '';
  const session = process.env.WA_SESSION || 'default';
  if (!baseUrl) throw new Error('WA_API_URL belum disetting.');
  if (!apiKey) console.warn('⚠️ WA_API_KEY belum disetting. Pengiriman mungkin gagal (401).');
  return { baseUrl, apiKey, session };
}

// Format phone: remove non-digits, normalize Indonesian numbers (0xx / 620xx -> 62xx)
export function normalizePhone(targetPhone: string): string {
  let phone = targetPhone.replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  if (phone.startsWith('620')) phone = '62' + phone.slice(3);
  return phone;
}

async function wahaPost(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  const { baseUrl, apiKey, session } = wahaConfig();
  return fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
    },
    body: JSON.stringify({ session, ...body }),
  });
}

export async function sendWhatsAppMessage(targetPhone: string, message: string) {
  try {
    const phone = normalizePhone(targetPhone);
    const response = await wahaPost('/api/sendText', { chatId: `${phone}@c.us`, text: message });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp API Error (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

// Send a document buffer via WhatsApp. Throws on failure so callers can report the cause.
export async function sendWhatsAppDocument(
  targetPhone: string,
  fileBuffer: Buffer,
  fileName: string,
  caption: string,
  mimeType: string = 'application/pdf'
) {
  const phone = normalizePhone(targetPhone);
  const response = await wahaPost('/api/sendFile', {
    chatId: `${phone}@c.us`,
    caption,
    file: { mimetype: mimeType, filename: fileName, data: fileBuffer.toString('base64') },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) throw new Error('Gagal login API WAHA (401). Cek WA_API_KEY.');
    throw new Error(`API WA Error (${response.status}): ${errorText}`);
  }

  return response.json().catch(() => ({}));
}

// Files stored by app/lib/s3.ts are read straight from disk instead of over HTTP.
async function loadFile(fileUrl: string): Promise<Buffer | null> {
  const publicBase = (process.env.FILES_PUBLIC_URL || '/files').replace(/\/$/, '');
  if (fileUrl.startsWith(publicBase + '/')) {
    const filesDir = path.resolve(process.env.FILES_DIR || path.join(process.cwd(), 'storage', 'files'));
    const target = path.resolve(filesDir, fileUrl.slice(publicBase.length + 1));
    if (target.startsWith(filesDir + path.sep)) return readFile(target);
  }

  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    console.error('[WA-File] Failed to download file:', fileResponse.status);
    return null;
  }
  return Buffer.from(await fileResponse.arrayBuffer());
}

// Send a document file via WhatsApp
// Loads the file from its URL, then sends it as a document
export async function sendWhatsAppFile(targetPhone: string, fileUrl: string, caption: string, fileName?: string) {
  try {
    console.log('[WA-File] Loading file from:', fileUrl);
    const fileBuffer = await loadFile(fileUrl);
    if (!fileBuffer) return false;
    console.log('[WA-File] File loaded, size:', fileBuffer.length, 'bytes');

    try {
      await sendWhatsAppDocument(targetPhone, fileBuffer, fileName || 'document.pdf', caption);
      console.log('[WA-File] Document sent successfully');
      return true;
    } catch (error) {
      console.error('[WA-File] sendFile failed:', error);

      // Fallback: send the download link as a text message
      console.log('[WA-File] Falling back to text message with download link');
      const linkMsg = `${caption}\n\n📥 Download dokumen:\n${fileUrl}`;
      return sendWhatsAppMessage(targetPhone, linkMsg);
    }
  } catch (error) {
    console.error('[WA-File] Failed to send WhatsApp file:', error);
    return false;
  }
}

export async function sendAdminNotification(message: string) {
  const ADMIN_PHONE = process.env.WA_ADMIN_PHONE || '6283197321658';
  return sendWhatsAppMessage(ADMIN_PHONE, message);
}
